#!/usr/bin/env node

/**
 * Clean workspace before starting new translation
 * Moves existing original.md and translation.md to timestamped backups
 */

const fs = require('fs');
const path = require('path');

function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function cleanWorkspace() {
    const outputDir = path.join(process.cwd(), 'output');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log('✓ Created output directory');
        return;
    }

    const timestamp = getTimestamp();
    let cleaned = false;

    // Check and backup original.md
    const originalPath = path.join(outputDir, 'original.md');
    if (fs.existsSync(originalPath)) {
        const backupPath = path.join(outputDir, `_backup-original-${timestamp}.md`);
        fs.renameSync(originalPath, backupPath);
        console.log(`✓ Backed up original.md → _backup-original-${timestamp}.md`);
        cleaned = true;
    }

    // Check and backup translation.md
    const translationPath = path.join(outputDir, 'translation.md');
    if (fs.existsSync(translationPath)) {
        const backupPath = path.join(outputDir, `_backup-translation-${timestamp}.md`);
        fs.renameSync(translationPath, backupPath);
        console.log(`✓ Backed up translation.md → _backup-translation-${timestamp}.md`);
        cleaned = true;
    }

    // Check and backup thumbnail-latest.png
    const thumbnailPath = path.join(outputDir, 'thumbnail-latest.png');
    if (fs.existsSync(thumbnailPath)) {
        const backupPath = path.join(outputDir, `_backup-thumbnail-${timestamp}.png`);
        fs.renameSync(thumbnailPath, backupPath);
        console.log(`✓ Backed up thumbnail-latest.png → _backup-thumbnail-${timestamp}.png`);
        cleaned = true;
    }

    if (!cleaned) {
        console.log('✓ Workspace is already clean');
    } else {
        console.log('\n✓ Workspace cleaned - ready for new translation');
    }
}

if (require.main === module) {
    console.log('========================================');
    console.log('Clean Workspace');
    console.log('========================================\n');
    cleanWorkspace();
    console.log('');
}

module.exports = { cleanWorkspace };
