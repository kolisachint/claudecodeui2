# UI Map

> **Purpose:** a token-lean lookup so an agent can locate frontend code **without
> re-searching**. Start with the [Quick Index](#quick-index) — jump straight to the
> file(s) a request touches and open only those. Fall back to the `explore` subagent
> only when the map doesn't cover something. Keep this file updated as the UI evolves.

## Stack & entry points

- **React 18 + Vite 7 + Tailwind 3**, routing via `react-router-dom` v6.
- State: React Context + Zustand (`src/stores/useSessionStore.ts`). No Redux.
- UI libs: Lucide icons, CodeMirror (editor), xterm (terminal), cmdk (command menu), Radix (dialogs).
- i18n: `react-i18next`.

| Entry | Path |
|---|---|
| HTML root | `index.html` (`#root`) |
| App entry | `src/main.jsx` |
| Root providers + router | `src/App.tsx` |
| Vite config (alias `@`→`src/`, `/api` `/ws` `/shell` proxy) | `vite.config.js` |

**Routing:** `src/App.tsx` defines two routes — `/` and `/session/:sessionId` — both render
`src/components/app/AppContent.tsx`, which lays out `Sidebar` + `MainContent` + `CommandPalette`.
There is no `pages/` folder; features live in `src/components/<feature>/`.

Provider order (in `App.tsx`): I18next → Theme → Auth → WebSocket → Plugins → TasksSettings → TaskMaster.

## `src/` layout

| Folder | Purpose |
|---|---|
| `components/` | Feature folders (sidebar, chat, code-editor, shell, git-panel, task-master, settings, …) |
| `contexts/` | React Context providers (Theme, WebSocket, Plugins, …) |
| `hooks/` | Custom hooks (`useProjectsState`, `useDeviceSettings`, `useUiPreferences`, …) |
| `stores/` | Zustand stores (`useSessionStore.ts`) |
| `shared/view/ui/` | Reusable UI primitives (barrel: `index.ts`) |
| `styles/` | Global CSS (`kit*.css` layers/overrides) |
| `i18n/` | `config.js`, `locales/` |
| `types/`, `constants/`, `utils/`, `lib/`, `providers/` | Types, app constants, helpers, provider registry |

## Feature areas → primary files

Each feature folder uses a `view/` + `view/subcomponents/` convention.

- **App shell / layout:** `src/components/app/AppContent.tsx`; `src/components/main-content/view/MainContent.tsx` (+ `subcomponents/MainContentHeader.tsx`, `MainContentTabSwitcher.tsx` for the Chat/Code/Terminal/Git/Tasks tabs); error boundary `src/components/main-content/view/ErrorBoundary.tsx`.
- **Sidebar:** `src/components/sidebar/view/Sidebar.tsx` (+ `subcomponents/SidebarContent.tsx`, `SidebarCollapsed.tsx`, `SidebarProjectItem.tsx`, `SidebarSessionItem.tsx`, `SidebarModals.tsx`).
- **Chat:** `src/components/chat/view/ChatInterface.tsx` (+ `subcomponents/ChatHeader.tsx`, `ChatComposer.tsx`, `ChatMessagesPane.tsx`, `MessageComponent.tsx`, `Markdown.tsx`, `ClaudeStatus.tsx`, `TokenUsagePie.tsx`).
- **Code editor:** `src/components/code-editor/view/CodeEditor.tsx` (+ `CodeEditorHeader.tsx`, `CodeEditorSurface.tsx` (CodeMirror), `CodeEditorFooter.tsx`, `EditorSidebar.tsx`).
- **File tree:** `src/components/file-tree/view/FileTree.tsx` (+ `FileTreeHeader.tsx`, `FileTreeList.tsx`, `FileTreeNode.tsx`, `FileContextMenu.tsx`, `ImageViewer.tsx`).
- **Terminal/shell:** `src/components/shell/view/Shell.tsx` (xterm).
- **Git panel:** `src/components/git-panel/view/GitPanel.tsx` (+ `GitPanelHeader.tsx`, `GitViewTabs.tsx`, subfolders `branches/`, `changes/`, `history/`, `modals/`).
- **Tasks (TaskMaster):** `src/components/task-master/view/TaskMasterPanel.tsx` (+ `TaskBoard.tsx`, `TaskCard.tsx`, `TaskDetailModal.tsx`, `modals/`).
- **Settings:** `src/components/settings/view/Settings.tsx` (+ `SettingsSidebar.tsx`, `SettingsMainTabs.tsx`, `tabs/` incl. `AppearanceSettingsTab.tsx`, `AboutTab.tsx`, `api-settings/`, `agents-settings/`, `git-settings/`).
- **Quick settings panel:** `src/components/quick-settings-panel/view/QuickSettingsPanelView.tsx`.
- **Auth:** `src/components/auth/view/` (`ProtectedRoute.tsx`, `LoginForm.tsx`, `SetupForm.tsx`, `AuthInputField.tsx`); context `src/components/auth/context/AuthContext.jsx`.
- **Onboarding:** `src/components/onboarding/view/Onboarding.tsx` (+ `subcomponents/`).
- **Command palette:** `src/components/command-palette/CommandPalette.tsx` (+ `sources/`).
- **MCP servers:** `src/components/mcp/view/McpServers.tsx` (+ `modals/`).
- **Plugins:** `src/components/plugins/` (note: plural); context `src/contexts/PluginsContext.tsx`.
- **Legacy kit components:** `src/components/kit/` (Badge, Button, Card, Field, IconBtn, …).

## Shared UI primitives — `src/shared/view/ui/`

Import via the barrel `src/shared/view/ui/index.ts`. Prefer these over inline styles:

`Alert` · `Badge` · `BrandLogo` · `Button` · `Card` · `Collapsible` · `Command` ·
`Confirmation` · `DarkModeToggle` · `Dialog` · `Input` · `LanguageSelector` ·
`PillBar` · `PromptInput` · `Queue` · `Reasoning` · `ScrollArea` · `Shimmer` · `Tooltip`

## Design tokens & styling

Approach: **Tailwind classes + CSS variables** ("paper-ink" design system). Dark mode is
class-based (`dark:` prefix), toggled by `src/contexts/ThemeContext.jsx` /
`src/shared/view/ui/DarkModeToggle.tsx`.

- **Tokens:** `src/index.css` — HSL vars (`--paper-hsl`, `--ink-hsl`, `--line-hsl`,
  `--accent-hsl`, `--err-hsl`, `--radius`) and hex aliases (`--paper`, `--ink`, `--line`,
  `--brand-accent`, `--ok`, `--warn`, `--err`). `@font-face` (JetBrains Mono, MesloLGS NF) here too.
- **Tailwind theme:** `tailwind.config.js` maps tokens → `border`/`background`/`foreground`/
  `primary`/`destructive`/`muted` (use `hsl(var(--X-hsl) / <alpha-value>)`), plus `borderRadius`
  and animations (`shimmer`, dialog show).
- **Global CSS layers:** `src/styles/kit*.css` (`kit.css`, `kit-extra.css`, `kit-v2.css`,
  `kit-mobile*.css`, `kit-revisions.css`, `kit-overrides.css` — last wins).

## State & data

- **Contexts** (`src/contexts/`): `ThemeContext.jsx`, `WebSocketContext.tsx`,
  `PluginsContext.tsx`, `TasksSettingsContext.jsx`, `PermissionContext.tsx`,
  `PaletteOpsContext.tsx`. Auth context lives at `src/components/auth/context/AuthContext.jsx`;
  TaskMaster at `src/components/task-master/context/TaskMasterContext.ts`.
- **Store:** `src/stores/useSessionStore.ts` (active session, messages, per-session settings).
- **Key hooks** (`src/hooks/`): `useProjectsState.ts`, `useDeviceSettings.ts` (mobile/PWA),
  `useUiPreferences.ts` (sidebar collapsed etc.), `useSessionProtection.ts`, `useVersionCheck.ts`,
  `useWebPush.ts`, `useGitHubStars.ts`, `useLocalStorage.jsx`.
- **API/utils:** `src/utils/api.js` (`/api/*` fetch wrapper), `clipboard.ts`, `dateUtils.ts`,
  `src/lib/utils.js`, `src/constants/config.ts`.

## Quick Index

| Change request | Edit |
|---|---|
| Colors / design tokens | `src/index.css` (vars) + `tailwind.config.js` (theme) |
| Dark mode / theme | `src/contexts/ThemeContext.jsx`, `src/shared/view/ui/DarkModeToggle.tsx` |
| Buttons | `src/shared/view/ui/Button.tsx` (primitive) · `src/components/kit/Button.tsx` (legacy) |
| Inputs | `src/shared/view/ui/Input.tsx` · chat: `chat/view/subcomponents/ChatComposer.tsx` |
| Dialogs / modals | `src/shared/view/ui/Dialog.tsx` (primitive) |
| Routing | `src/App.tsx` · `src/components/app/AppContent.tsx` |
| Sidebar | `src/components/sidebar/view/Sidebar.tsx` + `subcomponents/SidebarContent.tsx` |
| Sidebar collapse | `subcomponents/SidebarCollapsed.tsx`, `src/hooks/useUiPreferences.ts` |
| Top bar / tabs | `main-content/view/subcomponents/MainContentHeader.tsx`, `MainContentTabSwitcher.tsx` |
| Chat UI | `src/components/chat/view/ChatInterface.tsx` + subcomponents |
| Message rendering | `chat/view/subcomponents/MessageComponent.tsx`, `Markdown.tsx` |
| Code editor | `src/components/code-editor/view/CodeEditor.tsx` |
| File tree | `src/components/file-tree/view/FileTree.tsx` |
| Terminal | `src/components/shell/view/Shell.tsx` |
| Git panel | `src/components/git-panel/view/GitPanel.tsx` |
| Tasks board | `src/components/task-master/view/TaskMasterPanel.tsx` |
| Settings | `src/components/settings/view/Settings.tsx` + `tabs/` |
| Quick settings | `src/components/quick-settings-panel/view/QuickSettingsPanelView.tsx` |
| Auth forms | `src/components/auth/view/LoginForm.tsx`, `SetupForm.tsx` |
| Onboarding | `src/components/onboarding/view/Onboarding.tsx` |
| Command palette | `src/components/command-palette/CommandPalette.tsx` |
| MCP servers | `src/components/mcp/view/McpServers.tsx` |
| Global styles | `src/index.css`, `src/styles/kit*.css` |
| Fonts | `src/index.css` (`@font-face`) |
| Animations | `tailwind.config.js` (keyframes), `src/styles/kit*.css` |
| i18n / translations | `src/i18n/config.js`, `src/i18n/locales/` |
| Mobile responsiveness | `src/styles/kit-mobile*.css`, `src/hooks/useDeviceSettings.ts` |
| WebSocket / real-time | `src/contexts/WebSocketContext.tsx` |
| API calls | `src/utils/api.js` |
| Error boundary | `src/components/main-content/view/ErrorBoundary.tsx` |
