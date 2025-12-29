const fs = require('fs');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');
const path = require('path');
const { URL } = require('url');
const FormData = require('form-data');
require('dotenv').config();

const GHOST_URL = process.env.GHOST_URL || 'https://aiden.ghost.io';
const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY;

if (!GHOST_ADMIN_API_KEY) {
    console.error('Error: GHOST_ADMIN_API_KEY not found in .env file');
    process.exit(1);
}

function createJWT(apiKey) {
    const [id, secret] = apiKey.split(':');
    return jwt.sign(
        {},
        Buffer.from(secret, 'hex'),
        {
            keyid: id,
            algorithm: 'HS256',
            expiresIn: '5m',
            audience: '/admin/'
        }
    );
}

async function makeRequest(method, endpoint, data = null, isFormData = false) {
    const token = createJWT(GHOST_ADMIN_API_KEY);
    const apiUrl = new URL(endpoint, GHOST_URL);

    return new Promise((resolve, reject) => {
        const options = {
            hostname: apiUrl.hostname,
            path: apiUrl.pathname + apiUrl.search,
            method: method,
            headers: {
                'Authorization': `Ghost ${token}`
            }
        };

        if (data && !isFormData) {
            const postData = JSON.stringify(data);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const client = apiUrl.protocol === 'https:' ? https : http;
        const req = client.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseData));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', reject);

        if (data && !isFormData) {
            req.write(JSON.stringify(data));
        } else if (isFormData) {
            data.pipe(req);
        }

        req.end();
    });
}

async function uploadImage(imagePath) {
    const token = createJWT(GHOST_ADMIN_API_KEY);
    const apiUrl = new URL('/ghost/api/admin/images/upload', GHOST_URL);

    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));
    form.append('purpose', 'image');

    return new Promise((resolve, reject) => {
        const options = {
            hostname: apiUrl.hostname,
            path: apiUrl.pathname,
            method: 'POST',
            headers: {
                'Authorization': `Ghost ${token}`,
                ...form.getHeaders()
            }
        };

        const client = apiUrl.protocol === 'https:' ? https : http;
        const req = client.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const result = JSON.parse(data);
                    resolve(result.images[0].url);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        form.pipe(req);
    });
}

async function findPostByTitle(title) {
    const result = await makeRequest('GET', `/ghost/api/admin/posts/?filter=title:'${encodeURIComponent(title)}'`);
    return result.posts && result.posts.length > 0 ? result.posts[0] : null;
}

async function updatePost(postId, data) {
    const result = await makeRequest('PUT', `/ghost/api/admin/posts/${postId}/`, {
        posts: [data]
    });
    return result.posts[0];
}

async function updatePostThumbnail(title, thumbnailPath) {
    console.log(`\nProcessing: ${title}`);
    console.log('-------------------------------------------');

    // Find post
    console.log('📍 Finding post on Ghost...');
    const post = await findPostByTitle(title);

    if (!post) {
        console.error(`❌ Post not found: ${title}`);
        return;
    }

    console.log(`✓ Found post: ${post.title} (ID: ${post.id})`);

    // Upload thumbnail
    console.log('📤 Uploading thumbnail...');
    const imageUrl = await uploadImage(thumbnailPath);
    console.log(`✓ Uploaded: ${imageUrl}`);

    // Update post with feature image
    console.log('🔄 Updating post...');
    const updatedPost = await updatePost(post.id, {
        feature_image: imageUrl,
        updated_at: post.updated_at
    });

    console.log(`✅ Updated successfully!`);
    console.log(`   URL: ${updatedPost.url}`);
    console.log(`   Feature Image: ${updatedPost.feature_image}`);
}

async function main() {
    console.log('=========================================');
    console.log('Update Ghost Post Thumbnails');
    console.log('=========================================');

    const posts = [
        {
            title: '[번역] How To Be Successful',
            thumbnailPath: 'output/thumbnail-how-to-be-successful-20251229-180500.png'
        },
        {
            title: '[번역] The Shape of the Essay Field',
            thumbnailPath: 'output/thumbnail-the-shape-of-the-essay-field-20251229-200041.png'
        }
    ];

    for (const post of posts) {
        try {
            await updatePostThumbnail(post.title, post.thumbnailPath);
        } catch (error) {
            console.error(`❌ Failed to update ${post.title}:`, error.message);
        }
    }

    console.log('\n=========================================');
    console.log('✅ All Done!');
    console.log('=========================================');
    console.log('\nCheck your Ghost blog to see the updated thumbnails!');
}

main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
});
