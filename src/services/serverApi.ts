/**
 * StackConnect Server API client — SQLite-backed persistence.
 * All calls require JWT auth (localStorage 'stackconnect_token').
 */

function getToken(): string | null {
  return localStorage.getItem('stackconnect_token');
}

async function authedFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('stackconnect_token');
    localStorage.removeItem('stackconnect_auth');
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export interface SavedAttempt {
  id: string;
  quizId: string;
  documentTitle: string;
  targetSkillId: string;
  scorePercent: number;
  passed: boolean;
  createdAt: string;
  topicScores: Record<string, { correct: number; total: number; scorePercent: number }>;
}

export interface SavedSkill {
  skill_id: string;
  level: number;
  last_assessed_at: string;
  assessed_via: string;
}

/** Save a quiz attempt + skill score atomically on the server. */
export async function saveAttempt(payload: {
  quizId: string;
  documentTitle: string;
  targetSkillId: string;
  questions: unknown[];
  answers: Record<string, number>;
  scorePercent: number;
  passed: boolean;
  topicScores: Record<string, unknown>;
  newSkillLevel: number;
}): Promise<{ ok: boolean }> {
  return authedFetch('/api/attempts', { method: 'POST', body: JSON.stringify(payload) });
}

/** Fetch the user's quiz history (most recent 50). */
export async function getAttempts(): Promise<SavedAttempt[]> {
  const data = await authedFetch('/api/attempts');
  return data.attempts || [];
}

/** Fetch the user's skill scores from the server DB. */
export async function getSkills(): Promise<SavedSkill[]> {
  const data = await authedFetch('/api/skills');
  return data.skills || [];
}

/** Update a skill level server-side (course completion, manual). */
export async function saveSkillLevel(skillId: string, level: number, assessedVia = 'manual'): Promise<{ ok: boolean }> {
  return authedFetch('/api/skills', { method: 'POST', body: JSON.stringify({ skillId, level, assessedVia }) });
}