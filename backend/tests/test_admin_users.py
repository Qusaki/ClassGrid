import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models import User, UserRole
from app.security import get_password_hash


@pytest.mark.asyncio
async def test_admin_list_users(admin_token):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get(
            "/users",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1  # At least the admin exists


@pytest.mark.asyncio
async def test_admin_get_user(admin_token):
    # Retrieve self
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get(
            "/users/admin_user",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    assert response.status_code == 200
    assert response.json()["user_id"] == "admin_user"


@pytest.mark.asyncio
async def test_admin_update_user(admin_token):
    # Create a user to update
    user = User(
        user_id="update_test",
        firstname="Update",
        lastname="Test",
        hashed_password=get_password_hash("pass"),
        role=UserRole.instructor,
    )
    await user.create()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.put(
            "/users/update_test",
            json={"firstname": "UpdatedName", "password": "newpassword"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["firstname"] == "UpdatedName"

    # Verify DB update
    updated_user = await User.find_one(User.user_id == "update_test")
    assert updated_user.firstname == "UpdatedName"
    assert updated_user.hashed_password != get_password_hash(
        "pass"
    )  # Should be changed


@pytest.mark.asyncio
async def test_admin_delete_user(admin_token):
    # Create a user to delete
    user = User(
        user_id="delete_test",
        firstname="Delete",
        lastname="Test",
        hashed_password=get_password_hash("pass"),
        role=UserRole.instructor,
    )
    await user.create()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.delete(
            "/users/delete_test",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert response.status_code == 200
    assert response.json()["user_id"] == "delete_test"

    # Verify DB deletion
    deleted_user = await User.find_one(User.user_id == "delete_test")
    assert deleted_user is None
