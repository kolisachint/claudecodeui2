type TokenUsagePieProps = {
  used: number;
  total: number;
};

export default function TokenUsagePie({ used, total }: TokenUsagePieProps) {
  if (used == null || total == null || total <= 0) return null;

  const pct = Math.min(1, used / total);
  const c = 7;
  const r = 6;
  const circumference = 2 * Math.PI * r;

  const color = pct > 0.85 ? 'var(--err)' : pct > 0.6 ? 'var(--warn)' : 'var(--accent)';

  return (
    <span className="composer-tokens" title={`${used.toLocaleString()} / ${total.toLocaleString()} tokens`}>
      <svg width="14" height="14" viewBox="0 0 14 14" style={{ verticalAlign: 'middle' }}>
        <circle
          cx={c}
          cy={c}
          r={r}
          stroke="var(--line)"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx={c}
          cy={c}
          r={r}
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeDasharray={`${circumference * pct} ${circumference}`}
          transform={`rotate(-90 ${c} ${c})`}
        />
      </svg>
      {Math.round(pct * 100)}%
    </span>
  );
};
