# Releasing HooCowork

## Overview

HooCowork is distributed two ways:

1. **npm package** (`@kolisachint/hoocowork`)
2. **Standalone binaries** via GitHub Releases

Both are built and published by the same GitHub Actions workflow.

## Triggering a Release

1. Go to [Actions → Release](https://github.com/kolisachint/hoocowork/actions/workflows/release.yml)
2. Click "Run workflow"
3. Choose version bump: `patch`, `minor`, or `major`
4. Click "Run workflow"

The workflow bumps the version, generates the changelog, tags the commit, creates a GitHub Release, publishes to npm, and builds binaries for all 5 platforms.

## After the Workflow

1. Verify the release at [Releases](https://github.com/kolisachint/hoocowork/releases)
2. Check all 5 binaries are attached
3. Check npm: `npm view @kolisachint/hoocowork version`

## Winget (Windows)

After each release, submit the updated manifest to [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs):

1. Fork the repo
2. Copy `winget/kolisachint.hoocowork.yaml` to `manifests/k/kolisachint/hoocowork/{VERSION}/`
3. Update `PackageVersion` and `InstallerUrl`
4. Compute SHA256 of `hoocowork-win-x64.exe`
5. Update `InstallerSha256`
6. Submit a PR

## Manual Build

```bash
bun install
bun run build
bun run scripts/embed-assets.ts
bun build --compile server/binary-entry.ts --outfile=hoocowork-test
```

## Troubleshooting

- **Binary won't start**: `chmod +x hoocowork-*`
- **macOS Gatekeeper**: `xattr -d com.apple.quarantine hoocowork-*`
