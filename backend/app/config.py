import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load server-side .env file if available
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

class Settings:
    # Server configuration
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    BACKEND_API_KEY: str = os.getenv("BACKEND_API_KEY", "civicsignal-local-secret-key-2026")
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
        ).split(",")
    ]

    # CivicSignal Coordinator Agent configuration
    AGENT_NAME: str = os.getenv("AGENT_NAME", "civicsignal_coordinator")
    AGENT_SEED: str = os.getenv(
        "AGENT_SEED",
        "civicsignal_coordinator_secure_production_seed_phrase_2026_gdg",
    )
    AGENT_PORT: int = int(os.getenv("AGENT_PORT", "8001"))
    
    # Mailbox & Agentverse connectivity
    AGENT_MAILBOX: bool = os.getenv("AGENT_MAILBOX", "true").lower() in ("true", "1", "yes")
    AGENTVERSE_KEY: str = os.getenv("AGENTVERSE_KEY", "")
    AGENTVERSE_URL: str = os.getenv("AGENTVERSE_URL", "https://agentverse.ai")

    # ASI:One API Integration
    ASI_ONE_API_KEY: str = os.getenv("ASI_ONE_API_KEY", "")
    ASI_ONE_BASE_URL: str = os.getenv("ASI_ONE_BASE_URL", "https://api.asi1.ai/v1")
    ASI_ONE_MODEL: str = os.getenv("ASI_ONE_MODEL", "asi1-mini")

settings = Settings()
