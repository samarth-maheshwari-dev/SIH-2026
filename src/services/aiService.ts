/**
 * StackConnect AI Service — Secure Server-Side Proxy
 *
 * All AI calls go through /api/ai/chat (Express server).
 * The server handles OmniRoute + Ollama fallback server-side.
 * NO API keys are exposed to the browser bundle.
 */

export interface AIProviderInfo {
  name: 'omniroute' | 'ollama' | 'none';
  label: string;
  online: boolean;
  model: string | null;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Get stored JWT token */
function getToken(): string | null {
  return localStorage.getItem('stackconnect_token');
}

/** Clear auth on 401 */
function clearAuth() {
  localStorage.removeItem('stackconnect_auth');
  localStorage.removeItem('stackconnect_token');
}

/**
 * Main AI chat entry point — calls server proxy.
 * Server handles OmniRoute → Ollama failover.
 */
export async function aiChat(
  messages: ChatMessage[],
  _onToken?: (delta: string) => void
): Promise<{ text: string; provider: 'omniroute' | 'ollama' }> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated. Please log in.');

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages,
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Server error' }));
    throw new Error(body.error || `AI request failed (HTTP ${response.status})`);
  }

  const data = await response.json();
  return {
    text: data.content || '',
    provider: data.provider || 'omniroute',
  };
}

/**
 * Check backend health — used for the AI status badge.
 */
export async function getAIStatus(): Promise<AIProviderInfo[]> {
  const token = getToken();

  if (!token) {
    return [
      { name: 'omniroute', label: 'OmniRoute Gateway', online: false, model: null },
      { name: 'ollama', label: 'Ollama (Local)', online: false, model: null },
    ];
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('/api/auth/me', {
      signal: controller.signal,
      headers: { 'Authorization': `Bearer ${token}` },
    });
    clearTimeout(timer);

    const backendOnline = res.ok;
    return [
      { name: 'omniroute', label: 'OmniRoute Gateway', online: backendOnline, model: backendOnline ? 'auto/best-coding' : null },
      { name: 'ollama', label: 'Ollama (Local)', online: backendOnline, model: backendOnline ? 'gemma4:latest' : null },
    ];
  } catch {
    return [
      { name: 'omniroute', label: 'OmniRoute Gateway', online: false, model: null },
      { name: 'ollama', label: 'Ollama (Local)', online: false, model: null },
    ];
  }
}

export function getLastUsedProvider(): 'omniroute' | 'ollama' | 'none' {
  return 'none'; // Provider info comes from server response
}

export const AI_CONFIG = {
  omniRouteModel: 'auto/best-coding (server-side)',
  ollamaModel: 'gemma4:latest (server-side)',
};
