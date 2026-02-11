from typing import Annotated, Optional

from pydantic import BaseModel, BeforeValidator, Field
from app.models.user import DepartmentType

PyObjectId = Annotated[str, BeforeValidator(str)]


class SubjectBase(BaseModel):
    subject_code: str
    subject_description: str
    units: int
    department: Optional[DepartmentType] = None


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    subject_code: Optional[str] = None
    subject_description: Optional[str] = None
    units: Optional[int] = None
    department: Optional[DepartmentType] = None


class SubjectResponse(SubjectBase):
    id: PyObjectId = Field(alias="_id")

    class Config:
        from_attributes = True
        populate_by_name = True
