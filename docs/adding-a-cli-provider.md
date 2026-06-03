# Adding (or retiring) a CLI provider

Providers are wired through two small registries so adding a new CLI — or
promoting/retiring an existing one — is a localized change rather than an edit
across ~25 files.

## Tiers

Every provider has a **tier**, declared once in `shared/modelConstants.js`:

| Tier     | Meaning                                                                       |
| -------- | ----------------------------------------------------------------------------- |
| `first`  | Primary, featured integration. Leads the pickers.                             |
| `second` | Supported, secondary integration.                                             |
| `hidden` | Retired. Not offered for **new** sessions, but existing sessions still work — history, auth and sync run off the full provider list on the server. |

To promote/demote/retire a provider, change its `tier` in one place
(`shared/modelConstants.js` → `PROVIDERS`). No code is deleted; flipping a
provider back to `second`/`first` restores it instantly.

## The two registries (source of truth)

1. **Runtime config** — `shared/modelConstants.js` → `PROVIDERS`
   (`id`, vendor `name`, `models`, `tier`). Imported by both server and
   frontend. Helpers: `getVisibleProviders()`, `getProviderTier(id)`,
   `isProviderVisible(id)`, `getProvidersByTier(tier)`, `PROVIDER_IDS`.

2. **Frontend UI registry** — `src/providers/provider-registry.tsx`
   (logo component, display name, vendor, glyph, description, auth endpoint).
   Pickers, the logo dispatcher, auth status and settings all derive from this,
   so there are no scattered hardcoded provider arrays.

3. **Backend implementation registry** —
   `server/modules/providers/provider.registry.ts` maps each id to an
   `IProvider` implementation. A startup drift guard fails fast if the config
   and the implementations disagree in either direction.

## Checklist: add a new CLI

1. **Config** — add an entry to `PROVIDERS` in `shared/modelConstants.js`
   (`id`, `name`, a `*_MODELS` catalog, and a `tier`).
2. **Frontend** — add a logo component under
   `src/components/llm-logo-provider/` and one entry to `PROVIDER_UI_META` in
   `src/providers/provider-registry.tsx`.
3. **Backend** — implement `IProvider` under
   `server/modules/providers/list/<id>/` and register the factory in
   `server/modules/providers/provider.registry.ts`.
4. **Type union** — add the id to `LLMProvider` in `server/shared/types.ts` and
   `src/types/app.ts` (kept explicit for type-safety; the drift guard catches a
   missed registration at startup).

The selection surfaces (`CliSelection`, the new-session model picker,
settings agents, auth status) require **no** changes — they already read from
the registries above.

## Checklist: retire a CLI

Set its `tier` to `hidden` in `shared/modelConstants.js`. It disappears from
new-session pickers and settings while existing sessions keep working. Nothing
else to touch.
