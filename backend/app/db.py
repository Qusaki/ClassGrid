from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.models import Item, User, UserRole
from app.security import get_password_hash


async def init_db():
    # Helper for running simplified tests without a real Mongo instance could go here,
    # but for now we assume a local or configured Mongo URI.
    # In a real app, use environment variables for the URI.
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.MONGODB_DB_NAME], document_models=[Item, User]
    )

    # Create initial superuser
    user = await User.find_one(User.email == settings.FIRST_SUPERUSER)
    if not user:
        user = User(
            email=settings.FIRST_SUPERUSER,
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            role=UserRole.admin,
        )
        await user.create()
