import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models import User, UserRole
from app.security import create_access_token, get_password_hash


@pytest_asyncio.fixture
async def admin_token():
    # init_db handled by autouse fixture in conftest
    # Create or update admin
    admin_email = "admin_test@example.com"
    user = await User.find_one(User.email == admin_email)
    if not user:
        user = User(
            email=admin_email,
            hashed_password=get_password_hash("admin123"),
            role=UserRole.admin,
        )
        await user.create()
    elif user.role != UserRole.admin:
        user.role = UserRole.admin
        await user.save()

    return create_access_token(subject=admin_email)


@pytest_asyncio.fixture
async def user_token():
    # Create or update normal user (now defaulting to instructor as student is removed)
    user_email = "normal_test@example.com"
    user = await User.find_one(User.email == user_email)
    if not user:
        user = User(
            email=user_email,
            hashed_password=get_password_hash("user123"),
            role=UserRole.instructor,
        )
        await user.create()

    return create_access_token(subject=user_email)


@pytest.mark.asyncio
async def test_admin_create_instructor(admin_token):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={
                "email": "instructor@example.com",
                "password": "instructorpass",
                "role": "instructor",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    assert response.status_code == 200
    assert response.json()["email"] == "instructor@example.com"
    assert response.json()["role"] == "instructor"


@pytest.mark.asyncio
async def test_admin_create_program_chairperson(admin_token):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={
                "email": "chair@example.com",
                "password": "chairpass",
                "role": "program_chairperson",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    assert response.status_code == 200
    assert response.json()["email"] == "chair@example.com"
    assert response.json()["role"] == "program_chairperson"


@pytest.mark.asyncio
async def test_user_cannot_create_user(user_token):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={"email": "hacker@example.com", "password": "hacked", "role": "admin"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
    assert response.status_code == 403
