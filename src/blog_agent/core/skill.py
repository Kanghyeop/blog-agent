"""Base skill class for blog agent system."""

from abc import ABC, abstractmethod
from typing import Any, Dict


class Skill(ABC):
    """Base class for all skills in the system.

    Skills are reusable capabilities that agents can use to perform specific actions.
    Examples: content generation, image processing, API calls, formatting, etc.
    """

    def __init__(self, name: str, description: str) -> None:
        """Initialize skill with name and description.

        Args:
            name: Unique identifier for this skill
            description: Human-readable description of what this skill does
        """
        self.name = name
        self.description = description

    @abstractmethod
    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the skill's action.

        Args:
            params: Parameters needed for skill execution

        Returns:
            Results of skill execution
        """
        pass
