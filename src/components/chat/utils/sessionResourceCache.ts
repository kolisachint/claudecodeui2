import { useCallback, useEffect, useReducer, useRef } from 'react';

/**
 * Session-scoped resource cache.
 *
 * A tiny module-level store that lets several components share a single live
 * fetch for the lifetime of the page session. Unlike per-hook state, entries
 * survive unmounts and are keyed by a stable string, so:
 *   - the same catalog isn't re-fetched every time a component remounts, and
 *   - multiple consumers of the same key share one in-flight request.
 *
 * This is the client mirror of the server-side TTL caches (e.g. the
 * `pi --list-models` cache) and exists to "fetch live once, reuse all session".
 */

type CacheEntry<T> = {
  data: T | null;
  error: string | null;
  fetchedAt: number;
  promise: Promise<T> | null;
};

const store = new Map<string, CacheEntry<unknown>>();
const subscribers = new Map<string, Set<() => void>>();

function getEntry<T>(key: string): CacheEntry<T> | undefined {
  return store.get(key) as CacheEntry<T> | undefined;
}

function notify(key: string): void {
  const subs = subscribers.get(key);
  if (!subs) return;
  for (const listener of subs) {
    listener();
  }
}

function subscribe(key: string, listener: () => void): () => void {
  let subs = subscribers.get(key);
  if (!subs) {
    subs = new Set();
    subscribers.set(key, subs);
  }
  subs.add(listener);
  return () => {
    subs?.delete(listener);
  };
}

/**
 * Load a resource through the session cache. Returns the cached value when it's
 * still fresh, joins an in-flight request when one exists, or starts a new
 * fetch otherwise. `ttlMs` defaults to the whole session (no expiry).
 */
export function loadSessionResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  { ttlMs = Infinity, force = false }: { ttlMs?: number; force?: boolean } = {},
): Promise<T> {
  const existing = getEntry<T>(key);
  const now = Date.now();

  if (!force && existing) {
    if (existing.promise) {
      return existing.promise;
    }
    if (existing.data !== null && now - existing.fetchedAt < ttlMs) {
      return Promise.resolve(existing.data);
    }
  }

  const promise = fetcher().then(
    (data) => {
      store.set(key, { data, error: null, fetchedAt: Date.now(), promise: null });
      notify(key);
      return data;
    },
    (caughtError: unknown) => {
      const message = caughtError instanceof Error ? caughtError.message : 'Failed to load resource';
      const previous = getEntry<T>(key);
      store.set(key, {
        data: previous?.data ?? null,
        error: message,
        fetchedAt: previous?.fetchedAt ?? 0,
        promise: null,
      });
      notify(key);
      throw caughtError;
    },
  );

  store.set(key, {
    data: existing?.data ?? null,
    error: null,
    fetchedAt: existing?.fetchedAt ?? 0,
    promise,
  });
  notify(key);
  return promise;
}

/** Drop a cached entry so the next read re-fetches. */
export function invalidateSessionResource(key: string): void {
  store.delete(key);
  notify(key);
}

type UseSessionResourceOptions = {
  enabled?: boolean;
  ttlMs?: number;
};

type UseSessionResourceResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

/**
 * React binding for the session cache. Subscribes to a key, triggers a load
 * when enabled, and re-renders whenever that key's entry changes (including
 * when another component populates it).
 */
export function useSessionResource<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  { enabled = true, ttlMs = Infinity }: UseSessionResourceOptions = {},
): UseSessionResourceResult<T> {
  const [, forceRender] = useReducer((count: number) => count + 1, 0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!key) return undefined;
    return subscribe(key, forceRender);
  }, [key]);

  useEffect(() => {
    if (!key || !enabled) return;
    void loadSessionResource(key, () => fetcherRef.current(), { ttlMs }).catch(() => {
      // Error is captured on the cache entry and surfaced via `error`.
    });
  }, [key, enabled, ttlMs]);

  const refresh = useCallback(async () => {
    if (!key) return;
    await loadSessionResource(key, () => fetcherRef.current(), { ttlMs, force: true }).catch(() => {
      // Error is captured on the cache entry and surfaced via `error`.
    });
  }, [key, ttlMs]);

  const entry = key ? getEntry<T>(key) : undefined;
  return {
    data: entry?.data ?? null,
    loading: Boolean(entry?.promise),
    error: entry?.error ?? null,
    refresh,
  };
}
