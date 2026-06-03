import { useState } from 'react';
import { AlertTriangle, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../../../../../../lib/utils';

export const COMMON_CLAUDE_TOOLS = [
  'Bash(git log:*)',
  'Bash(git diff:*)',
  'Bash(git status:*)',
  'Write',
  'Read',
  'Edit',
  'Glob',
  'Grep',
  'MultiEdit',
  'Task',
  'TodoWrite',
  'TodoRead',
  'WebFetch',
  'WebSearch',
];

export const COMMON_CURSOR_COMMANDS = [
  'Shell(ls)',
  'Shell(mkdir)',
  'Shell(cd)',
  'Shell(cat)',
  'Shell(echo)',
  'Shell(git status)',
  'Shell(git diff)',
  'Shell(git log)',
  'Shell(npm install)',
  'Shell(npm run)',
  'Shell(python)',
  'Shell(node)',
];

export const addUnique = (items: string[], value: string): string[] => {
  const normalizedValue = value.trim();
  if (!normalizedValue || items.includes(normalizedValue)) {
    return items;
  }

  return [...items, normalizedValue];
};

export const removeValue = (items: string[], value: string): string[] => (
  items.filter((item) => item !== value)
);

export type SkipPermissionsRowProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
};

export function SkipPermissionsRow({ checked, onChange, label, description }: SkipPermissionsRowProps) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-label">{label}</div>
        <div className="settings-row-hint text-[var(--warn)]">{description}</div>
      </div>
      <div className="settings-row-ctrl">
        <label className="toggle">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="toggle-track"><span className="toggle-thumb" /></span>
        </label>
      </div>
    </div>
  );
}

export type ListEditorProps = {
  title: string;
  description: string;
  placeholder: string;
  emptyLabel: string;
  tone: 'ok' | 'err';
  items: string[];
  onItemsChange: (next: string[]) => void;
  quickAdd?: { label: string; values: string[] };
};

export function ListEditor({
  title,
  description,
  placeholder,
  emptyLabel,
  tone,
  items,
  onItemsChange,
  quickAdd,
}: ListEditorProps) {
  const { t } = useTranslation('settings');
  const [draft, setDraft] = useState('');

  const handleAdd = (value: string) => {
    const next = addUnique(items, value);
    if (next.length === items.length) {
      return;
    }
    onItemsChange(next);
    setDraft('');
  };

  const toneClasses = tone === 'ok'
    ? 'border-[var(--ok)]/30 bg-[var(--ok-soft)] text-[var(--ok)]'
    : 'border-[var(--err)]/30 bg-[var(--err-soft)] text-[var(--err)]';
  const toneInk = tone === 'ok' ? 'text-[var(--ok)]' : 'text-[var(--err)]';

  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{title}</div>
        <div className="settings-section-desc">{description}</div>
      </div>
      <div className="settings-section-body">
        <div className="settings-row">
          <div className="settings-row-text w-full">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input flex-1"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAdd(draft);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => handleAdd(draft)}
                disabled={!draft.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('permissions.actions.add')}</span>
              </button>
            </div>
            {quickAdd && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="settings-row-hint">{quickAdd.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {quickAdd.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => handleAdd(value)}
                      disabled={items.includes(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-3 flex flex-col gap-1.5">
              {items.length === 0 ? (
                <div className="settings-row-hint">{emptyLabel}</div>
              ) : (
                items.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-[var(--radius-1)] border px-3 py-2',
                      toneClasses,
                    )}
                  >
                    <span className={cn('font-mono text-[var(--fs-sm)]', toneInk)}>{item}</span>
                    <button
                      type="button"
                      className="btn btn-icon btn-ghost"
                      onClick={() => onItemsChange(removeValue(items, item))}
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type ExamplesProps = {
  title: string;
  items: { code: string; description: string }[];
};

export function ExamplesPanel({ title, items }: ExamplesProps) {
  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{title}</div>
      </div>
      <div className="settings-section-body">
        <div className="settings-row">
          <div className="settings-row-text w-full">
            <ul className="flex flex-col gap-1.5 text-[var(--fs-sm)] text-[var(--ink-3)]">
              {items.map((item) => (
                <li key={item.code} className="flex flex-wrap items-center gap-2">
                  <code className="rounded-[var(--radius-1)] bg-[var(--paper-3)] px-1.5 py-0.5 font-mono text-[var(--fs-xs)] text-[var(--ink)]">
                    {item.code}
                  </code>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export type RadioModeOption<TValue extends string> = {
  value: TValue;
  title: string;
  description: string;
  tone: 'neutral' | 'ok' | 'warn';
  warningIcon?: boolean;
};

export type RadioModeSectionProps<TValue extends string> = {
  name: string;
  title: string;
  description: string;
  value: TValue;
  onChange: (next: TValue) => void;
  options: RadioModeOption<TValue>[];
};

export function RadioModeSection<TValue extends string>({
  name,
  title,
  description,
  value,
  onChange,
  options,
}: RadioModeSectionProps<TValue>) {
  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{title}</div>
        <div className="settings-section-desc">{description}</div>
      </div>
      <div className="settings-section-body">
        <div style={{ padding: 'var(--s-3)' }}>
          <div className="permissions-grid" role="radiogroup" aria-label={title}>
            {options.map((option) => {
              const isActive = value === option.value;
              const dotTone = option.tone === 'ok'
                ? 'dot-ok'
                : option.tone === 'warn'
                  ? 'dot-warn'
                  : 'dot-off';
              const descTone = option.tone === 'ok'
                ? 'text-[var(--ok)]'
                : option.tone === 'warn'
                  ? 'text-[var(--warn)]'
                  : '';
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  name={name}
                  onClick={() => onChange(option.value)}
                  className={cn('permission-mode-card', isActive && 'active')}
                >
                  <div className="permission-mode-card-head">
                    <span className={cn('status-dot', dotTone)} />
                    <span className="permission-mode-card-name">{option.title}</span>
                    {option.warningIcon && <AlertTriangle className="h-3.5 w-3.5 text-[var(--warn)]" />}
                  </div>
                  <div className={cn('permission-mode-card-desc', descTone)}>{option.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simplified tool toggles for design-matched UI
export const SIMPLIFIED_TOOLS = [
  { key: 'Bash', label: 'Bash', desc: 'Run shell commands in your project' },
  { key: 'Edit', label: 'Edit', desc: 'Modify files in your project' },
  { key: 'Write', label: 'Write', desc: 'Create new files' },
  { key: 'Read', label: 'Read', desc: 'Read file contents' },
  { key: 'WebFetch', label: 'WebFetch', desc: 'Fetch URLs and render HTML' },
  { key: 'WebSearch', label: 'WebSearch', desc: 'Search the public web' },
] as const;

export type ToolToggleRowProps = {
  tool: typeof SIMPLIFIED_TOOLS[number];
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToolToggleRow({ tool, checked, onChange }: ToolToggleRowProps) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-label">{tool.label}</div>
        <div className="settings-row-hint">{tool.desc}</div>
      </div>
      <div className="settings-row-ctrl">
        <label className="toggle">
          <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
          <span className="toggle-track"><span className="toggle-thumb" /></span>
        </label>
      </div>
    </div>
  );
}
