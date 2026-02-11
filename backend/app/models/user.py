from enum import Enum

from beanie import Document


class UserRole(str, Enum):
    admin = "admin"
    instructor = "instructor"
    program_chairperson = "program_chairperson"


class User(Document):
    user_id: str
    firstname: str
    lastname: str
    middlename: str | None = None
    password: str | None = None
    role: UserRole = UserRole.instructor
    is_active: bool = True

    class Settings:
        name = "users"
        indexes = [
            "user_id",
        ]
