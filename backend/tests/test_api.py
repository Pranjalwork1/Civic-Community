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

    def test_agent_info(self):
        response = client.get("/api/agent/info")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["agent_name"], "civicsignal_coordinator")
        self.assertEqual(data["protocol_version"], "AgentChatProtocol:0.3.0")
        self.assertTrue(data["manifest_published"])

    def test_assistant_chat_unauthorized(self):
        """Request without token must receive 401 Unauthorized."""
        payload = {"message": "Hello Coordinator!"}
        response = client.post("/api/assistant/chat", json=payload)
        self.assertEqual(response.status_code, 401)

    def test_assistant_chat_invalid_token(self):
        """Request with wrong token must receive 401 Unauthorized."""
        payload = {"message": "Hello Coordinator!"}
        headers = {"Authorization": "Bearer invalid-token-xyz"}
        response = client.post("/api/assistant/chat", json=payload, headers=headers)
        self.assertEqual(response.status_code, 401)

    def test_assistant_chat_authorized(self):
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

if __name__ == "__main__":
    unittest.main()
