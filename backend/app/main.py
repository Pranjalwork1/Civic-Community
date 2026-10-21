import asyncio
from contextlib import asynccontextmanager
import logging
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.app.config import settings
from backend.app.auth import verify_api_key
from backend.app.services.agent_service import coordinator_service
from backend.app.agent.registration import register_coordinator_agent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("civicsignal.backend")

class AgentSubmitASGI:
    """
    ASGI sub-application proxy ensuring incoming Fetch.ai agent envelopes
    hit the internal uAgent /submit ASGI handler.
    """
    def __init__(self, agent_server):
        self.server = agent_server

    async def __call__(self, scope, receive, send):
        scope["path"] = "/submit"
        await self.server(scope, receive, send)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CivicSignal FastAPI Backend & Coordinator Agent Service...")
    # Initialize agent identity and verify address
    agent_addr = coordinator_service.address
    logger.info(f"CivicSignal Coordinator Agent online. Address: {agent_addr}")
    logger.info(f"Agent Endpoint URL: {settings.AGENT_ENDPOINT_URL or 'Internal (auto-mounted at /submit)'}")
    logger.info(f"Agent Mailbox: {'Enabled (Agentverse)' if settings.AGENT_MAILBOX and not settings.AGENT_ENDPOINT_URL else 'Disabled'}")
    logger.info(f"ASI:One API: {'Configured' if settings.ASI_ONE_API_KEY else 'Domain Fallback Active'}")

    # Optional automated startup registration with Agentverse
    if settings.AUTO_REGISTER_AGENTVERSE:
        if settings.AGENTVERSE_KEY:
            logger.info("AUTO_REGISTER_AGENTVERSE enabled: attempting background registration with Agentverse...")
            asyncio.create_task(asyncio.to_thread(register_coordinator_agent))
        else:
            logger.warning("AUTO_REGISTER_AGENTVERSE is enabled but AGENTVERSE_KEY is not set.")
    else:
        logger.info(
            "Agentverse registration: On-demand mode. "
            "Run 'python backend/register_agent.py' or call POST /api/agent/register to register."
        )

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

# Mount the Fetch.ai uAgent submit router directly at /submit
# This enables Agentverse and other external uAgents to send Chat Protocol envelopes directly to this web service
app.mount("/submit", AgentSubmitASGI(coordinator_service.get_agent()._server))

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
    endpoint_url: str
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
        "mailbox_enabled": settings.AGENT_MAILBOX and not bool(settings.AGENT_ENDPOINT_URL),
        "endpoint_url": settings.AGENT_ENDPOINT_URL or "/submit",
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
        mailbox_enabled=settings.AGENT_MAILBOX and not bool(settings.AGENT_ENDPOINT_URL),
        endpoint_url=settings.AGENT_ENDPOINT_URL or "/submit",
        agentverse_url=settings.AGENTVERSE_URL,
        asi_one_connected=bool(settings.ASI_ONE_API_KEY),
        asi_one_model=settings.ASI_ONE_MODEL,
    )

class AgentRegisterRequest(BaseModel):
    endpoint: Optional[str] = Field(None, description="Public HTTPS endpoint URL (e.g. /submit)")
    name: Optional[str] = Field(None, description="Agent name on Agentverse")
    active: bool = Field(True, description="Mark agent active on Agentverse")

class AgentRegisterResponse(BaseModel):
    success: bool
    agent_name: str
    endpoint: str
    active: bool
    message: str
    error: Optional[str] = None

@app.post(
    "/api/agent/register",
    response_model=AgentRegisterResponse,
    dependencies=[Depends(verify_api_key)],
    summary="Register CivicSignal Coordinator Agent with Agentverse using register_chat_agent",
)
async def register_agent_on_agentverse(payload: Optional[AgentRegisterRequest] = None):
    """
    Triggers official register_chat_agent registration with Agentverse.
    Protected with server-side authentication.
    """
    req_endpoint = payload.endpoint if payload else None
    req_name = payload.name if payload else None
    req_active = payload.active if payload else True

    result = await asyncio.to_thread(
        register_coordinator_agent,
        endpoint=req_endpoint,
        name=req_name,
        active=req_active,
    )

    if not result["success"] and result.get("error") == "AGENTVERSE_KEY is not configured":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"],
        )
    return AgentRegisterResponse(**result)

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
