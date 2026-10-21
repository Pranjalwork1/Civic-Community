import logging
from datetime import datetime, timezone
from uuid import uuid4
from uagents import Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    chat_protocol_spec,
)
from backend.app.agent.asi_client import asi_one_client

logger = logging.getLogger("civicsignal.protocol")

# Initialize protocol using standard AgentChatProtocol specification
chat_proto = Protocol(spec=chat_protocol_spec)

@chat_proto.on_message(model=ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    """
    Standard Agent Chat Protocol message handler.
    1. Acknowledges receipt of the message immediately (<100ms requirement).
    2. Extracts natural language content.
    3. Resolves answer via ASI:One API / Coordinator knowledge base.
    4. Replies with a ChatMessage containing TextContent.
    """
    ctx.logger.info(f"[Coordinator Agent] Received ChatMessage from {sender} (msg_id={msg.msg_id})")

    # Step 1: Send immediate acknowledgement
    ack = ChatAcknowledgement(
        timestamp=datetime.now(timezone.utc),
        acknowledged_msg_id=msg.msg_id,
    )
    await ctx.send(sender, ack)
    ctx.logger.info(f"[Coordinator Agent] Sent ChatAcknowledgement to {sender} for msg_id={msg.msg_id}")

    # Step 2: Extract text from incoming content blocks
    user_text = ""
    for item in msg.content:
        if isinstance(item, TextContent):
            user_text += item.text
        elif hasattr(item, "text"):
            user_text += str(item.text)

    ctx.logger.info(f"[Coordinator Agent] Processing user prompt: '{user_text}'")

    # Step 3: Consult ASI:One / Domain Coordinator model
    messages = [{"role": "user", "content": user_text}]
    reply_text = await asi_one_client.get_chat_completion(messages)

    # Step 4: Transmit ChatMessage response back to sender
    response_msg = ChatMessage(
        timestamp=datetime.now(timezone.utc),
        msg_id=uuid4(),
        content=[TextContent(type="text", text=reply_text)],
    )
    await ctx.send(sender, response_msg)
    ctx.logger.info(f"[Coordinator Agent] Replied to {sender} with msg_id={response_msg.msg_id}")

@chat_proto.on_message(model=ChatAcknowledgement)
async def handle_chat_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """
    Handle incoming read-receipts / acknowledgements from client agents.
    """
    ctx.logger.info(
        f"[Coordinator Agent] Received ChatAcknowledgement from {sender} for msg_id={msg.acknowledged_msg_id}"
    )
