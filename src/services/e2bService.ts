/**
 * StackConnect E2B Service — Server-Side Proxy
 *
 * Code execution goes through /api/e2b/execute (Express server).
 * The server holds the E2B API key (or runs a local sandbox) — never exposed to the browser.
 */

export interface LabRunResult {
  stdout: string;
  stderr: string;
  error: string;
  plots: string[];
  text: string | null;
}

export interface E2BResult {
  output: string;
  error: string;
}

function getToken(): string | null {
  return localStorage.getItem('stackconnect_token');
}

function clearAuth() {
  localStorage.removeItem('stackconnect_auth');
  localStorage.removeItem('stackconnect_token');
}

/** Low-level server call — shared by all public functions. */
async function serverRun(code: string): Promise<{ output: string; error: string }> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated. Please log in.');

  const response = await fetch('/api/e2b/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error('Session expired. Please log in again.');
  }

  const body = await response.json().catch(() => ({ error: 'Server error' }));
  if (!response.ok) {
    throw new Error(body.error || `Code execution failed (HTTP ${response.status})`);
  }

  return { output: body.output || '', error: body.error || '' };
}

/**
 * Run Python in the sandbox — returns LabRunResult (compatible with VirtualLab).
 */
export async function runPython(code: string): Promise<LabRunResult> {
  const { output, error } = await serverRun(code);
  return {
    stdout: output,
    stderr: '',
    error,
    plots: [],
    text: output,
  };
}

export function isE2BConfigured(): boolean {
  return true; // Server decides whether E2B/local sandbox is available
}

export function closeSandbox(): void {
  // Stateless — sandbox lifecycle is managed server-side per request
}

export async function executeCode(code: string): Promise<E2BResult> {
  return serverRun(code);
}
