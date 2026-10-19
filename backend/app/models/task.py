from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base
from app.models.enums import TaskStatus, Priority


class Task(Base):
    """Task model for task management."""

    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    status: Mapped[TaskStatus] = mapped_column(
        SQLEnum(
            TaskStatus,
            name="task_status",
            create_constraint=False,
            values_callable=lambda x: [e.value for e in x],
        ),
        default=TaskStatus.TODO,
        nullable=False,
    )
    priority: Mapped[Priority] = mapped_column(
        SQLEnum(
            Priority,
            name="priority",
            create_constraint=False,
            values_callable=lambda x: [e.value for e in x],
        ),
        default=Priority.MEDIUM,
        nullable=False,
    )
    ai_suggested_priority: Mapped[Optional[Priority]] = mapped_column(
        SQLEnum(
            Priority,
            name="priority",
            create_constraint=False,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=True,
    )

    # Foreign key to User
    assignee_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationship to User
    assignee: Mapped[Optional["User"]] = relationship("User", back_populates="tasks")

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', status={self.status.value})>"
