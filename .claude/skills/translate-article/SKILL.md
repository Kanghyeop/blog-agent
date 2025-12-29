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

For cost savings (95% cheaper):
```
이거 Haiku로 번역해서 발행해줘: https://example.com/article
```

## Workflow Steps

### 1. Extract Content
Use WebFetch to extract article from URL → save to `output/original.md`

### 2. Translate
Spawn Haiku agent using Task tool for cost-efficient translation:
- Read `output/original.md`
- Translate to Korean with Task tool (model: haiku)
- Add translation notice with original URL
- Save to `output/translation.md`

**Cost**: ~$0.002/article with Haiku vs ~$0.05 with Sonnet

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

1. Add notice: `> **번역 안내**: 이 글은 [원문](URL)을 한국어로 번역한 글입니다.`
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
cd .claude/skills/translate-article && node scripts/translate.js <URL>
```
