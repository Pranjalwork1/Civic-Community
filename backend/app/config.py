import os
import logging
from pathlib import Path
from typing import List
from dotenv import load_dotenv

logger = logging.getLogger("civicsignal.config")

# Load server-side .env file if available
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

class Settings:
    # Server configuration
    # PaaS hosts like Render set the 'PORT' environment variable automatically
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("PORT") or os.getenv("BACKEND_PORT", "8000"))
    
    # Server-side authentication key (never exposed to client browser)
    BACKEND_API_KEY: str = os.getenv("BACKEND_API_KEY", "civicsignal-local-secret-key-2026")
    
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://civic-community-wine.vercel.app",
        ).split(",")
        if origin.strip()
    ]

    # CivicSignal Coordinator Agent configuration
    AGENT_NAME: str = os.getenv("AGENT_NAME", "civicsignal_coordinator")
    
    # Stable seed phrase for cryptographic identity. Must be set in production!
    AGENT_SEED: str = os.getenv(
        "AGENT_SEED",
        "civicsignal_coordinator_dev_seed_change_in_production",
    )
    AGENT_PORT: int = int(os.getenv("AGENT_PORT", "8001"))
    
    # Public Endpoint URL for Agentverse Connect Agent wizard
    # e.g., https://civicsignal-backend.onrender.com/submit
    AGENT_ENDPOINT_URL: str = os.getenv("AGENT_ENDPOINT_URL", "").strip()

    # Mailbox connectivity (alternative to direct public endpoint)
    AGENT_MAILBOX: bool = os.getenv("AGENT_MAILBOX", "false").lower() in ("true", "1", "yes")
    AGENTVERSE_KEY: str = os.getenv("AGENTVERSE_KEY", "")
    AGENTVERSE_URL: str = os.getenv("AGENTVERSE_URL", "https://agentverse.ai")

    # ASI:One API Integration (server-side only)
    ASI_ONE_API_KEY: str = os.getenv("ASI_ONE_API_KEY", "")
    ASI_ONE_BASE_URL: str = os.getenv("ASI_ONE_BASE_URL", "https://api.asi1.ai/v1")
    ASI_ONE_MODEL: str = os.getenv("ASI_ONE_MODEL", "asi1-mini")

settings = Settings()
