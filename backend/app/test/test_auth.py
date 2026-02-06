import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models import User
from app.security import get_password_hash


@pytest.mark.asyncio
async def test_login():
    # init_db is handled by autouse fixture

    # Create a user manually
    email = "testlogin@example.com"
    password = "password123"
    hashed = get_password_hash(password)

    existing_user = await User.find_one(User.email == email)
    if not existing_user:
        await User(email=email, hashed_password=hashed).create()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/token", data={"username": email, "password": password}
        )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
