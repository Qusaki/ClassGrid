import pytest
from httpx import AsyncClient

# We need to setup fixtures for db, but usually existing tests have them.
# Let's check conftext.py or similar if it exists
# For now, I'll write standard pytest async functions assuming 'client' fixture is available
# or I will create one if needed.
# Since I'm not sure about existing fixtures, I'll try to rely on common patterns or check existing tests first.


@pytest.mark.asyncio
async def test_create_schedule(client: AsyncClient, token_headers):
    # Create a schedule
    response = await client.post(
        "/schedules/",
        headers=token_headers,
        json={
            "subject_code": "CS101",
            "instructor_id": "inst001",
            "section": "A",
            "day": "Mon",
            "start_time": "09:00",
            "end_time": "10:30",
            "room": "Room 101",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["instructor_id"] == "inst001"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_schedule_conflict(client: AsyncClient, token_headers):
    # Create the first schedule
    await client.post(
        "/schedules/",
        headers=token_headers,
        json={
            "subject_code": "CS101",
            "instructor_id": "inst002",
            "section": "B",
            "day": "Tue",
            "start_time": "09:00",
            "end_time": "10:00",
            "room": "Room 102",
        },
    )

    # Try to create conflicting schedule
    # Overlapping time: 09:30 - 10:30
    response = await client.post(
        "/schedules/",
        headers=token_headers,
        json={
            "subject_code": "CS102",
            "instructor_id": "inst002",
            "section": "C",
            "day": "Tue",
            "start_time": "09:30",
            "end_time": "10:30",
            "room": "Room 103",
        },
    )
    assert response.status_code == 400
    assert "conflict" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_update_schedule_no_conflict(client: AsyncClient, token_headers):
    # Create a schedule
    create_res = await client.post(
        "/schedules/",
        headers=token_headers,
        json={
            "subject_code": "CS103",
            "instructor_id": "inst003",
            "section": "D",
            "day": "Wed",
            "start_time": "13:00",
            "end_time": "14:00",
            "room": "Room 104",
        },
    )
    schedule_id = create_res.json()["id"]

    # Update time to non-conflicting new time
    response = await client.put(
        f"/schedules/{schedule_id}",
        headers=token_headers,
        json={"start_time": "15:00", "end_time": "16:00"},
    )
    assert response.status_code == 200
    assert response.json()["start_time"] == "15:00"


@pytest.mark.asyncio
async def test_read_schedules(client: AsyncClient, token_headers):
    response = await client.get("/schedules/", headers=token_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_delete_schedule(client: AsyncClient, token_headers):
    # Create a schedule to delete
    create_res = await client.post(
        "/schedules/",
        headers=token_headers,
        json={
            "subject_code": "CS104",
            "instructor_id": "inst004",
            "section": "E",
            "day": "Fri",
            "start_time": "08:00",
            "end_time": "09:00",
            "room": "Room 105",
        },
    )
    schedule_id = create_res.json()["id"]

    response = await client.delete(f"/schedules/{schedule_id}", headers=token_headers)
    assert response.status_code == 204

    # Verify it's gone
    get_res = await client.get(f"/schedules/{schedule_id}", headers=token_headers)
    assert get_res.status_code == 404
