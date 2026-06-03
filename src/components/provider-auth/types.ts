import {
  ALL_PROVIDER_IDS,
  PROVIDER_DESCRIPTORS,
  VISIBLE_PROVIDER_IDS,
} from '../../providers/provider-registry';
import type { LLMProvider } from '../../types/app';

export type ProviderAuthStatus = {
  authenticated: boolean;
  email: string | null;
  method: string | null;
  error: string | null;
  loading: boolean;
};

export type ProviderAuthStatusMap = Record<LLMProvider, ProviderAuthStatus>;

/**
 * All providers, including retired ("hidden") ones. Used for background auth
 * sync so existing sessions of retired providers still report status.
 */
export const CLI_PROVIDERS: LLMProvider[] = ALL_PROVIDER_IDS;

/** Providers offered for new sessions — use this for auth UI surfaces. */
export const VISIBLE_CLI_PROVIDERS: LLMProvider[] = VISIBLE_PROVIDER_IDS;

export const PROVIDER_AUTH_STATUS_ENDPOINTS: Record<LLMProvider, string> = Object.fromEntries(
  PROVIDER_DESCRIPTORS.map((descriptor) => [descriptor.id, descriptor.authStatusEndpoint]),
) as Record<LLMProvider, string>;

export const createInitialProviderAuthStatusMap = (loading = true): ProviderAuthStatusMap =>
  Object.fromEntries(
    CLI_PROVIDERS.map((id) => [
      id,
      { authenticated: false, email: null, method: null, error: null, loading },
    ]),
  ) as ProviderAuthStatusMap;
