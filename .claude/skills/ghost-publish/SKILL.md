---
name: ghost-publish
description: Publish markdown content to Ghost blog with automatic thumbnail upload. Use when publishing to Ghost, updating posts, or managing Ghost blog content.
allowed-tools: Read, Bash
---

# Ghost Blog Publisher

## Quick Start

```bash
node publish.js              # Publish output/translation.md
node update-ghost-thumbnails.js  # Update existing posts
```

## Features

- Auto-upload feature images (2000x1200px thumbnails)
- Timestamped file archiving
- Ghost Admin API integration
- JWT authentication

## Configuration

Required environment variables in `.env`:
```
GHOST_URL=https://your-blog.ghost.io
GHOST_ADMIN_API_KEY=your_key_here
```

## Output

- Ghost post with `[번역]` prefix
- Timestamped files: `{prefix}-{title}-{YYYYMMDD-HHMMSS}.md`
- Latest files: `original.md`, `translation.md` (backward compatible)
