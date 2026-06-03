# UI Component Map

> Reference map for the hoocowork frontend (`src/`). Read this **first** before searching
> for where a piece of UI lives — it saves re-exploring 350+ files.
>
> Stack: React + TypeScript + Vite (UI on `:5173`, proxied to server on `:3001`), Tailwind.
> Keep this file updated when features move or large components are split.

## Quick navigation cheat sheet

| I want to change…        | Start here |
|--------------------------|------------|
| Chat messages / bubbles  | `src/components/chat/view/subcomponents/MessageComponent.tsx` |
| Chat input box           | `src/components/chat/view/subcomponents/ChatComposer.tsx` |
| Chat layout / header     | `src/components/chat/view/ChatInterface.tsx` |
| Sidebar (projects/sessions) | `src/components/sidebar/view/subcomponents/SidebarContent.tsx` |
| Tab switching / main area | `src/components/main-content/view/MainContent.tsx` |
| File browser             | `src/components/file-tree/view/FileTree.tsx` |
| Terminal                 | `src/components/shell/view/Shell.tsx` |
| Task board (kanban)      | `src/components/task-master/view/TaskMasterPanel.tsx` |
| Code editor / diff       | `src/components/code-editor/view/CodeEditor.tsx` |
| Settings screens         | `src/components/settings/view/Settings.tsx` |
| Command palette (Cmd+K)  | `src/components/command-palette/CommandPalette.tsx` |
| Git panel                | `src/components/git-panel/view/GitPanel.tsx` |
| MCP servers              | `src/components/mcp/view/McpServers.tsx` |
| Reusable Button/Input/Dialog | `src/shared/view/ui/` |
| Colors / spacing / theme tokens | `src/index.css` (`:root` and `.dark`) |
| Dark mode behavior       | `src/contexts/ThemeContext.jsx` |

## Routing & layout

- Entry: `src/main.jsx` → root: `src/App.tsx`
- Provider nesting (App.tsx): I18next → Theme → Auth → WebSocket → Plugins → TasksSettings → TaskMaster → ProtectedRoute → Router
- Routes: `/` and `/session/:sessionId` → `AppContent`
- `AppContent` renders: **Sidebar** (280px, left) + **MainContent** (flex-1) + **CommandPalette** (overlay)
- Mobile: sidebar becomes an 85vw drawer; main is full-width
- Dark mode: `class` strategy (`dark` on `<html>`), persisted in localStorage, system-preference fallback

## Feature areas (`src/components/`)

Each feature folder follows `view/` (components) + `hooks/` + `types/` + `utils/`.

### chat — `chat/view/ChatInterface.tsx` (~477)
LLM conversation: history, provider/model selection, token tracking.
- `subcomponents/ChatMessagesPane.tsx` (~280) — message list, load-earlier
- `subcomponents/MessageComponent.tsx` (~471) — single message, tool calls, markdown
- `subcomponents/ChatComposer.tsx` (~428) — input, attachments, send
- `subcomponents/ChatHeader.tsx` (~145) — session name, model, token budget
- `subcomponents/ProviderSelectionEmptyState.tsx` (~454) — empty-chat provider picker

### sidebar — `sidebar/view/Sidebar.tsx` (~235)
Project & session navigation, new session, settings/refresh.
- `view/subcomponents/SidebarContent.tsx` (~394) — projects/sessions list, collapsible
- `view/subcomponents/SidebarProjectItem.tsx` (~265) — project row, star, menu
- `view/subcomponents/SidebarSessionItem.tsx` (~170) — session row, rename/delete
- `view/subcomponents/SidebarModals.tsx` (~216) — new/rename/delete dialogs

### main-content — `main-content/view/MainContent.tsx` (~294)
Tab switcher between chat / code / file-tree / shell / settings / task-master / mcp / git / plugins.
- `MainContentTabSwitcher.tsx` (~106), `MainContentHeader.tsx` (~66), `MainContentTitle.tsx` (~90), `MainContentStateView.tsx` (~56)

### code-editor — `code-editor/view/CodeEditor.tsx`
File view/edit, diff, syntax highlighting.
- `CodeEditorHeader.tsx` (~146), `CodeEditorBinaryFile.tsx` (~115), `EditorSidebar.tsx`

### file-tree — `file-tree/view/FileTree.tsx` (~315)
Project file/folder browser, create/rename/delete, image preview.
- `FileTreeBody.tsx`, `FileTreeNode.tsx`, `FileTreeDetailedColumns.tsx`, `FileTreeHeader.tsx`, `ImageViewer.tsx`, `FileContextMenu.tsx` (~313)

### shell — `shell/view/Shell.tsx` (~334)
xterm.js terminal, command I/O.
- `ShellHeader.tsx`, `ShellEmptyState.tsx`, `ShellConnectionOverlay.tsx`, `ShellMinimalView.tsx`, `TerminalShortcutsPanel.tsx`

### task-master — `task-master/view/TaskMasterPanel.tsx`
Kanban board, task create/edit, AI-generated tasks.
- `TaskBoard.tsx`, `TaskCard.tsx` (~211), `TaskDetailModal.tsx` (~324), `TaskBoardToolbar.tsx` (~268), `NextTaskBanner.tsx` (~215), `TaskBoardContent.tsx`, `TaskEmptyState.tsx`

