# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLI tool that translates English articles to Korean and publishes them to Ghost blog. The pipeline:
1. Extracts content from URL or local file
2. Translates using Claude Haiku (cost-efficient)
3. Publishes to Ghost blog with markdown→HTML conversion

## Development Commands

### Setup
```bash
# Install Node.js dependencies (required)
npm install

# Configure environment
cp .env.example .env
# Edit .env with GHOST_URL and GHOST_ADMIN_API_KEY
```

### Token-Efficient Translation Workflow

**IMPORTANT**: This workflow minimizes Claude Code token usage by using external tools and scripts where possible.

```bash
# Step 1: Start workflow (optional, shows instructions)
node translate_and_publish.js <source_url> [original_url]

# Step 2: Extract content using Claude Code WebFetch
# (Claude Code will do this for you)

# Step 3: Claude Code translates and saves to output/translation.md
# (Claude Code will do this for you)

# Step 4: Publish to Ghost
node publish.js

# Step 5: Commit changes
git add -A && git commit -m "Translate: [article title]"
```

### Manual Translation (if needed)
```bash
# 1. Save original content to output/original.md
# 2. Manually translate or ask Claude Code to translate
# 3. Save translation to output/translation.md with notice:
#    > **번역 안내**: 이 글은 [원문](URL)을 한국어로 번역한 글입니다.
# 4. Run: node publish.js
```

### Testing
```bash
# Run all tests
poetry run pytest

# Run specific test file
poetry run pytest tests/pipeline/test_translator.py

# Run with coverage
poetry run pytest --cov=src/blog_agent --cov-report=html

# Run single test
poetry run pytest tests/pipeline/test_translator.py::test_translate
```

### Code Quality
```bash
# Format code (auto-fix)
poetry run black src/ tests/

# Lint (check only)
poetry run ruff check src/ tests/

# Type checking
poetry run mypy src/

# Run all quality checks
poetry run black src/ tests/ && poetry run ruff check src/ tests/ && poetry run mypy src/
```

## Architecture

### Token-Efficient Workflow

This project uses a **token-optimized workflow** for Claude Code:

**1. Content Extraction** (via WebFetch - no tokens):
- Claude Code uses WebFetch tool to get article content
- Content is extracted and saved to `output/original.md`
- WebFetch operates outside Claude's context, saving tokens

**2. Translation** (Claude Code - tokens used here):
- Claude Code reads `output/original.md`
- Translates to Korean in a single operation
- Adds translation notice: `> **번역 안내**: 이 글은 [원문](URL)을 한국어로 번역한 글입니다.`
- Saves to `output/translation.md`
- This is the ONLY step that uses significant tokens

**3. Publishing** (via Node.js script - no tokens):
- `publish.js` reads `output/translation.md`
- Converts markdown to HTML
- Publishes to Ghost via Admin API
- Returns post ID and URL
- Runs independently, no Claude Code tokens used

### Why This Approach?

- **Minimizes token usage**: Only translation step uses Claude Code context
- **Faster**: WebFetch and scripts run without conversation overhead
- **Reliable**: Each step is isolated and can be repeated independently
- **Cost-effective**: Translation is the only billable operation

### Directory Structure

```
src/blog_agent/         # Python pipeline (optional, not actively used)
├── cli.py              # CLI entry point (legacy)
├── core/               # Core classes (legacy)
├── pipeline/           # Pipeline components (legacy)
└── integrations/       # Ghost API client (legacy)

# Active workflow files (use these):
publish.js              # Ghost publishing script (ACTIVE)
translate_and_publish.js # Workflow helper (ACTIVE)

output/                 # Default output directory
├── original.md         # Extracted original content
├── translation.md      # Translated content
└── .workflow.json      # Workflow metadata

node_modules/           # Node.js dependencies
package.json            # Node.js package config
.env                    # Environment variables (Ghost credentials)
```

### CLI Entry Point

`src/blog_agent/cli.py` contains:
- `main()`: CLI entry point (registered in pyproject.toml)
- `run_pipeline()`: Async orchestration of three pipeline stages
- Argument parsing with mutually exclusive `--url` and `--source`
- Required `--allow-republish` safety flag validation

### Configuration

