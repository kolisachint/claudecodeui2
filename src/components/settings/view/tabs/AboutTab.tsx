import { useTranslation } from 'react-i18next';

import { useVersionCheck } from '../../../../hooks/useVersionCheck';

const GITHUB_REPO_URL = 'https://github.com/kolisachint/hoocowork';
const DISCORD_URL = 'https://discord.gg/buxwujPNRE';
const DOCS_URL = 'https://hoocowork.app/docs/plugin-overview';
const HOOCOWORK_URL = 'https://hoocowork.app';

// Settings section component matching the design pattern
function SettingsSection({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{title}</div>
        {desc && <div className="settings-section-desc">{desc}</div>}
      </div>
      <div className="settings-section-body">{children}</div>
    </div>
  );
}

// Settings row component matching the design pattern
function SettingsRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-label">{label}</div>
        {hint && <div className="settings-row-hint">{hint}</div>}
      </div>
      <div className="settings-row-ctrl">{children}</div>
    </div>
  );
}

export default function AboutTab() {
  const { t } = useTranslation('settings');
  const { updateAvailable, latestVersion, currentVersion } = useVersionCheck('kolisachint', 'hoocowork');

  return (
    <>
      <div className="settings-h1">{t('mainTabs.about')}</div>
      <div className="settings-sub">Version, license, and credits.</div>

      {/* Version Section */}
      <SettingsSection title="Version">
        <SettingsRow label="HooCowork" hint={updateAvailable && latestVersion ? `Update available: v${latestVersion}` : `v${currentVersion}`}>
          {updateAvailable && latestVersion ? (
            <a
              href={`${GITHUB_REPO_URL}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              Update
            </a>
          ) : (
            <span className="badge badge-ok">Up to date</span>
          )}
        </SettingsRow>
      </SettingsSection>

      {/* Links Section */}
      <SettingsSection title="Links">
        <div className="settings-row">
          <div className="settings-row-text">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--accent)' }}
            >
              <span className="font-mono text-xs" aria-hidden="true">GH</span>
              GitHub
            </a>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--accent)' }}
            >
              <span className="font-mono text-xs" aria-hidden="true">DC</span>
              Discord
            </a>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--accent)' }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documentation
            </a>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <a
              href={HOOCOWORK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--accent)' }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Website
            </a>
          </div>
        </div>
      </SettingsSection>

      {/* License Section */}
      <SettingsSection title="License">
        <div className="about-license">
          AGPL-3.0-or-later. If you modify HooCowork and run it as a network service, you must make the modified source available to users of that service.{' '}
          <a
            href={`${GITHUB_REPO_URL}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: 'var(--accent)' }}
          >
            View license
          </a>
          .
        </div>
      </SettingsSection>
    </>
  );
}
