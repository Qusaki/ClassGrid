import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_admin_create_instructor(admin_token):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={
                "user_id": "instructor1",
                "firstname": "Instructor",
                "lastname": "One",
                "password": "instructorpass",
                "role": "instructor",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    assert response.status_code == 200
    assert response.json()["user_id"] == "instructor1"
    assert response.json()["firstname"] == "Instructor"
    assert response.json()["role"] == "instructor"


@pytest.mark.asyncio
async def test_admin_create_program_chairperson(admin_token):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={
                "user_id": "chair1",
                "firstname": "Chair",
                "lastname": "Person",
                "password": "chairpass",
                "role": "program_chairperson",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    assert response.status_code == 200
    assert response.json()["user_id"] == "chair1"
    assert response.json()["role"] == "program_chairperson"


@pytest.mark.asyncio
async def test_user_cannot_create_user(user_token):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={
                "user_id": "hacker",
                "firstname": "Hacker",
                "lastname": "Man",
                "password": "hacked",
                "role": "admin",
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_create_admin(admin_token):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/users",
            json={
                "user_id": "admin2",
                "firstname": "Second",
                "lastname": "Admin",
                "password": "adminpass",
                "role": "admin",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    assert response.status_code == 200
    assert response.json()["user_id"] == "admin2"
    assert response.json()["role"] == "admin"
