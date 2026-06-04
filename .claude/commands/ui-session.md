UI Session

Arguments: $ARGUMENTS

Start a live dev-UI session for iterating on frontend changes by chat, with hot reload.
$ARGUMENTS (optional) = a short session name used for the working branch (e.g. `sidebar-restyle`).

## What I do when this runs

1. **Read the map first.** Read `docs/ui-map.md` so I can locate components without
   re-searching. Do NOT bulk-read large component files up front — only read the specific
   file(s) a request touches, and prefer the `explore` subagent to locate things.

2. **Create a working branch.** From up-to-date `main`:
   - `git switch main && git pull --ff-only`
   - `git switch -c dev/ui-<name>` where `<name>` is `$ARGUMENTS` (slugified) or a timestamp.
   - If the branch already exists, switch to it instead.

3. **Launch the dev servers in the background** (Vite on :5173 + API on :3001):
   - `npm run dev` (kills others on exit). Confirm both ports are up.
   - Report the URL: http://localhost:5173

4. **Enter iterate mode.** I'm now ready for UI requests over chat. For each request:
   - Locate the component (use `docs/ui-map.md`; delegate search to `explore` if unclear).
   - Make the smallest correct edit; Vite hot-reloads so you see it live.
   - Keep edits scoped and show a short diff for non-trivial changes.
   - Delegate self-contained edits to the `edit` subagent to keep context lean.

## Token-lean rules for this session

- Prefer `explore`/`edit` subagents for finding and changing code — their file reads stay
  in isolated context, not ours.
- Read only the lines I need (`offset`/`limit`), not whole files.
- Reuse `src/shared/view/ui/` primitives and `src/index.css` tokens instead of inline styles.
- Batch independent edits in a single call.

## Ending the session

When you're done, run `/pr <patch|minor|major>` — I'll summarize all changes, run
typecheck + lint, and ask for explicit approval before opening a labeled release PR
against `main`.
