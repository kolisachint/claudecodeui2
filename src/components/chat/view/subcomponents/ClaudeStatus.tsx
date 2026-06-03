import { useEffect, useState } from 'react';

import SessionProviderLogo from '../../../llm-logo-provider/SessionProviderLogo';

type ClaudeStatusProps = {
  status: {
    text?: string;
    tokens?: number;
    can_interrupt?: boolean;
  } | null;
  onAbort?: () => void;
  isLoading: boolean;
  provider?: string;
};

export default function ClaudeStatus({
  status,
  onAbort,
  isLoading,
  provider = 'claude',
}: ClaudeStatusProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 mb-3 w-full duration-500">
      <div className="claude-status mx-auto flex max-w-4xl items-center justify-between gap-3 overflow-hidden rounded-full border border-border/50 bg-muted px-3 py-1.5 shadow-sm backdrop-blur-md dark:bg-[var(--paper)]">
        {/* Provider mark + optional elapsed time */}
        <div className="flex items-center gap-2">
          <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
            <SessionProviderLogo provider={provider} className="h-4 w-4" />
            <span className="absolute inset-0 animate-pulse rounded-full ring-1 ring-[var(--ok)]/30" />
          </div>
          {elapsed > 0 && (
            <span className="text-[var(--fs-xs)] tabular-nums text-muted-foreground">
              {elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`}
            </span>
          )}
        </div>

        {/* Stop */}
        {status?.can_interrupt !== false && onAbort && (
          <button
            type="button"
            onClick={onAbort}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
            title="Stop generation (Esc)"
          >
            <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
