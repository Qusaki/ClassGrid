from typing import Optional, Annotated
from pydantic import BaseModel, Field, field_validator, BeforeValidator

PyObjectId = Annotated[str, BeforeValidator(str)]

from app.models.schedule import DayOfWeek


class ScheduleBase(BaseModel):
    subject_code: str
    instructor_id: str
    section: str
    day: DayOfWeek
    start_time: str = Field(
        ..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", example="09:00"
    )
    end_time: str = Field(
        ..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", example="10:30"
    )
    room: str

    @field_validator("end_time")
    def end_time_must_be_after_start_time(cls, v, values):
        if "start_time" in values.data and v <= values.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return v


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    subject_code: Optional[str] = None
    instructor_id: Optional[str] = None
    section: Optional[str] = None
    day: Optional[DayOfWeek] = None
    start_time: Optional[str] = Field(
        None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
    )
    end_time: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    room: Optional[str] = None

    @field_validator("end_time")
    def end_time_must_be_after_start_time(cls, v, values):
        # Only validate if both are present or if we have context of the existing object, but Pydantic validation on update is tricky without full context.
        # For now, simplistic validation if both are in update.
        if (
            "start_time" in values.data
            and values.data["start_time"]
            and v <= values.data["start_time"]
        ):
            raise ValueError("end_time must be after start_time")
        return v


class ScheduleOut(ScheduleBase):
    id: PyObjectId

    class Config:
        from_attributes = True