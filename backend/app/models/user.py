from enum import Enum

from beanie import Document


class UserRole(str, Enum):
    admin = "admin"
    instructor = "instructor"
    program_chairperson = "program_chairperson"
    student = "student"  # Assuming student is needed based on context, user said 'add' not 'replace', but 'user' is generic. I will add 'student' to be safe given context.


class User(Document):
    email: str
    hashed_password: str
    role: UserRole = UserRole.student
    is_active: bool = True

    class Settings:
        name = "users"
        indexes = [
            "email",
        ]
