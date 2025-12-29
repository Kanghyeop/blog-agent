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

**Option 1: Interactive Pipeline (Recommended)**

```bash
node run.js https://www.paulgraham.com/field.html
```

This will guide you through:
1. Extract content (via Claude Code WebFetch)
2. Translate to Korean (you can choose Haiku or Sonnet)
3. Publish to Ghost
4. Commit and push to GitHub

**Option 2: Manual Steps**

```bash
# 1. Ask Claude Code to extract
"Extract from <URL> to output/original.md"

# 2. Ask Claude Code to translate (Haiku for cost savings)
"Use Task tool with model='haiku' to translate output/original.md"

# 3. Publish
node publish.js

# 4. Commit
git add -A && git commit -m "Translate: [title]" && git push
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
