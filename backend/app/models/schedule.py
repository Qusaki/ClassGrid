from enum import Enum
from beanie import Document


class DayOfWeek(str, Enum):
    Monday = "Mon"
    Tuesday = "Tue"
    Wednesday = "Wed"
    Thursday = "Thu"
    Friday = "Fri"
    Saturday = "Sat"
    Sunday = "Sun"


class Schedule(Document):
    subject_code: str
    instructor_id: str
    section: str
    day: DayOfWeek
    start_time: str  # Store as string HH:MM for simplicity in JSON, or time object if Beanie handles it well. Beanie handles datetime.time.
    end_time: str
    room: str

    class Settings:
        name = "schedules"
        indexes = ["instructor_id", "subject_code", "day"]