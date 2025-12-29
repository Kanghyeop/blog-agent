# Blog Agent

CLI tool to translate English articles to Korean and publish to Ghost blog.

## 📚 Documentation

- **[README.md](README.md)** - 이 파일: 사용 가이드
- **[WORKFLOW.md](WORKFLOW.md)** - 간단 사용법 (한글)
- **[CLAUDE.md](CLAUDE.md)** - Claude Code를 위한 상세 문서
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - 개발 과정 아카이브 (교육용)
- **[SECURITY.md](SECURITY.md)** - API 키 보안 가이드

## 🛠️ Available Scripts

### Main Pipeline
- `node run.js <URL>` - 전체 파이프라인 실행 (6단계)

### Individual Tools
- `node publish.js` - Ghost 발행 (타임스탬프 파일 저장)
- `node generate-thumbnail.js` - 썸네일 생성 (2000x1200px)
- `node translate.js <URL>` - 번역 워크플로우 가이드
- `node update-ghost-thumbnails.js` - Ghost 포스트에 썸네일 추가

### Utilities
- `node file-utils.js` - 파일명 유틸리티 (라이브러리)
- `node retroactive-apply.js` - 기존 글에 기능 소급 적용
- `node append-development.js` - DEVELOPMENT.md 업데이트 헬퍼

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
