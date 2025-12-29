#!/usr/bin/env node

/**
 * Update thumbnail for an existing Ghost post
 *
 * Usage:
 *   node update-thumbnail.js <post_id> <thumbnail_path>
 */

const fs = require('fs');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');
const { URL } = require('url');
require('dotenv').config();

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

async function getPost(postId) {
    const token = createJWT(GHOST_ADMIN_API_KEY);
    const apiUrl = new URL(`/ghost/api/admin/posts/${postId}/`, GHOST_URL);

    return new Promise((resolve, reject) => {
        const client = apiUrl.protocol === 'https:' ? https : http;

        const req = client.request({
            hostname: apiUrl.hostname,
            path: apiUrl.pathname,
            method: 'GET',
            headers: {
                'Authorization': `Ghost ${token}`,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Get post failed: HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function updatePost(postId, featureImageUrl, updatedAt) {
    const token = createJWT(GHOST_ADMIN_API_KEY);
    const apiUrl = new URL(`/ghost/api/admin/posts/${postId}/`, GHOST_URL);

    const postData = JSON.stringify({
        posts: [{
            feature_image: featureImageUrl,
            updated_at: updatedAt
        }]
    });

    return new Promise((resolve, reject) => {
        const client = apiUrl.protocol === 'https:' ? https : http;

        const req = client.request({
            hostname: apiUrl.hostname,
            path: apiUrl.pathname,
            method: 'PUT',
            headers: {
                'Authorization': `Ghost ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Update post failed: HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: node update-thumbnail.js <post_id> <thumbnail_path>');
        console.error('Example: node update-thumbnail.js 6952658df6f30a000125b469 output/thumbnail-latest.png');
        process.exit(1);
    }

    const postId = args[0];
    const thumbnailPath = args[1];

    if (!fs.existsSync(thumbnailPath)) {
        console.error(`Error: Thumbnail file not found: ${thumbnailPath}`);
        process.exit(1);
    }

    console.log('========================================');
    console.log('Update Ghost Post Thumbnail');
    console.log('========================================\n');

    try {
        // 1. Get existing post to get updated_at timestamp
        console.log(`Step 1: Fetching post ${postId}...`);
        const postData = await getPost(postId);
        const post = postData.posts[0];

        console.log(`✓ Found post: "${post.title}"`);
        console.log(`  Current feature image: ${post.feature_image || 'none'}\n`);

        // 2. Upload thumbnail
        console.log('Step 2: Uploading thumbnail...');
        const imageUrl = await uploadImage(thumbnailPath);
        console.log(`✓ Thumbnail uploaded: ${imageUrl}\n`);

        // 3. Update post
        console.log('Step 3: Updating post...');
        const result = await updatePost(postId, imageUrl, post.updated_at);
        const updatedPost = result.posts[0];

        console.log('✓ Post updated successfully!\n');
        console.log('========================================');
        console.log('Post Details:');
        console.log('========================================');
        console.log(`Title: ${updatedPost.title}`);
        console.log(`URL: ${updatedPost.url}`);
        console.log(`Feature Image: ${updatedPost.feature_image}`);
        console.log('========================================\n');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
