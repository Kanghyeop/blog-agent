"""CLI interface for blog agent."""

import argparse
import asyncio
from pathlib import Path
import sys

from .pipeline import ContentExtractor, Translator, Publisher


async def run_pipeline(
    url: str | None = None,
    source: Path | None = None,
    allow_republish: bool = False,
    output_dir: Path = Path("output")
) -> None:
    """Run the translation and publishing pipeline.

    Args:
        url: URL of article to translate
        source: Local markdown file to translate
        allow_republish: Safety flag confirming rights/permission
        output_dir: Directory to save output files
    """
    if not allow_republish:
        print("Error: --allow-republish flag is required")
        print("Only use this flag if you have rights/permission to republish the content")
        sys.exit(1)

    if not url and not source:
        print("Error: Either --url or --source must be provided")
        sys.exit(1)

    output_dir.mkdir(exist_ok=True)

    # Step 1: Extract content
    print("Step 1: Extracting content...")
    extractor = ContentExtractor()

    if url:
        article = await extractor.extract_from_url(url)
    else:
        article = await extractor.extract_from_file(source)

    original_path = await extractor.save_original(article["content"], output_dir)
    print(f"✓ Original saved to: {original_path}")

    # Step 2: Translate
    print("\nStep 2: Translating content (using Claude Haiku)...")
    translator = Translator(model="claude-3-haiku-20240307")
    translation = await translator.translate(article["content"])

    translation_path = await translator.save_translation(
        translation["translated_content"],
        output_dir
    )
    print(f"✓ Translation saved to: {translation_path}")
    print(f"  Tokens used: {translation['usage']['input_tokens']} in, "
          f"{translation['usage']['output_tokens']} out")

    # Step 3: Publish to Ghost
    print("\nStep 3: Publishing to Ghost...")
    publisher = Publisher()

    title = translation["title"] or article["title"]
    result = await publisher.publish(
        title=title,
        markdown_content=translation["translated_content"],
        status="published"
    )

    print(f"✓ Published successfully!")
    print(f"  Post ID: {result['id']}")
    print(f"  URL: {result['url']}")
    print(f"  Status: {result['status']}")


def main() -> None:
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Translate and publish articles to Ghost blog"
    )

    source_group = parser.add_mutually_exclusive_group(required=True)
    source_group.add_argument(
        "--url",
        type=str,
        help="URL of the article to translate"
    )
    source_group.add_argument(
        "--source",
        type=Path,
        help="Local markdown file to translate"
    )

    parser.add_argument(
        "--allow-republish",
        action="store_true",
        help="Required safety flag: only use when you have rights/permission"
    )

    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("output"),
        help="Directory to save output files (default: output/)"
    )

    args = parser.parse_args()

    asyncio.run(run_pipeline(
        url=args.url,
        source=args.source,
        allow_republish=args.allow_republish,
        output_dir=args.output_dir
    ))


if __name__ == "__main__":
    main()
