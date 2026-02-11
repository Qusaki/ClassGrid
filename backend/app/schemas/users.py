from typing import Annotated, Optional

from pydantic import BaseModel, BeforeValidator

from app.models import DepartmentType, UserRole

PyObjectId = Annotated[str, BeforeValidator(str)]


class UserCreate(BaseModel):
    user_id: str
    firstname: str
    lastname: str
    middlename: Optional[str] = None
    role: UserRole = UserRole.instructor
    department: Optional[DepartmentType] = None
    password: str


class UserUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    middlename: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[DepartmentType] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: PyObjectId  # Beanie uses PydanticObjectId, usually handled as str in response
    user_id: str
    firstname: str
    lastname: str
    middlename: Optional[str] = None
    role: UserRole
    department: Optional[DepartmentType] = None
    password: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
