---
name: ghost-publish
description: Publish markdown content to Ghost blog with automatic thumbnail upload and timestamped archiving. Use when publishing to Ghost, updating posts, or managing Ghost blog content.
allowed-tools: Read, Bash
---

# Ghost Blog Publisher

Publish translated articles to Ghost blog with automated file management.

## Quick Start

Publish translation with automatic archiving:
```bash
cd .claude/skills/ghost-publish && node scripts/publish.js
```

Reads `output/translation.md` and publishes to Ghost with:
- Automatic thumbnail upload
- Timestamped file archiving
- `[번역]` title prefix

## Configuration

Required in `.env`:
```
GHOST_URL=https://your-blog.ghost.io
GHOST_ADMIN_API_KEY=your_key_here
```

Get API key from: `https://your-blog.ghost.io/ghost/#/settings/integrations`

## Features

### Automatic Timestamping
Creates archived copies:
- `original-{title}-{YYYYMMDD-HHMMSS}.md`
- `translation-{title}-{YYYYMMDD-HHMMSS}.md`

Maintains latest files for backward compatibility:
- `output/original.md`
- `output/translation.md`

### Ghost Integration
- JWT authentication
- HTML conversion from markdown
- Feature image (thumbnail) upload
- Published status (not draft)

## Output

After successful publish:
```
✓ Published successfully!
  Post ID: 6952658...
  URL: https://your-blog.ghost.io/beonyeog-article-title/
  Status: published
```

## Utilities

File naming utilities (`file-utils.js`):
```javascript
generateFilename(prefix, title, extension)
titleToFilename(title)  // Slug generation
getTimestamp()          // YYYYMMDD-HHMMSS
```
