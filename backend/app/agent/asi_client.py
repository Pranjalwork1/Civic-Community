import logging
from typing import List, Dict, Any, Optional
import httpx
from backend.app.config import settings

logger = logging.getLogger("civicsignal.asi_client")

COORDINATOR_SYSTEM_PROMPT = """You are the CivicSignal Coordinator Agent, an autonomous civic agent built on Fetch.ai's uAgents framework and powered by the ASI:One decentralized intelligence network.

Your core mission is to coordinate neighborhood civic action, corroborate community hazards, explain municipal workflows, and guide citizens through incident lifecycle milestones.

Key System Guidelines:
1. Incident Room Threshold: When 50 unique neighbors corroborate an issue ('I Saw It' or photo evidence), CivicSignal unlocks a dedicated Incident Room and designates the initial reporter as the community leader.
2. Photo Evidence Guidelines: Streetlights require wide-angle context + pole identifier. Potholes require perspective showing lane impact. Waste piles need clear scale indicators.
3. Electrical Hazards & Safety: Immediate priority. Never approach dangling wires, sparking transformers, or waterlogged poles. Advise standing at least 10 meters away.
4. Petition Campaigns: When an Incident Room gathers 100 verified local members, a collective petition campaign initiates. The Community Leader must approve before formal municipal dispatch.
5. Tone: Helpful, authoritative, community-centric, professional, and civic-minded. Keep replies concise, structured, and actionable.
"""

def generate_local_fallback_response(query: str, locality: Optional[str] = None) -> str:
    """
    Intelligent civic domain fallback when an external ASI:One API key is not configured or network is unreachable.
    """
    q = query.lower()
    loc = locality or "your area"

    if any(k in q for k in ("50", "threshold", "room", "unlock", "corroborat")):
        return (
            "When 50 unique eligible neighbors independently report or corroborate an incident (via 'I Saw It' "
            "or adding photos), CivicSignal automatically unlocks a dedicated Incident Room. This consolidates all "
            "neighborhood signals and designates the initial reporter as the Community Leader."
        )
    elif any(k in q for k in ("streetlight", "street light", "light", "dark", "lamp")):
        return (
            f"For streetlight outages in {loc}: 1. Take a wide-angle photo capturing the pole and roadway context. "
            "2. Note any pole number or nearest landmark. 3. Tag how many nights the light has been non-functional. "
            "CivicSignal automatically records GPS coordinates."
        )
    elif any(k in q for k in ("electrical", "wire", "spark", "transformer", "shock", "hazard", "urgent")):
        return (
            "CRITICAL SAFETY WARNING: Never approach hanging or downed wires, sparking transformers, or flooded poles. "
            "Photograph safely from at least 10 meters away. CivicSignal flags electrical hazards as 'High Severity Urgent Safety' "
            "for immediate municipal triage."
        )
    elif any(k in q for k in ("petition", "signature", "leader", "campaign", "complaint")):
        return (
            f"In {loc}, when an Incident Room reaches 100 participating residents, an official Signature Campaign initiates. "
            "After neighborhood signatures are gathered, the Community Leader gives final sign-off before the automated packet "
            "is transmitted to the municipal commissioner."
        )
    elif any(k in q for k in ("pothole", "road", "footpath", "drain", "water", "waste", "garbage")):
        return (
            f"CivicSignal is currently tracking civic issues across {loc}. To file a report, click '+ Create report' at the top "
            "or use the quick composer. Ensure your evidence photo is sharp and includes recognizable street context."
        )
    else:
        return (
            f"Greetings from the CivicSignal Coordinator Agent! I am monitoring civic operations in {loc}. "
            "I can assist you with hazard classifications, photo evidence protocols, 50-resident incident rooms, "
            "or community petition tracking. How can I help coordinate your neighborhood today?"
        )

class AsiOneClient:
    def __init__(self):
        self.api_key = settings.ASI_ONE_API_KEY
        self.base_url = settings.ASI_ONE_BASE_URL.rstrip("/")
        self.model = settings.ASI_ONE_MODEL

    async def get_chat_completion(
        self,
        messages: List[Dict[str, str]],
        locality: Optional[str] = None,
    ) -> str:
        """
        Send a conversation to the ASI:One Chat Completions API with fallback to built-in coordinator logic.
        """
        # If API key is not configured, gracefully use coordinator domain knowledge
        if not self.api_key:
            logger.info("ASI_ONE_API_KEY not set. Using CivicSignal Coordinator domain logic.")
            last_user_query = ""
            for m in reversed(messages):
                if m.get("role") == "user":
                    last_user_query = m.get("content", "")
                    break
            return generate_local_fallback_response(last_user_query, locality)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        # Build full prompt with coordinator system instructions
        conversation = [{"role": "system", "content": COORDINATOR_SYSTEM_PROMPT}]
        if locality:
            conversation.append(
                {
                    "role": "system",
                    "content": f"The resident is currently viewing or reporting in locality: {locality}.",
                }
            )
        conversation.extend(messages)

        payload = {
            "model": self.model,
            "messages": conversation,
            "temperature": 0.4,
            "max_tokens": 600,
        }

        endpoint = f"{self.base_url}/chat/completions"

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(endpoint, json=payload, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        return choices[0]["message"].get("content", "").strip()
                logger.warning(
                    f"ASI:One API returned status {response.status_code}: {response.text}. Using domain fallback."
                )
        except Exception as e:
            logger.warning(f"Error querying ASI:One API: {e}. Falling back to domain logic.")

        last_user_query = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_user_query = m.get("content", "")
                break
        return generate_local_fallback_response(last_user_query, locality)

asi_one_client = AsiOneClient()
