from contextlib import asynccontextmanager
import logging
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.app.config import settings
from backend.app.auth import verify_api_key
from backend.app.services.agent_service import coordinator_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("civicsignal.backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CivicSignal FastAPI Backend & Coordinator Agent Service...")
    # Initialize agent identity and verify address
    agent_addr = coordinator_service.address
    logger.info(f"CivicSignal Coordinator Agent online. Address: {agent_addr}")
    logger.info(f"Agent Mailbox: {'Enabled (Agentverse)' if settings.AGENT_MAILBOX else 'Disabled'}")
    logger.info(f"ASI:One API: {'Configured' if settings.ASI_ONE_API_KEY else 'Domain Fallback Active'}")
    yield
    logger.info("CivicSignal Backend shutting down.")

app = FastAPI(
    title="CivicSignal Agentic AI Backend",
    description="Backend service integrating Fetch.ai uAgents, Agent Chat Protocol, and ASI:One API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS setup for existing React 19 + Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / Response Schemas
class AssistantChatRequest(BaseModel):
    message: str = Field(..., description="The user's message or civic question", min_length=1)
    locality: Optional[str] = Field("Knowledge Park III", description="Current neighborhood or locality")
    session_id: Optional[str] = Field(None, description="Client conversation session identifier")

class AssistantChatResponse(BaseModel):
    reply: str
    agent_name: str
    agent_address: str
    protocol: str
    mailbox_enabled: bool
    msg_id: str
    timestamp: str
    session_id: str

class AgentInfoResponse(BaseModel):
    agent_name: str
    agent_address: str
    protocol_version: str
    manifest_published: bool
    mailbox_enabled: bool
    agentverse_url: str
    asi_one_connected: bool
    asi_one_model: str

# Endpoints
@app.get("/api/health")
async def health_check():
    """Service health and agent status check."""
    return {
        "status": "healthy",
        "service": "CivicSignal Backend",
        "agent": settings.AGENT_NAME,
        "agent_address": coordinator_service.address,
        "mailbox_enabled": settings.AGENT_MAILBOX,
        "protocol": "AgentChatProtocol:0.3.0",
    }

@app.get("/api/agent/info", response_model=AgentInfoResponse)
async def get_agent_info():
    """Return public metadata about the CivicSignal Coordinator Agent."""
    return AgentInfoResponse(
        agent_name=settings.AGENT_NAME,
        agent_address=coordinator_service.address,
        protocol_version="AgentChatProtocol:0.3.0",
        manifest_published=True,
        mailbox_enabled=settings.AGENT_MAILBOX,
        agentverse_url=settings.AGENTVERSE_URL,
        asi_one_connected=bool(settings.ASI_ONE_API_KEY),
        asi_one_model=settings.ASI_ONE_MODEL,
    )

@app.post(
    "/api/assistant/chat",
    response_model=AssistantChatResponse,
    dependencies=[Depends(verify_api_key)],
    summary="Authenticated chat with CivicSignal Coordinator Agent",
)
async def assistant_chat(request: AssistantChatRequest):
    """
    Authenticated chat endpoint for the React AI assistant drawer.
    Queries the CivicSignal Coordinator Agent backed by Fetch.ai uAgents and ASI:One.
    """
    try:
        result = await coordinator_service.process_chat(
            message=request.message,
            locality=request.locality,
            session_id=request.session_id,
        )
        return AssistantChatResponse(**result)
    except Exception as e:
        logger.error(f"Error processing assistant chat: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error communicating with CivicSignal Coordinator Agent: {str(e)}",
        )
