import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DEFAULT_PROVIDER, VISIBLE_PROVIDERS, VISIBLE_PROVIDER_IDS } from '../../providers/provider-registry';
import type { LLMProvider } from '../../types/app';

// Selectable CLIs are the visible (non-retired) providers, in registry order.
const CLI_OPTIONS = VISIBLE_PROVIDERS.map((descriptor) => ({
  id: descriptor.id,
  name: descriptor.displayName,
  vendor: descriptor.vendor,
  glyph: descriptor.glyph,
  desc: descriptor.description,
}));

type CliSelectionProps = {
  /** Called when user continues with a provider. Defaults to setting localStorage + navigating to chat. */
  onPick?: (provider: LLMProvider) => void;
  /** Optional override for the Skip button. When omitted, falls back to writing localStorage + navigating home. */
  onSkip?: () => void;
};

const readPersistedProvider = (): LLMProvider => {
  try {
    const stored = localStorage.getItem('selected-provider') as LLMProvider | null;
    // Only honor a persisted choice that is still offered; a previously selected
    // but now-retired provider falls back to the default (first-class) one.
    if (stored && VISIBLE_PROVIDER_IDS.includes(stored)) return stored;
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_PROVIDER;
};

export default function CliSelection({ onPick, onSkip }: CliSelectionProps) {
  const [picked, setPicked] = useState<LLMProvider>(readPersistedProvider);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (onPick) {
      onPick(picked);
      return;
    }

    try {
      localStorage.setItem('selected-provider', picked);
    } catch {
      // Silently ignore — localStorage may be unavailable
    }

    navigate('/');
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      return;
    }

    try {
      localStorage.setItem('selected-provider', DEFAULT_PROVIDER);
    } catch {
      // Silently ignore — localStorage may be unavailable
    }

    navigate('/');
  };

  const pickedName = CLI_OPTIONS.find((c) => c.id === picked)?.name ?? '';

  return (
    <section className="cli-select">
      <div className="cli-head">
        <div className="cli-eyebrow">Coding agent</div>
        <div className="cli-title">Pick a CLI.</div>
        <div className="cli-sub">
          You can switch later. Sessions live in your project&apos;s working directory regardless.
        </div>
      </div>

      <div className="cli-grid">
        {CLI_OPTIONS.map((cli) => (
          <button
            key={cli.id}
            type="button"
            className={`cli-card ${picked === cli.id ? 'picked' : ''}`}
            onClick={() => setPicked(cli.id)}
          >
            <div className="cli-glyph">{cli.glyph}</div>
            <div className="cli-name">{cli.name}</div>
            <div className="cli-vendor">{cli.vendor}</div>
            <div className="cli-desc">{cli.desc}</div>
            <div className="cli-mark">{picked === cli.id ? '✓ selected' : 'select'}</div>
          </button>
        ))}
      </div>

      <div className="cli-foot">
        <button type="button" className="btn btn-ghost" onClick={handleSkip}>
          Skip
        </button>
        <button type="button" className="btn btn-accent" onClick={handleContinue}>
          Continue with {pickedName} →
        </button>
      </div>
    </section>
  );
}
