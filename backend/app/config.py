import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    MONGODB_URL: str
    MONGODB_DB_NAME: str = "classgrid_db"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    PROJECT_NAME: str = "ClassGrid"
    # Use Render's environment variable if available, otherwise default to localhost
    SELF_PING_URL: str = os.getenv("RENDER_EXTERNAL_URL", "http://localhost:10000")

    FIRST_SUPERUSER: str
    FIRST_SUPERUSER_PASSWORD: str


settings = Settings()
