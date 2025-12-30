#!/usr/bin/env node

/**
 * Auto-update README.md and DEVELOPMENT.md based on code changes
 *
 * Triggers on:
 * - Code file changes (.js, .py, .ts, etc.)
 * - Skill additions/modifications
 * - Configuration changes
 *
 * Skips on:
 * - Translation-only changes (output/*.md)
 * - Documentation-only changes (README.md, DEVELOPMENT.md)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, silent = true) {
    try {
        return execSync(command, { encoding: 'utf-8' }).trim();
    } catch (error) {
        if (!silent) console.error(`Command failed: ${command}`);
        return '';
    }
}

function getChangedFiles() {
    const status = runCommand('git status --short');
    return status.split('\n')
        .filter(line => line.trim())
        .map(line => line.substring(3)); // Remove status prefix
}

function needsDocUpdate(changedFiles) {
    // Skip if no changes
    if (changedFiles.length === 0) return false;

    // Skip if only translation files changed (output/*.md, output/*.png)
    const onlyTranslation = changedFiles.every(f =>
        f.startsWith('output/') && (f.endsWith('.md') || f.endsWith('.png'))
    );
    if (onlyTranslation) {
        console.log('📝 Translation-only changes detected - skipping doc update');
        return false;
    }

    // Skip if only docs changed
    const onlyDocs = changedFiles.every(f =>
        f === 'README.md' || f === 'DEVELOPMENT.md'
    );
    if (onlyDocs) {
        console.log('📄 Documentation already updated');
        return false;
    }

    // Needs update if:
    // - Code files changed
    // - Skills changed
    // - Config changed
    const needsUpdate = changedFiles.some(f =>
        /\.(js|py|ts|jsx|tsx)$/.test(f) ||
        f.includes('.claude/skills/') ||
        f.includes('package.json') ||
        f.includes('.env')
    );

    return needsUpdate;
}

function analyzeChanges(changedFiles) {
    const changes = {
        skills: [],
        codeFiles: [],
        configFiles: [],
        description: ''
    };

    // Analyze skills
    const skillFiles = changedFiles.filter(f => f.includes('.claude/skills/'));
    if (skillFiles.length > 0) {
        const skillNames = [...new Set(
            skillFiles.map(f => {
                const match = f.match(/skills\/([^\/]+)\//);
                return match ? match[1] : null;
            }).filter(Boolean)
        )];
        changes.skills = skillNames;
    }

    // Analyze code files
    changes.codeFiles = changedFiles.filter(f =>
        /\.(js|py|ts|jsx|tsx)$/.test(f) && !f.includes('.claude/skills/')
    );

    // Analyze config files
    changes.configFiles = changedFiles.filter(f =>
        f.includes('package.json') || f.includes('.env')
    );

    // Generate description
    const parts = [];
    if (changes.skills.length > 0) {
        parts.push(`Skills: ${changes.skills.join(', ')}`);
    }
    if (changes.codeFiles.length > 0) {
        parts.push(`Code: ${changes.codeFiles.length} file(s)`);
    }
    if (changes.configFiles.length > 0) {
        parts.push(`Config updated`);
    }
    changes.description = parts.join(' | ');

    return changes;
}

function updateReadme(changes) {
    const readmePath = path.join(process.cwd(), 'README.md');

    if (!fs.existsSync(readmePath)) {
        console.log('⚠️  README.md not found - skipping');
        return false;
    }

    let content = fs.readFileSync(readmePath, 'utf-8');
    let updated = false;

    // Update skills section if skills changed
    if (changes.skills.length > 0) {
        console.log(`📝 Updating README.md - Skills: ${changes.skills.join(', ')}`);

        // Find skills section and update (support emoji in heading)
        const skillsRegex = /##\s+(?:🎯\s+)?Skills\n\n([\s\S]*?)(?=\n##|$)/;
        const match = content.match(skillsRegex);

        if (match) {
            // Get all skills from .claude/skills/
            const skillsDir = path.join(process.cwd(), '.claude/skills');
            const allSkills = fs.readdirSync(skillsDir)
                .filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());

            // Generate skills list
            const skillsList = allSkills.map(skill => {
                const skillPath = path.join(skillsDir, skill, 'SKILL.md');
                if (fs.existsSync(skillPath)) {
                    const skillContent = fs.readFileSync(skillPath, 'utf-8');
                    const descMatch = skillContent.match(/description:\s*(.+)/);
                    const desc = descMatch ? descMatch[1] : 'No description';
                    return `- **${skill}**: ${desc}`;
                }
                return `- **${skill}**`;
            }).join('\n');

            // Preserve emoji if it exists
            const headingMatch = content.match(/##\s+((?:🎯\s+)?Skills)/);
            const heading = headingMatch ? headingMatch[1] : 'Skills';
            content = content.replace(skillsRegex, `## ${heading}\n\n${skillsList}\n\n`);
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(readmePath, content);
        console.log('✓ README.md updated');
        return true;
    }

    return false;
}

function updateDevelopment(changes) {
    const devPath = path.join(process.cwd(), 'DEVELOPMENT.md');

    if (!fs.existsSync(devPath)) {
        console.log('⚠️  DEVELOPMENT.md not found - skipping');
        return false;
    }

    let content = fs.readFileSync(devPath, 'utf-8');

    // Add changelog entry at the end before "---" separator if exists, or at the very end
    const timestamp = new Date().toISOString().split('T')[0];
    const changelogEntry = `\n## Changelog\n\n### ${timestamp}\n- ${changes.description}\n`;

    // Find changelog section (support emoji)
    const changelogRegex = /(##\s+(?:📋\s+)?Changelog\n)/;
    if (changelogRegex.test(content)) {
        // Changelog section exists, add entry after it
        const entryOnly = `\n### ${timestamp}\n- ${changes.description}\n`;
        content = content.replace(changelogRegex, `$1${entryOnly}`);
    } else {
        // No changelog section, add it at the end
        content = content.trimEnd() + '\n\n---\n' + changelogEntry;
    }

    fs.writeFileSync(devPath, content);
    console.log('✓ DEVELOPMENT.md updated');
    return true;
}

function main() {
    console.log('\n========================================');
    console.log('📚 Documentation Update Check');
    console.log('========================================\n');

    const changedFiles = getChangedFiles();

    if (!needsDocUpdate(changedFiles)) {
        return;
    }

    console.log('📝 Code changes detected - updating documentation...\n');

    const changes = analyzeChanges(changedFiles);
    console.log(`Changes: ${changes.description}\n`);

    let docsUpdated = false;

    // Update README.md
    if (updateReadme(changes)) {
        docsUpdated = true;
    }

    // Update DEVELOPMENT.md
    if (updateDevelopment(changes)) {
        docsUpdated = true;
    }

    if (docsUpdated) {
        // Stage updated docs
        runCommand('git add README.md DEVELOPMENT.md');
        console.log('\n✅ Documentation updated and staged for commit\n');
    } else {
        console.log('\n⚠️  No documentation updates needed\n');
    }

    console.log('========================================\n');
}

if (require.main === module) {
    main();
}

module.exports = { needsDocUpdate, analyzeChanges };
