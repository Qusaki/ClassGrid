from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.student


class UserResponse(BaseModel):
    id: str  # Beanie uses PydanticObjectId, usually handled as str in response
    email: EmailStr
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
