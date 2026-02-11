import certifi
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.models import Item, User, UserRole, Subject
from app.security import get_password_hash


async def init_db():
    # Helper for running simplified tests without a real Mongo instance could go here,
    # but for now we assume a local or configured Mongo URI.
    # In a real app, use environment variables for the URI.
    client = AsyncIOMotorClient(settings.MONGODB_URL, tlsCAFile=certifi.where())
    await init_beanie(
        database=client[settings.MONGODB_DB_NAME], document_models=[Item, User, Subject]
    )

    # Create initial superuser
    user = await User.find_one(User.user_id == settings.FIRST_SUPERUSER)
    if not user:
        user = User(
            user_id=settings.FIRST_SUPERUSER,
            firstname="Admin",
            lastname="User",
            password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            role=UserRole.admin,
        )
        await user.create()
    elif not user.password:
        user.password = get_password_hash(settings.FIRST_SUPERUSER_PASSWORD)
        await user.save()
