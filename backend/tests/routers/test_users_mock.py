import asyncio
from unittest.mock import MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.deps import get_current_admin_user  # Import the dependency
from app.main import app
from app.models import User, UserRole


# Mock the database dependencies
@pytest.fixture
def mock_user_db():
    with patch("app.routers.users.User") as mock_user_model:
        # User not found by default (for creation)
        # find_one returns a future (awaitable) that returns None (not found) or user
        f = asyncio.Future()
        f.set_result(None)
        mock_user_model.find_one.return_value = f

        # user.create() must be awaitable
        # When User(...) is called, it returns a mock instance.
        # that instance's .create() should be awaitable
        mock_instance = MagicMock()
        f_create = asyncio.Future()
        f_create.set_result(None)
        mock_instance.create.return_value = f_create

        # When User(...) is called, return this instance
        mock_user_model.return_value = mock_instance

        yield mock_user_model


@pytest.fixture
def mock_deps():
    pass


@pytest.mark.asyncio
async def test_create_instructor_success(mock_user_db):
    mock_admin = User(
        user_id="admin_user",
        firstname="Admin",
        lastname="User",
        role=UserRole.admin,
        hashed_password="hash",
    )
    app.dependency_overrides[get_current_admin_user] = lambda: mock_admin

    mock_instance = mock_user_db.return_value
    mock_instance.user_id = "instructor1"
    mock_instance.firstname = "Instructor"
    mock_instance.lastname = "One"
    mock_instance.middlename = None
    mock_instance.role = UserRole.instructor
    mock_instance.id = "507f1f77bcf86cd799439012"
    mock_instance.password = None
    mock_instance.is_active = True

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={
                "user_id": "instructor1",
                "firstname": "Instructor",
                "lastname": "One",
                "password": "password",
                "role": "instructor",
            },
        )

    app.dependency_overrides = {}
    assert response.status_code == 200, f"Response: {response.text}"
    assert response.json()["role"] == "instructor"


@pytest.mark.asyncio
async def test_create_user_existing_email(mock_user_db):
    mock_admin = User(
        user_id="admin_user",
        firstname="Admin",
        lastname="User",
        role=UserRole.admin,
        hashed_password="hash",
    )
    app.dependency_overrides[get_current_admin_user] = lambda: mock_admin

    # Simulate finding an existing user
    mock_existing = User(
        user_id="existing_user",
        firstname="Existing",
        lastname="User",
        role=UserRole.instructor,
        hashed_password="hash",
    )
    # Also need fields for validation if response is returned, but here we expect 400 exception before response

    # find_one returns a future with the user
    f = asyncio.Future()
    f.set_result(mock_existing)
    mock_user_db.find_one.return_value = f

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={
                "user_id": "existing_user",
                "firstname": "Existing",
                "lastname": "User",
                "password": "password",
                "role": "instructor",
            },
        )

    app.dependency_overrides = {}
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
