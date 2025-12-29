/**
 * Retroactively apply timestamped files and thumbnails to existing articles
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generateFilename } = require('./file-utils');
const { generateThumbnail, extractKeywords } = require('./generate-thumbnail');

// Article 1: How To Be Successful
const article1 = {
    name: 'How To Be Successful',
    originalPath: 'output/article1-original-temp.md',
    translationPath: 'output/article1-translation-temp.md',
    // Use a timestamp from when it was published (approximate)
    timestamp: '20251229-180500'
};

// Article 2: The Shape of the Essay Field (current files)
const article2 = {
    name: 'The Shape of the Essay Field',
    originalPath: 'output/original.md',
    translationPath: 'output/translation.md',
    timestamp: '20251229-180700'
};

function extractTitleFromContent(content) {
    const match = content.match(/^# (.+)$/m);
    return match ? match[1] : 'Untitled';
}

function createTimestampedFiles(article) {
    console.log(`\nProcessing: ${article.name}`);
    console.log('-------------------------------------------');

    // Read files
    const originalContent = fs.readFileSync(article.originalPath, 'utf-8');
    const translationContent = fs.readFileSync(article.translationPath, 'utf-8');

    // Extract title
    const title = extractTitleFromContent(originalContent);
    console.log(`Title: ${title}`);

    // Generate filenames (use custom timestamp)
    const shortTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
        .replace(/-+$/, '');

    const originalFilename = `original-${shortTitle}-${article.timestamp}.md`;
    const translationFilename = `translation-${shortTitle}-${article.timestamp}.md`;
    const thumbnailFilename = `thumbnail-${shortTitle}-${article.timestamp}.png`;

    // Save timestamped files
    fs.writeFileSync(path.join('output', originalFilename), originalContent);
    fs.writeFileSync(path.join('output', translationFilename), translationContent);

    console.log(`✓ Created: ${originalFilename}`);
    console.log(`✓ Created: ${translationFilename}`);

    // Generate thumbnail
    const keywords = extractKeywords(translationContent);
    const thumbnailPath = path.join('output', thumbnailFilename);
    generateThumbnail(keywords, thumbnailPath);

    console.log(`✓ Created: ${thumbnailFilename}`);
    console.log(`  Keywords: "${keywords}"`);

    return {
        originalFilename,
        translationFilename,
        thumbnailFilename
    };
}

async function main() {
    console.log('=========================================');
    console.log('Retroactive Application Tool');
    console.log('=========================================');

    const results = [];

    // Process Article 1
    results.push(createTimestampedFiles(article1));

    // Process Article 2
    results.push(createTimestampedFiles(article2));

    console.log('\n=========================================');
    console.log('✅ All Done!');
    console.log('=========================================\n');

    console.log('Created files:');
    results.forEach((result, index) => {
        console.log(`\nArticle ${index + 1}:`);
        console.log(`  - ${result.originalFilename}`);
        console.log(`  - ${result.translationFilename}`);
        console.log(`  - ${result.thumbnailFilename}`);
    });

    console.log('\nAll timestamped files and thumbnails have been created!');
}

main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
});
