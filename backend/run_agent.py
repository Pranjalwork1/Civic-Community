import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import asyncio
import logging
from backend.app.agent.coordinator import create_coordinator_agent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

if __name__ == "__main__":
    print("Starting standalone CivicSignal Coordinator Agent...")
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    agent = create_coordinator_agent(loop=loop)
    try:
        agent.run()
    except KeyboardInterrupt:
        print("Coordinator Agent stopped by user.")
