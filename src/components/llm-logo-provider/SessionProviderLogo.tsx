import { getProviderDescriptor } from '../../providers/provider-registry';
import { useState, useEffect } from 'react';

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false,
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/**
 * HooCode compact mark — icon-mono.svg for tight spaces (sidebar, picker, status).
 * The "h" monogram with cyan dot reads clearly at 12–20 px.
 */
function HooCodeCompactIcon({ className }: { className?: string }) {
  const isDark = useIsDark();
  const src = isDark ? '/icon-mono.svg' : '/icon-mono-light.svg';
  return (
    <img
      src={src}
      alt="HooCode"
      className={className}
      style={{ display: 'block' }}
    />
  );
}

type SessionProviderLogoProps = {
  provider?: string;
  className?: string;
};

export default function SessionProviderLogo({
  provider = 'claude',
  className = 'w-5 h-5',
}: SessionProviderLogoProps) {
  const descriptor = getProviderDescriptor(provider);

  if (provider === 'hoocode') {
    return <HooCodeCompactIcon className={className} />;
  }

  const glyph = descriptor?.glyph ?? '◆';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'inherit',
        lineHeight: 1,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      }}
      title={descriptor?.displayName ?? provider}
      aria-hidden="true"
    >
      {glyph}
    </span>
  );
}
