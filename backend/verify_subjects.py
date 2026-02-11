import asyncio
import httpx

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin"
CHAIRPERSON_USERNAME = "chairperson"
CHAIRPERSON_PASSWORD = "chairperson"


async def get_token(client, username, password):
    response = await client.post(
        f"{BASE_URL}/token",
        data={"username": username, "password": password, "grant_type": "password"},
    )
    if response.status_code != 200:
        print(f"Failed to get token for {username}: {response.text}")
        return None
    return response.json()["access_token"]


async def verify_subjects():
    async with httpx.AsyncClient() as client:
        # 1. Admin Login (to create chairperson)
        print("1. Admin Login...")
        admin_token = await get_token(client, ADMIN_USERNAME, ADMIN_PASSWORD)
        if not admin_token:
            return

        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 2. Create Chairperson User
        print("\n2. Creating Chairperson User...")
        chairperson_data = {
            "user_id": CHAIRPERSON_USERNAME,
            "firstname": "Chair",
            "lastname": "Person",
            "password": CHAIRPERSON_PASSWORD,
            "role": "program_chairperson",
            "department": "BSCS",
        }
        # First check if exists or create
        response = await client.post(
            f"{BASE_URL}/users/users", json=chairperson_data, headers=admin_headers
        )
        if response.status_code == 200:
            print("Chairperson created.")
        elif response.status_code == 400 and "already exists" in response.text:
            print("Chairperson already exists.")
        else:
            print(
                f"Failed to create chairperson: {response.status_code} {response.text}"
            )
            # Attempt to continue if possibly exists but failed for other reason? No, strict check.
            # Actually, if it failed it might be because the endpoint is /users not /users/users
            # Checking router users.py: @router.post("/users", ...)
            # So endpoint is /users/users because prefix is likely /users in main.py?
            # main.py: app.include_router(users.router, tags=["users"])
            # users.py: router = APIRouter() -> @router.post("/users")
            # So it is /users
            pass

        # Retry creation with correct endpoint if needed
        if response.status_code == 404:
            response = await client.post(
                f"{BASE_URL}/users", json=chairperson_data, headers=admin_headers
            )
            print(f"Chairperson create retry: {response.status_code}")

        # 3. Chairperson Login
        print("\n3. Chairperson Login...")
        cp_token = await get_token(client, CHAIRPERSON_USERNAME, CHAIRPERSON_PASSWORD)
        if not cp_token:
            # Try verify_subjects logic for token retrieval failure
            return

        cp_headers = {"Authorization": f"Bearer {cp_token}"}

        # 4. Create Subject (as Chairperson)
        print("\n4. Creating Subject (Start CRUD)...")
        subject_data = {
            "subject_code": "CS102",
            "subject_description": "Data Structures",
            "units": 3,
            "department": "BSCS",
        }
        response = await client.post(
            f"{BASE_URL}/subjects/", json=subject_data, headers=cp_headers
        )
        print(f"Create Status: {response.status_code}")
        print(f"Create Response: {response.json()}")

        # 5. List Subjects
        print("\n5. Listing Subjects...")
        response = await client.get(f"{BASE_URL}/subjects/", headers=cp_headers)
        print(f"List Status: {response.status_code}")
        print(f"List Response: {response.json()}")

        # 6. Update Subject
        print("\n6. Updating Subject...")
        update_data = {
            "subject_description": "Data Structures & Algorithms",
            "units": 4,
            "department": "BSCS",
        }
        response = await client.put(
            f"{BASE_URL}/subjects/CS102", json=update_data, headers=cp_headers
        )
        print(f"Update Status: {response.status_code}")
        print(f"Update Response: {response.json()}")

        # 7. Delete Subject
        print("\n7. Deleting Subject...")
        response = await client.delete(f"{BASE_URL}/subjects/CS102", headers=cp_headers)
        print(f"Delete Status: {response.status_code}")


if __name__ == "__main__":
    asyncio.run(verify_subjects())
