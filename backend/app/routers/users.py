from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_admin_user, get_current_user
from app.models import User
from app.schemas.users import UserCreate, UserResponse, UserUpdate
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
        password=get_password_hash(user_in.password),
        role=user_in.role,
        department=user_in.department,
    )
    await user.create()
    return user


@router.get("/users/me", response_model=UserResponse)
async def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=list[UserResponse])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin_user),
):
    users = await User.find_all().skip(skip).limit(limit).to_list()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: str,
    current_admin: User = Depends(get_current_admin_user),
):
    user = await User.find_one(User.user_id == user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this user_id does not exist in the system",
        )
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_in: UserUpdate,
    current_admin: User = Depends(get_current_admin_user),
):
    user = await User.find_one(User.user_id == user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this user_id does not exist in the system",
        )

    if user_in.firstname is not None:
        user.firstname = user_in.firstname
    if user_in.lastname is not None:
        user.lastname = user_in.lastname
    if user_in.middlename is not None:
        user.middlename = user_in.middlename
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.department is not None:
        user.department = user_in.department
    if user_in.password is not None:
        user.password = get_password_hash(user_in.password)

    await user.save()
    return user


@router.delete("/users/{user_id}", response_model=UserResponse)
async def delete_user(
    user_id: str,
    current_admin: User = Depends(get_current_admin_user),
):
    user = await User.find_one(User.user_id == user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this user_id does not exist in the system",
        )
    await user.delete()
    return user


# chairperson fetch teachers in their department
@router.get("/users/department/{department}", response_model=list[UserResponse])
async def read_users_by_department(
    department: str,
    current_user: User = Depends(get_current_user)
):
  
    users = await User.find(User.department == department).to_list()
    return users