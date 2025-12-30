# Blog Agent

Translate English articles to Korean and publish to Ghost blog using Claude Code.

## Quick Start

```bash
# Setup
npm install
cp .env.example .env  # Add your Ghost credentials
```

**Just ask Claude Code:**
```
이거 번역해서 발행해줘: https://example.com/article
```

**Cost savings (95% cheaper):**
```
이거 Haiku로 번역해서 발행해줘: https://example.com/article
```

Claude Code automatically:
1. Extracts content with WebFetch
2. Translates to Korean (Haiku/Sonnet)
3. Generates thumbnail (2000x1200px)
4. Publishes to Ghost
5. Commits and pushes to Git

## 📚 Documentation

| File | Description |
|------|-------------|
| [WORKFLOW.md](WORKFLOW.md) | 간단 사용법 (한글) |
| [CLAUDE.md](CLAUDE.md) | Claude Code 가이드 |
| [SECURITY.md](SECURITY.md) | API 키 보안 |
| [DEVELOPMENT.md](DEVELOPMENT.md) | 개발 과정 아카이브 |

## 🎯 Skills

- **ghost-publish**: Publish markdown content to Ghost blog with automatic thumbnail upload and timestamped archiving. Use when publishing to Ghost, updating posts, or managing Ghost blog content.
- **git-workflow**: Automate routine Git operations including status checks, commits, pushes, and branch management. Use when user mentions "commit", "push", "git", "deploy", or wants to save their work.
- **korean-rewriter**: 번역된 한국어 텍스트를 원어민이 처음부터 쓴 것처럼 리라이트하는 스킬. 번역투 제거, 말맛 살리기, 원저자 톤 보존이 필요할 때 사용. (1) 영한 번역 후 윤문, (2) 번역체 문장 다듬기, (3) 한국어 문장의 자연스러움 개선 시 활용.
- **skill-generator**: Create new Claude Code skills following official best practices. Use when user asks to create a new skill, generate a skill, or organize code into a skill structure.
- **thumbnail-generator**: Generate minimalist blog post thumbnails (2000x1200px) with black background and white text. Use when creating thumbnails, feature images, or when user mentions thumbnail generation.
- **translate-article**: Translate English articles to Korean and publish to Ghost blog. Use when user asks to translate and publish an article URL, mentions translation, Ghost publishing, or says "번역해서 발행해줘".


## 💰 Cost Comparison

| Model | Cost/Article | Quality | Use Case |
|-------|--------------|---------|----------|
| **Haiku** | ~$0.002 | Good | Default (95% 절감) |
| Sonnet | ~$0.05 | Excellent | Complex content |
| Opus | ~$0.35 | Best | Critical translations |

**Recommendation**: Use Haiku for most articles.

## 📦 Output

```
output/
├── original.md                          # Latest original
├── translation.md                       # Latest translation
├── original-{title}-{timestamp}.md      # Archived
├── translation-{title}-{timestamp}.md   # Archived
└── thumbnail-{title}-{timestamp}.png    # Thumbnail (2000x1200px)
```

Ghost post format: `[번역] Original English Title`

## 🏗️ Project Structure

```
.claude/skills/              # All functionality (Claude Code skills)
  ├── translate-article/     # Main workflow
  ├── ghost-publish/         # Publishing
  ├── thumbnail-generator/   # Image generation
  └── skill-generator/       # Meta skill
output/                      # Translation files
file-utils.js                # Shared utilities
```
