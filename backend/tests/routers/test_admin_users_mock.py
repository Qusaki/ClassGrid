import pytest
from unittest.mock import MagicMock, patch
from httpx import AsyncClient, ASGITransport
import asyncio
from app.main import app
from app.models import UserRole


# Re-use the mock_user_db fixture pattern or create a new one
@pytest.fixture
def mock_user_db_admin():
    with patch("app.routers.users.User") as mock_user_model:
        # User not found by default
        f = asyncio.Future()
        f.set_result(None)
        mock_user_model.find_one.return_value = f

        # Mock instance for creation/updates
        mock_instance = MagicMock()
        mock_instance.user_id = "test_user"
        mock_instance.firstname = "Test"
        mock_instance.lastname = "User"
        mock_instance.role = UserRole.instructor
        mock_instance.hashed_password = "hash"
        mock_instance.password = "hash"
        mock_instance.is_active = True
        mock_instance.middlename = None
        mock_instance.id = "mock_obj_id"

        f_create = asyncio.Future()
        f_create.set_result(None)
        mock_instance.create.return_value = f_create

        f_save = asyncio.Future()
        f_save.set_result(None)
        mock_instance.save.return_value = f_save

        f_delete = asyncio.Future()
        f_delete.set_result(None)
        mock_instance.delete.return_value = f_delete

        mock_user_model.return_value = mock_instance
        yield mock_user_model


@pytest.mark.asyncio
async def test_admin_list_users_mock(mock_user_db_admin):
    # Mock find_all().skip().limit().to_list()
    mock_cursor = MagicMock()
    mock_cursor.skip.return_value = mock_cursor
    mock_cursor.limit.return_value = mock_cursor

    # Return a list of users
    user1 = MagicMock()
    user1.user_id = "u1"
    user1.firstname = "F1"
    user1.lastname = "L1"
    user1.role = UserRole.instructor
    user1.is_active = True
    user1.middlename = None
    user1.password = None
    user1.id = "id1"

    f_list = asyncio.Future()
    f_list.set_result([user1])
    mock_cursor.to_list.return_value = f_list

    mock_user_db_admin.find_all.return_value = mock_cursor

    # Mock Token Dependency to return Admin
    mock_admin = MagicMock()
    mock_admin.user_id = "admin"
    mock_admin.firstname = "Admin"
    mock_admin.lastname = "User"
    mock_admin.role = UserRole.admin
    mock_admin.hashed_password = "hash"
    # We need to mock get_current_admin_user dependency
    from app.deps import get_current_admin_user

    app.dependency_overrides[get_current_admin_user] = lambda: mock_admin

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/users")

    app.dependency_overrides = {}

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["user_id"] == "u1"


@pytest.mark.asyncio
async def test_admin_get_user_mock(mock_user_db_admin):
    # Mock find_one to return a user
    mock_user = MagicMock()
    mock_user.user_id = "target_user"
    mock_user.firstname = "Target"
    mock_user.lastname = "User"
    mock_user.role = UserRole.instructor
    mock_user.is_active = True
    mock_user.middlename = None
    mock_user.password = None
    mock_user.id = "target_id"

    f = asyncio.Future()
    f.set_result(mock_user)
    mock_user_db_admin.find_one.return_value = f

    mock_admin = MagicMock()
    mock_admin.user_id = "admin"
    mock_admin.firstname = "Admin"
    mock_admin.lastname = "User"
    mock_admin.role = UserRole.admin
    mock_admin.hashed_password = "hash"
    from app.deps import get_current_admin_user

    app.dependency_overrides[get_current_admin_user] = lambda: mock_admin

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/users/target_user")

    app.dependency_overrides = {}

    assert response.status_code == 200
    assert response.json()["user_id"] == "target_user"


@pytest.mark.asyncio
async def test_admin_update_user_mock(mock_user_db_admin):
    # Mock find_one to return the user to update
    mock_instance = mock_user_db_admin.return_value  # Default mock instance
    f = asyncio.Future()
    f.set_result(mock_instance)
    mock_user_db_admin.find_one.return_value = f

    mock_admin = MagicMock()
    mock_admin.user_id = "admin"
    mock_admin.firstname = "Admin"
    mock_admin.lastname = "User"
    mock_admin.role = UserRole.admin
    mock_admin.hashed_password = "hash"
    from app.deps import get_current_admin_user

    app.dependency_overrides[get_current_admin_user] = lambda: mock_admin

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.put("/users/test_user", json={"firstname": "UpdatedName"})

    app.dependency_overrides = {}

    assert response.status_code == 200
    # Check if save was called
    assert mock_instance.save.called
    assert mock_instance.firstname == "UpdatedName"


@pytest.mark.asyncio
async def test_admin_delete_user_mock(mock_user_db_admin):
    # Mock find_one to return the user to delete
    mock_instance = mock_user_db_admin.return_value
    f = asyncio.Future()
    f.set_result(mock_instance)
    mock_user_db_admin.find_one.return_value = f

    mock_admin = MagicMock()
    mock_admin.user_id = "admin"
    mock_admin.firstname = "Admin"
    mock_admin.lastname = "User"
    mock_admin.role = UserRole.admin
    mock_admin.hashed_password = "hash"
    from app.deps import get_current_admin_user

    app.dependency_overrides[get_current_admin_user] = lambda: mock_admin

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.delete("/users/test_user")

    app.dependency_overrides = {}

    assert response.status_code == 200
    # Check if delete was called
    assert mock_instance.delete.called
