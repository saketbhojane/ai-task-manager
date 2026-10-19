from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.enums import TaskStatus, Priority
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import TaskService
from app.services.ai_service import get_ai_service, AIService

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def get_task_service(
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
) -> TaskService:
    """Dependency to get TaskService instance with AI support."""
    return TaskService(db, ai_service)


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    """Create a new task."""
    return service.create_task(task_data)


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[TaskStatus] = Query(None),
    priority: Optional[Priority] = Query(None),
    assignee_id: Optional[int] = Query(None),
    service: TaskService = Depends(get_task_service),
) -> list[TaskResponse]:
    """Get all tasks with optional filters and pagination."""
    return service.get_tasks(
        skip=skip,
        limit=limit,
        status=status,
        priority=priority,
        assignee_id=assignee_id,
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    """Get a task by ID."""
    return service.get_task(task_id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    """Update a task."""
    return service.update_task(task_id, task_data)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
) -> None:
    """Delete a task."""
    service.delete_task(task_id)
