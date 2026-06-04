import { useTranslation } from 'react-i18next';

import { thinkingModes } from '../../../../../../chat/constants/thinkingModes';
import type { AgentProvider } from '../../../../../types/types';

type ThinkingModeContentProps = {
  agent: AgentProvider;
  selectedMode: string;
  onChange: (mode: string) => void;
};

export default function ThinkingModeContent({ agent, selectedMode, onChange }: ThinkingModeContentProps) {
  const { t } = useTranslation('settings');

  // Only show for Claude and Hoocode initially - other agents can be added later
  if (agent !== 'claude' && agent !== 'hoocode') {
    return (
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('thinking.title')}</div>
          <div className="settings-section-desc">{t('thinking.notAvailableForAgent', { agent })}</div>
        </div>
      </div>
    );
  }

  const modeKeyMap: Record<string, string> = {
    'think-hard': 'thinkHard',
    'think-harder': 'thinkHarder',
  };

  const translatedModes = thinkingModes.map((mode) => {
    const modeKey = modeKeyMap[mode.id] || mode.id;
    return {
      ...mode,
      name: t(`chat:thinkingMode.modes.${modeKey}.name`, { defaultValue: mode.name }),
      description: t(`chat:thinkingMode.modes.${modeKey}.description`, { defaultValue: mode.description }),
    };
  });

  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{t('thinking.title')}</div>
        <div className="settings-section-desc">{t('thinking.description')}</div>
      </div>
      <div className="settings-section-body">
        <div className="permissions-grid" role="radiogroup" aria-label={t('thinking.title')}>
          {translatedModes.map((mode) => {
            const isActive = selectedMode === mode.id;
            const IconComponent = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onChange(mode.id)}
                className={`permission-mode-card ${isActive ? 'active' : ''}`}
              >
                <div className="permission-mode-card-head">
                  {IconComponent && (
                    <span className={mode.color}>
                      <IconComponent className="h-4 w-4" />
                    </span>
                  )}
                  <span className="permission-mode-card-name">{mode.name}</span>
                  {isActive && (
                    <span className="think-option-active-pill ml-auto text-[var(--fs-xs)]">
                      {t('thinking.active')}
                    </span>
                  )}
                </div>
                <div className="permission-mode-card-desc">{mode.description}</div>
                {mode.prefix && (
                  <code className="mt-1 inline-block rounded bg-[var(--paper-3)] px-1.5 py-0.5 font-mono text-[var(--fs-xs)] text-[var(--ink-3)]">
                    {mode.prefix}
                  </code>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
