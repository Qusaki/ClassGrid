import pytest_asyncio

from app.db import init_db


@pytest_asyncio.fixture(loop_scope="function", scope="function", autouse=True)
async def initialize_database():
    await init_db()
