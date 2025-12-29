---
name: thumbnail-generator
description: Generate minimalist blog post thumbnails (2000x1200px) with black background and white text. Use when creating thumbnails, feature images, or when user mentions thumbnail generation.
allowed-tools: Read, Bash
---

# Thumbnail Generator

Generate Ghost blog feature images with minimalist design.

## Quick Start

Generate from translation file:
```bash
cd .claude/skills/thumbnail-generator && node scripts/generate-thumbnail.js
```

Automatically:
- Reads `output/translation.md`
- Extracts title/keywords
- Creates 2000x1200px PNG
- Saves with timestamp

## Design Specs

### Size
2000x1200px (Ghost recommended feature image size)

### Style
- **Background**: Solid black (#000000)
- **Text**: White (#FFFFFF)
- **Font**: Pretendard → Malgun Gothic → Apple SD Gothic Neo → Noto Sans KR
- **Layout**: Centered, auto-wrapped text

### Text Processing
- Auto-extracts keywords from article title
- Smart line breaking (max width: 85% of canvas)
- Font size: 120px (scales for long text)
- Line height: 1.3x font size

## Output Files

```
output/thumbnail-{title}-{timestamp}.png
output/thumbnail-latest.png
```

Example: `thumbnail-the-simplest-way-to-test-20251229-202656.png`

## Manual Generation

Custom title:
```bash
cd .claude/skills/thumbnail-generator && node scripts/generate-thumbnail.js "Custom Title"
```

## Dependencies

Requires `canvas` package:
```bash
npm install canvas
```

Uses Node.js Canvas API for server-side image generation.
