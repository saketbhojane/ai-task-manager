from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["Users"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Dependency to get UserService instance."""
    return UserService(db)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    user_data: UserCreate,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    """Create a new user."""
    return service.create_user(user_data)


@router.get("", response_model=list[UserResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    service: UserService = Depends(get_user_service),
) -> list[UserResponse]:
    """Get all users with pagination."""
    return service.get_users(skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    """Get a user by ID."""
    return service.get_user(user_id)
