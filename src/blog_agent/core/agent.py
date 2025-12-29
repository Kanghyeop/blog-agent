"""Base agent class for blog agent system."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List

from .skill import Skill


class Agent(ABC):
    """Base class for all agents in the system.

    Agents are autonomous components that use skills to accomplish tasks.
    Each agent should have a specific responsibility in the blog publishing workflow.
    """

    def __init__(self, name: str, skills: List[Skill]) -> None:
        """Initialize agent with name and available skills.

        Args:
            name: Unique identifier for this agent
            skills: List of skills this agent can use
        """
        self.name = name
        self.skills = {skill.name: skill for skill in skills}

    @abstractmethod
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's primary task.

        Args:
            task: Task parameters and context

        Returns:
            Results of task execution
        """
        pass

    def get_skill(self, skill_name: str) -> Skill:
        """Retrieve a skill by name.

        Args:
            skill_name: Name of the skill to retrieve

        Returns:
            The requested skill

        Raises:
            KeyError: If skill is not available to this agent
        """
        return self.skills[skill_name]
