import json
from typing import Optional
import anthropic
from fastapi import HTTPException, status

from app.config import get_settings
from app.models.enums import Priority

settings = get_settings()


class AIService:
    """Service for AI-powered task analysis."""

    def __init__(self):
        if not settings.anthropic_api_key:
            self.client = None
        else:
            self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def _check_enabled(self) -> None:
        """Check if AI is enabled and configured."""
        if not settings.ai_enabled:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI features are disabled",
            )
        if not self.client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI is not configured. Set ANTHROPIC_API_KEY in environment.",
            )

    def suggest_priority(self, title: str, description: Optional[str] = None) -> dict:
        """
        Analyze task and suggest priority level.

        Returns:
            dict with 'priority' (high/medium/low) and 'reasoning' (explanation)
        """
        self._check_enabled()

        task_text = f"Title: {title}"
        if description:
            task_text += f"\nDescription: {description}"

        prompt = f"""Analyze this task and suggest a priority level.

Task:
{task_text}

Consider these factors:
- Urgency: Does it need immediate attention?
- Impact: What's the consequence of delay?
- Dependencies: Are other tasks blocked by this?
- Keywords: Look for urgent words like "critical", "ASAP", "bug", "broken", "deadline"

Respond with a JSON object containing:
- "priority": one of "high", "medium", or "low"
- "reasoning": a brief explanation (1-2 sentences)

Example response:
{{"priority": "high", "reasoning": "This is a critical bug affecting users and should be fixed immediately."}}

Respond ONLY with the JSON object, no other text."""

        try:
            message = self.client.messages.create(
                model=settings.ai_model,
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = message.content[0].text.strip()
            result = json.loads(response_text)

            # Validate priority value
            priority_value = result.get("priority", "medium").lower()
            if priority_value not in ["high", "medium", "low"]:
                priority_value = "medium"

            return {
                "priority": Priority(priority_value),
                "reasoning": result.get("reasoning", ""),
            }
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract priority from text
            response_lower = response_text.lower()
            if "high" in response_lower:
                priority = Priority.HIGH
            elif "low" in response_lower:
                priority = Priority.LOW
            else:
                priority = Priority.MEDIUM
            return {
                "priority": priority,
                "reasoning": "Priority determined from AI analysis.",
            }
        except anthropic.APIError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI service error: {str(e)}",
            )

    def summarize_tasks(self, tasks: list[dict]) -> str:
        """
        Generate a summary of multiple tasks.

        Args:
            tasks: List of task dicts with title, description, status, priority

        Returns:
            Summary string
        """
        self._check_enabled()

        if not tasks:
            return "No tasks to summarize."

        tasks_text = "\n".join(
            f"- [{t.get('status', 'unknown')}] [{t.get('priority', 'medium')}] {t.get('title', 'Untitled')}"
            + (f": {t.get('description', '')[:100]}" if t.get('description') else "")
            for t in tasks
        )

        prompt = f"""Summarize these tasks concisely. Highlight:
1. Total count and status breakdown
2. High priority items that need attention
3. Overall progress assessment

Tasks:
{tasks_text}

Provide a brief, actionable summary (3-5 sentences)."""

        try:
            message = self.client.messages.create(
                model=settings.ai_model,
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}],
            )

            return message.content[0].text.strip()
        except anthropic.APIError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI service error: {str(e)}",
            )


# Singleton instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Get or create AIService singleton."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
