---
name: translate-article
description: Translate English articles to Korean and publish to Ghost blog. Use when user asks to translate and publish an article URL, mentions translation, Ghost publishing, or says "번역해서 발행해줘".
allowed-tools: Read, Write, Bash, WebFetch, Task
model: sonnet
---

# Translate & Publish Article

Complete workflow for translating English articles to Korean and publishing to Ghost.

## User Prompts

```
이거 번역해서 발행해줘: https://example.com/article
```

**Model Selection** (specify quality/cost preference):
```
이거 Haiku로 번역해서 발행해줘: https://example.com/article   # Cost-efficient (default)
이거 Sonnet으로 번역해서 발행해줘: https://example.com/article # High-quality
이거 Opus로 번역해서 발행해줘: https://example.com/article    # Best quality
```

## Workflow Steps

### 1. Extract Content
Use WebFetch to extract article from URL → save to `output/original.md`

### 2. Translate
Spawn translation agent using Task tool:
- Read `output/original.md`
- Translate to Korean with Task tool (model: haiku|sonnet|opus)
- Add translation notice with original URL AND model name
- Save to `output/translation.md`

**Model Options**:
- **Haiku** (default): ~$0.002/article - Cost-efficient, good quality
- **Sonnet**: ~$0.05/article - High-quality, recommended for complex content
- **Opus**: ~$0.35/article - Best quality, for critical translations

### 3. Generate Thumbnail
Run thumbnail generator (2000x1200px, black bg, white text):
```bash
cd .claude/skills/thumbnail-generator && node scripts/generate-thumbnail.js
```

### 4. Publish to Ghost
Run publisher with automatic file archiving:
```bash
cd .claude/skills/ghost-publish && node scripts/publish.js
```

### 5. Git Commit
```bash
git add -A
git commit -m "Translate: [title]
- From: [URL]
- Published: [Ghost URL]"
git push origin master
```

## Translation Guidelines

1. Add notice with model info: `> **번역 안내**: 이 글은 [원문](URL)을 Claude [Model Name]로 번역한 글입니다.`
2. Title format: `[번역] Original English Title`
3. Preserve markdown formatting
4. Keep code blocks unchanged
5. Translate naturally for Korean readers

## Output Files

- `output/original.md` - Latest original
- `output/translation.md` - Latest translation
- `output/original-{title}-{timestamp}.md` - Archived
- `output/translation-{title}-{timestamp}.md` - Archived
- `output/thumbnail-{title}-{timestamp}.png` - Thumbnail

## Scripts

Full pipeline (interactive):
```bash
cd .claude/skills/translate-article && node scripts/run.js <URL>
```

Translation helper:
```bash
cd .claude/skills/translate-article && node scripts/translate.js <URL> [--model=haiku|sonnet|opus]
```

Examples:
```bash
node scripts/translate.js https://example.com/article                # Haiku (default)
node scripts/translate.js https://example.com/article --model=sonnet # Sonnet
node scripts/translate.js https://example.com/article --model=opus   # Opus
```
