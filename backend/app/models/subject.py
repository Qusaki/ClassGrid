from typing import Optional
from beanie import Document
from pydantic import Field
from app.models import DepartmentType


class Subject(Document):
    subject_code: str = Field(..., unique=True)
    subject_description: str
    units: int
    department: Optional[DepartmentType] = None

    class Settings:
        name = "subjects"
        indexes = [
            "subject_code",
        ]
