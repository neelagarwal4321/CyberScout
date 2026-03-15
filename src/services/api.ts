// ── Token storage ─────────────────────────────────────────────────────────────
const ACCESS_KEY = 'cs_access_token';
const REFRESH_KEY = 'cs_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ── Base URL ──────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000/api';

// ── Token refresh (singleton promise to avoid concurrent refreshes) ────────────
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error('Refresh failed');
  }

  const json = (await res.json()) as { data: { accessToken: string; refreshToken: string } };
  setTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

// ── Main fetch wrapper ────────────────────────────────────────────────────────
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  _retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && _retry) {
    // Try to refresh once
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;
    return apiFetch<T>(path, options, false);
  }

  if (!res.ok) {
    let errorBody: { error?: { code?: string; message?: string } } = {};
    try {
      errorBody = (await res.json()) as typeof errorBody;
    } catch {
      // ignore
    }
    const msg = errorBody.error?.message ?? `HTTP ${res.status}`;
    throw Object.assign(new Error(msg), { code: errorBody.error?.code, status: res.status });
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
