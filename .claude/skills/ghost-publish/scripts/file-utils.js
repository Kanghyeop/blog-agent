/**
 * Utility functions for file naming and management
 */

/**
 * Converts title to short filename-safe format
 */
function titleToFilename(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 50) // Limit length
        .replace(/-+$/, ''); // Remove trailing hyphens
}

/**
 * Gets current timestamp in YYYYMMDD-HHMMSS format
 */
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

/**
 * Generates timestamped filename
 * Example: original-how-to-be-successful-20231229-143022.md
 */
function generateFilename(prefix, title, extension = 'md') {
    const shortTitle = titleToFilename(title);
    const timestamp = getTimestamp();
    return `${prefix}-${shortTitle}-${timestamp}.${extension}`;
}

module.exports = {
    titleToFilename,
    getTimestamp,
    generateFilename
};
