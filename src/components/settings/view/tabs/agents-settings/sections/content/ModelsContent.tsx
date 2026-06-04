import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CLAUDE_MODELS, HOOCODE_MODELS } from '../../../../../../../../shared/modelConstants';
import type { AgentProvider } from '../../../../../types/types';

const MODEL_CATALOG: Record<string, { value: string; label: string }[]> = {
  claude: CLAUDE_MODELS.OPTIONS,
  hoocode: HOOCODE_MODELS.OPTIONS,
};

const DEFAULT_MODEL: Record<string, string> = {
  claude: CLAUDE_MODELS.DEFAULT,
  hoocode: HOOCODE_MODELS.DEFAULT,
};

const STORAGE_KEY: Record<string, string> = {
  claude: 'claude-model',
  hoocode: 'hoocode-model',
};

const THINKING_BUDGETS = [
  { id: 'auto', name: 'Auto' },
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
];

type ModelsContentProps = {
  agent: AgentProvider;
};

export default function ModelsContent({ agent }: ModelsContentProps) {
  const { t } = useTranslation('settings');
  const storageKey = STORAGE_KEY[agent];
  const catalog = MODEL_CATALOG[agent];
  const defaultModel = DEFAULT_MODEL[agent];

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    if (typeof window === 'undefined' || !storageKey) return defaultModel || '';
    return localStorage.getItem(storageKey) || defaultModel || '';
  });
  const [thinkingBudget, setThinkingBudget] = useState('auto');

  // Keep in sync if localStorage changes externally
  useEffect(() => {
    if (!storageKey) return;
    const sync = () => {
      setSelectedModel(localStorage.getItem(storageKey) || defaultModel || '');
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [storageKey, defaultModel]);

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    if (storageKey) {
      localStorage.setItem(storageKey, value);
      // Dispatch custom event so the composer model pickers pick it up
      window.dispatchEvent(new Event('model-changed'));
    }
  };

  // Only show for agents with a known catalog
  if (!catalog) {
    return (
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('models.title')}</div>
          <div className="settings-section-desc">{t('models.notAvailableForAgent', { agent })}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('models.title')}</div>
        </div>
        <div className="settings-section-body">
          <div className="settings-row">
            <div className="settings-row-text">
              <div className="settings-row-label">{t('models.defaultModel')}</div>
            </div>
            <div className="settings-row-ctrl">
              <select
                className="composer-model"
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
              >
                {catalog.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-text">
              <div className="settings-row-label">{t('models.thinkingBudget')}</div>
              <div className="settings-row-hint">{t('models.thinkingBudgetHint')}</div>
            </div>
            <div className="settings-row-ctrl">
              <select
                className="composer-model"
                value={thinkingBudget}
                onChange={(e) => setThinkingBudget(e.target.value)}
              >
                {THINKING_BUDGETS.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
