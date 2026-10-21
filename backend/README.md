# CivicSignal Phase 3A: Backend & Fetch.ai Coordinator Agent

This directory contains the Python backend and Fetch.ai `uAgents` service for CivicSignal, implementing Phase 3A.

## Architecture Overview

- **Framework**: FastAPI (async REST API) + Fetch.ai `uAgents` v0.26+ + `uagents-core` v0.4+
- **Agent**: `CivicSignal Coordinator Agent` (`civicsignal_coordinator`)
- **Protocol**: Standard **Agent Chat Protocol** (`AgentChatProtocol:0.3.0`) with `publish_manifest=True`
- **Messages**: Standard `ChatMessage`, `ChatAcknowledgement`, and `TextContent` models
- **Mailbox**: Agentverse mailbox support for asynchronous routing and firewall traversal
- **AI Intelligence**: Integrated with **ASI:One** (`https://api.asi1.ai/v1`) with resilient built-in coordinator domain knowledge
- **Security**: Server-side environment variables for API keys, seed phrases, and tokens. Authenticated `/api/assistant/chat` endpoint protecting the agent from unauthorized client queries.

---

## Directory Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── config.py           # Loads settings from server-side .env
│   ├── main.py             # FastAPI app with CORS, health checks, and /api/assistant/chat
│   ├── auth.py             # Server-side Bearer token / API key validation
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── coordinator.py  # CivicSignal Coordinator Agent factory
│   │   ├── asi_client.py   # ASI:One API integration & domain fallback logic
│   │   └── protocol.py     # Agent Chat Protocol handlers (ChatMessage, ChatAcknowledgement)
│   └── services/
│       ├── __init__.py
│       └── agent_service.py # Bridge service between FastAPI and Coordinator Agent
├── tests/
│   ├── __init__.py
│   ├── test_agent_chat.py   # Test sending ChatMessage and receiving response via Chat Protocol
│   └── test_api.py          # FastAPI test suite for authentication and chat endpoints
├── run_backend.py          # Runs the FastAPI server (port 8000)
├── run_agent.py            # Runs the standalone Coordinator Agent with Mailbox (port 8001)
├── requirements.txt        # Python package dependencies
├── .env.example            # Environment variables template
└── README.md               # Setup instructions (this file)
```

---

## Setup & Installation

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js & npm (for the React 19 frontend)

### 2. Install Dependencies
From the repository root or `backend/` directory:
```bash
pip install -r backend/requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your credentials:
```env
# Backend server
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_API_KEY=civicsignal-local-secret-key-2026

# Coordinator Agent
AGENT_NAME=civicsignal_coordinator
AGENT_SEED=civicsignal_coordinator_secure_production_seed_phrase_2026_gdg
AGENT_PORT=8001

# Agentverse Mailbox
AGENT_MAILBOX=true
AGENTVERSE_KEY=<your-agentverse-api-key>
AGENTVERSE_URL=https://agentverse.ai

# ASI:One API (Optional - domain knowledge fallback active if omitted)
ASI_ONE_API_KEY=<your-asi1-api-key>
ASI_ONE_BASE_URL=https://api.asi1.ai/v1
ASI_ONE_MODEL=asi1-mini
```

---

## Running the Application

### 1. Run the FastAPI Backend Server
```bash
python backend/run_backend.py
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`
- Agent Info: `http://localhost:8000/api/agent/info`

### 2. Run the Standalone Coordinator Agent with Mailbox
```bash
python backend/run_agent.py
```
This runs the coordinator agent with the published `AgentChatProtocol` manifest and connects it to the Agentverse mailbox.

### 3. Run Automated Tests
```bash
python -m unittest discover -s backend/tests -v
```
All 8 test cases verify:
- Coordinator agent initialization and cryptographic address format (`agent1q...`)
- Full Agent Chat Protocol message flow: `ChatMessage` -> `ChatAcknowledgement` -> `ChatMessage` with `TextContent`
- Domain knowledge responses (50-contributor threshold, streetlight evidence, electrical safety)
- FastAPI authentication protection (401 on missing/invalid token, 200 on authorized token)

---

## Authenticated API Usage

Send a message from any authorized client:

```bash
curl -X POST http://localhost:8000/api/assistant/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer civicsignal-local-secret-key-2026" \
  -d '{
    "message": "How does the 50-contributor threshold work?",
    "locality": "Knowledge Park III"
  }'
```

**Response**:
```json
{
  "reply": "When 50 unique eligible neighbors independently report, corroborate (\"I Saw It\"), or add evidence to an incident, CivicSignal automatically unlocks a dedicated Incident Room. This consolidates all signals and assigns the original reporter as the community leader.",
  "agent_name": "civicsignal_coordinator",
  "agent_address": "agent1q0raqudlpe0kn6tefpuhn8kh3n8m80dlmzyuc2g2j6jgf8axalk2x0aj53g",
  "protocol": "AgentChatProtocol:0.3.0",
  "mailbox_enabled": false,
  "msg_id": "716f6d5f-1bc0-4364-9bb4-20cb7e65e206",
  "timestamp": "2026-10-21T18:59:00+00:00",
  "session_id": "0381665e-213c-41ad-b6f7-c2901dbd5918"
}
```
