from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.models import User
from app.schemas.users import Token
from app.security import (  # Using app.security since utils didn't exist, wait I named it app/security.py. I should import from app.security
    create_access_token,
    verify_password,
)

router = APIRouter()


@router.post("/token", response_model=Token)
async def login_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    user = await User.find_one(User.email == form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    return {
        "access_token": create_access_token(subject=user.email),
        "token_type": "bearer",
    }
