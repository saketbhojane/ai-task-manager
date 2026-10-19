from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TaskStatus, Priority


class TaskBase(BaseModel):
    """Base schema for Task."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    status: TaskStatus = TaskStatus.TODO
    priority: Priority = Priority.MEDIUM
    assignee_id: Optional[int] = None
    auto_suggest_priority: bool = False  # If True, AI will suggest priority


class TaskUpdate(BaseModel):
    """Schema for updating a task. All fields optional."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    assignee_id: Optional[int] = None


class TaskResponse(TaskBase):
    """Schema for task response."""
    id: int
    status: TaskStatus
    priority: Priority
    ai_suggested_priority: Optional[Priority] = None
    assignee_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
