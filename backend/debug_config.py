from app.config import settings
from app.security import get_password_hash

if __name__ == "__main__":
    print(f"FIRST_SUPERUSER: {settings.FIRST_SUPERUSER}")
    print(f"FIRST_SUPERUSER_PASSWORD: {settings.FIRST_SUPERUSER_PASSWORD}")
    print(f"Password Length: {len(settings.FIRST_SUPERUSER_PASSWORD)}")

    try:
        pw = get_password_hash(settings.FIRST_SUPERUSER_PASSWORD)
        print(f"Hash success: {pw[:10]}...")
    except Exception as e:
        print(f"Hash failed: {e}")
