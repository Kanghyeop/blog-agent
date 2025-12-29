"""Publishing translated content to Ghost."""

from typing import Dict, Any
import markdown

from ..integrations.ghost import GhostClient


class Publisher:
    """Publish markdown content to Ghost blog."""

    def __init__(self) -> None:
        """Initialize publisher with Ghost client."""
        self.ghost_client = GhostClient()

    async def publish(
        self,
        title: str,
        markdown_content: str,
        status: str = "published",
        tags: list[str] | None = None
    ) -> Dict[str, Any]:
        """Publish markdown content to Ghost.

        Args:
            title: Post title
            markdown_content: Content in markdown format
            status: Publication status ('published' or 'draft')
            tags: Optional list of tags

        Returns:
            Dictionary with 'id', 'url', and 'status' of published post
        """
        # Convert markdown to HTML
        html_content = self._markdown_to_html(markdown_content)

        # Publish to Ghost
        result = await self.ghost_client.create_post(
            title=title,
            content=html_content,
            tags=tags or [],
            status=status
        )

        return {
            "id": result.get("id"),
            "url": result.get("url"),
            "status": result.get("status")
        }

    def _markdown_to_html(self, content: str) -> str:
        """Convert markdown to HTML.

        Args:
            content: Markdown content

        Returns:
            HTML string
        """
        return markdown.markdown(
            content,
            extensions=['fenced_code', 'tables', 'nl2br']
        )
