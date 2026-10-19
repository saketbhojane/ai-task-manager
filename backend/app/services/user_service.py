from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate


class UserService:
    """Service class for User operations."""

    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user."""
        user = User(
            email=user_data.email,
            name=user_data.name,
        )
        try:
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            return user
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

    def get_user(self, user_id: int) -> User:
        """Get a user by ID."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    def get_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all users with pagination."""
        return self.db.query(User).offset(skip).limit(limit).all()

    def get_user_by_email(self, email: str) -> User | None:
        """Get a user by email."""
        return self.db.query(User).filter(User.email == email).first()
