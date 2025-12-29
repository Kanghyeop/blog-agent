#!/usr/bin/env node

/**
 * Blog Agent Translation Pipeline (Windows-compatible)
 * Usage: node run.js <article_url>
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function prompt(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node run.js <article_url>');
        console.log('Example: node run.js https://www.paulgraham.com/field.html');
        process.exit(1);
    }

    const articleUrl = args[0];

    console.log('=========================================');
    console.log('Blog Agent Translation Pipeline');
    console.log('=========================================\n');
    console.log(`Article URL: ${articleUrl}\n`);

    // Step 1: Extraction
    console.log('Step 1: Content Extraction');
    console.log('-------------------------------------------');
    console.log('👉 Ask Claude Code:');
    console.log(`   "Extract content from ${articleUrl} to output/original.md"\n`);
    await prompt('Press Enter when extraction is complete...');

    // Step 2: Translation
    console.log('\nStep 2: Translation');
    console.log('-------------------------------------------');
    console.log('👉 Ask Claude Code:');
    console.log('   "Translate output/original.md to Korean, save to output/translation.md"');
    console.log(`   "Add translation notice: > **번역 안내**: 이 글은 [원문](${articleUrl})을 한국어로 번역한 글입니다."\n`);
    console.log('For cost efficiency (95% cheaper), you can request:');
    console.log('   "Use Task tool with model=\\"haiku\\" to translate"\n');
    await prompt('Press Enter when translation is complete...');

    // Step 3: Generate Thumbnail
    console.log('\nStep 3: Generating Thumbnail');
    console.log('-------------------------------------------');
    try {
        execSync('node generate-thumbnail.js', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Thumbnail generation failed!');
        console.log('   Continuing anyway...');
    }

    // Step 4: Publish
    console.log('\nStep 4: Publishing to Ghost');
    console.log('-------------------------------------------');
    try {
        execSync('node publish.js', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Publishing failed!');
        process.exit(1);
    }

    // Step 5: Git commit
    console.log('\nStep 5: Committing to Git');
    console.log('-------------------------------------------');

    const fs = require('fs');
    const originalContent = fs.readFileSync('output/original.md', 'utf-8');
    const titleMatch = originalContent.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Untitled Article';

    console.log(`Title: ${title}`);

    const commitMessage = `Translate: ${title}

- Extracted from: ${articleUrl}
- Translation saved to output/translation.md
- Thumbnail generated`;

    try {
        execSync('git add -A', { stdio: 'inherit' });
        execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    } catch (error) {
        console.error('Note: Git commit may have failed (files might be unchanged)');
    }

    // Step 6: Push
    console.log('\nStep 6: Pushing to GitHub');
    console.log('-------------------------------------------');
    try {
        execSync('git push origin master', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Git push failed!');
        process.exit(1);
    }

    console.log('\n=========================================');
    console.log('✅ Pipeline Complete!');
    console.log('=========================================\n');
    console.log('Check your Ghost blog for the published post!');

    rl.close();
}

main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
});
