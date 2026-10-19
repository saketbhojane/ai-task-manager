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
    # Create enums using raw SQL with DO block for idempotency
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
                CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority') THEN
                CREATE TYPE priority AS ENUM ('high', 'medium', 'low');
            END IF;
        END$$;
    """)

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Create tasks table using raw SQL to avoid SQLAlchemy enum auto-creation
    op.execute("""
        CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            status task_status NOT NULL DEFAULT 'todo',
            priority priority NOT NULL DEFAULT 'medium',
            ai_suggested_priority priority,
            assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
        CREATE INDEX ix_tasks_id ON tasks(id);
        CREATE INDEX ix_tasks_assignee_id ON tasks(assignee_id);
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS tasks;")
    op.drop_table('users')
    op.execute("DROP TYPE IF EXISTS task_status;")
    op.execute("DROP TYPE IF EXISTS priority;")
