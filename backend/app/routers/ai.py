from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.task import Task
from app.models.enums import TaskStatus, Priority
from app.schemas.ai import (
    PrioritySuggestionRequest,
    PrioritySuggestionResponse,
    SummarizeRequest,
    SummarizeResponse,
)
from app.services.ai_service import get_ai_service, AIService

router = APIRouter(prefix="/api/ai", tags=["AI"])


def get_ai(ai_service: AIService = Depends(get_ai_service)) -> AIService:
    """Dependency to get AIService instance."""
    return ai_service


@router.post("/suggest-priority", response_model=PrioritySuggestionResponse)
def suggest_priority(
    request: PrioritySuggestionRequest,
    ai: AIService = Depends(get_ai),
) -> PrioritySuggestionResponse:
    """Get AI-suggested priority for a task based on title and description."""
    result = ai.suggest_priority(request.title, request.description)
    return PrioritySuggestionResponse(
        priority=result["priority"],
        reasoning=result["reasoning"],
    )


@router.post("/summarize", response_model=SummarizeResponse)
def summarize_tasks(
    request: SummarizeRequest,
    db: Session = Depends(get_db),
    ai: AIService = Depends(get_ai),
) -> SummarizeResponse:
    """Generate AI summary of tasks."""
    query = db.query(Task)

    if request.task_ids:
        query = query.filter(Task.id.in_(request.task_ids))

    tasks = query.all()

    task_dicts = [
        {
            "title": t.title,
            "description": t.description,
            "status": t.status.value,
            "priority": t.priority.value,
        }
        for t in tasks
    ]

    summary = ai.summarize_tasks(task_dicts)

    return SummarizeResponse(
        summary=summary,
        task_count=len(tasks),
    )


@router.get("/status")
def ai_status() -> dict:
    """Check AI service status."""
    from app.config import get_settings
    settings = get_settings()

    return {
        "enabled": settings.ai_enabled,
        "configured": bool(settings.anthropic_api_key),
        "model": settings.ai_model,
    }
