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


@pytest_asyncio.fixture(loop_scope="function", scope="function")
async def initialize_database():
    print(
        f"\nDEBUG: Connecting to {settings.MONGODB_URL} database {settings.MONGODB_DB_NAME}"
    )
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        print("DEBUG: Dropping database...")
        await client.drop_database(settings.MONGODB_DB_NAME)
        print("DEBUG: Database dropped. Initializing Beanie...")
        await init_db()
        print("DEBUG: Beanie initialized.")
    except Exception as e:
        print(f"DEBUG: Error initializing database: {e}")
        raise e
