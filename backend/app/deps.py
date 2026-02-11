from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError

from app.config import settings
from app.models import User, UserRole
from app.schemas.users import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise ValidationError("sub claim missing")
        token_data = TokenData(user_id=user_id)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    user = await User.find_one(User.user_id == token_data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


async def get_current_chairperson_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in [UserRole.admin, UserRole.program_chairperson]:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user
