const CACHE_PREFIX = 'gw-live-page:';
const API_CACHE_PREFIX = 'gw-api-cache:';
const API_CACHE_TTL_MS = 15 * 60 * 1000;

function cacheScope(): string {
  try {
    const user = JSON.parse(sessionStorage.getItem('gw_user') || localStorage.getItem('gw_user') || 'null');
    const userId = user?.id || user?._id;
    if (userId) return String(userId);
    const token = localStorage.getItem('gw_auth_token') || '';
    let fingerprint = 2166136261;
    for (let index = 0; index < token.length; index += 1) fingerprint = Math.imul(fingerprint ^ token.charCodeAt(index), 16777619);
    return token ? `token-${(fingerprint >>> 0).toString(36)}` : 'signed-out';
  } catch {
    return 'session';
  }
}

export type ApiCacheEntry<T> = { value: T; checkedAt: number };

export function readApiCache<T>(key: string): ApiCacheEntry<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${API_CACHE_PREFIX}${cacheScope()}:${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as ApiCacheEntry<T>;
    if (!Number.isFinite(entry.checkedAt) || Date.now() - entry.checkedAt > API_CACHE_TTL_MS) {
      sessionStorage.removeItem(`${API_CACHE_PREFIX}${cacheScope()}:${key}`);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

export function writeApiCache<T>(key: string, value: T, checkedAt = Date.now()): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${API_CACHE_PREFIX}${cacheScope()}:${key}`, JSON.stringify({ value, checkedAt }));
  } catch {
    // Storage can be disabled or full; live API requests remain the source of truth.
  }
}

export function clearApiCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const prefix = `${API_CACHE_PREFIX}${cacheScope()}:`;
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(prefix)) sessionStorage.removeItem(key);
    }
  } catch {
    // Cache invalidation is best effort; every view still revalidates against the API.
  }
}

export function readPageCache<T>(page: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${cacheScope()}:${page}`);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}

export function writePageCache<T>(page: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${cacheScope()}:${page}`, JSON.stringify(value));
  } catch {
    // Storage can be disabled or full; live API requests remain the source of truth.
  }
}
