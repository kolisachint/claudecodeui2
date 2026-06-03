import { Settings, Sparkles, PanelLeftOpen, Bug } from 'lucide-react';
import type { TFunction } from 'i18next';

const DISCORD_INVITE_URL = 'https://discord.gg/buxwujPNRE';
const GITHUB_ISSUES_URL = 'https://github.com/kolisachint/hoocowork/issues/new';

type SidebarCollapsedProps = {
  onExpand: () => void;
  onShowSettings: () => void;
  updateAvailable: boolean;
  onShowVersionModal: () => void;
  t: TFunction;
};

export default function SidebarCollapsed({
  onExpand,
  onShowSettings,
  updateAvailable,
  onShowVersionModal,
  t,
}: SidebarCollapsedProps) {
  return (
    <div className="flex h-full w-12 flex-col items-center gap-1 py-3" style={{ background: 'var(--paper)' }}>
      {/* Expand button with brand logo */}
      <button
        onClick={onExpand}
        className="group flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--paper-3)]"
        aria-label={t('common:versionUpdate.ariaLabels.showSidebar')}
        title={t('common:versionUpdate.ariaLabels.showSidebar')}
      >
        <PanelLeftOpen className="h-4 w-4 transition-colors group-hover:text-foreground" style={{ color: 'var(--ink-3)' }} />
      </button>

      <div className="nav-divider my-1 w-6" />

      {/* Settings */}
      <button
        onClick={onShowSettings}
        className="group flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--paper-3)]"
        aria-label={t('actions.settings')}
        title={t('actions.settings')}
      >
        <Settings className="h-4 w-4 transition-colors group-hover:text-foreground" style={{ color: 'var(--ink-3)' }} />
      </button>

      {/* Report Issue */}
      <a
        href={GITHUB_ISSUES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--paper-3)]"
        aria-label={t('actions.reportIssue')}
        title={t('actions.reportIssue')}
      >
        <Bug className="h-4 w-4 transition-colors group-hover:text-foreground" style={{ color: 'var(--ink-3)' }} />
      </a>

      {/* Discord */}
      <a
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--paper-3)]"
        aria-label={t('actions.joinCommunity')}
        title={t('actions.joinCommunity')}
      >
        <span className="font-mono text-[10px] transition-colors group-hover:text-foreground" style={{ color: 'var(--ink-3)' }} aria-hidden="true">DC</span>
      </a>

      {/* Update indicator */}
      {updateAvailable && (
        <button
          onClick={onShowVersionModal}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--paper-3)]"
          aria-label={t('common:versionUpdate.ariaLabels.updateAvailable')}
          title={t('common:versionUpdate.ariaLabels.updateAvailable')}
        >
          <Sparkles className="h-4 w-4 text-[var(--brand-accent)]" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--brand-accent)]" />
        </button>
      )}
    </div>
  );
}
