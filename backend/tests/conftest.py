import os

# Set environment variables for testing
os.environ.setdefault("MONGODB_DB_NAME", "classgrid_test")
os.environ.setdefault("PROJECT_NAME", "ClassGrid Test")
os.environ.setdefault("FIRST_SUPERUSER", "admin_user")
os.environ.setdefault("FIRST_SUPERUSER_PASSWORD", "admin")

from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio
from app.config import settings
from app.db import init_db


@pytest_asyncio.fixture(loop_scope="function", scope="function", autouse=True)
async def initialize_database():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await client.drop_database(settings.MONGODB_DB_NAME)
    await init_db()
