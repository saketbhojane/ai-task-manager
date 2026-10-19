from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    """Base schema for User."""
    email: EmailStr
    name: str


class UserCreate(UserBase):
    """Schema for creating a new user."""
    pass


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
