import asyncio
import os
from app.db import init_db
from app.models.user import User, UserRole, DepartmentType
from app.security import get_password_hash


# Create a dummy user for verification
async def verify_department_field():
    print("Initializing database...")
    await init_db()

    user_id = "test_chairperson_001"

    # Clean up existing user if any
    existing_user = await User.find_one(User.user_id == user_id)
    if existing_user:
        print(f"Deleting existing user {user_id}...")
        await existing_user.delete()

    print(f"Creating new chairperson user {user_id} with department BSCS...")
    user = User(
        user_id=user_id,
        firstname="Test",
        lastname="Chairperson",
        password=get_password_hash("password123"),
        role=UserRole.program_chairperson,
        department=DepartmentType.BSCS,
    )
    await user.create()

    # Verify creation
    fetched_user = await User.find_one(User.user_id == user_id)
    assert fetched_user is not None
    assert fetched_user.department == DepartmentType.BSCS
    print(f"User created successfully with department: {fetched_user.department}")

    # Update department
    print("Updating department to BSED-English...")
    fetched_user.department = DepartmentType.BSED_English
    await fetched_user.save()

    # Verify update
    updated_user = await User.find_one(User.user_id == user_id)
    assert updated_user.department == DepartmentType.BSED_English
    print(f"User updated successfully with department: {updated_user.department}")

    # Clean up
    await updated_user.delete()
    print("Test user deleted. Verification complete.")


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(verify_department_field())
