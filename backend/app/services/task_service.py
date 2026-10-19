from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.task import Task
from app.models.enums import TaskStatus, Priority
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    """Service class for Task operations."""

    def __init__(self, db: Session, ai_service=None):
        self.db = db
        self.ai_service = ai_service

    def create_task(self, task_data: TaskCreate) -> Task:
        """Create a new task."""
        ai_suggested_priority = None

        # Get AI suggestion if requested and AI service is available
        if task_data.auto_suggest_priority and self.ai_service:
            try:
                result = self.ai_service.suggest_priority(
                    task_data.title, task_data.description
                )
                ai_suggested_priority = result["priority"]
            except Exception:
                # AI failure shouldn't block task creation
                pass

        task = Task(
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            priority=task_data.priority,
            ai_suggested_priority=ai_suggested_priority,
            assignee_id=task_data.assignee_id,
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def get_task(self, task_id: int) -> Task:
        """Get a task by ID."""
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )
        return task

    def get_tasks(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[TaskStatus] = None,
        priority: Optional[Priority] = None,
        assignee_id: Optional[int] = None,
    ) -> list[Task]:
        """Get all tasks with optional filters and pagination."""
        query = self.db.query(Task)

        if status is not None:
            query = query.filter(Task.status == status)
        if priority is not None:
            query = query.filter(Task.priority == priority)
        if assignee_id is not None:
            query = query.filter(Task.assignee_id == assignee_id)

        return query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()

    def update_task(self, task_id: int, task_data: TaskUpdate) -> Task:
        """Update a task."""
        task = self.get_task(task_id)

        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, task_id: int) -> None:
        """Delete a task."""
        task = self.get_task(task_id)
        self.db.delete(task)
        self.db.commit()
