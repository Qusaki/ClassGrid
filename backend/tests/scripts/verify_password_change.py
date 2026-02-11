import asyncio
import os
import sys

# Ensure the backend directory is in sys.path
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

from app.db import init_db
from app.models import User
from app.security import verify_password

# Mock settings if needed, but we can rely on defaults or .env
# Set env var for testing if not present
if not os.getenv("MONGODB_URL"):
    os.environ["MONGODB_URL"] = "mongodb://localhost:27017"  # Default fallback
os.environ["MONGODB_DB_NAME"] = "verify_script_test"


async def verify_changes():
    try:
        print("Initializing DB...")
        await init_db()
        print("Database initialized.")

        # 1. Create a test user
        test_user_id = "test_plain_text_user"
        test_password = "supersecretpassword123"

        # Cleanup if exists
        try:
            existing_user = await User.find_one(User.user_id == test_user_id)
            if existing_user:
                await existing_user.delete()
                print("Existing test user deleted.")
        except Exception as e:
            print(f"Error accessing DB: {e}")
            return

        new_user = User(
            user_id=test_user_id,
            firstname="Test",
            lastname="User",
            password=test_password,  # Note: passing plain text direct to password field
            role="instructor",
        )
        await new_user.create()
        print(f"User {test_user_id} created.")

        # 2. Verify storage
        fetched_user = await User.find_one(User.user_id == test_user_id)
        if fetched_user.password == test_password:
            print("SUCCESS: Password stored in plain text.")
        else:
            print(f"FAILURE: Password mismatch. Stored: {fetched_user.password}")

        # 3. Verify security utility
        if verify_password(test_password, fetched_user.password):
            print("SUCCESS: verify_password works with plain text.")
        else:
            print("FAILURE: verify_password failed.")

        # Clean up
        await fetched_user.delete()
        print("Test user deleted.")

    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    try:
        if sys.platform == "win32":
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        asyncio.run(verify_changes())
    except KeyboardInterrupt:
        pass
