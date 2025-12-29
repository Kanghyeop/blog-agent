# Blog Agent

CLI tool to translate English articles to Korean and publish to Ghost blog.

## 📚 Documentation

- **[README.md](README.md)** - 이 파일: Quick Start
- **[WORKFLOW.md](WORKFLOW.md)** - 간단 사용법 (한글)
- **[CLAUDE.md](CLAUDE.md)** - Claude Code 가이드
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - 개발 과정 (교육용)
- **[SECURITY.md](SECURITY.md)** - API 키 보안

## 🛠️ Scripts

### Main
- `node run.js <URL>` - 전체 파이프라인 (6단계)

### Tools
- `node publish.js` - Ghost 발행
- `node generate-thumbnail.js` - 썸네일 생성 (2000x1200px)
- `node translate.js <URL>` - 번역 가이드
- `node update-ghost-thumbnails.js` - 썸네일 업데이트

### Utilities
- `file-utils.js` - 파일명 유틸리티
- `retroactive-apply.js` - 기존 글 소급 적용
- `append-development.js` - DEVELOPMENT.md 헬퍼

## Quick Start

```bash
# Setup
npm install
cp .env.example .env  # Add your Ghost credentials

# Translate & Publish (Claude Code에게)
이거 번역해서 발행해줘: https://www.paulgraham.com/field.html

# Or for 95% cost savings
이거 Haiku로 번역해서 발행해줘: https://example.com/article
```

Claude Code will automatically:
1. ✅ WebFetch로 콘텐츠 추출
2. ✅ 한국어 번역 (Haiku/Sonnet)
3. ✅ 썸네일 생성 (2000x1200px)
4. ✅ Ghost 발행
5. ✅ Git 커밋 & 푸시

## Cost Comparison

| Model | Cost/Article | Quality | Use Case |
|-------|--------------|---------|----------|
| **Haiku** | ~$0.002 | Good | Default (권장, 95% 절감) |
| Sonnet | ~$0.05 | Excellent | 복잡한 내용 |
| Opus | ~$0.35 | Best | 중요한 번역 |

## Features

### Automatic Thumbnails
- **Size**: 2000x1200px (Ghost 권장)
- **Style**: Black background, white Pretendard text
- **Auto-upload**: Ghost feature image

### Timestamped Archives
- Format: `{prefix}-{title}-{YYYYMMDD-HHMMSS}.{ext}`
- Example: `original-how-to-be-successful-20231229-143022.md`
- Keeps latest files for backward compatibility

## Output

- `output/original.md` - Latest original
- `output/translation.md` - Latest translation
- `output/thumbnail-latest.png` - Latest thumbnail
- `output/*-{timestamp}.{md,png}` - Timestamped archives
- Ghost post: `[번역] Original Title`

## Project Structure

```
.claude/skills/          # Claude Code skills
output/                  # Translation files
publish.js               # Ghost publishing
generate-thumbnail.js    # Thumbnail generator
file-utils.js            # Utilities
run.js                   # Main pipeline
```
