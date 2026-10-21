/**
 * CivicSignal Assistant Service
 * Connects the frontend AI assistant drawer to the Python FastAPI backend
 * and Fetch.ai CivicSignal Coordinator Agent.
 *
 * Security Note:
 * All backend API keys and agent credentials remain strictly server-side.
 * In production on Vercel, requests route through the secure server-side proxy
 * at `/api/assistant/chat`. In local development, requests connect to the local
 * backend server at `http://localhost:8000/api/assistant/chat`.
 */

export interface AssistantChatResponse {
  reply: string;
  agent_name?: string;
  agent_address?: string;
  protocol?: string;
  msg_id?: string;
  timestamp?: string;
}

function resolveAssistantApiUrl(): string {
  // If explicitly configured via Vite env, prioritize it
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
  if (metaEnv?.VITE_BACKEND_URL) {
    return `${metaEnv.VITE_BACKEND_URL.replace(/\/$/, '')}/api/assistant/chat`;
  }

  // If running in browser locally on Vite dev server (e.g. port 5173), direct to local Python backend
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000/api/assistant/chat';
  }

  // Production on Vercel: use relative URL routed through the secure server-side proxy
  return '/api/assistant/chat';
}

export async function sendAssistantMessage(
  message: string,
  locality?: string,
  sessionId?: string
): Promise<string> {
  const endpoint = resolveAssistantApiUrl();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        locality: locality || 'Knowledge Park III',
        session_id: sessionId,
      }),
    });

    if (response.ok) {
      const data: AssistantChatResponse = await response.json();
      return data.reply;
    }
  } catch {
    // If backend server is currently offline or sleeping, use resilient local domain fallback
  }

  // Graceful client fallback preserving zero downtime
  const lower = message.toLowerCase();
  if (lower.includes('50') || lower.includes('threshold') || lower.includes('room')) {
    return 'When 50 unique eligible neighbors independently report, corroborate ("I Saw It"), or add evidence to an incident, CivicSignal automatically unlocks a dedicated Incident Room. This consolidates all signals and assigns the original reporter as the community leader.';
  } else if (lower.includes('streetlight') || lower.includes('light')) {
    return 'For streetlights: 1. Take a wide-angle photo showing the pole and street context. 2. Capture the pole number or landmark. 3. Tag whether it has been dark for multiple nights. CivicSignal geotags your coordinates automatically.';
  } else if (lower.includes('electrical') || lower.includes('hazard') || lower.includes('wire')) {
    return 'SAFETY FIRST: Never approach hanging wires, sparking transformers, or waterlogged electrical poles. Photograph from at least 10 meters away. Our system flags these as "Urgent Safety Concerns" for immediate escalation.';
  } else if (lower.includes('petition') || lower.includes('signature') || lower.includes('leader')) {
    return 'Once an Incident Room reaches 100 members, a collective Signature Campaign begins. Members sign securely, and the Community Leader must give explicit approval before the formal complaint document is submitted to municipal authorities.';
  } else {
    return `Thank you for asking. Based on active reports in ${locality || 'your locality'}, you can submit geotagged evidence directly via the "Create Report" button. Would you like me to open the reporting wizard for you?`;
  }
}
