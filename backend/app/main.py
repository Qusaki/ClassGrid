from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.db import init_db
from app.routers import auth, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
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
