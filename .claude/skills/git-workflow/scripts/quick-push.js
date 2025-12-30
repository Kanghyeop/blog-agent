#!/usr/bin/env node

/**
 * Quick commit and push workflow
 *
 * Usage:
 *   node quick-push.js                    # Auto-generate commit message
 *   node quick-push.js "Custom message"   # Use custom message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, silent = false) {
    try {
        const result = execSync(command, { encoding: 'utf-8' });
        if (!silent) console.log(result);
        return result.trim();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(error.stderr);
        process.exit(1);
    }
}

function getChangedFiles() {
    const status = runCommand('git status --short', true);
    return status.split('\n').filter(line => line.trim());
}

function generateCommitMessage(changedFiles) {
    // Check for translation workflow
    const hasTranslation = changedFiles.some(f => f.includes('output/translation'));
    const hasOriginal = changedFiles.some(f => f.includes('output/original'));

    if (hasTranslation && hasOriginal) {
        // Try to get article title from workflow file
        const workflowPath = path.join(process.cwd(), 'output', '.workflow.json');
        if (fs.existsSync(workflowPath)) {
            const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));

            // Extract title from original.md
            const originalPath = path.join(process.cwd(), 'output', 'original.md');
            if (fs.existsSync(originalPath)) {
                const content = fs.readFileSync(originalPath, 'utf-8');
                const titleMatch = content.match(/^# (.+)$/m);
                const title = titleMatch ? titleMatch[1] : 'Article';

                return `Translate: ${title}

- Extracted from: ${workflow.originalUrl || 'URL'}
- Model: ${workflow.modelName || 'Claude'}
- Published to Ghost

🤖 Generated with Claude Code`;
            }
        }
        return 'Translate: New article published';
    }

    // Check file types
    const fileTypes = {
        code: changedFiles.filter(f => /\.(js|ts|jsx|tsx)$/.test(f)),
        docs: changedFiles.filter(f => /\.md$/.test(f)),
        config: changedFiles.filter(f => /(package\.json|\.env|config)/.test(f)),
        skills: changedFiles.filter(f => /\.claude\/skills/.test(f))
    };

    if (fileTypes.skills.length > 0) {
        const skillNames = [...new Set(
            fileTypes.skills.map(f => {
                const match = f.match(/skills\/([^\/]+)\//);
                return match ? match[1] : null;
            }).filter(Boolean)
        )];
        return `Update skills: ${skillNames.join(', ')}`;
    }

    if (fileTypes.code.length > 0) {
        return `Update: ${fileTypes.code.length} file(s) modified`;
    }

    if (fileTypes.docs.length > 0) {
        return `Docs: update documentation`;
    }

    if (fileTypes.config.length > 0) {
        return `Config: update configuration`;
    }

    return `Update: ${changedFiles.length} file(s) changed`;
}

function main() {
    console.log('========================================');
    console.log('Git Quick Push');
    console.log('========================================\n');

    // Check git status
    console.log('Step 1: Checking git status...\n');
    const changedFiles = getChangedFiles();

    if (changedFiles.length === 0) {
        console.log('✓ No changes to commit. Working directory is clean.');
        return;
    }

    console.log('Changed files:');
    changedFiles.forEach(file => console.log(`  ${file}`));
    console.log('');

    // Step 1.5: Update documentation if needed
    const updateDocsScript = path.join(__dirname, 'update-docs.js');
    if (fs.existsSync(updateDocsScript)) {
        runCommand(`node "${updateDocsScript}"`, false);
    }

    // Get commit message
    const customMessage = process.argv.slice(2).join(' ');
    const commitMessage = customMessage || generateCommitMessage(changedFiles);

    console.log('Step 2: Creating commit...\n');
    console.log(`Message: ${commitMessage}\n`);

    // Add all files
    runCommand('git add -A', true);

    // Commit
    const escapedMessage = commitMessage.replace(/"/g, '\\"');
    runCommand(`git commit -m "${escapedMessage}"`, false);

    console.log('\nStep 3: Pushing to remote...\n');

    // Get current branch
    const branch = runCommand('git branch --show-current', true);
    console.log(`Pushing to origin/${branch}...`);

    // Push
    runCommand(`git push origin ${branch}`, false);

    console.log('\n========================================');
    console.log('✅ Successfully committed and pushed!');
    console.log('========================================\n');
}

main();
