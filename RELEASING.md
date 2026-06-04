# Releasing HooCowork

## Overview

HooCowork is distributed as an **npm package** (`@kolisachint/hoocowork`).
Each GitHub Release also carries the auto-generated **source code** archives
(`zip` / `tar.gz`).

Releases are **driven by the version in `package.json`**: when that version
changes on `main` (i.e. a version-bump PR is merged), the Release workflow
tags the commit, creates the GitHub Release, and publishes to npm. Versions
that are already tagged are skipped, so ordinary merges and re-runs are no-ops.

## Cutting a release (PR merge)

1. Create a branch and bump the version:
   ```bash
   npm version patch --no-git-tag-version   # or minor / major
   bun x conventional-changelog-cli -p conventionalcommits -i CHANGELOG.md -s
   ```
2. Open a PR with the `package.json` (and `CHANGELOG.md`) change and merge it.
3. On merge to `main`, the **Release** workflow publishes
   `@kolisachint/hoocowork@<new version>` to npm and creates the GitHub Release.

You can also trigger the workflow manually (Actions → Release → Run workflow)
to publish the current `package.json` version if it isn't tagged yet.

## Requirements

- **`NPM_TOKEN`** repo secret — an npm automation token whose account can
  publish to the `@kolisachint` scope. The publish step fails with a
  `404 PUT … is not in this registry` when this token is missing, expired,
  or unauthorized for the scope.
- **`RELEASE_PAT`** repo secret — used to push the tag and create the
  GitHub Release.

## After the release

1. Verify the release at [Releases](https://github.com/kolisachint/hoocowork/releases)
2. Check npm: `npm view @kolisachint/hoocowork version`
