"""create_users_and_tasks_tables

Revision ID: 1e91e03a00b2
Revises:
Create Date: 2026-10-19 23:21:57.762022

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1e91e03a00b2'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create task_status enum
    task_status_enum = sa.Enum('todo', 'in_progress', 'done', name='task_status')
    task_status_enum.create(op.get_bind(), checkfirst=True)

    # Create priority enum
    priority_enum = sa.Enum('high', 'medium', 'low', name='priority')
    priority_enum.create(op.get_bind(), checkfirst=True)

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('todo', 'in_progress', 'done', name='task_status', create_constraint=False), nullable=False, server_default='todo'),
        sa.Column('priority', sa.Enum('high', 'medium', 'low', name='priority', create_constraint=False), nullable=False, server_default='medium'),
        sa.Column('ai_suggested_priority', sa.Enum('high', 'medium', 'low', name='priority', create_constraint=False), nullable=True),
        sa.Column('assignee_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('tasks')
    op.drop_table('users')

    # Drop enums
    sa.Enum(name='task_status').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='priority').drop(op.get_bind(), checkfirst=True)
