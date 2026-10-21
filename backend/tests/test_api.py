import unittest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import settings

client = TestClient(app)

class TestFastApiAssistantEndpoint(unittest.TestCase):

    def test_health_check(self):
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["agent"], "civicsignal_coordinator")
        self.assertTrue(data["agent_address"].startswith("agent1"))
        self.assertIn("endpoint_url", data)

    def test_agent_info(self):
        response = client.get("/api/agent/info")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["agent_name"], "civicsignal_coordinator")
        self.assertEqual(data["protocol_version"], "AgentChatProtocol:0.3.0")
        self.assertTrue(data["manifest_published"])
        self.assertIn("endpoint_url", data)

    def test_agentverse_submit_readiness_probe(self):
        """
        Agentverse Connect Agent wizard sends a HEAD /submit request
        to verify that the agent endpoint is live and responsive.
        """
        response = client.head("/submit")
        self.assertEqual(response.status_code, 200)

    def test_assistant_chat_unauthorized(self):
        """Request without token and without allowed origin must receive 401 Unauthorized."""
        payload = {"message": "Hello Coordinator!"}
        response = client.post("/api/assistant/chat", json=payload)
        self.assertEqual(response.status_code, 401)

    def test_assistant_chat_invalid_token(self):
        """Request with wrong token must receive 401 Unauthorized."""
        payload = {"message": "Hello Coordinator!"}
        headers = {"Authorization": "Bearer invalid-token-xyz"}
        response = client.post("/api/assistant/chat", json=payload, headers=headers)
        self.assertEqual(response.status_code, 401)

    def test_assistant_chat_authorized_token(self):
        """Request with valid server-side token must succeed and return coordinator reply."""
        payload = {
            "message": "How does the 50-contributor threshold work?",
            "locality": "Knowledge Park III",
        }
        headers = {"Authorization": f"Bearer {settings.BACKEND_API_KEY}"}
        response = client.post("/api/assistant/chat", json=payload, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("reply", data)
        self.assertIn("50", data["reply"])
        self.assertEqual(data["agent_name"], "civicsignal_coordinator")
        self.assertTrue(data["agent_address"].startswith("agent1"))
        self.assertEqual(data["protocol"], "AgentChatProtocol:0.3.0")

    def test_assistant_chat_authorized_origin(self):
        """Direct browser request with valid Vercel CORS Origin must succeed."""
        payload = {
            "message": "Explain petition signatures & leader review",
            "locality": "Knowledge Park III",
        }
        headers = {"Origin": "https://civic-community-wine.vercel.app"}
        response = client.post("/api/assistant/chat", json=payload, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("reply", data)
        self.assertIn("Signature Campaign", data["reply"])

    def test_registration_without_key(self):
        """register_coordinator_agent must return clean failure when AGENTVERSE_KEY is not set."""
        from backend.app.agent.registration import register_coordinator_agent
        result = register_coordinator_agent(agentverse_key="")
        self.assertFalse(result["success"])
        self.assertEqual(result["error"], "AGENTVERSE_KEY is not configured")
        self.assertIn("AGENTVERSE_KEY is not set", result["message"])

    def test_registration_with_mocked_uagents_core(self):
        """Test successful registration using mocked register_chat_agent."""
        from unittest.mock import patch
        from backend.app.agent.registration import register_coordinator_agent

        captured_kwargs = {}

        def mock_register(*args, **kwargs):
            captured_kwargs.update(kwargs)
            return True

        with patch("backend.app.agent.registration.register_chat_agent", side_effect=mock_register):
            result = register_coordinator_agent(
                agentverse_key="av-mock-api-key-12345",
                endpoint="https://civicsignal-backend.onrender.com/submit",
                name="civicsignal_coordinator",
                active=True,
            )
            self.assertTrue(result["success"])
            self.assertEqual(result["agent_name"], "civicsignal_coordinator")
            self.assertEqual(result["endpoint"], "https://civicsignal-backend.onrender.com/submit")
            self.assertTrue(result["active"])

            # Verify parameters forwarded to official uagents_core function
            self.assertEqual(captured_kwargs["name"], "civicsignal_coordinator")
            self.assertEqual(captured_kwargs["endpoint"], "https://civicsignal-backend.onrender.com/submit")
            self.assertTrue(captured_kwargs["active"])
            creds = captured_kwargs["credentials"]
            self.assertEqual(creds.agent_seed_phrase, settings.AGENT_SEED)
            self.assertEqual(creds.agentverse_api_key, "av-mock-api-key-12345")

    def test_registration_api_endpoint_authorized(self):
        """Test POST /api/agent/register with mocked registration."""
        from unittest.mock import patch
        with patch(
            "backend.app.main.register_coordinator_agent",
            return_value={
                "success": True,
                "agent_name": "civicsignal_coordinator",
                "endpoint": "https://civicsignal-backend.onrender.com/submit",
                "active": True,
                "message": "Successfully registered agent",
            },
        ):
            headers = {"Authorization": f"Bearer {settings.BACKEND_API_KEY}"}
            response = client.post("/api/agent/register", json={}, headers=headers)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["agent_name"], "civicsignal_coordinator")

if __name__ == "__main__":
    unittest.main()
