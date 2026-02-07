from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_admin_user, get_current_user
from app.models import User
from app.schemas.users import UserCreate, UserResponse
from app.security import get_password_hash

router = APIRouter()


@router.post("/users", response_model=UserResponse)
async def create_user(
    user_in: UserCreate,
    current_admin: User = Depends(
        get_current_admin_user
    ),  # Only admins can create users
):
    user = await User.find_one(User.user_id == user_in.user_id)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this user_id already exists in the system.",
        )

    user = User(
        user_id=user_in.user_id,
        firstname=user_in.firstname,
        lastname=user_in.lastname,
        middlename=user_in.middlename,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
    )
    await user.create()
    return user


@router.get("/users/me", response_model=UserResponse)
async def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user
