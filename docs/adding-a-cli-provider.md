# Adding (or retiring) a CLI provider

Providers are wired through two small registries so adding a new CLI — or
promoting/retiring an existing one — is a localized change.

## Current Providers

| Provider | Tier | Status |
|----------|------|--------|
| `hoocode` | `first` | Primary — HooCowork's own agent |
| `claude` | `second` | Anthropic Claude Code |
| `githubcopilot` | `second` | GitHub Copilot |
| `codex` | `hidden` | Retired |
| `gemini` | `hidden` | Retired |
| `cursor` | `hidden` | Retired |
| `opencode` | `hidden` | Retired |

## Tiers

| Tier     | Meaning |
| -------- | ------- |
| `first`  | Primary, featured integration. Leads the pickers. |
| `second` | Supported, secondary integration. |
| `hidden` | Retired. Not offered for **new** sessions, but existing sessions still work. |

To promote/demote/retire a provider, change its `tier` in `shared/modelConstants.js` → `PROVIDERS`.

## The two registries

1. **Runtime config** — `shared/modelConstants.js` → `PROVIDERS`
   (`id`, vendor `name`, `models`, `tier`). Imported by both server and frontend.

2. **Frontend UI registry** — `src/providers/provider-registry.tsx`
   (display name, vendor, glyph, description, auth endpoint). No logo components needed — providers render as glyphs.

3. **Backend registry** — `server/modules/providers/provider.registry.ts`
   maps each id to an `IProvider` implementation.

## Checklist: add a new CLI

1. **Config** — add an entry to `PROVIDERS` in `shared/modelConstants.js`.
2. **Frontend** — add a glyph and entry to `PROVIDER_UI_META` in `src/providers/provider-registry.tsx`.
3. **Backend** — implement `IProvider` under `server/modules/providers/list/<id>/` and register the factory.
4. **Types** — add the id to `LLMProvider` in `src/types/app.ts` and `server/shared/types.ts`.

Selection surfaces require **no** changes — they read from the registries.

## Checklist: retire a CLI

Set its `tier` to `hidden` in `shared/modelConstants.js`. It disappears from
new-session pickers while existing sessions keep working.
