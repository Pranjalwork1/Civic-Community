import asyncio
import logging
from uagents import Agent, Context
from backend.app.config import settings
from backend.app.agent.protocol import chat_proto

logger = logging.getLogger("civicsignal.coordinator")

def create_coordinator_agent(loop: asyncio.AbstractEventLoop = None) -> Agent:
    """
    Instantiate and configure the official CivicSignal Coordinator Agent.
    - Uses Fetch.ai uAgents framework
    - Supports public HTTPS endpoint routing (AGENT_ENDPOINT_URL) for Agentverse Connect Agent
    - Supports Agentverse Mailbox connectivity (AGENT_MAILBOX)
    - Publishes the Chat Protocol manifest (publish_manifest=True)
    - Integrated with ASI:One API and local civic coordinator domain logic
    """
    if loop is None:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

    agent_kwargs = {
        "name": settings.AGENT_NAME,
        "seed": settings.AGENT_SEED,
        "port": settings.AGENT_PORT,
        "loop": loop,
    }

    # If public HTTPS endpoint URL is provided (e.g. on Render), configure direct endpoint
    if settings.AGENT_ENDPOINT_URL:
        agent_kwargs["endpoint"] = [settings.AGENT_ENDPOINT_URL]
    elif settings.AGENT_MAILBOX:
        agent_kwargs["mailbox"] = True
        if settings.AGENTVERSE_URL:
            agent_kwargs["agentverse"] = settings.AGENTVERSE_URL

    agent = Agent(**agent_kwargs)

    # Attach the standard Agent Chat Protocol and publish manifest to Almanac / Agentverse
    agent.include(chat_proto, publish_manifest=True)

    @agent.on_event("startup")
    async def on_startup(ctx: Context):
        endpoint_info = settings.AGENT_ENDPOINT_URL or ("Mailbox Polling" if settings.AGENT_MAILBOX else "Local Loopback")
        ctx.logger.info("=" * 64)
        ctx.logger.info("🏛️  CivicSignal Coordinator Agent Initialized")
        ctx.logger.info(f"   Name:     {agent.name}")
        ctx.logger.info(f"   Address:  {agent.address}")
        ctx.logger.info(f"   Endpoint: {endpoint_info}")
        ctx.logger.info(f"   Mailbox:  {'Enabled (Agentverse)' if settings.AGENT_MAILBOX and not settings.AGENT_ENDPOINT_URL else 'Disabled'}")
        ctx.logger.info("   Protocol: AgentChatProtocol:0.3.0 (publish_manifest=True)")
        ctx.logger.info(f"   ASI:One:  {'Connected (' + settings.ASI_ONE_MODEL + ')' if settings.ASI_ONE_API_KEY else 'Built-in Civic Knowledge Base'}")
        ctx.logger.info("=" * 64)

    @agent.on_event("shutdown")
    async def on_shutdown(ctx: Context):
        ctx.logger.info("🏛️  CivicSignal Coordinator Agent shutting down.")

    return agent
