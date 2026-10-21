/**
 * Vercel Serverless Function: Secure Server-Side Proxy for CivicSignal Assistant
 * Keeps the backend credentials and private tokens strictly server-side.
 * Never exposes secrets to the browser bundle.
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Server-side environment variables on Vercel (not exposed via VITE_)
  const backendUrl = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');
  const backendApiKey = process.env.BACKEND_API_KEY || '';

  const headers = {
    'Content-Type': 'application/json',
  };

  // Securely inject server-side credentials
  if (backendApiKey) {
    headers['Authorization'] = `Bearer ${backendApiKey}`;
    headers['X-API-Key'] = backendApiKey;
  }

  try {
    const response = await fetch(`${backendUrl}/api/assistant/chat`, {
      method: 'POST',
      headers,
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding to CivicSignal Coordinator Agent backend:', error);
    return res.status(502).json({
      error: 'Failed to communicate with CivicSignal Coordinator Agent backend',
      details: error.message,
    });
  }
}
