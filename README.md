# HooCowork

![HooCowork](public/wordmark.svg)

[![CI](https://github.com/kolisachint/hoocowork/actions/workflows/ci.yml/badge.svg)](https://github.com/kolisachint/hoocowork/actions)
[![npm](https://img.shields.io/npm/v/@kolisachint/hoocowork)](https://www.npmjs.com/package/@kolisachint/hoocowork)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)

A unified web interface for AI coding agents. Run **HooCode**, **Claude Code**, and **GitHub Copilot** from one place — locally or remotely.

**[Website](https://hoocowork.app)** · **[Docs](https://hoocowork.app/docs)** · **[Discord](https://discord.gg/buxwujPNRE)** · **[Issues](https://github.com/kolisachint/hoocowork/issues)**

---

## Quick Start

### Cloud (Recommended)

No setup. Managed container with web, mobile, and API access.

**[Get started →](https://hoocowork.app)**

### Self-Hosted

Requires **Node.js 22+**:

```bash
npx @kolisachint/hoocowork
```

Or install globally:

```bash
npm install -g @kolisachint/hoocowork
hoocowork
```

Open `http://localhost:3001`. Existing sessions are discovered automatically.

### Standalone Binary

Download from [Releases](https://github.com/kolisachint/hoocowork/releases) — no Node.js needed.

| Platform | Binary |
|----------|--------|
| Windows x64 | `hoocowork-win-x64.exe` |
| macOS ARM64 | `hoocowork-darwin-arm64` |
| macOS x64 | `hoocowork-darwin-x64` |
| Linux x64 | `hoocowork-linux-x64` |
| Linux ARM64 | `hoocowork-linux-arm64` |

---

## Features

- **Multi-Agent** — HooCode, Claude Code, GitHub Copilot
- **Chat + Terminal** — Markdown, code blocks, and an integrated shell
- **File & Git UI** — File tree, syntax highlighting, diff viewer, branch switching
- **Session Management** — Resume conversations, manage history
- **MCP Servers** — Visual config for Model Context Protocol
- **Plugins** — Extend with custom tabs and backends
- **REST API** — Trigger sessions from other apps
- **PWA** — Installable on desktop and mobile

---

## Development

```bash
git clone https://github.com/kolisachint/hoocowork.git
cd hoocowork
npm install
npm run dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).
