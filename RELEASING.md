# Releasing HooCowork

## Overview

HooCowork is distributed as an **npm package** (`@kolisachint/hoocowork`).
Each GitHub Release also carries the auto-generated **source code** archives
(`zip` / `tar.gz`).

## Triggering a Release

1. Go to [Actions → Release](https://github.com/kolisachint/hoocowork/actions/workflows/release.yml)
2. Click "Run workflow"
3. Choose version bump: `patch`, `minor`, or `major`
4. Click "Run workflow"

The workflow bumps the version, generates the changelog, tags the commit,
creates a GitHub Release (with the source-code archives GitHub attaches
automatically), and publishes to npm.

## Requirements

- **`NPM_TOKEN`** repo secret — an npm automation token whose account can
  publish to the `@kolisachint` scope. The publish step fails with a
  `404 PUT … is not in this registry` when this token is missing, expired,
  or unauthorized for the scope.
- **`RELEASE_PAT`** repo secret — used to push the release commit/tag and
  create the GitHub Release.

## After the Workflow

1. Verify the release at [Releases](https://github.com/kolisachint/hoocowork/releases)
2. Check npm: `npm view @kolisachint/hoocowork version`
