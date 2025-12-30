const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { generateFilename } = require('./file-utils');

// Ghost recommended feature image size
const WIDTH = 2000;
const HEIGHT = 1200;

/**
 * Extracts key keywords from markdown content
 * Prioritizes H1 and H2 headings
 */
function extractKeywords(markdown, maxLength = 80) {
    // First try to get H1
    const h1Match = markdown.match(/^# (.+)$/m);
    if (h1Match) {
        const title = h1Match[1];
        // If title is short enough, return it
        if (title.length <= maxLength) {
            return title;
        }
        // Otherwise, truncate with ellipsis
        return title.substring(0, maxLength - 3) + '...';
    }

    // If no H1, try H2
    const h2Match = markdown.match(/^## (.+)$/m);
    if (h2Match) {
        return h2Match[1].substring(0, maxLength);
    }

    // Fallback: first line of content
    const lines = markdown.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
        const firstLine = lines[0].replace(/^#+\s*/, ''); // Remove heading markers
        return firstLine.substring(0, maxLength);
    }

    return 'Blog Post';
}

/**
 * Wraps text to fit within specified width
 */
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

/**
 * Generates a thumbnail image for Ghost blog
 */
function generateThumbnail(title, outputPath) {
    // Create canvas
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // White text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Try to use Pretendard or fallback to system fonts
    // Font list: Pretendard, Malgun Gothic (Windows), Apple Gothic (Mac), Noto Sans KR (Linux)
    const fontSize = 120;
    ctx.font = `bold ${fontSize}px Pretendard, "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;

    // Wrap text if needed
    const maxWidth = WIDTH * 0.85; // 85% of canvas width
    const lines = wrapText(ctx, title, maxWidth);

    // Calculate starting Y position to center all lines
    const lineHeight = fontSize * 1.3;
    const totalHeight = lines.length * lineHeight;
    let y = (HEIGHT - totalHeight) / 2 + (fontSize / 2);

    // Draw each line
    lines.forEach(line => {
        ctx.fillText(line, WIDTH / 2, y);
        y += lineHeight;
    });

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
}

async function main() {
    try {
        // Read translation for keywords
        const translationPath = path.join('output', 'translation.md');

        if (!fs.existsSync(translationPath)) {
            console.error('Error: output/translation.md not found');
            console.log('Please run the translation first');
            process.exit(1);
        }

        const content = fs.readFileSync(translationPath, 'utf-8');

        // Extract keywords/title
        const keywords = extractKeywords(content);
        console.log(`Generating thumbnail with text: "${keywords}"`);

        // Generate filename
        const thumbnailFilename = generateFilename('thumbnail', keywords, 'png');
        const thumbnailPath = path.join('output', thumbnailFilename);

        // Generate thumbnail
        generateThumbnail(keywords, thumbnailPath);

        console.log('✓ Thumbnail generated successfully!');
        console.log(`  File: ${thumbnailFilename}`);
        console.log(`  Size: ${WIDTH}x${HEIGHT}px (Ghost recommended)`);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Allow script to be run directly or imported as module
if (require.main === module) {
    main();
}

module.exports = { generateThumbnail, extractKeywords };
