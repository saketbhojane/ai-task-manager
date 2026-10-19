from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "AI Task Manager"
    debug: bool = False

    # Database (using psycopg3 driver)
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/taskmanager"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # AI Configuration
    anthropic_api_key: Optional[str] = None
    ai_model: str = "claude-sonnet-4-20250514"
    ai_enabled: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
