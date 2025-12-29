# Blog Agent

CLI tool to translate English articles to Korean and publish to Ghost blog.

## Features

- Extract content from URLs using WebFetch
- Translate using Claude (Haiku for cost efficiency, Sonnet for quality)
- Publish directly to Ghost blog with proper formatting
- Automatic Git commit and push
- Title format: `[번역] Original English Title`

## Quick Start

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Ghost credentials
```

### Translate an Article

**Just ask Claude Code directly:**

```
이거 번역해서 발행해줘: https://www.paulgraham.com/field.html
```

Or for cost savings (95% cheaper):

```
이거 Haiku로 번역해서 발행해줘: https://example.com/article
```

Claude Code will automatically:
1. ✅ Extract content with WebFetch
2. ✅ Translate to Korean (Haiku or Sonnet)
3. ✅ Publish to Ghost
4. ✅ Commit and push to GitHub

**Alternative: Manual Pipeline**

```bash
node run.js <URL>  # Interactive step-by-step guide
```

## Cost Comparison

| Model | Cost/Article | Quality | Use Case |
|-------|-------------|---------|----------|
| **Haiku** | ~$0.002 | Good | Most articles (recommended) |
| Sonnet | ~$0.05 | Excellent | Complex/nuanced content |
| Opus | ~$0.35 | Best | Critical translations |

**Recommendation**: Use Haiku for 95% cost savings with excellent quality.

## Features

### Automatic Thumbnail Generation

Blog Agent automatically generates thumbnails for your Ghost blog posts:

- **Size**: 2000x1200px (Ghost recommended feature image size)
- **Design**: Minimalist black background with white text
- **Content**: Extracted from article title/keywords
- **Font**: System fonts with Korean support (Pretendard, Malgun Gothic, etc.)

Generate manually:
```bash
node generate-thumbnail.js
```

### Timestamped Archives

All translations are automatically archived with timestamps:
- Format: `{prefix}-{short-title}-{YYYYMMDD-HHMMSS}.{ext}`
- Example: `original-how-to-be-successful-20231229-143022.md`
- Keeps `original.md` and `translation.md` as latest for backward compatibility

## Output

- `output/original.md`: Latest extracted English content
- `output/translation.md`: Latest Korean translation with notice
- `output/original-{title}-{timestamp}.md`: Timestamped archive of original
- `output/translation-{title}-{timestamp}.md`: Timestamped archive of translation
- `output/thumbnail-{title}-{timestamp}.png`: Generated thumbnail (2000x1200px)
- `output/thumbnail-latest.png`: Latest thumbnail for easy access
- Ghost post: `[번역] Original Title`
- Git commit with article info

## Project Structure

```
blog-agent/
├── run.js                   # Interactive pipeline script (6 steps)
├── publish.js               # Ghost publishing (auto-saves timestamped files)
├── generate-thumbnail.js    # Thumbnail generator (2000x1200px)
├── file-utils.js            # Filename utilities (timestamps, slugs)
├── translate.js             # Translation workflow helper
├── output/                  # Translation files
│   ├── original.md          # Latest original
│   ├── translation.md       # Latest translation
│   ├── thumbnail-latest.png # Latest thumbnail
│   └── *-YYYYMMDD-*.{md,png} # Timestamped archives
├── CLAUDE.md                # Documentation for Claude Code
├── WORKFLOW.md              # Simple workflow (Korean)
├── SECURITY.md              # API key security guide
├── DEVELOPMENT.md           # Development process archive
└── README.md                # This file
```
