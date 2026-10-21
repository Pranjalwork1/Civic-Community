"""
CivicSignal Agentverse Registration CLI
Command-line utility to register the CivicSignal Coordinator Agent with Agentverse
using the official register_chat_agent function and RegistrationRequestCredentials.

Usage:
    python backend/register_agent.py
    python backend/register_agent.py --endpoint https://civicsignal-backend.onrender.com/submit
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import argparse
import logging
from backend.app.config import settings
from backend.app.agent.registration import register_coordinator_agent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

def main():
    parser = argparse.ArgumentParser(
        description="Register CivicSignal Coordinator Agent with Agentverse."
    )
    parser.add_argument(
        "--endpoint",
        type=str,
        default=None,
        help="Target public HTTPS endpoint URL (defaults to AGENT_ENDPOINT_URL or Render /submit)",
    )
    parser.add_argument(
        "--name",
        type=str,
        default=None,
        help="Agent display name on Agentverse (defaults to AGENT_NAME)",
    )
    parser.add_argument(
        "--inactive",
        action="store_true",
        help="Register agent in inactive mode instead of active",
    )
    args = parser.parse_args()

    active_state = not args.inactive

    print("=" * 70)
    print("🤖 CivicSignal Agentverse Registration Tool")
    print("=" * 70)
    print(f"Agent Name:    {args.name or settings.AGENT_NAME}")
    endpoint_to_use = (
        args.endpoint
        or settings.AGENT_ENDPOINT_URL
        or "https://civicsignal-backend.onrender.com/submit"
    )
    print(f"Endpoint URL:  {endpoint_to_use}")
    print(f"Active Status: {active_state}")
    print(f"Agent Seed:    [CONFIGURED: {len(settings.AGENT_SEED)} chars, hidden]")
    print(f"Agentverse Key:[CONFIGURED: {'YES' if settings.AGENTVERSE_KEY else 'NO (MISSING)'}]")
    print("-" * 70)

    if not settings.AGENTVERSE_KEY:
        print("\n❌ Error: AGENTVERSE_KEY is not set.")
        print("Please configure AGENTVERSE_KEY in backend/.env or your environment:")
        print("1. Log in to https://agentverse.ai")
        print("2. Go to Profile / API Keys and create a new key.")
        print("3. Set AGENTVERSE_KEY=<your-key> in backend/.env")
        sys.exit(1)

    result = register_coordinator_agent(
        endpoint=endpoint_to_use,
        name=args.name,
        active=active_state,
    )

    print("\n" + "=" * 70)
    if result["success"]:
        print("✅ AGENTVERSE REGISTRATION SUCCEEDED!")
        print(f"Message:       {result['message']}")
        print(f"Agent Name:    {result['agent_name']}")
        print(f"Endpoint URL:  {result['endpoint']}")
        print(f"Active:        {result['active']}")
        print("\nNext Steps:")
        print("1. Open https://agentverse.ai -> My Agents.")
        print("2. You will see 'civicsignal_coordinator' listed as Active.")
        print("3. Test in ASI:One (https://asi1.ai) by searching for your agent.")
        print("=" * 70)
        sys.exit(0)
    else:
        print("❌ REGISTRATION FAILED")
        print(f"Reason:        {result.get('error', 'Unknown error')}")
        print(f"Details:       {result.get('message', '')}")
        print("\nTroubleshooting tips:")
        print("- Verify that your AGENTVERSE_KEY is valid on https://agentverse.ai")
        print("- Verify that your endpoint is publicly reachable (HTTP HEAD 200 OK)")
        print("=" * 70)
        sys.exit(1)


if __name__ == "__main__":
    main()
