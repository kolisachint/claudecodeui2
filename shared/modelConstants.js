/**
 * Centralized Model Definitions
 * Single source of truth for all supported AI models
 */

/**
 * Claude (Anthropic) Models
 *
 * Note: Claude uses two different formats:
 * - SDK format ('sonnet', 'opus') - used by the UI and claude-sdk.js
 * - API format ('claude-sonnet-4.5') - used by slash commands for display
 */
export const CLAUDE_MODELS = {
  // Models in SDK format (what the actual SDK accepts)
  OPTIONS: [
    { value: "opus", label: "Opus" },
    { value: "sonnet", label: "Sonnet" },
    { value: "haiku", label: "Haiku" },
    { value: "claude-opus-4-6", label: "Opus 4.6" },
    { value: "opusplan", label: "Opus Plan" },
    { value: "sonnet[1m]", label: "Sonnet [1M]" },
    { value: "opus[1m]", label: "Opus [1M]" },
  ],

  DEFAULT: "opus",
};

/**
 * Cursor Models
 */
export const CURSOR_MODELS = {
  OPTIONS: [
    { value: "opus-4.6-thinking", label: "Claude 4.6 Opus (Thinking)" },
    { value: "gpt-5.3-codex", label: "GPT-5.3" },
    { value: "gpt-5.2-high", label: "GPT-5.2 High" },
    { value: "gemini-3-pro", label: "Gemini 3 Pro" },
    { value: "opus-4.5-thinking", label: "Claude 4.5 Opus (Thinking)" },
    { value: "gpt-5.2", label: "GPT-5.2" },
    { value: "gpt-5.1", label: "GPT-5.1" },
    { value: "gpt-5.1-high", label: "GPT-5.1 High" },
    { value: "composer-1", label: "Composer 1" },
    { value: "auto", label: "Auto" },
    { value: "sonnet-4.5", label: "Claude 4.5 Sonnet" },
    { value: "sonnet-4.5-thinking", label: "Claude 4.5 Sonnet (Thinking)" },
    { value: "opus-4.5", label: "Claude 4.5 Opus" },
    { value: "gpt-5.1-codex", label: "GPT-5.1 Codex" },
    { value: "gpt-5.1-codex-high", label: "GPT-5.1 Codex High" },
    { value: "gpt-5.1-codex-max", label: "GPT-5.1 Codex Max" },
    { value: "gpt-5.1-codex-max-high", label: "GPT-5.1 Codex Max High" },
    { value: "opus-4.1", label: "Claude 4.1 Opus" },
    { value: "grok", label: "Grok" },
  ],

  DEFAULT: "gpt-5.3-codex",
};

/**
 * Codex (OpenAI) Models
 */
export const CODEX_MODELS = {
  OPTIONS: [
    { value: "gpt-5.5", label: "GPT-5.5" },
    { value: "gpt-5.4", label: "GPT-5.4" },
    { value: "gpt-5.4-mini", label: "GPT-5.4 mini" },
    { value: "gpt-5.3-codex", label: "GPT-5.3 Codex" },
    { value: "gpt-5.2-codex", label: "GPT-5.2 Codex" },
    { value: "gpt-5.2", label: "GPT-5.2" },
    { value: "gpt-5.1-codex-max", label: "GPT-5.1 Codex Max" },
    { value: "o3", label: "O3" },
    { value: "o4-mini", label: "O4-mini" },
  ],

  DEFAULT: "gpt-5.4",
};

/**
 * Gemini Models
 */
