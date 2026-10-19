from typing import Optional
from pydantic import BaseModel

from app.models.enums import Priority


class PrioritySuggestionRequest(BaseModel):
    """Request schema for priority suggestion."""
    title: str
    description: Optional[str] = None


class PrioritySuggestionResponse(BaseModel):
    """Response schema for priority suggestion."""
    priority: Priority
    reasoning: str


class SummarizeRequest(BaseModel):
    """Request schema for task summarization."""
    task_ids: Optional[list[int]] = None  # If None, summarize all tasks


class SummarizeResponse(BaseModel):
    """Response schema for task summarization."""
    summary: str
    task_count: int
