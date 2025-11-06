async function withAuthFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const hasWindow = typeof window !== 'undefined';
  const accessToken = hasWindow ? localStorage.getItem('accessToken') : null;
  const headers = new Headers(init?.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const first = await fetch(input, { ...init, headers });
  if (first.status !== 401) return first;

  // Try refresh once
  if (!hasWindow) return first;
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return first;
  const refreshRes = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!refreshRes.ok) return first;
  const { accessToken: newAccess } = await refreshRes.json();
  if (!newAccess) return first;
  localStorage.setItem('accessToken', newAccess);

  const retryHeaders = new Headers(init?.headers);
  retryHeaders.set('Authorization', `Bearer ${newAccess}`);
  return fetch(input, { ...init, headers: retryHeaders });
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await withAuthFetch(path, {});
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const res = await withAuthFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await withAuthFetch(path, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  try { return await res.json(); } catch { return {} as T; }
}

export async function apiPut<T = any>(path: string, body: any): Promise<T> {
  const res = await withAuthFetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}


