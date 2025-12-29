#!/usr/bin/env node

/**
 * Translation helper using Claude Code Task tool with Haiku model
 *
 * This script creates instructions for Claude Code to translate using Haiku,
 * which is much cheaper than Sonnet.
 *
 * Usage:
 *   node translate.js <original_url>
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Usage: node translate.js <original_url>');
    console.error('Example: node translate.js https://www.paulgraham.com/field.html');
    process.exit(1);
}

const originalUrl = args[0];

console.log('========================================');
console.log('Translation Workflow (Haiku Model)');
console.log('========================================\n');

console.log(`Original URL: ${originalUrl}\n`);

console.log('INSTRUCTIONS FOR CLAUDE CODE:');
console.log('========================================\n');

console.log('Step 1: Extract content');
console.log(`   Use WebFetch to get: ${originalUrl}`);
console.log('   Save to: output/original.md\n');

console.log('Step 2: Translate with HAIKU model');
console.log('   Use Task tool with model="haiku" for cost efficiency');
console.log('   Translate output/original.md to Korean');
console.log(`   Add translation notice: > **번역 안내**: 이 글은 [원문](${originalUrl})을 한국어로 번역한 글입니다.`);
console.log('   Save to: output/translation.md\n');

console.log('Step 3: Publish');
console.log('   Run: node publish.js\n');

console.log('Step 4: Commit');
console.log('   Run: git add -A && git commit -m "Translate: [title]" && git push\n');

console.log('========================================');
console.log('COST COMPARISON:');
console.log('========================================');
console.log('Sonnet 4.5: ~7,000-10,000 tokens = ~$0.05-0.07');
console.log('Haiku 3.5:  ~7,000-10,000 tokens = ~$0.002-0.003');
console.log('Savings: ~95% cost reduction!\n');

// Save workflow state
const workflow = {
    originalUrl,
    timestamp: new Date().toISOString(),
    model: 'haiku',
    steps: [
        'Extract with WebFetch',
        'Translate with Haiku (Task tool)',
        'Publish to Ghost',
        'Commit to Git'
    ]
};

fs.mkdirSync('output', { recursive: true });
fs.writeFileSync('output/.workflow.json', JSON.stringify(workflow, null, 2));

console.log('✓ Workflow info saved to output/.workflow.json\n');
