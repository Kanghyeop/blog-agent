# CLAUDE.md

Claude Code 작업 가이드

## Project Overview

영문 아티클을 한국어로 번역하고 Ghost 블로그에 발행하는 CLI 도구

**파이프라인**: URL 추출 → 번역 (Claude Haiku) → Ghost 발행

## Quick Start

```bash
# Setup
npm install
cp .env.example .env  # Edit with your Ghost credentials

# Translate & Publish
node run.js <URL>     # 6-step pipeline
```

## Workflow (Token-Efficient)

### Option 1: Haiku Translation (권장, 95% 절감)

```bash
node translate.js <URL>
# Claude Code spawns Haiku agent for translation
node publish.js
git add -A && git commit -m "..." && git push
```

**비용**: ~$0.002/article

### Option 2: Sonnet Translation (고품질)

WebFetch 추출 → Sonnet 번역 → publish.js

**비용**: ~$0.05/article

## Commands

```bash
# Main Pipeline
node run.js <URL>              # Full 6-step workflow

# Individual Steps
node translate.js <URL>        # Translation guide
node generate-thumbnail.js     # Thumbnail (2000x1200px)
node publish.js                # Publish to Ghost
node update-ghost-thumbnails.js # Update existing posts

# Utilities
node file-utils.js             # Filename utilities
node retroactive-apply.js      # Apply features to old posts
```

## Architecture

### Token Optimization

1. **WebFetch** (0 tokens): Extract → `output/original.md`
2. **Translation** (tokens used): Read → Translate → `output/translation.md`
3. **Publishing** (0 tokens): `publish.js` → Ghost API

### Directory Structure

```
.claude/skills/          # Claude Code skills
output/                  # Translation files
  ├── original.md
  ├── translation.md
  └── thumbnail-*.png
publish.js               # Ghost publishing
generate-thumbnail.js    # Thumbnail generator
file-utils.js            # Filename utilities
```

## Configuration

`.env` 필수 설정:
```
GHOST_URL=https://your-blog.ghost.io
GHOST_ADMIN_API_KEY=your_key_here
```

## Translation Guidelines

1. Preserve markdown formatting
2. Add translation notice: `> **번역 안내**: 이 글은 [원문](URL)을 한국어로 번역한 글입니다.`
3. Title format: `[번역] Original English Title`
4. Keep code blocks unchanged
5. Maintain structure

## Cost Comparison

| Model | Cost/Article | Quality | Use Case |
|-------|--------------|---------|----------|
| **Haiku 3.5** | ~$0.002 | Good | Default (권장) |
| Sonnet 4.5 | ~$0.05 | Excellent | Complex content |
| Opus 4.5 | ~$0.35 | Best | Critical translations |

## Common Issues

**Publishing fails?**
- Check `.env` credentials
- Verify Ghost Admin API key permissions
- Try `status: "draft"` in publish.js

**Token usage too high?**
- Use Haiku via `node translate.js`
- Avoid re-translating (use cached files)

## Features

### Timestamped Archives

Format: `{prefix}-{title}-{YYYYMMDD-HHMMSS}.{ext}`

Example: `original-how-to-be-successful-20231229-143022.md`

### Automatic Thumbnails

- Size: 2000x1200px (Ghost recommended)
- Style: Black background, white Pretendard text
- Auto-generated from article keywords

### Git Automation

모든 번역은 자동 커밋:
```bash
git add -A
git commit -m "Translate: [title]
- From: [URL]
- Published: [Ghost URL]"
git push
```
