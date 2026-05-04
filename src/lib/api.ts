/**
 * Normalise l'URL d'API fournie par environnement.
 * Accepte `https://api.exemple.com` et `https://api.exemple.com/api`.
 */
function normalizeApiBase(raw: string | undefined): string {
  const trimmed = (raw ?? '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.replace(/\/api$/i, '');
}

/**
 * URL de base de l’API depuis `VITE_API_URL` au build.
 * - Si vide en prod : requêtes relatives `/api/...` (proxy Netlify requis).
 */
function apiBase(): string {
  return normalizeApiBase(import.meta.env.VITE_API_URL);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase()}${p}`;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };
  const res = await fetch(buildUrl(path), { ...init, headers });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      if (res.ok && /^\s*</.test(text)) {
        throw new ApiError(
          502,
          'Réponse HTML au lieu de JSON (souvent /api non proxifié). Définissez VITE_API_URL au build Netlify et redéployez, ou vérifiez dist/_redirects.'
        );
      }
      data = null;
    }
  }
  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: unknown }).error)
        : text || res.statusText;
    throw new ApiError(res.status, msg);
  }
  return data as T;
}
