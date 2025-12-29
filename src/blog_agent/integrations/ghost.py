"""Ghost CMS integration for publishing blog posts."""

from typing import Any, Dict, Optional
from ghost import Ghost

from ..core.config import settings


class GhostClient:
    """Client for interacting with Ghost Admin API."""

    def __init__(self) -> None:
        """Initialize Ghost client with configuration from settings."""
        self.client = Ghost(
            url=settings.ghost_url,
            admin_api_key=settings.ghost_admin_api_key
        )

    async def create_post(
        self,
        title: str,
        content: str,
        tags: Optional[list[str]] = None,
        featured: bool = False,
        status: str = "draft"
    ) -> Dict[str, Any]:
        """Create a new blog post in Ghost.

        Args:
            title: Post title
            content: Post content in HTML or Markdown
            tags: Optional list of tag names
            featured: Whether to mark post as featured
            status: Post status ('draft' or 'published')

        Returns:
            Created post data from Ghost API
        """
        post_data = {
            "title": title,
            "html": content,
            "status": status,
            "featured": featured,
        }

        if tags:
            post_data["tags"] = [{"name": tag} for tag in tags]

        return self.client.posts.create(**post_data)

    async def update_post(self, post_id: str, **kwargs: Any) -> Dict[str, Any]:
        """Update an existing blog post.

        Args:
            post_id: ID of the post to update
            **kwargs: Fields to update

        Returns:
            Updated post data from Ghost API
        """
        return self.client.posts.update(post_id, **kwargs)

    async def get_post(self, post_id: str) -> Dict[str, Any]:
        """Retrieve a blog post by ID.

        Args:
            post_id: ID of the post to retrieve

        Returns:
            Post data from Ghost API
        """
        return self.client.posts.get(post_id)
