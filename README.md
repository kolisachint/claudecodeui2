<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/hoocowork.svg">
    <img alt="HooCowork" src="public/hoocowork-light.svg" height="64">
  </picture>
</p>

<p align="center">One web interface for HooCode, Claude Code &amp; GitHub Copilot — local or remote.</p>

<p align="center">
  <a href="https://github.com/kolisachint/hoocowork/actions"><img src="https://github.com/kolisachint/hoocowork/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@kolisachint/hoocowork"><img src="https://img.shields.io/npm/v/@kolisachint/hoocowork" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue" alt="License: AGPL-3.0"></a>
</p>

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
