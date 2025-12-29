---
name: translate-article
description: Translate English articles to Korean and publish to Ghost blog. Use when user asks to translate and publish an article URL, mentions translation, Ghost publishing, or says "번역해서 발행해줘".
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# Translate & Publish Article

## Workflow

**User prompt examples:**
- "이거 번역해서 발행해줘: https://example.com/article"
- "Haiku로 번역해서 발행해줘: https://example.com/article"

### Steps

1. **Extract content** - Use WebFetch to get article content
2. **Translate** - Use Claude API (Haiku/Sonnet based on user request)
3. **Generate thumbnail** - Run `node generate-thumbnail.js`
4. **Publish** - Run `node publish.js`
5. **Git commit** - Auto-commit with article info

### Model Selection

| Model | Cost/Article | Use Case |
|-------|--------------|----------|
| Haiku | ~$0.002 | Default (95% cost savings) |
| Sonnet | ~$0.05 | Complex content |

### Commands

**Full pipeline:**
```bash
node run.js <URL>
```

**Individual steps:**
```bash
node translate.js <URL>      # Step-by-step guide
node generate-thumbnail.js   # Thumbnail only
node publish.js              # Publish only
```

## Output Format

- Title: `[번역] Original English Title`
- Files: Timestamped archives in `output/`
- Git: Auto-commit with article metadata