export const GEMINI_MODELS = {
  OPTIONS: [
    { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview" },
    { value: "gemini-3-pro-preview", label: "Gemini 3 Pro Preview" },
    { value: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.0-pro-exp", label: "Gemini 2.0 Pro Experimental" },
    {
      value: "gemini-2.0-flash-thinking-exp",
      label: "Gemini 2.0 Flash Thinking",
    },
  ],

  DEFAULT: "gemini-3.1-pro-preview",
};

/**
 * Hoocode Models
 *
 * Identifiers must match patterns from `hoocode --list-models` since the server
 * passes the value straight through as `hoocode --model <value>`. The special
 * sentinel "auto" is handled server-side (server/hoocode-cli.js) by omitting
 * --model so the Hoocode CLI's own default is used.
 */
export const HOOCODE_MODELS = {
  OPTIONS: [
    { value: "auto", label: "Auto (Hoocode default)" },
    { value: "opencode/claude-opus-4-7", label: "Claude Opus 4.7" },
    { value: "opencode/claude-opus-4-6", label: "Claude Opus 4.6" },
    { value: "opencode/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
    { value: "opencode/claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
    { value: "opencode/claude-haiku-4-5", label: "Claude Haiku 4.5" },
    { value: "openai-codex/gpt-5.5", label: "GPT-5.5" },
    { value: "openai-codex/gpt-5.4", label: "GPT-5.4" },
    { value: "openai-codex/gpt-5.4-mini", label: "GPT-5.4 mini" },
    { value: "openai-codex/gpt-5.3-codex", label: "GPT-5.3 Codex" },
    { value: "opencode/gemini-3.1-pro", label: "Gemini 3.1 Pro" },
    { value: "opencode/gemini-3-flash", label: "Gemini 3 Flash" },
  ],

  DEFAULT: "auto",
};

/**
 * OpenCode Models
 *
 * Identifiers use OpenCode's `provider/model` format (matches
 * `opencode models` output) and pass through to `opencode run --model <value>`.
 * The "auto" sentinel is handled server-side (server/opencode-cli.js) by
 * omitting --model so OpenCode uses the model configured in
 * `~/.config/opencode/opencode.json`.
 *
 * This static list is a curated fallback. The full catalog is loaded
 * dynamically from `opencode models` via /api/providers/opencode/models when
 * the picker opens, mirroring the Hoocode flow.
 */
export const OPENCODE_MODELS = {
  OPTIONS: [
    { value: "auto", label: "Auto (OpenCode default)" },
    { value: "opencode/claude-opus-4-7", label: "Claude Opus 4.7" },
    { value: "opencode/claude-opus-4-6", label: "Claude Opus 4.6" },
    { value: "opencode/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
    { value: "opencode/claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
    { value: "opencode/claude-haiku-4-5", label: "Claude Haiku 4.5" },
    { value: "opencode/gpt-5.5", label: "GPT-5.5" },
    { value: "opencode/gpt-5.5-pro", label: "GPT-5.5 Pro" },
    { value: "opencode/gpt-5.4", label: "GPT-5.4" },
    { value: "opencode/gpt-5.4-mini", label: "GPT-5.4 mini" },
    { value: "opencode/gpt-5.4-pro", label: "GPT-5.4 Pro" },
    { value: "opencode/gpt-5.3-codex", label: "GPT-5.3 Codex" },
    { value: "opencode/gpt-5.2-codex", label: "GPT-5.2 Codex" },
    { value: "opencode/gpt-5.1-codex-max", label: "GPT-5.1 Codex Max" },
    { value: "opencode/gemini-3.1-pro", label: "Gemini 3.1 Pro" },
    { value: "opencode/gemini-3-flash", label: "Gemini 3 Flash" },
    { value: "opencode/glm-5.1", label: "GLM 5.1" },
  ],

  DEFAULT: "auto",
};

/**
 * GitHub Copilot CLI Models
 *
 * The Copilot CLI (`@github/copilot`, binary `copilot`) selects a model with
 * `--model <id>`. Values mirror the strings shown by `copilot help`; the
 * default (no `--model`) is Claude Sonnet 4.5. Auth is via a GitHub token
 * (COPILOT_GITHUB_TOKEN / GH_TOKEN / GITHUB_TOKEN) or `gh auth`.
 */
export const COPILOT_MODELS = {
  OPTIONS: [
    { value: "claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
    { value: "claude-opus-4.5", label: "Claude Opus 4.5 (Preview)" },
    { value: "claude-haiku-4.5", label: "Claude Haiku 4.5" },
    { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
    { value: "gpt-5.1", label: "GPT-5.1" },
    { value: "gpt-5.1-codex", label: "GPT-5.1 Codex" },
    { value: "gpt-5.1-codex-mini", label: "GPT-5.1 Codex Mini" },
    { value: "gpt-5", label: "GPT-5" },
    { value: "gpt-5-mini", label: "GPT-5 mini" },
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gemini-3-pro", label: "Gemini 3 Pro (Preview)" },
  ],

  DEFAULT: "claude-sonnet-4.5",
};

/**
 *
 * This is the single source of truth for which CLI integrations the product
 * leads with. It lets us promote/retire providers from one place instead of
 * editing the registry, type unions, UI lists and i18n separately.
 *
 * - "first":  Primary, featured integration. Highlighted in the UI.
 * - "second": Supported, secondary integration.
 * - "hidden": Retired. Not offered for NEW sessions (hidden from pickers), but
 *             the backend can still read/sync existing sessions so history is
 *             never lost. Flip to "second"/"first" to bring it back instantly.
 *
 * @typedef {"first" | "second" | "hidden"} ProviderTier
 */

/**
 * Ordered provider registry — the single source of truth for the supported
 * provider list, their display order, vendor names, model catalogs and tier.
 *
 * To promote, demote or retire a provider, change its `tier` here. Downstream
 * consumers (server registry, selection UIs) read tier from this list rather
 * than hardcoding the provider set.
 */
export const PROVIDERS = [
  { id: "hoocode", name: "Hoocode", models: HOOCODE_MODELS, tier: "first" },
  { id: "claude", name: "Anthropic", models: CLAUDE_MODELS, tier: "second" },
  { id: "githubcopilot", name: "GitHub Copilot", models: COPILOT_MODELS, tier: "second" },
  { id: "codex", name: "OpenAI", models: CODEX_MODELS, tier: "hidden" },
  { id: "gemini", name: "Google", models: GEMINI_MODELS, tier: "hidden" },
  { id: "cursor", name: "Cursor", models: CURSOR_MODELS, tier: "hidden" },
  { id: "opencode", name: "OpenCode", models: OPENCODE_MODELS, tier: "hidden" },
];

/** All provider ids, in display order. */
export const PROVIDER_IDS = PROVIDERS.map((p) => p.id);

/** Look up a single provider descriptor by id. */
export function getProviderById(id) {
  return PROVIDERS.find((p) => p.id === id);
}

/** Resolve a provider's tier, defaulting to "hidden" for unknown ids. */
export function getProviderTier(id) {
  return getProviderById(id)?.tier ?? "hidden";
}

/** Providers matching a given tier, in display order. */
export function getProvidersByTier(tier) {
  return PROVIDERS.filter((p) => p.tier === tier);
}

/**
 * Providers offered for NEW sessions (everything not retired), in display
 * order: "first" tier first, then "second". Use this for selection/picker UIs.
 */
export function getVisibleProviders() {
  const order = { first: 0, second: 1, hidden: 2 };
  return PROVIDERS.filter((p) => p.tier !== "hidden").sort(
    (a, b) => order[a.tier] - order[b.tier],
  );
}

/** Whether a provider is offered for new sessions (not retired). */
export function isProviderVisible(id) {
  return getProviderTier(id) !== "hidden";
}
