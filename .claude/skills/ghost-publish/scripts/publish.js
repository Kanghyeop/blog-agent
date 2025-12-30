const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { marked } = require('marked');
const { generateFilename } = require('./file-utils');
require('dotenv').config();

// Ghost configuration from environment variables
const GHOST_URL = process.env.GHOST_URL || 'https://aiden.ghost.io';
const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY;

if (!GHOST_ADMIN_API_KEY) {
    console.error('Error: GHOST_ADMIN_API_KEY not found in .env file');
    process.exit(1);
}

function createJWT(apiKey) {
    const [id, secret] = apiKey.split(':');

    const token = jwt.sign(
        {},
        Buffer.from(secret, 'hex'),
        {
            keyid: id,
            algorithm: 'HS256',
            expiresIn: '5m',
            audience: '/admin/'
        }
    );

    return token;
}

function markdownToHTML(md) {
    // Remove the first H1 heading to avoid duplication with Ghost post title
    // Ghost already displays the title, so we don't need it in the content
    const lines = md.split('\n');
    let contentWithoutTitle = [];
    let foundFirstH1 = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip the first H1 heading (# Title)
        if (!foundFirstH1 && line.startsWith('# ')) {
            foundFirstH1 = true;
            continue;
        }
        contentWithoutTitle.push(lines[i]);
    }

    const contentMd = contentWithoutTitle.join('\n').trim();

    // Use marked library for proper markdown conversion
    return marked(contentMd);
}

function extractTitle(md) {
    const match = md.match(/^# (.+)$/m);
    return match ? match[1] : 'Untitled';
}

async function uploadImage(imagePath) {
    const FormData = require('form-data');
    const token = createJWT(GHOST_ADMIN_API_KEY);
    const apiUrl = new URL('/ghost/api/admin/images/upload/', GHOST_URL);

    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

    return new Promise((resolve, reject) => {
        const client = apiUrl.protocol === 'https:' ? https : http;

        const req = client.request({
            hostname: apiUrl.hostname,
            path: apiUrl.pathname,
            method: 'POST',
            headers: {
                'Authorization': `Ghost ${token}`,
                ...form.getHeaders()
            }
        }, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const result = JSON.parse(data);
                    resolve(result.images[0].url);
                } else {
                    reject(new Error(`Image upload failed: HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        form.pipe(req);
    });
}

async function publishToGhost(title, htmlContent, featureImage = null) {
    const token = createJWT(GHOST_ADMIN_API_KEY);
    const apiUrl = new URL('/ghost/api/admin/posts/?source=html', GHOST_URL);

    const postPayload = {
        title: title,
        html: htmlContent,
        status: 'published'
    };

    if (featureImage) {
        postPayload.feature_image = featureImage;
    }

    const postData = JSON.stringify({
        posts: [postPayload]
    });

    const options = {
        hostname: apiUrl.hostname,
        path: apiUrl.pathname + apiUrl.search,
        method: 'POST',
        headers: {
            'Authorization': `Ghost ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const client = apiUrl.protocol === 'https:' ? https : http;
        const req = client.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function generateThumbnailForTitle(title) {
    const { generateThumbnail, extractKeywords } = require('../../thumbnail-generator/scripts/generate-thumbnail.js');

    const translationContent = fs.readFileSync('output/translation.md', 'utf-8');
    const keywords = extractKeywords(translationContent);
    const thumbnailFilename = generateFilename('thumbnail', title, 'png');
    const thumbnailPath = path.join('output', thumbnailFilename);

    generateThumbnail(keywords, thumbnailPath);
    return { path: thumbnailPath, filename: thumbnailFilename };
}

async function main() {
    try {
        // Read original and translation
        const originalContent = fs.readFileSync('output/original.md', 'utf-8');
        const mdContent = fs.readFileSync('output/translation.md', 'utf-8');

        // Extract title from translation (more reliable as it's what we're publishing)
        const translationTitle = extractTitle(mdContent);
        const originalTitle = extractTitle(originalContent);

        // Validate: warn if titles don't match
        if (translationTitle !== originalTitle) {
            console.warn(`⚠️  Warning: Title mismatch detected!`);
            console.warn(`  Original: ${originalTitle}`);
            console.warn(`  Translation: ${translationTitle}`);
            console.warn(`  Using translation title for publishing.\n`);
        }

        // Save timestamped versions for archival (use translation title)
        const timestampedOriginal = generateFilename('original', translationTitle);
        const timestampedTranslation = generateFilename('translation', translationTitle);

        fs.writeFileSync(path.join('output', timestampedOriginal), originalContent);
        fs.writeFileSync(path.join('output', timestampedTranslation), mdContent);

        console.log(`✓ Saved timestamped files:`);
        console.log(`  ${timestampedOriginal}`);
        console.log(`  ${timestampedTranslation}`);

        // Generate thumbnail
        let featureImageUrl = null;
        console.log(`\nGenerating thumbnail...`);
        const thumbnail = await generateThumbnailForTitle(translationTitle);
        console.log(`✓ Thumbnail generated: ${thumbnail.filename}`);

        // Upload thumbnail
        console.log(`Uploading thumbnail...`);
        featureImageUrl = await uploadImage(thumbnail.path);
        console.log(`✓ Thumbnail uploaded: ${featureImageUrl}`);

        // Prepare for publishing (use translation title)
        const title = `[번역] ${translationTitle}`;
        const htmlContent = markdownToHTML(mdContent);

        console.log(`\nPublishing: ${title}`);

        // Publish with feature image
        const result = await publishToGhost(title, htmlContent, featureImageUrl);

        const post = result.posts[0];
        console.log('✓ Published successfully!');
        console.log(`  Post ID: ${post.id}`);
        console.log(`  URL: ${post.url}`);
        console.log(`  Status: ${post.status}`);
        if (featureImageUrl) {
            console.log(`  Feature Image: ${featureImageUrl}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
