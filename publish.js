const fs = require('fs');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { marked } = require('marked');

// Ghost configuration
const GHOST_URL = 'https://aiden.ghost.io';
const GHOST_ADMIN_API_KEY = '69522d3df6f30a000125b42c:4098e3fcf0d8fb0428c8c3dfe6f18e5eed47f4142a803abcf1461fae1c10ba90';

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

async function publishToGhost(title, htmlContent) {
    const token = createJWT(GHOST_ADMIN_API_KEY);
    const apiUrl = new URL('/ghost/api/admin/posts/?source=html', GHOST_URL);

    const postData = JSON.stringify({
        posts: [{
            title: title,
            html: htmlContent,
            status: 'published'
        }]
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

async function main() {
    try {
        // Read original and translation
        const originalContent = fs.readFileSync('output/original.md', 'utf-8');
        const mdContent = fs.readFileSync('output/translation.md', 'utf-8');

        // Extract title from original English article and add [번역] prefix
        const originalTitle = extractTitle(originalContent);
        const title = `[번역] ${originalTitle}`;
        const htmlContent = markdownToHTML(mdContent);

        console.log(`Publishing: ${title}`);

        // Publish
        const result = await publishToGhost(title, htmlContent);

        const post = result.posts[0];
        console.log('✓ Published successfully!');
        console.log(`  Post ID: ${post.id}`);
        console.log(`  URL: ${post.url}`);
        console.log(`  Status: ${post.status}`);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
