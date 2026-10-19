from enum import Enum


class TaskStatus(str, Enum):
    """Task status enum."""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class Priority(str, Enum):
    """Task priority enum."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
