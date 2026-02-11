import asyncio
import httpx

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_USERNAME = "admin"  # Replace with actual admin username if different
ADMIN_PASSWORD = "admin"  # Replace with actual admin password if different


async def get_token(client):
    response = await client.post(
        f"{BASE_URL}/token",
        data={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD,
            "grant_type": "password",
        },
    )
    if response.status_code != 200:
        print(f"Failed to get token: {response.text}")
        return None
    return response.json()["access_token"]


async def verify_subjects():
    async with httpx.AsyncClient() as client:
        # 1. Get Token
        print("1. Authenticating...")
        token = await get_token(client)
        if not token:
            return

        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Subject
        print("\n2. Creating Subject...")
        subject_data = {
            "subject_code": "CS101",
            "subject_description": "Introduction to Computer Science",
            "units": 3,
            "department": "BSCS",
        }
        response = await client.post(
            f"{BASE_URL}/subjects/", json=subject_data, headers=headers
        )
        print(f"Create Status: {response.status_code}")
        print(f"Create Response: {response.json()}")
        if response.status_code != 201:
            # Check if it already exists from previous run
            if response.status_code == 400 and "already exists" in response.text:
                print("Subject already exists, continuing...")
            else:
                return

        # 3. List Subjects
        print("\n3. Listing Subjects...")
        response = await client.get(f"{BASE_URL}/subjects/", headers=headers)
        print(f"List Status: {response.status_code}")
        print(f"List Response: {response.json()}")

        # 4. Get Subject
        print("\n4. Getting Subject...")
        response = await client.get(f"{BASE_URL}/subjects/CS101", headers=headers)
        print(f"Get Status: {response.status_code}")
        print(f"Get Response: {response.json()}")

        # 5. Update Subject
        print("\n5. Updating Subject...")
        update_data = {
            "subject_description": "Intro to CS (Updated)",
            "units": 4,
            "department": "BSCS",
        }
        response = await client.put(
            f"{BASE_URL}/subjects/CS101", json=update_data, headers=headers
        )
        print(f"Update Status: {response.status_code}")
        print(f"Update Response: {response.json()}")

        # 6. Delete Subject
        print("\n6. Deleting Subject...")
        response = await client.delete(f"{BASE_URL}/subjects/CS101", headers=headers)
        print(f"Delete Status: {response.status_code}")

        # 7. Verify Deletion
        print("\n7. Verifying Deletion...")
        response = await client.get(f"{BASE_URL}/subjects/CS101", headers=headers)
        print(f"Get after Delete Status: {response.status_code}")  # Should be 404


if __name__ == "__main__":
    asyncio.run(verify_subjects())
