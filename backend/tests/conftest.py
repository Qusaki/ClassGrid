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
from app.models import User, UserRole
from app.security import create_access_token, get_password_hash


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


@pytest_asyncio.fixture
async def admin_token(initialize_database):
    # Create or update admin
    admin_id = "admin_user"
    user = await User.find_one(User.user_id == admin_id)
    if not user:
        user = User(
            user_id=admin_id,
            firstname="Admin",
            lastname="User",
            password=get_password_hash("admin123"),
            role=UserRole.admin,
        )
        await user.create()
    elif user.role != UserRole.admin:
        user.role = UserRole.admin
        await user.save()

    return create_access_token(subject=admin_id)


@pytest_asyncio.fixture
async def user_token(initialize_database):
    # Create or update normal user (now defaulting to instructor as student is removed)
    user_id = "normal_user"
    user = await User.find_one(User.user_id == user_id)
    if not user:
        user = User(
            user_id=user_id,
            firstname="Normal",
            lastname="User",
            password=get_password_hash("user123"),
            role=UserRole.instructor,
        )
        await user.create()


from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture(scope="function")
def token_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
