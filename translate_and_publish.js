#!/usr/bin/env node

/**
 * Efficient workflow for translating and publishing to Ghost
 *
 * This script is optimized to minimize Claude Code token usage by:
 * 1. Fetching content with WebFetch (external tool, no tokens)
 * 2. Storing extracted content for Claude to translate
 * 3. Publishing with a simple script (minimal tokens)
 *
 * Usage:
 *   node translate_and_publish.js <url> <original_url>
 *
 * Example:
 *   node translate_and_publish.js https://example.com/article https://example.com/article
 */

const fs = require('fs');
const https = require('https');
const { URL } = require('url');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Usage: node translate_and_publish.js <source_url> [original_url]');
    console.error('Example: node translate_and_publish.js https://example.com/article');
    process.exit(1);
}

const sourceUrl = args[0];
const originalUrl = args[1] || sourceUrl;

console.log('========================================');
console.log('Blog Agent - Translation Workflow');
console.log('========================================\n');

console.log(`Source URL: ${sourceUrl}`);
console.log(`Original URL: ${originalUrl}\n`);

console.log('📝 Step 1: Content extracted (use Claude Code WebFetch)');
console.log('   → Save to output/original.md\n');

console.log('🔄 Step 2: Translation needed');
console.log('   → Claude Code will translate output/original.md');
console.log('   → Add translation notice with original URL');
console.log('   → Save to output/translation.md\n');

console.log('📤 Step 3: Ready to publish');
console.log('   → Run: node publish.js');
console.log('   → Will publish output/translation.md to Ghost\n');

console.log('========================================');
console.log('INSTRUCTIONS FOR CLAUDE CODE:');
console.log('========================================\n');

console.log(`1. Use WebFetch to get content from: ${sourceUrl}`);
console.log('2. Save extracted content to: output/original.md');
console.log('3. Translate to Korean and save to: output/translation.md');
console.log(`4. Add translation notice: "> **번역 안내**: 이 글은 [원문](${originalUrl})을 한국어로 번역한 글입니다."`);
console.log('5. Run: node publish.js');
console.log('6. Commit with: git add -A && git commit -m "Translate: [article title]"\n');

// Save workflow info
const workflowInfo = {
    sourceUrl,
    originalUrl,
    timestamp: new Date().toISOString(),
    steps: [
        'Extract content from URL → output/original.md',
        'Translate to Korean → output/translation.md',
        'Add translation notice with original link',
        'Publish with: node publish.js',
        'Commit changes to git'
    ]
};

fs.writeFileSync(
    'output/.workflow.json',
    JSON.stringify(workflowInfo, null, 2)
);

console.log('✓ Workflow info saved to output/.workflow.json\n');
