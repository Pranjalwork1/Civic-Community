import asyncio
import unittest
from typing import Any
from datetime import datetime, timezone
from uuid import uuid4
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    chat_protocol_spec,
)
from backend.app.agent.coordinator import create_coordinator_agent
from backend.app.agent.protocol import handle_chat_message
from backend.app.services.agent_service import coordinator_service

class MockContext:
    """Mock agent context to capture outbound messages for deterministic testing."""
    def __init__(self):
        self.sent_messages = []
        import logging
        self.logger = logging.getLogger("test_context")

    async def send(self, destination: str, message: Any):
        self.sent_messages.append((destination, message))

class TestCoordinatorAgentChat(unittest.IsolatedAsyncioTestCase):

    async def test_coordinator_agent_initialization_and_address(self):
        """Verify the coordinator agent initializes with valid cryptographic address and protocol."""
        agent = coordinator_service.get_agent()
        self.assertIsNotNone(agent)
        self.assertTrue(agent.address.startswith("agent1"))
        self.assertEqual(agent.name, "civicsignal_coordinator")
        print(f"\n[Test] Coordinator Agent Address: {agent.address}")

    async def test_agent_chat_protocol_message_flow(self):
        """
        Verify sending a ChatMessage conforming to Agent Chat Protocol (v0.3.0)
        yields an immediate ChatAcknowledgement and a ChatMessage with TextContent.
        """
        ctx = MockContext()
        test_sender = "agent1qtest_client_resident_address_gdg_2026"
        incoming_msg_id = uuid4()

        # Build standard ChatMessage with TextContent
        incoming_chat = ChatMessage(
            timestamp=datetime.now(timezone.utc),
            msg_id=incoming_msg_id,
            content=[
                TextContent(
                    type="text",
                    text="How does the 50-contributor threshold work in CivicSignal?",
                )
            ],
        )

        # Dispatch through the real Agent Chat Protocol handler
        await handle_chat_message(ctx, test_sender, incoming_chat)

        # Assert two outbound messages: 1. ChatAcknowledgement, 2. ChatMessage reply
        self.assertEqual(len(ctx.sent_messages), 2)

        # Message 1: ChatAcknowledgement
        dest_1, ack = ctx.sent_messages[0]
        self.assertEqual(dest_1, test_sender)
        self.assertIsInstance(ack, ChatAcknowledgement)
        self.assertEqual(ack.acknowledged_msg_id, incoming_msg_id)
        print(f"[Test] Successfully received ChatAcknowledgement for msg_id: {ack.acknowledged_msg_id}")

        # Message 2: ChatMessage response
        dest_2, response = ctx.sent_messages[1]
        self.assertEqual(dest_2, test_sender)
        self.assertIsInstance(response, ChatMessage)
        self.assertTrue(len(response.content) > 0)
        self.assertIsInstance(response.content[0], TextContent)

        reply_text = response.content[0].text
        self.assertIn("50", reply_text)
        self.assertIn("Incident Room", reply_text)
        print(f"[Test] Successfully received Coordinator reply: {reply_text[:80]}...")

    async def test_coordinator_service_end_to_end(self):
        """Verify the coordinator service returns structured response for API bridge."""
        res = await coordinator_service.process_chat(
            message="What evidence is required for a broken streetlight?",
            locality="Knowledge Park III",
        )
        self.assertIn("reply", res)
        self.assertEqual(res["agent_name"], "civicsignal_coordinator")
        self.assertEqual(res["protocol"], "AgentChatProtocol:0.3.0")
        self.assertTrue(len(res["reply"]) > 20)
        print(f"[Test] Coordinator service responded: {res['reply'][:70]}...")

if __name__ == "__main__":
    unittest.main()
