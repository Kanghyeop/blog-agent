#!/bin/bash

# Blog Agent Translation Pipeline
# Usage: ./run.sh <article_url>

set -e  # Exit on error

if [ -z "$1" ]; then
    echo "Usage: ./run.sh <article_url>"
    echo "Example: ./run.sh https://www.paulgraham.com/field.html"
    exit 1
fi

ARTICLE_URL="$1"

echo "========================================="
echo "Blog Agent Translation Pipeline"
echo "========================================="
echo ""
echo "Article URL: $ARTICLE_URL"
echo ""

# Step 1: Instructions for Claude Code
echo "Step 1: Content Extraction"
echo "-------------------------------------------"
echo "👉 Ask Claude Code:"
echo "   'Extract content from $ARTICLE_URL to output/original.md'"
echo ""
read -p "Press Enter when extraction is complete..."

# Step 2: Translation instructions
echo ""
echo "Step 2: Translation"
echo "-------------------------------------------"
echo "👉 Ask Claude Code:"
echo "   'Translate output/original.md to Korean, save to output/translation.md'"
echo "   'Add translation notice: > **번역 안내**: 이 글은 [원문]($ARTICLE_URL)을 한국어로 번역한 글입니다.'"
echo ""
echo "For cost efficiency, you can request:"
echo "   'Use Task tool with model=\"haiku\" to translate'"
echo ""
read -p "Press Enter when translation is complete..."

# Step 3: Publish
echo ""
echo "Step 3: Publishing to Ghost"
echo "-------------------------------------------"
node publish.js
if [ $? -ne 0 ]; then
    echo "❌ Publishing failed!"
    exit 1
fi

# Step 4: Git commit
echo ""
echo "Step 4: Committing to Git"
echo "-------------------------------------------"

# Extract title from original
TITLE=$(grep -m 1 "^# " output/original.md | sed 's/^# //')

if [ -z "$TITLE" ]; then
    TITLE="Untitled Article"
fi

echo "Title: $TITLE"
git add -A
git commit -m "Translate: $TITLE

- Extracted from: $ARTICLE_URL
- Translation saved to output/translation.md"

echo ""
echo "Step 5: Pushing to GitHub"
echo "-------------------------------------------"
git push origin master

echo ""
echo "========================================="
echo "✅ Pipeline Complete!"
echo "========================================="
echo ""
echo "Check your Ghost blog for the published post!"
