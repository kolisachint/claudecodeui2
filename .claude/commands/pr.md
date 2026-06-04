Open a Release PR

Arguments: $ARGUMENTS

Gate the current session's changes into a reviewable Pull Request against `main`.
If a bump is given, the PR is labeled so that merging it cuts an npm release;
if no bump is given, it's just a plain PR — **no release, no npm publish** on merge.

`$ARGUMENTS` format: `[bump] [summary]`
- `[bump]` (optional) = one of `patch` | `minor` | `major`. Maps to the
  `npm:patch` / `npm:minor` / `npm:major` PR label that drives the release.
  **If omitted, open the PR with NO `npm:*` label** — merging it just lands the
  changes on `main` with no release and no npm publish.
- `[summary]` (optional) = a one-line summary for the commit + PR title.
  If omitted, generate one from the change summary.

If a `[bump]` is provided but is not one of patch/minor/major, STOP and ask.

## What I do when this runs

1. **Stop the dev servers** started by `/ui-session` (if still running).

2. **Identify only my changes.** Build the exact list of files *I* edited in this
   session (track them as I go; do not rely on `git status` alone, since other
   agents may have unrelated changes in the working tree). I will only ever stage
   these explicit paths — **never** `git add .` or `git add -A`.

3. **Summarize the session.** Show, scoped to my files:
   - `git status` + `git diff --stat -- <my files>`
   - A concise bullet list of what changed and why (grouped by feature).

4. **Validate before opening the PR:**
   - `npm run typecheck`
   - `npm run lint`
   - Report results. If either fails, STOP and offer to fix — do not proceed.

5. **Ask for explicit approval.** Prompt:
   > "Open a release PR (`npm:<bump>`) with these changes? [yes / no / keep iterating]"
   > or, when no bump was given:
   > "Open a plain PR (no release) with these changes? [yes / no / keep iterating]"
   - Do nothing that writes to git until you answer **yes**.

6. **On approval — sync with `main`, then branch and stage:**
   - `git fetch origin main`
   - Create a working branch off the up-to-date remote main:
     `git switch -c pr/<slug>` where `<slug>` is the summary slugified (or a
     timestamp). If I'm already on a feature branch, reuse it.
   - **Rebase onto the latest main if behind:** `git rebase origin/main`.
     If conflicts arise, STOP and surface them — do not auto-resolve.
   - Stage **only my files** by explicit path:
     `git add -- <path1> <path2> …`
   - Commit with a clear conventional-commit message (use `[summary]` if given,
     else generate from the change summary).

7. **Push and open the PR:**
   - `git push -u origin HEAD`
   - Create the PR. **Only pass `--label` when a bump was given:**
     ```
     gh pr create \
       --base main \
       --title "<summary>" \
       --body "<change summary + why, grouped by feature>" \
       [--label "npm:<bump>"]   # omit entirely when no bump was given
     ```
   - If a bump was given and the `npm:<bump>` label doesn't exist yet, create it first:
     `gh label create "npm:<bump>" --color <color> --description "Release bump: <bump>"`
   - Report the PR URL.

8. **On "no" / "keep iterating":** leave everything on the working branch
   untouched and stay in the session.

## How the release happens (for reference)

When a PR carrying an `npm:patch|minor|major` label is **merged** into `main`,
the **Release** workflow (`.github/workflows/release.yml`) reads the label,
bumps `package.json` accordingly, updates `CHANGELOG.md`, commits + tags the
version, creates the GitHub Release, and publishes to npm. I do **not** bump
the version in this PR — the label is the source of truth.

**A PR with no `npm:*` label does nothing on merge** beyond landing the changes
on `main`: the Release workflow's job is gated on the label, so no release and
no npm publish happen.

## Safety

- Never force-push (except a `--force-with-lease` only when *I* created the
  branch and am rebasing my own commits), never delete others' branches.
- Only stage the explicit files I changed this session — never other agents'
  working-tree changes.
- Never bump the version or publish locally; the label + workflow own that.
- If a rebase conflicts, STOP and surface it.
