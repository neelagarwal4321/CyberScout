from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 3004
    DATABASE_URL: str
    REDIS_URL: str
    QDRANT_URL: str = "http://qdrant:6333"
    QDRANT_COLLECTION: str = "cybersec_knowledge"
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama3-8b-8192"
    JWT_PUBLIC_KEY_FILE: str

    class Config:
        env_file = ".env"

settings = Settings()
