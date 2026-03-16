from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    PORT: int = 3008
    DATABASE_URL: str
    REDIS_URL: str
    JWT_PUBLIC_KEY_FILE: str
    class Config:
        env_file = ".env"
settings = Settings()
