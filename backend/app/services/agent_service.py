import logging
from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional, Dict, Any
from backend.app.config import settings
from backend.app.agent.coordinator import create_coordinator_agent
from backend.app.agent.asi_client import asi_one_client

logger = logging.getLogger("civicsignal.agent_service")

class CoordinatorAgentService:
    """
    Service managing coordinator agent metadata, state, and API routing.
    """
    def __init__(self):
        self._agent = None
        self._address = None

    def get_agent(self):
        if self._agent is None:
            self._agent = create_coordinator_agent()
            self._address = self._agent.address
        return self._agent

    @property
    def address(self) -> str:
        if self._address is None:
            # Derive agent address without starting full event loops
            self.get_agent()
        return self._address

    async def process_chat(
        self,
        message: str,
        locality: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Process chat query through the Coordinator Agent logic and ASI:One.
        """
        msg_id = str(uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()

        logger.info(f"Dispatching query to Coordinator Agent [{self.address}]: '{message}'")

        # Query ASI:One / Coordinator model
        conversation = [{"role": "user", "content": message}]
        reply = await asi_one_client.get_chat_completion(conversation, locality=locality)

        return {
            "reply": reply,
            "agent_name": settings.AGENT_NAME,
            "agent_address": self.address,
            "protocol": "AgentChatProtocol:0.3.0",
            "mailbox_enabled": settings.AGENT_MAILBOX,
            "msg_id": msg_id,
            "timestamp": timestamp,
            "session_id": session_id or str(uuid4()),
        }

coordinator_service = CoordinatorAgentService()
