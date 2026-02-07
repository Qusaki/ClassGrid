from typing import Optional

from pydantic import BaseModel

from app.models import UserRole


class UserCreate(BaseModel):
    user_id: str
    firstname: str
    lastname: str
    middlename: Optional[str] = None
    password: str
    role: UserRole = UserRole.instructor


from typing import Annotated, Any
from pydantic import BeforeValidator

PyObjectId = Annotated[str, BeforeValidator(str)]


class UserResponse(BaseModel):
    id: PyObjectId  # Beanie uses PydanticObjectId, usually handled as str in response
    user_id: str
    firstname: str
    lastname: str
    middlename: Optional[str] = None
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
