import { ClaudeProvider } from '@/modules/providers/list/claude/claude.provider.js';
import { CodexProvider } from '@/modules/providers/list/codex/codex.provider.js';
import { CursorProvider } from '@/modules/providers/list/cursor/cursor.provider.js';
import { GeminiProvider } from '@/modules/providers/list/gemini/gemini.provider.js';
import { OpenCodeProvider } from '@/modules/providers/list/opencode/opencode.provider.js';
import { HoocodeProvider } from '@/modules/providers/list/hoocode/hoocode.provider.js';
import type { IProvider } from '@/shared/interfaces.js';
import type { LLMProvider, ProviderTier } from '@/shared/types.js';
import { AppError } from '@/shared/utils.js';

// The supported provider set, display order and tier live in one shared config
// (imported by both server and frontend). The registry only owns the concrete
// implementations; the *list* and tiering are driven from that config.
import {
  PROVIDERS,
  getProviderTier,
  isProviderVisible,
} from '../../../shared/modelConstants.js';

/**
 * Concrete implementation for each supported provider id.
 *
 * This map must stay in sync with the `PROVIDERS` config in
 * `shared/modelConstants.js`; the drift guard below fails fast at startup if a
 * configured provider has no implementation here (or vice versa).
 */
const providerFactories: Record<LLMProvider, () => IProvider> = {
  claude: () => new ClaudeProvider(),
  codex: () => new CodexProvider(),
  cursor: () => new CursorProvider(),
  gemini: () => new GeminiProvider(),
  hoocode: () => new HoocodeProvider(),
  opencode: () => new OpenCodeProvider(),
};

// Instantiate in the order declared by the shared config so listings reflect
// the configured display order, and validate there is no drift in either
// direction between the config and the available implementations.
const providers = new Map<LLMProvider, IProvider>();
for (const { id } of PROVIDERS) {
  const factory = providerFactories[id as LLMProvider];
  if (!factory) {
    throw new Error(
      `Provider "${id}" is listed in shared/modelConstants.js PROVIDERS but has no implementation in the provider registry.`,
    );
  }
  providers.set(id as LLMProvider, factory());
}
for (const id of Object.keys(providerFactories) as LLMProvider[]) {
  if (!providers.has(id)) {
    throw new Error(
      `Provider "${id}" has a registry implementation but is missing from shared/modelConstants.js PROVIDERS.`,
    );
  }
}

/**
 * Central registry for resolving concrete provider implementations by id.
 *
 * Tiering/visibility is read from the shared config so retiring or promoting a
 * provider is a one-line change there rather than edits across the registry.
 */
export const providerRegistry = {
  /**
   * All providers, including retired ("hidden") ones.
   *
   * Session synchronization, auth checks and history loading use this so that
   * existing sessions for a retired provider keep working — retiring only
   * removes a provider from *new* session selection, never its history.
   */
  listProviders(): IProvider[] {
    return [...providers.values()];
  },

  /**
   * Providers offered for NEW sessions (tier !== 'hidden'), in display order.
   * Selection/picker surfaces should use this rather than the full list.
   */
  listVisibleProviders(): IProvider[] {
    return [...providers.values()].filter((provider) => isProviderVisible(provider.id));
  },

  /**
   * Providers in a specific tier, in display order.
   */
  listProvidersByTier(tier: ProviderTier): IProvider[] {
    return [...providers.values()].filter((provider) => getProviderTier(provider.id) === tier);
  },

  /**
   * Resolve the configured tier for a provider id (unknown ids resolve to
   * 'hidden').
   */
  getTier(provider: string): ProviderTier {
    return getProviderTier(provider) as ProviderTier;
  },

  /**
   * Whether a provider is offered for new sessions (not retired).
   */
  isVisible(provider: string): boolean {
    return isProviderVisible(provider);
  },

  resolveProvider(provider: string): IProvider {
    const key = provider as LLMProvider;
    const resolvedProvider = providers.get(key);
    if (!resolvedProvider) {
      throw new AppError(`Unsupported provider "${provider}".`, {
        code: 'UNSUPPORTED_PROVIDER',
        statusCode: 400,
      });
    }

    return resolvedProvider;
  },
};
