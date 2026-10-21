# CivicSignal Backend & Fetch.ai Coordinator Agent Guide

This directory houses the production Python backend and autonomous agent implementation for **CivicSignal**, built using FastAPI, Fetch.ai's official `uAgents` framework, and the Agent Chat Protocol.

---

## 🧭 Why Agentverse Asks for "Agent Endpoint URL"

When you choose **Agentverse → Launch an Agent → Connect Agent → Chat Protocol**, Agentverse is setting up a **Direct HTTP Webhook Integration**. 

In this architecture:
- Agentverse needs a public HTTPS URL where it can send incoming conversational messages and test readiness probes.
- **Why `localhost` doesn't work:** Agentverse runs in the cloud; it cannot reach your laptop's private IP or local ports.
- **Why the Vercel frontend URL doesn't work:** Vercel only hosts the React web application bundle, not a persistent Python process that implements the cryptographic Fetch.ai Agent Protocol.
- **The Solution:** Deploy this Python backend to a free persistent hosting platform like **Render**. Render assigns a public HTTPS domain (e.g. `https://civicsignal-backend.onrender.com`).
- **The Exact Endpoint URL to enter into Agentverse:**
  ```text
  https://<your-render-service-name>.onrender.com/submit
  ```
  *(The `/submit` path is the standard Fetch.ai protocol router implemented by `uagents.ASGIServer`).*

---

## 🚀 Step-by-Step Render Deployment (Persistent Service)

### Step 1: Push Repository to GitHub
Ensure all latest files (including `render.yaml`, `backend/`, and `api/`) are pushed to your GitHub repository `https://github.com/Pranjalwork1/Civic-Community`.

### Step 2: Create Web Service on Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com) and sign in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `Pranjalwork1/Civic-Community`.
4. Configure the Web Service settings:
   - **Name:** `civicsignal-backend` (or your preferred name)
   - **Region:** Any (e.g. Oregon, Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank / default)*
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `python backend/run_backend.py`
   - **Plan:** Free

### Step 3: Configure Environment Variables on Render
Under the **Environment** tab on Render, add:
| Key | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `10000` | Render assigns this automatically |
| `AGENT_NAME` | `civicsignal_coordinator` | Agent identity name |
| `AGENT_SEED` | *(Generate a secret phrase)* | Critical: Keeps agent address (`agent1q...`) constant |
| `BACKEND_API_KEY` | *(Generate a random secret)* | Protects the assistant API endpoint |
| `AGENT_ENDPOINT_URL` | `https://civicsignal-backend.onrender.com/submit` | Set after service URL is created |
| `CORS_ORIGINS` | `https://civic-community-wine.vercel.app,http://localhost:5173` | Allows Vercel frontend |
| `ASI_ONE_API_KEY` | *(Optional - from asi1.ai)* | LLM API key; domain fallback active if blank |
| `ASI_ONE_MODEL` | `asi1-mini` | Default model |

Click **Save Changes** and deploy. Once deployment completes, your public URL will be live (e.g. `https://civicsignal-backend.onrender.com`).

---

## 🤖 Connecting the Agent on Agentverse

Now that your agent is live on Render:

1. In Agentverse, navigate to **Launch an Agent** → **Connect Agent**.
2. Select **Chat Protocol**.
3. On the **Add your agent details** screen:
   - **Agent Name:** `civicsignal_coordinator`
   - **Agent Endpoint URL:** `https://<your-render-service-name>.onrender.com/submit`
4. Click **Next / Verify**.
   - Agentverse sends a `HEAD /submit` request to verify the server is live and returns `200 OK`.
   - Agentverse retrieves the agent's published `AgentChatProtocol:0.3.0` manifest.
5. Confirm the agent profile, avatar, and description.
6. Click **Finish / Launch**.

---

## ⚡ Alternative Mode: Agentverse Mailbox (No Public URL Needed)

If you do NOT want to host a public webhook endpoint:
1. In Agentverse, go to **My Agents** → create a **Mailbox Agent**.
2. Generate an **Agentverse Mailbox Key**.
3. In `backend/.env` (or Render):
   - Set `AGENT_MAILBOX=true`
   - Set `AGENTVERSE_KEY=<your-agentverse-key>`
   - Leave `AGENT_ENDPOINT_URL=` empty.
4. Run `python backend/run_agent.py` locally or as a background worker.
5. The agent will connect through Agentverse Mailbox polling automatically!

---

## 🔒 Frontend Security (Vercel Integration)

The frontend assistant drawer does not expose any shared backend secret keys in client-side JavaScript.

### How it works:
1. In production, frontend requests are sent to the same-origin serverless proxy: `/api/assistant/chat`.
2. The Vercel serverless function (`api/assistant/chat.js`) runs server-side on Vercel.
3. In your **Vercel Project Settings** → **Environment Variables**, add:
   - `BACKEND_URL`: `https://civicsignal-backend.onrender.com`
   - `BACKEND_API_KEY`: *(Matches the BACKEND_API_KEY set on Render)*
4. The serverless function attaches the `Authorization: Bearer <BACKEND_API_KEY>` header securely on the server side and forwards requests to Render.
5. Client-side browser inspection reveals zero private tokens or credentials.

---

## 🧪 Local Testing & Verification

Run all unit and integration tests locally:
```bash
python -m unittest discover -s backend/tests -v
```

All 10 test cases verify:
- Coordinator agent address initialization (`agent1q...`)
- Real Agent Chat Protocol message loop: `ChatMessage` → `ChatAcknowledgement` → `ChatMessage(TextContent)`
- Agentverse `/submit` readiness probe (`HEAD /submit` returns `200 OK`)
- Authorized token and authorized CORS origin enforcement
- Resilient domain knowledge response generation
