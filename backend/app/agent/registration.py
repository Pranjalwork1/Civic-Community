"""
Agentverse Chat Agent Registration Service
Integrates official register_chat_agent and RegistrationRequestCredentials from uagents_core.
"""

import logging
from typing import Optional, Dict, Any
from uagents_core.utils.registration import (
    AgentverseRequestError,
    RegistrationRequestCredentials,
    register_chat_agent,
)
from backend.app.config import settings

logger = logging.getLogger("civicsignal.registration")

DEFAULT_DESCRIPTION = (
    "CivicSignal Coordinator Agent for community issue escalation, "
    "petition signature verification, and municipal authority routing."
)

DEFAULT_README = """# CivicSignal Coordinator Agent

Official Fetch.ai uAgent coordinating civic incidents, community petitions, and municipal escalations for CivicSignal.

## Capabilities
- **Community Incident Verification**: Tracks citizen reports and verifies severity across neighborhoods.
- **Petition Threshold Monitoring**: Monitors the 50-contributor threshold required to trigger formal municipal authority review.
- **Municipal Authority Routing**: Escalates verified issues to local authorities with immutable event logging.
- **Agent Chat Protocol**: Implements standard `AgentChatProtocol:0.3.0` for decentralized communication with ASI:One and peer agents.
"""

DEFAULT_STARTER_PROMPTS = [
    "What is the status of the pipeline repair in Sector 62?",
    "How many signatures are needed for a civic petition in Knowledge Park III?",
    "How does the 50-contributor escalation threshold work?",
    "Who is the assigned municipal authority for road hazards?",
]

DEFAULT_METADATA = {
    "categories": ["civic", "community", "governance"],
    "is_public": "True",
    "framework": "uAgents",
    "protocol": "AgentChatProtocol:0.3.0",
}


def register_coordinator_agent(
    endpoint: Optional[str] = None,
    name: Optional[str] = None,
    active: bool = True,
    agent_seed: Optional[str] = None,
    agentverse_key: Optional[str] = None,
    description: Optional[str] = None,
    starter_prompts: Optional[list] = None,
) -> Dict[str, Any]:
    """
    Registers the CivicSignal Coordinator Agent with Agentverse using the official
    uagents_core register_chat_agent function.

    Security & Idempotency:
    - Never logs secrets (AGENTVERSE_KEY or AGENT_SEED).
    - Reuses the existing agent seed to maintain permanent agent identity.
    - Uses the designated /submit endpoint on Render.
    """
    agent_name = (name or settings.AGENT_NAME).strip()
    target_endpoint = (
        endpoint
        or settings.AGENT_ENDPOINT_URL
        or "https://civicsignal-backend.onrender.com/submit"
    ).strip()
    seed = (agent_seed or settings.AGENT_SEED).strip()
    api_key = (agentverse_key or settings.AGENTVERSE_KEY).strip()

    if not api_key:
        msg = (
            "Agentverse registration skipped: AGENTVERSE_KEY is not set. "
            "Please configure AGENTVERSE_KEY in your environment or Render dashboard."
        )
        logger.warning(msg)
        return {
            "success": False,
            "agent_name": agent_name,
            "endpoint": target_endpoint,
            "active": active,
            "error": "AGENTVERSE_KEY is not configured",
            "message": msg,
        }

    if not seed:
        msg = "Agentverse registration failed: AGENT_SEED is empty."
        logger.error(msg)
        return {
            "success": False,
            "agent_name": agent_name,
            "endpoint": target_endpoint,
            "active": active,
            "error": "AGENT_SEED is empty",
            "message": msg,
        }

    logger.info(f"Initiating Agentverse registration for agent '{agent_name}' with endpoint '{target_endpoint}'...")

    try:
        credentials = RegistrationRequestCredentials(
            agent_seed_phrase=seed,
            agentverse_api_key=api_key,
        )

        success = register_chat_agent(
            name=agent_name,
            endpoint=target_endpoint,
            active=active,
            credentials=credentials,
            description=description or DEFAULT_DESCRIPTION,
            readme=DEFAULT_README,
            starter_prompts=starter_prompts or DEFAULT_STARTER_PROMPTS,
            metadata=DEFAULT_METADATA,
        )

        if success:
            success_msg = (
                f"Successfully registered agent '{agent_name}' on Agentverse! "
                f"Endpoint: {target_endpoint}, Active: {active}"
            )
            logger.info(success_msg)
            return {
                "success": True,
                "agent_name": agent_name,
                "endpoint": target_endpoint,
                "active": active,
                "message": success_msg,
            }
        else:
            fail_msg = f"Agentverse registration returned False for agent '{agent_name}'."
            logger.warning(fail_msg)
            return {
                "success": False,
                "agent_name": agent_name,
                "endpoint": target_endpoint,
                "active": active,
                "message": fail_msg,
            }

    except AgentverseRequestError as exc:
        err_msg = f"Agentverse API rejected registration: {str(exc)}"
        logger.error(f"Agentverse registration failed for '{agent_name}': {err_msg}")
        return {
            "success": False,
            "agent_name": agent_name,
            "endpoint": target_endpoint,
            "active": active,
            "error": str(exc),
            "message": err_msg,
        }
    except Exception as exc:
        err_msg = f"Unexpected error during Agentverse registration: {str(exc)}"
        logger.error(f"Agentverse registration exception for '{agent_name}': {err_msg}")
        return {
            "success": False,
            "agent_name": agent_name,
            "endpoint": target_endpoint,
            "active": active,
            "error": str(exc),
            "message": err_msg,
        }
