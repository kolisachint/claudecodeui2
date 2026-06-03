import type { ComponentType } from 'react';

import ClaudeLogo from '../components/llm-logo-provider/ClaudeLogo';
import CodexLogo from '../components/llm-logo-provider/CodexLogo';
import CopilotLogo from '../components/llm-logo-provider/CopilotLogo';
import CursorLogo from '../components/llm-logo-provider/CursorLogo';
import GeminiLogo from '../components/llm-logo-provider/GeminiLogo';
import HoocodeLogo from '../components/llm-logo-provider/HoocodeLogo';
import OpenCodeLogo from '../components/llm-logo-provider/OpenCodeLogo';
import type { LLMProvider } from '../types/app';
import { PROVIDERS } from '../../shared/modelConstants';

/**
 * Frontend provider registry — the single place that describes how each CLI
 * provider is presented in the UI.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * ADDING A NEW CLI:
 *   1. Add its runtime entry (id, vendor name, models, tier) to
 *      `shared/modelConstants.js` → PROVIDERS.
 *   2. Add a logo component under `src/components/llm-logo-provider/` and one
 *      entry to `PROVIDER_UI_META` below.
 *   3. Add the backend implementation (an `IProvider`) and register it in
 *      `server/modules/providers/provider.registry.ts`.
 * That's it — pickers, logos, auth status and settings all derive from here,
 * so there are no scattered hardcoded provider arrays to update.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Tier (`first` | `second` | `hidden`) is read from the shared PROVIDERS config
 * so promoting/retiring a provider is a one-line change there. Retired
 * ("hidden") providers are dropped from selection surfaces but remain fully
 * functional for existing sessions (history/auth/sync are driven off the full
 * list on the server).
 */

export type ProviderTier = 'first' | 'second' | 'hidden';

type LogoComponent = ComponentType<{ className?: string }>;

export interface ProviderDescriptor {
  id: LLMProvider;
  /** Full CLI product name, e.g. "Claude Code". */
  displayName: string;
  /** Short label used in compact UI, e.g. "Claude". */
  label: string;
  /** Vendor/maker, e.g. "Anthropic". */
  vendor: string;
  /** Decorative glyph used by the CLI picker cards. */
  glyph: string;
  /** One-line description for the picker. */
  description: string;
  tier: ProviderTier;
  Logo: LogoComponent;
  /** Backend auth-status endpoint for this provider. */
  authStatusEndpoint: string;
}

/**
 * UI-only presentation metadata that cannot live in the shared JS config
 * (React logo components, copy, glyphs). Keyed by provider id.
 */
const PROVIDER_UI_META: Record<
  LLMProvider,
  { displayName: string; label: string; vendor: string; glyph: string; description: string; Logo: LogoComponent }
> = {
  hoocode: {
    displayName: 'HooCode',
    label: 'HooCode',
    vendor: 'HooCowork',
    glyph: '▽',
    description: "HooCowork's own coding agent.",
    Logo: HoocodeLogo,
  },
  claude: {
    displayName: 'Claude Code',
    label: 'Claude',
    vendor: 'Anthropic',
    glyph: '◆',
    description: "Anthropic's official CLI for coding agents.",
    Logo: ClaudeLogo,
  },
  githubcopilot: {
    displayName: 'GitHub Copilot',
    label: 'Copilot',
    vendor: 'GitHub',
    glyph: '⌘',
    description: "GitHub's Copilot coding agent in your terminal.",
    Logo: CopilotLogo,
  },
  codex: {
    displayName: 'Codex',
    label: 'Codex',
    vendor: 'OpenAI',
    glyph: '○',
    description: "OpenAI's Codex CLI.",
    Logo: CodexLogo,
  },
  gemini: {
    displayName: 'Gemini CLI',
    label: 'Gemini',
    vendor: 'Google',
    glyph: '△',
    description: "Google's Gemini command-line interface.",
    Logo: GeminiLogo,
  },
  cursor: {
    displayName: 'Cursor CLI',
    label: 'Cursor',
    vendor: 'Cursor',
    glyph: '◇',
    description: "Cursor's command-line interface.",
    Logo: CursorLogo,
  },
  opencode: {
    displayName: 'OpenCode',
    label: 'OpenCode',
    vendor: 'OpenCode',
    glyph: '□',
    description: "OpenCode's command-line coding agent.",
    Logo: OpenCodeLogo,
  },
};

/**
 * All provider descriptors, in the display order defined by the shared config.
 * Built by joining the runtime config (id/order/tier) with the UI metadata.
 */
export const PROVIDER_DESCRIPTORS: ProviderDescriptor[] = PROVIDERS.map((cfg) => {
  const id = cfg.id as LLMProvider;
  const meta = PROVIDER_UI_META[id];
  return {
    id,
    tier: (cfg.tier ?? 'hidden') as ProviderTier,
    displayName: meta.displayName,
    label: meta.label,
    vendor: meta.vendor,
    glyph: meta.glyph,
    description: meta.description,
    Logo: meta.Logo,
    authStatusEndpoint: `/api/providers/${id}/auth/status`,
  };
});

const DESCRIPTOR_BY_ID = new Map<LLMProvider, ProviderDescriptor>(
  PROVIDER_DESCRIPTORS.map((descriptor) => [descriptor.id, descriptor]),
);

/** Every provider id, including retired ones (use for auth/history sync). */
export const ALL_PROVIDER_IDS: LLMProvider[] = PROVIDER_DESCRIPTORS.map((d) => d.id);

/** Descriptors offered for NEW sessions (tier !== 'hidden'), in display order. */
export const VISIBLE_PROVIDERS: ProviderDescriptor[] = PROVIDER_DESCRIPTORS.filter(
  (d) => d.tier !== 'hidden',
);

/** Provider ids offered for new sessions. */
export const VISIBLE_PROVIDER_IDS: LLMProvider[] = VISIBLE_PROVIDERS.map((d) => d.id);

/** The default provider to preselect — the first visible (first-class) one. */
export const DEFAULT_PROVIDER: LLMProvider = VISIBLE_PROVIDER_IDS[0] ?? 'claude';

export function getProviderDescriptor(id: string | null | undefined): ProviderDescriptor | undefined {
  if (!id) return undefined;
  return DESCRIPTOR_BY_ID.get(id as LLMProvider);
}

/** Resolve a provider's logo component, falling back to the Claude mark. */
export function getProviderLogo(id: string | null | undefined): LogoComponent {
  return getProviderDescriptor(id)?.Logo ?? ClaudeLogo;
}

/** Whether a provider is offered for new sessions (not retired). */
export function isProviderVisible(id: string | null | undefined): boolean {
  const descriptor = getProviderDescriptor(id);
  return descriptor ? descriptor.tier !== 'hidden' : false;
}
