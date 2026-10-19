from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, users, tasks, ai

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="AI-powered task management system",
    version="0.1.0",
    debug=settings.debug,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(ai.router)
