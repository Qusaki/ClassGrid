import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app.models.schedule import Schedule

async def clear_schedules():
    client = AsyncIOMotorClient(settings.MONGODB_URL, tlsCAFile=certifi.where())
    await init_beanie(
        database=client[settings.MONGODB_DB_NAME],
        document_models=[Schedule],
    )
    
    print("Deleting all schedules...")
    await Schedule.delete_all()
    print("All schedules deleted.")

if __name__ == "__main__":
    asyncio.run(clear_schedules())