### settings — `settings/view/Settings.tsx` (~195)
Preferences, API keys, theme, provider auth, MCP, plugins.
- `SettingsSidebar.tsx` (~74), `SettingsMainTabs.tsx` (~59), `view/tabs/*` (agents, tasks, api, git)
- Note: `tabs/agents-settings/sections/content/PermissionsContent.tsx` (~647) is the largest UI file — candidate for splitting.

### command-palette — `command-palette/CommandPalette.tsx` (~384)
Global Cmd+K palette; source-based (chat/file/task/project).

### git-panel — `git-panel/view/GitPanel.tsx`
Git status, branches, history, staged changes, commit.
- subfolders: `branches/`, `changes/`, `history/`; `GitPanelHeader.tsx`, `GitViewTabs.tsx`

### mcp — `mcp/view/McpServers.tsx` (~366)
MCP server management; `view/modals/McpServerFormModal.tsx` (~397).

### plugins — `plugins/view/PluginSettingsTab.tsx` (~543)
Plugin list, enable/disable, settings. `PluginTabContent.tsx`, `PluginIcon.tsx`.

### Other features
- `provider-auth/view/ProviderLoginModal.tsx` — LLM provider login
- `quick-settings-panel/view/QuickSettingsPanelView.tsx` — floating settings drawer
- `prd-editor/view/PrdEditorWorkspace.tsx` — PRD editor (+ `GenerateTasksModal.tsx`)
- `standalone-shell/view/StandaloneShell.tsx` — shell in modal
- `onboarding/view/Onboarding.tsx` — first-run setup
- `cli-selection/`, `project-creation-wizard/`, `version-upgrade/`, `llm-logo-provider/`
- `auth/view/` — `LoginForm.tsx`, `ProtectedRoute.tsx`, `AuthLoadingScreen.tsx`, `AuthErrorAlert.tsx`
- `kit/` — **legacy** components; prefer `src/shared/view/ui/` for new work

## Shared UI kit (`src/shared/view/ui/`)

Reusable primitives — prefer these over inline markup. Barrel export: `index.ts`.

| Component | Purpose |
|-----------|---------|
| `Button.tsx` | CVA button: default/destructive/outline/secondary/ghost/link |
| `Input.tsx` | Styled text input |
| `Dialog.tsx` | Modal (trigger/overlay/content) |
| `Card.tsx` | Card container |
| `Confirmation.tsx` | Yes/no/cancel dialog |
| `Alert.tsx` | info/warning/error/success box |
| `Badge.tsx` | Status/count label |
| `Tooltip.tsx` | Tooltip overlay |
| `Collapsible.tsx` | Accordion section |
| `ScrollArea.tsx` | Styled scroll container |
| `Command.tsx` | cmdk search/command input |
| `PillBar.tsx` | Horizontal pill/chip selector |
| `PromptInput.tsx` | Auto-expand chat input w/ file drop |
| `Queue.tsx` | Queue display |
| `Reasoning.tsx` | Expandable reasoning block |
| `Shimmer.tsx` | Loading skeleton |
| `DarkModeToggle.tsx` | Sun/moon toggle |
| `LanguageSelector.tsx` | Locale selector |

## Styling system

Layered CSS, cascade order matters:
1. `src/index.css` — **design tokens** in `:root` and `.dark` (HSL colors, spacing `--s-1..--s-10`, radii, shadows, fonts, safe areas)
2. `src/styles/kit.css` — base component layout (pre-Tailwind)
3. `src/styles/kit-extra.css`, `kit-v2.css`, `kit-mobile.css`, `kit-mobile-v2.css`, `kit-revisions.css` — feature/legacy overrides
4. `src/styles/kit-overrides.css` — imported **last**, cascades over Tailwind
5. `config/tailwind.config.js` — Tailwind maps colors to HSL vars

Core tokens (light / dark): `--paper` bg `#FAFAF7 / #0E0E0C`, `--ink` text `#111110 / #ECECE6`,
`--line` border `#DEDED7 / #2A2A26`, `--accent` `#C2603A / #D6926B`, plus `--ok / --warn / --err / --info`.
Tailwind: `background`=paper, `foreground`=ink, `primary`=accent, `destructive`=err.

## State

### Contexts (`src/contexts/`)
- `ThemeContext.jsx` — dark mode state + localStorage sync
- `AuthContext.jsx` — token, login/logout
- `WebSocketContext.tsx` — singleton WS, dispatch, reconnect
- `TaskMasterContext.ts` — task board state
- `TasksSettingsContext.jsx` — task settings
- `PluginsContext.tsx` — plugin list/install/enable
- `PermissionContext.tsx` — per-session tool permission grants
- `PaletteOpsContext.tsx` — command palette action registry

### Stores (`src/stores/`)
- `useSessionStore.ts` — Zustand: active session id + metadata

### Hooks (`src/hooks/`)
- `useProjectsState.ts` — projects/sessions/tabs/sidebar (WS + localStorage + nav)
- `useDeviceSettings.ts` — mobile/PWA/breakpoint detection
- `useSessionProtection.ts` — track active/processing sessions
- `useUiPreferences.ts` — sidebar visibility/layout
- `useVersionCheck.ts` — release polling
- `useWebPush.ts` — web push notifications
- `useServerPlatform.ts` — platform vs OSS mode
- `useLocalStorage.jsx` — persisted get/set
- `useGitHubStars.ts` — repo star count
