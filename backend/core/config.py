from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend directory explicitly
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Encryption
    ENCRYPTION_KEY: str
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_JWT_SECRET: str
    
    # Database
    DATABASE_URL: str
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    model_config = {
        "env_file": str(_env_path),
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
