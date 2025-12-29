#!/usr/bin/env node

/**
 * Enhanced git status display
 */

const { execSync } = require('child_process');

function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf-8' }).trim();
    } catch (error) {
        return null;
    }
}

function main() {
    console.log('========================================');
    console.log('Git Status');
    console.log('========================================\n');

    // Current branch
    const branch = runCommand('git branch --show-current');
    console.log(`Branch: ${branch || 'unknown'}\n`);

    // Status
    const status = runCommand('git status --short');

    if (!status) {
        console.log('✓ Working directory is clean\n');
    } else {
        console.log('Changed files:');
        status.split('\n').forEach(line => {
            if (line.trim()) {
                const status = line.substring(0, 2);
                const file = line.substring(3);
                let indicator = '  ';

                if (status.includes('M')) indicator = '📝';
                if (status.includes('A')) indicator = '✨';
                if (status.includes('D')) indicator = '🗑️';
                if (status.includes('?')) indicator = '❓';

                console.log(`  ${indicator} ${file}`);
            }
        });
        console.log('');
    }

    // Commit status (ahead/behind)
    const tracking = runCommand('git status -sb');
    if (tracking) {
        const match = tracking.match(/\[(.+)\]/);
        if (match) {
            console.log(`Remote status: ${match[1]}\n`);
        }
    }

    // Last commit
    const lastCommit = runCommand('git log -1 --oneline');
    if (lastCommit) {
        console.log(`Last commit: ${lastCommit}\n`);
    }

    console.log('========================================');
}

main();
