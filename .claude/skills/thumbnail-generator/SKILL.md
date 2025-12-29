---
name: thumbnail-generator
description: Generate blog post thumbnails with minimalist design. Use when creating thumbnails, feature images, or when user mentions thumbnail generation.
allowed-tools: Read, Bash
---

# Thumbnail Generator

## Quick Start

```bash
node generate-thumbnail.js
```

Generates thumbnail from `output/translation.md` with automatic timestamped filename.

## Design Specs

- **Size**: 2000x1200px (Ghost recommended)
- **Style**: Black background (#000000), white text (#FFFFFF)
- **Font**: Pretendard, Malgun Gothic (Korean support)
- **Text**: Auto-extracted keywords with smart wrapping

## Output

- `output/thumbnail-{title}-{timestamp}.png`
- `output/thumbnail-latest.png` (symlink for convenience)

## Manual Generation

```bash
node generate-thumbnail.js "Custom Title Text"
```
