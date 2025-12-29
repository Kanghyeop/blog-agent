# Blog Agent

CLI tool to translate English articles to Korean and publish to Ghost blog.

## Features

- Extract content from URLs or local markdown files
- Translate using Claude Haiku (cost-efficient)
- Publish directly to Ghost blog
- Save intermediate files (original.md, translation.md)

## Setup

1. Install dependencies:
```bash
poetry install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Ghost and Anthropic API credentials
```

## Usage

Translate from URL:
```bash
poetry run blog-agent --url https://example.com/article --allow-republish
```

Translate from local file:
```bash
poetry run blog-agent --source article.md --allow-republish
```

Options:
- `--url <URL>`: URL of article to translate
- `--source <FILE>`: Local markdown file to translate
- `--allow-republish`: Required safety flag (only use with permission)
- `--output-dir <DIR>`: Output directory (default: output/)

## Pipeline

1. **Extract**: Get content from URL or local file → save to `original.md`
2. **Translate**: Use Claude Haiku to translate to Korean → save to `translation.md`
3. **Publish**: Convert markdown to HTML and publish to Ghost blog

## Development

Run tests:
```bash
poetry run pytest
```

Type checking:
```bash
poetry run mypy src/
```

Linting and formatting:
```bash
poetry run ruff check src/
poetry run black src/
```
