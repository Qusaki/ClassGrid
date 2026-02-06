import asyncio

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.models.item import Item
from app.models.user import User


async def debug_init():
    print("Connecting to DB...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    print("Initializing Beanie...")
    await init_beanie(database=client.app_db, document_models=[Item, User])
    print("Creating User...")
    user = User(email="debug@example.com", hashed_password="pw")
    await user.create()
    print("User Created!")


if __name__ == "__main__":
    asyncio.run(debug_init())
