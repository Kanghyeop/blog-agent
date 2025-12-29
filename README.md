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

## Output

- `output/original.md`: Extracted English content
- `output/translation.md`: Korean translation with notice
- Ghost post: `[번역] Original Title`
- Git commit with article info

## Project Structure

```
blog-agent/
├── run.js              # Interactive pipeline script
├── publish.js          # Ghost publishing
├── translate.js        # Translation workflow helper
├── output/             # Translation files
│   ├── original.md
│   └── translation.md
├── CLAUDE.md           # Documentation for Claude Code
└── README.md           # This file
```
