import asyncio
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI

from app.config import settings
from app.db import init_db
from app.routers import auth, users


async def ping_self():
    """Pings the service itself every 10 minutes to prevent sleeping."""
    await asyncio.sleep(5)  # Wait for startup
    while True:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(settings.SELF_PING_URL)
                print(f"Self-ping status: {response.status_code}")
        except Exception as e:
            print(f"Self-ping failed: {e}")

        await asyncio.sleep(600)  # Sleep for 10 minutes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    asyncio.create_task(ping_self())
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
)

app.include_router(auth.router, tags=["auth"])
app.include_router(users.router, tags=["users"])


@app.get("/")
async def root():
    return {"message": "Hello, World!"}
