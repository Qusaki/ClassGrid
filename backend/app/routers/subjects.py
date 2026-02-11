from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import (
    get_current_admin_user,
    get_current_user,
    get_current_chairperson_user,
)
from app.models import Subject, User
from app.schemas.subjects import SubjectCreate, SubjectResponse, SubjectUpdate

router = APIRouter()


@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    subject_in: SubjectCreate,
    current_user: User = Depends(get_current_chairperson_user),
):
    """
    Create a new subject. Only chairpersons (and admins) can do this.
    """
    existing_subject = await Subject.find_one(
        Subject.subject_code == subject_in.subject_code
    )
    if existing_subject:
        raise HTTPException(
            status_code=400,
            detail="Subject with this code already exists.",
        )

    subject = Subject(**subject_in.model_dump())
    await subject.create()
    return subject


@router.get("/", response_model=List[SubjectResponse])
async def read_subjects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve all subjects.
    """
    subjects = await Subject.find_all().skip(skip).limit(limit).to_list()
    return subjects


@router.get("/{subject_code}", response_model=SubjectResponse)
async def read_subject(
    subject_code: str,
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific subject by subject_code.
    """
    subject = await Subject.find_one(Subject.subject_code == subject_code)
    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )
    return subject


@router.put("/{subject_code}", response_model=SubjectResponse)
async def update_subject(
    subject_code: str,
    subject_in: SubjectUpdate,
    current_user: User = Depends(get_current_chairperson_user),
):
    """
    Update a subject. Only chairpersons (and admins) can do this.
    """
    subject = await Subject.find_one(Subject.subject_code == subject_code)
    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    update_data = subject_in.model_dump(exclude_unset=True)

    if "subject_code" in update_data and update_data["subject_code"] != subject_code:
        existing_subject = await Subject.find_one(
            Subject.subject_code == update_data["subject_code"]
        )
        if existing_subject:
            raise HTTPException(
                status_code=400,
                detail="Subject with this code already exists.",
            )

    await subject.update({"$set": update_data})

    # Fetch updated document to ensure response reflects database state
    updated_subject = await Subject.find_one(
        Subject.subject_code == (update_data.get("subject_code") or subject_code)
    )
    return updated_subject


@router.delete("/{subject_code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_code: str,
    current_user: User = Depends(get_current_chairperson_user),
):
    """
    Delete a subject. Only chairpersons (and admins) can do this.
    """
    subject = await Subject.find_one(Subject.subject_code == subject_code)
    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )
    await subject.delete()
    return None