`src/blog_agent/core/config.py`:
- Uses Pydantic Settings for type-safe config
- Loads from `.env` file automatically
- Required settings:
  - `GHOST_URL`: Ghost blog URL (e.g., https://aiden.ghost.io)
  - `GHOST_ADMIN_API_KEY`: Ghost Admin API key
  - `ANTHROPIC_API_KEY`: Anthropic API key for Claude
- Optional settings:
  - `ANTHROPIC_MODEL`: Claude model (default: claude-3-haiku-20240307)
  - `MAX_RETRIES`: Retry count for API calls (default: 3)
  - `TIMEOUT_SECONDS`: Request timeout (default: 30)

### Ghost Integration

`src/blog_agent/integrations/ghost.py` - `GhostClient` class:
- Wraps `ghost-client` library
- Methods:
  - `create_post()`: Create new post (draft or published)
  - `update_post()`: Update existing post
  - `get_post()`: Retrieve post by ID
- Uses credentials from Settings
- All methods are async

### Translation Details

The translator (`pipeline/translator.py`):
- Default model: `claude-3-haiku-20240307` (cheapest, fast)
- Alternative models: `claude-3-5-sonnet-20241022` (better quality, more expensive)
- Translation prompt instructs Claude to:
  - Maintain markdown formatting
  - Preserve technical terms appropriately
  - Keep code blocks and structure intact
- Returns token usage (input/output) for cost tracking

### Safety Flag

The `--allow-republish` flag is required:
- Ensures user acknowledges they have permission to republish content
- CLI exits with error if flag is missing
- This is a legal/ethical safeguard against unauthorized republishing

## Common Tasks

### Translating a New Article

```bash
# 1. Start workflow (shows instructions)
node translate_and_publish.js <article_url>

# 2. Claude Code will:
#    - Use WebFetch to extract content → output/original.md
#    - Translate to Korean → output/translation.md
#    - Add translation notice with link

# 3. Publish
node publish.js

# 4. Commit
git add -A && git commit -m "Translate: [article title]"
```

### Publishing as Draft Instead of Published

Edit `publish.js`, change line ~52:
```javascript
posts: [{
    title: title,
    html: htmlContent,
    status: "draft"  // Change from "published" to "draft"
}]
```

### Translation Notice and Title Format

**Translation notice** is added to the top of `output/translation.md`:
```markdown
> **번역 안내**: 이 글은 [원문](https://original-url.com)을 한국어로 번역한 글입니다.
```

**Title format** for Ghost posts:
- Uses original English title from `output/original.md`
- Adds "[번역]" prefix
- Example: `[번역] How To Be Successful`
- This is handled automatically by `publish.js`

### Customizing Translation Style

When asking Claude Code to translate, provide specific instructions:

```
Please translate output/original.md to Korean with these guidelines:
- Use formal/informal tone
- Preserve technical terms in English
- Keep code blocks unchanged
- Translate to casual/professional style
```

## Technical Details

### Ghost API Authentication

`publish.js` uses JWT authentication:
- Splits API key into `id:secret`
- Creates JWT token with 5-minute expiration
- Sends as `Authorization: Ghost <token>` header

### Translation Guidelines

When translating with Claude Code:
1. **Preserve markdown formatting**: Keep headings, lists, links, code blocks
2. **Add translation notice**: Include original URL link at the top
3. **Maintain structure**: Don't reorganize content
4. **Keep code unchanged**: Code blocks stay in original language
5. **Translate naturally**: Don't be overly literal
6. **Title format**: Blog post titles use original English title with "[번역]" prefix
   - Example: "[번역] How To Be Successful"
   - The title is extracted from `output/original.md`, not the translation

### Git Workflow

All work is automatically committed:
```bash
# After each translation
git add -A
git commit -m "Translate: [article title]

- Extracted from: [original URL]
- Published to: [ghost URL]
- Translation saved to output/translation.md"
```

This creates a complete history of all translations.

### Error Handling

If `publish.js` fails:
- Check Ghost API credentials in `.env`
- Verify Ghost Admin API key has write permissions
- Check `output/translation.md` exists and has content
- Try publishing as draft first (change status in publish.js)

## Cost Optimization

### Current Approach (Token-Efficient)

**Token usage per article**:
- WebFetch content extraction: 0 tokens (external tool)
- Translation: ~3,000-5,000 tokens (Claude Code context)
- Publishing via Node.js: 0 tokens (external script)

**Total cost per article**: Minimal, only translation conversation tokens

### Why This Matters

- **Old approach**: Would use 10,000+ tokens per article (extraction, translation, publishing all in context)
- **New approach**: Uses ~3,000-5,000 tokens per article (only translation in context)
- **Savings**: ~70% reduction in token usage

### Best Practices

1. **Use WebFetch** for content extraction instead of asking Claude Code to browse
2. **Batch translations** if possible, but keep each translation in a separate conversation to avoid context bloat
3. **Use publish.js** instead of asking Claude Code to publish
4. **Keep output files**: `original.md` and `translation.md` can be reused without re-fetching
