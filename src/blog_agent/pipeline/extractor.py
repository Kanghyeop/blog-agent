"""Content extraction from URLs or local files."""

from pathlib import Path
from typing import Dict, Any
import trafilatura


class ContentExtractor:
    """Extract article content from URLs or local markdown files."""

    async def extract_from_url(self, url: str) -> Dict[str, Any]:
        """Extract content from a URL.

        Args:
            url: URL of the article to extract

        Returns:
            Dictionary with 'title', 'content', and 'metadata'
        """
        # Download and extract content
        downloaded = trafilatura.fetch_url(url)

        if not downloaded:
            raise ValueError(f"Failed to fetch URL: {url}")

        # Extract with metadata
        metadata = trafilatura.extract_metadata(downloaded)
        content = trafilatura.extract(
            downloaded,
            include_formatting=True,
            output_format='markdown',
            include_links=True,
            include_images=False
        )

        if not content:
            raise ValueError(f"Failed to extract content from URL: {url}")

        # Get title from metadata or content
        title = None
        if metadata:
            title = metadata.title

        if not title:
            title = self._extract_title(content)

        if not title:
            title = "Untitled"

        return {
            "title": title,
            "content": content,
            "metadata": {
                "source": url,
                "author": metadata.author if metadata else None,
                "date": metadata.date if metadata else None
            }
        }

    async def extract_from_file(self, filepath: Path) -> Dict[str, Any]:
        """Extract content from local markdown file.

        Args:
            filepath: Path to the markdown file

        Returns:
            Dictionary with 'title', 'content', and 'metadata'
        """
        content = filepath.read_text(encoding="utf-8")

        # Extract title from first heading or use filename
        title = self._extract_title(content) or filepath.stem

        return {
            "title": title,
            "content": content,
            "metadata": {"source": str(filepath)}
        }

    def _extract_title(self, content: str) -> str | None:
        """Extract title from markdown content (first # heading)."""
        for line in content.split("\n"):
            line = line.strip()
            if line.startswith("# "):
                return line[2:].strip()
        return None

    async def save_original(self, content: str, output_dir: Path) -> Path:
        """Save original content to markdown file.

        Args:
            content: Content to save
            output_dir: Directory to save file

        Returns:
            Path to saved file
        """
        output_path = output_dir / "original.md"
        output_path.write_text(content, encoding="utf-8")
        return output_path
