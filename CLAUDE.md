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
# Install dependencies
poetry install

# Configure environment
cp .env.example .env
# Edit .env with GHOST_URL, GHOST_ADMIN_API_KEY, and ANTHROPIC_API_KEY
```

### Running the CLI
```bash
# From URL
poetry run blog-agent --url https://example.com/article --allow-republish

# From local file
poetry run blog-agent --source article.md --allow-republish

# Specify output directory
poetry run blog-agent --source article.md --allow-republish --output-dir my_output/
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

### Pipeline Components

The tool is organized as a three-stage pipeline in `src/blog_agent/pipeline/`:

**1. ContentExtractor** (`extractor.py`):
- Extracts article content from URLs or local markdown files
- For URLs: Uses trafilatura/beautifulsoup4 to scrape and parse HTML
- For local files: Reads markdown and extracts title from first `# heading`
- Saves extracted content to `output/original.md`

**2. Translator** (`translator.py`):
- Translates content using Claude API (default: Haiku model)
- Uses Anthropic SDK with async client
- Builds translation prompt that preserves markdown formatting
- Extracts translated title from first `# heading`
- Saves translation to `output/translation.md`
- Returns token usage for cost tracking

**3. Publisher** (`publisher.py`):
- Converts markdown to HTML using `markdown` library
- Publishes to Ghost blog via Ghost Admin API
- Uses title from translation (or falls back to original)
- Returns post ID, URL, and publication status

### Directory Structure

```
src/blog_agent/
├── cli.py              # CLI entry point with argparse
├── core/
│   ├── config.py       # Settings management (Pydantic)
│   ├── agent.py        # Base Agent class (legacy, may remove)
│   └── skill.py        # Base Skill class (legacy, may remove)
├── pipeline/           # Main pipeline components
│   ├── extractor.py    # Content extraction
│   ├── translator.py   # Claude translation
│   └── publisher.py    # Ghost publishing
└── integrations/
    └── ghost.py        # Ghost CMS API client wrapper

output/                 # Default output directory
├── original.md         # Extracted original content
└── translation.md      # Translated content

tests/                  # Mirror src/ structure
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

## Common Development Tasks

### Adding URL Extraction

Currently URL extraction raises `NotImplementedError`. To implement:
1. Use `trafilatura` for article extraction (already in dependencies)
2. Update `ContentExtractor.extract_from_url()` in `extractor.py`
3. Example pattern:
```python
import trafilatura

async def extract_from_url(self, url: str) -> Dict[str, Any]:
    downloaded = trafilatura.fetch_url(url)
    content = trafilatura.extract(downloaded, include_formatting=True)
    # Extract title and metadata
    return {"title": title, "content": content, "metadata": {...}}
```

### Changing Translation Model

Edit `.env`:
```bash
# For better quality (more expensive)
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# For cheapest option (current default)
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

### Adding Custom Prompt Instructions

Modify `Translator._build_translation_prompt()` in `translator.py`:
```python
def _build_translation_prompt(self, content: str, source_lang: str, target_lang: str) -> str:
    return f"""Translate to {target_lang}.

Custom instructions here (e.g., "Use informal tone", "Preserve brand names").

Article:
{content}"""
```

### Publishing as Draft Instead of Published

Modify `cli.py`, `run_pipeline()` function:
```python
result = await publisher.publish(
    title=title,
    markdown_content=translation["translated_content"],
    status="draft"  # Change from "published" to "draft"
)
```

## Technical Patterns

### Async/Await

All pipeline components use async:
- Pipeline stages are async functions
- Ghost API calls are async
- Claude API calls are async
- Main orchestration uses `asyncio.run()`

### Type Annotations

Strictly typed (enforced by mypy):
- All functions have parameter and return type hints
- Use `Dict[str, Any]` for flexible data structures
- Use `str | None` for optional strings (Python 3.10+ union syntax)
- Pydantic models for settings validation

### Error Handling

Currently minimal error handling. To improve:
- Add retry logic using `MAX_RETRIES` from settings
- Handle API failures gracefully
- Validate extracted content before translation
- Catch Ghost API errors and provide user-friendly messages

## Cost Estimation

Using Claude Haiku (default):
- ~$0.001 - $0.003 per article translation
- Input: $0.25 per million tokens
- Output: $1.25 per million tokens
- Typical article: 1000-3000 tokens

Using Claude Sonnet:
- ~$0.01 - $0.03 per article translation
- Higher quality but 10x more expensive
