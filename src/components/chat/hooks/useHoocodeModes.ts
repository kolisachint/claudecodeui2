import { authenticatedFetch } from '../../../utils/api';
import { useSessionResource } from '../utils/sessionResourceCache';

const MODES_CACHE_KEY = 'hoocode:modes';

export type HoocodeMode = {
  name: string;
  description: string | null;
};

type HoocodeModesResponse = {
  success: boolean;
  data?: {
    installed: boolean;
    modes: HoocodeMode[];
  };
  error?: { message?: string };
};

type HoocodeModesData = {
  installed: boolean;
  modes: HoocodeMode[];
};

type UseHoocodeModesResult = {
  modes: HoocodeMode[];
  loading: boolean;
  error: string | null;
  installed: boolean;
  refresh: () => Promise<void>;
};

async function fetchHoocodeModes(): Promise<HoocodeModesData> {
  const response = await authenticatedFetch('/api/providers/hoocode/modes');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const payload = (await response.json()) as HoocodeModesResponse;
  const data = payload.data;
  if (!payload.success || !data) {
    throw new Error(payload.error?.message || 'Failed to load Hoocode modes');
  }
  return { installed: data.installed, modes: data.modes };
}

/**
 * Live Hoocode mode catalog (`~/.hoocode/modes/*`), cached for the whole session
 * and shared across consumers so it isn't re-read on every chat remount.
 */
export function useHoocodeModes({ enabled = true }: { enabled?: boolean } = {}): UseHoocodeModesResult {
  const { data, loading, error, refresh } = useSessionResource<HoocodeModesData>(
    MODES_CACHE_KEY,
    fetchHoocodeModes,
    { enabled },
  );

  return {
    modes: data?.modes ?? [],
    loading,
    error,
    installed: data?.installed ?? true,
    refresh,
  };
}
