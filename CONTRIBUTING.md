# Contributing to HooCowork

Thanks for your interest! A few guidelines to keep things smooth.

## Before You Start

- **Search first** — check [issues](https://github.com/kolisachint/hoocowork/issues) and [PRs](https://github.com/kolisachint/hoocowork/pulls).
- **Discuss first** for new features — open an issue before investing time.
- **Bug fixes are always welcome** — feel free to open a PR directly.

## Prerequisites

- [Node.js](https://nodejs.org/) 22 or later
- [Bun](https://bun.sh/) (optional, for fast CI)

## Getting Started

```bash
git clone https://github.com/<your-username>/hoocowork.git
cd hoocowork
npm install
npm run dev
```

## Making Changes

- One feature or fix per PR.
- Include screenshots for UI changes.
- Make sure CI passes (`npm run typecheck && npm run lint`).

## Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/).

```
<type>(optional scope): <description>
```

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `perf` | Performance improvement |
| `refactor` | Code change with no behavior change |
| `docs` | Documentation only |
| `style` | CSS, formatting, visual changes |
| `chore` | Maintenance, deps, config |
| `ci` | CI/CD changes |
| `test` | Adding or updating tests |
| `build` | Build system changes |

Examples:

```bash
feat: add conversation search
fix: redirect unauthenticated users to login
style(chat): extract message list component
```

Breaking changes: add `!` after the type.

```bash
feat!: redesign settings page layout
```

## License

By contributing, you agree that your contributions will be licensed under [AGPL-3.0-or-later](LICENSE).
