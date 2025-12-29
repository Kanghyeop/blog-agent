#!/usr/bin/env node

/**
 * Translation helper using Claude Code Task tool
 *
 * This script creates instructions for Claude Code to translate using your
 * choice of model (Haiku, Sonnet, or Opus).
 *
 * Usage:
 *   node translate.js <original_url> [--model=haiku|sonnet|opus]
 *
 * Examples:
 *   node translate.js https://example.com/article              (defaults to haiku)
 *   node translate.js https://example.com/article --model=sonnet
 *   node translate.js https://example.com/article --model=opus
 */

const fs = require('fs');
const path = require('path');
const { cleanWorkspace } = require('./clean-workspace');

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Usage: node translate.js <original_url> [--model=haiku|sonnet|opus]');
    console.error('Examples:');
    console.error('  node translate.js https://www.paulgraham.com/field.html');
    console.error('  node translate.js https://www.paulgraham.com/field.html --model=sonnet');
    process.exit(1);
}

const originalUrl = args[0];

// Parse model option (default: haiku)
let model = 'haiku';
const modelArg = args.find(arg => arg.startsWith('--model='));
if (modelArg) {
    const requestedModel = modelArg.split('=')[1].toLowerCase();
    if (['haiku', 'sonnet', 'opus'].includes(requestedModel)) {
        model = requestedModel;
    } else {
        console.error(`Error: Invalid model "${requestedModel}". Must be haiku, sonnet, or opus.`);
        process.exit(1);
    }
}

// Model display names and cost info
const modelInfo = {
    haiku: {
        name: 'Claude Haiku 3.5',
        cost: '~$0.002-0.003',
        quality: 'Good',
        use: 'Cost-efficient (recommended)'
    },
    sonnet: {
        name: 'Claude Sonnet 4.5',
        cost: '~$0.05-0.07',
        quality: 'Excellent',
        use: 'High-quality translations'
    },
    opus: {
        name: 'Claude Opus 4.5',
        cost: '~$0.35-0.50',
        quality: 'Best',
        use: 'Critical/complex content'
    }
};

const selectedModel = modelInfo[model];

console.log('========================================');
console.log(`Translation Workflow (${selectedModel.name})`);
console.log('========================================\n');

// Clean workspace before starting
console.log('Cleaning workspace...');
cleanWorkspace();
console.log('');

console.log(`Original URL: ${originalUrl}`);
console.log(`Model: ${selectedModel.name}`);
console.log(`Cost: ${selectedModel.cost} per article`);
console.log(`Quality: ${selectedModel.quality}\n`);

console.log('INSTRUCTIONS FOR CLAUDE CODE:');
console.log('========================================\n');

console.log('Step 1: Extract content');
console.log(`   Use WebFetch to get: ${originalUrl}`);
console.log('   Save to: output/original.md\n');

console.log(`Step 2: Translate with ${model.toUpperCase()} model`);
console.log(`   Use Task tool with model="${model}"`);
console.log('   Translate output/original.md to Korean');
console.log(`   Add translation notice: > **번역 안내**: 이 글은 [원문](${originalUrl})을 ${selectedModel.name}로 번역한 글입니다.`);
console.log('   Save to: output/translation.md\n');

console.log('Step 3: Generate thumbnail');
console.log('   Run: cd .claude/skills/thumbnail-generator && node scripts/generate-thumbnail.js\n');

console.log('Step 4: Publish');
console.log('   Run: cd .claude/skills/ghost-publish && node scripts/publish.js\n');

console.log('Step 5: Commit');
console.log('   Run: git add -A && git commit -m "Translate: [title]" && git push\n');

console.log('========================================');
console.log('COST COMPARISON:');
console.log('========================================');
console.log(`Haiku:  ${modelInfo.haiku.cost} (95% cheaper than Sonnet)`);
console.log(`Sonnet: ${modelInfo.sonnet.cost} (recommended for complex content)`);
console.log(`Opus:   ${modelInfo.opus.cost} (best quality, highest cost)\n`);

console.log(`✓ Selected: ${selectedModel.name} - ${selectedModel.use}\n`);

// Save workflow state
const workflow = {
    originalUrl,
    timestamp: new Date().toISOString(),
    model: model,
    modelName: selectedModel.name,
    estimatedCost: selectedModel.cost,
    steps: [
        'Extract with WebFetch',
        `Translate with ${selectedModel.name} (Task tool)`,
        'Generate thumbnail',
        'Publish to Ghost',
        'Commit to Git'
    ]
};

fs.mkdirSync('output', { recursive: true });
fs.writeFileSync('output/.workflow.json', JSON.stringify(workflow, null, 2));

console.log('✓ Workflow info saved to output/.workflow.json\n');
