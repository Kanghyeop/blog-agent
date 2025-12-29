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

All functionality is organized into Claude Code skills in `.claude/skills/`:

**translate-article** - Full translation workflow
**ghost-publish** - Ghost blog publishing
**thumbnail-generator** - Feature image generation
**skill-generator** - Create new skills

See individual `SKILL.md` files for details.

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
