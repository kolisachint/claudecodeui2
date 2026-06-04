import { useCallback } from 'react';

import { authenticatedFetch } from '../../../utils/api';
import { loadSessionResource, useSessionResource } from '../utils/sessionResourceCache';

const MODELS_CACHE_KEY = 'hoocode:models';

export type HoocodeModelOption = {
  value: string;
  label: string;
  provider: string;
  thinking: boolean;
  images: boolean;
  context: string | null;
};

type HoocodeModelsResponse = {
  success: boolean;
  data?: {
    installed: boolean;
    models: Array<{
      provider: string;
      model: string;
      id: string;
      context: string | null;
      maxOutput: string | null;
      thinking: boolean;
      images: boolean;
    }>;
    fetchedAt: string | null;
    cached: boolean;
  };
  error?: { message?: string };
};

type HoocodeModelsData = {
  installed: boolean;
  models: HoocodeModelOption[];
};

type UseHoocodeModelsResult = {
  models: HoocodeModelOption[];
  loading: boolean;
  error: string | null;
  installed: boolean;
  refresh: () => Promise<void>;
};

const toOption = (m: NonNullable<HoocodeModelsResponse['data']>['models'][number]): HoocodeModelOption => ({
  value: m.id,
  label: `${m.model} · ${m.provider}`,
  provider: m.provider,
  thinking: m.thinking,
  images: m.images,
  context: m.context,
});

async function fetchHoocodeModels(force: boolean): Promise<HoocodeModelsData> {
  const response = await authenticatedFetch(`/api/providers/pi/models${force ? '?force=true' : ''}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const payload = (await response.json()) as HoocodeModelsResponse;
  const data = payload.data;
  if (!payload.success || !data) {
    throw new Error(payload.error?.message || 'Failed to load Hoocode models');
  }
  return { installed: data.installed, models: data.models.map(toOption) };
}

/**
 * Live Hoocode model catalog (`pi --list-models`), cached for the whole session
 * and shared across every consumer (composer picker, provider dialog, …) so the
 * CLI is only invoked once per session unless explicitly refreshed.
 */
export function useHoocodeModels({ enabled = true }: { enabled?: boolean } = {}): UseHoocodeModelsResult {
  const { data, loading, error } = useSessionResource<HoocodeModelsData>(
    MODELS_CACHE_KEY,
    () => fetchHoocodeModels(false),
    { enabled },
  );

  const refresh = useCallback(async () => {
    await loadSessionResource(MODELS_CACHE_KEY, () => fetchHoocodeModels(true), { force: true }).catch(() => {
      // Error surfaced via the cache entry / `error`.
    });
  }, []);

  return {
    models: data?.models ?? [],
    loading,
    error,
    installed: data?.installed ?? true,
    refresh,
  };
}
