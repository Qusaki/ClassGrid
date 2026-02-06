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
async def test_create_user_success(mock_user_db):
    # Setup mock to simulate admin user
    mock_admin = User(
        email="admin@example.com", role=UserRole.admin, hashed_password="hash"
    )

    # Configure the mock instance that will be returned by User(...)
    # This is critical because this instance is returned by the API and validated against UserResponse
    mock_instance = mock_user_db.return_value
    mock_instance.email = "newstudent@example.com"
    mock_instance.role = UserRole.student
    mock_instance.id = "507f1f77bcf86cd799439011"
    mock_instance.is_active = True

    # Overriding dependency for this specific request using the FUNCTION OBJECT
    app.dependency_overrides[get_current_admin_user] = lambda: mock_admin

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={
                "email": "newstudent@example.com",
                "password": "password",
                "role": "student",
            },
        )

    # Clean up overrides
    app.dependency_overrides = {}

    assert response.status_code == 200, f"Response: {response.text}"
    assert response.json()["email"] == "newstudent@example.com"
    assert response.json()["role"] == "student"

    msg = (
        f"User.create() was not called. Calls: {mock_user_db.return_value.method_calls}"
    )
    mock_user_db.return_value.create.assert_called_once()


@pytest.mark.asyncio
async def test_create_instructor_success(mock_user_db):
    mock_admin = User(
        email="admin@example.com", role=UserRole.admin, hashed_password="hash"
    )
    app.dependency_overrides[get_current_admin_user] = lambda: mock_admin

    mock_instance = mock_user_db.return_value
    mock_instance.email = "instr@example.com"
    mock_instance.role = UserRole.instructor
    mock_instance.id = "507f1f77bcf86cd799439012"
    mock_instance.is_active = True

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={
                "email": "instr@example.com",
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
        email="admin@example.com", role=UserRole.admin, hashed_password="hash"
    )
    app.dependency_overrides[get_current_admin_user] = lambda: mock_admin

    # Simulate finding an existing user
    mock_existing = User(
        email="existing@example.com", role=UserRole.student, hashed_password="hash"
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
                "email": "existing@example.com",
                "password": "password",
                "role": "student",
            },
        )

    app.dependency_overrides = {}
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
