from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from beanie import PydanticObjectId

from app.models.schedule import Schedule, DayOfWeek
from app.schemas.schedule import ScheduleCreate, ScheduleOut, ScheduleUpdate

router = APIRouter()


async def check_conflict(
    instructor_id: str,
    day: DayOfWeek,
    start_time: str,
    end_time: str,
    exclude_schedule_id: Optional[PydanticObjectId] = None,
):
    # Overlap logic: (StartA < EndB) and (EndA > StartB)
    # New schedule: StartA, EndA
    # Existing schedule: StartB, EndB

    # query = {
    #     "instructor_id": instructor_id,
    #     "day": day,
    #     "$and": [{"start_time": {"$lt": end_time}}, {"end_time": {"$gt": start_time}}],
    # }

    # If excluding a specific schedule (for updates)
    if exclude_schedule_id:
        # Beanie/Mongo filter to exclude this ID
        # query["_id"] = {"$ne": exclude_schedule_id}
        # But we are using Beanie's find syntax below usually, but let's see.
        # It's easier to use the find argument.
        pass

    # We can use pure Beanie find
    schedules = Schedule.find(
        Schedule.instructor_id == instructor_id,
        Schedule.day == day,
        Schedule.start_time < end_time,
        Schedule.end_time > start_time,
    )

    if exclude_schedule_id:
        schedules = schedules.find(Schedule.id != exclude_schedule_id)

    if await schedules.count() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Schedule conflict detected for this instructor.",
        )


@router.post("/", response_model=ScheduleOut, status_code=status.HTTP_201_CREATED)
async def create_schedule(schedule_in: ScheduleCreate):
    await check_conflict(
        instructor_id=schedule_in.instructor_id,
        day=schedule_in.day,
        start_time=schedule_in.start_time,
        end_time=schedule_in.end_time,
    )

    schedule = Schedule(**schedule_in.model_dump())
    await schedule.create()
    return schedule


@router.get("/", response_model=List[ScheduleOut])
async def read_schedules(
    instructor_id: Optional[str] = None,
    room: Optional[str] = None,
    day: Optional[DayOfWeek] = None,
    skip: int = 0,
    limit: int = 100,
):
    query = Schedule.find_all()
    if instructor_id:
        query = query.find(Schedule.instructor_id == instructor_id)
    if room:
        query = query.find(Schedule.room == room)
    if day:
        query = query.find(Schedule.day == day)

    return await query.skip(skip).limit(limit).to_list()


@router.get("/{schedule_id}", response_model=ScheduleOut)
async def read_schedule(schedule_id: PydanticObjectId):
    schedule = await Schedule.get(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule


@router.put("/{schedule_id}", response_model=ScheduleOut)
async def update_schedule(schedule_id: PydanticObjectId, schedule_in: ScheduleUpdate):
    schedule = await Schedule.get(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    # If updating time/day/instructor, check for conflicts
    # We need to construct the potential new state to check conflicts
    new_instructor_id = schedule_in.instructor_id or schedule.instructor_id
    new_day = schedule_in.day or schedule.day
    new_start_time = schedule_in.start_time or schedule.start_time
    new_end_time = schedule_in.end_time or schedule.end_time

    # Only check if any of these fields are changing
    if (
        schedule_in.instructor_id is not None
        or schedule_in.day is not None
        or schedule_in.start_time is not None
        or schedule_in.end_time is not None
    ):
        await check_conflict(
            instructor_id=new_instructor_id,
            day=new_day,
            start_time=new_start_time,
            end_time=new_end_time,
            exclude_schedule_id=schedule.id,
        )

    # Update fields
    # schedule_in.dict(exclude_unset=True) is deprecated in v2, use model_dump
    update_data = schedule_in.model_dump(exclude_unset=True)
    await schedule.set(update_data)

    return schedule


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(schedule_id: PydanticObjectId):
    schedule = await Schedule.get(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    await schedule.delete()