import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "Mars Pathfinder AI — Mission Control API"
    VERSION: str = "2.1.0"
    API_V1_STR: str = "/api"
    
    # Database URL: defaults to local SQLite if Postgres is not provided
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./mars_pathfinder.db"
    )
    
    # NASA Open APIs Key (Public demo key is "DEMO_KEY")
    NASA_API_KEY: str = os.getenv("NASA_API_KEY", "DEMO_KEY")
    
    # Security & Admin auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mars-pathfinder-ai-secret-key-2026-supersecure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "flight-director")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "PathfinderMars2026!")
    
    # CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

settings = Settings()
