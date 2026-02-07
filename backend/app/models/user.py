from enum import Enum

from beanie import Document


class UserRole(str, Enum):
    admin = "admin"
    instructor = "instructor"
    program_chairperson = "program_chairperson"


class User(Document):
    email: str
    hashed_password: str
    role: UserRole = UserRole.instructor
    is_active: bool = True

    class Settings:
        name = "users"
        indexes = [
            "email",
        ]
