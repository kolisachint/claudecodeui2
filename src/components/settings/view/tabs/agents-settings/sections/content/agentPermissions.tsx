import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CodexPermissionMode, GeminiPermissionMode } from '../../../../../types/types';

import {
  SkipPermissionsRow,
  ListEditor,
  ExamplesPanel,
  RadioModeSection,
  ToolToggleRow,
  COMMON_CLAUDE_TOOLS,
  COMMON_CURSOR_COMMANDS,
  SIMPLIFIED_TOOLS,
  addUnique,
  removeValue,
} from './permissionsPrimitives';

export type ClaudePermissionsProps = {
  agent: 'claude';
  skipPermissions: boolean;
  onSkipPermissionsChange: (value: boolean) => void;
  allowedTools: string[];
  onAllowedToolsChange: (value: string[]) => void;
  disallowedTools: string[];
  onDisallowedToolsChange: (value: string[]) => void;
};

export function ClaudePermissions({
  skipPermissions,
  onSkipPermissionsChange,
  allowedTools,
  onAllowedToolsChange,
  disallowedTools,
  onDisallowedToolsChange,
}: Omit<ClaudePermissionsProps, 'agent'>) {
  const { t } = useTranslation('settings');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Helper to check if a simplified tool is allowed
  const isToolAllowed = (toolKey: string) => allowedTools.includes(toolKey);

  // Toggle a simplified tool in allowedTools
  const toggleTool = (toolKey: string, checked: boolean) => {
    if (checked) {
      onAllowedToolsChange(addUnique(allowedTools, toolKey));
    } else {
      onAllowedToolsChange(removeValue(allowedTools, toolKey));
    }
  };

  // Revoke all approvals
  const handleRevokeAll = () => {
    onAllowedToolsChange([]);
    onDisallowedToolsChange([]);
    onSkipPermissionsChange(false);
  };

  return (
    <>
      {/* Tool permissions section - design style */}
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('permissions.toolPermissions.title')}</div>
          <div className="settings-section-desc">{t('permissions.toolPermissions.desc')}</div>
        </div>
        <div className="settings-section-body">
          {SIMPLIFIED_TOOLS.map((tool) => (
            <ToolToggleRow
              key={tool.key}
              tool={tool}
              checked={isToolAllowed(tool.key)}
              onChange={(checked) => toggleTool(tool.key, checked)}
            />
          ))}
        </div>
        {/* Panic button - design style */}
        <div className="settings-panic">
          <button type="button" className="btn btn-sm btn-danger" onClick={handleRevokeAll}>
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t('permissions.revokeAll')}</span>
          </button>
        </div>
      </div>

      {/* Skip permissions toggle */}
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('permissions.title')}</div>
        </div>
        <div className="settings-section-body">
          <SkipPermissionsRow
            checked={skipPermissions}
            onChange={onSkipPermissionsChange}
            label={t('permissions.skipPermissions.label')}
            description={t('permissions.skipPermissions.claudeDescription')}
          />
        </div>
      </div>

      {/* Advanced section */}
      <details className="settings-section" open={showAdvanced}>
        <summary
          className="settings-section-head cursor-pointer"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <div className="settings-section-title">{t('permissions.advanced.title')}</div>
          <div className="settings-section-desc">{t('permissions.advanced.desc')}</div>
        </summary>
        <div className="settings-section-body">
          <ListEditor
            title={t('permissions.allowedTools.title')}
            description={t('permissions.allowedTools.description')}
            placeholder={t('permissions.allowedTools.placeholder')}
            emptyLabel={t('permissions.allowedTools.empty')}
            tone="ok"
            items={allowedTools}
            onItemsChange={onAllowedToolsChange}
            quickAdd={{ label: t('permissions.allowedTools.quickAdd'), values: COMMON_CLAUDE_TOOLS }}
          />

          <ListEditor
            title={t('permissions.blockedTools.title')}
            description={t('permissions.blockedTools.description')}
            placeholder={t('permissions.blockedTools.placeholder')}
            emptyLabel={t('permissions.blockedTools.empty')}
            tone="err"
            items={disallowedTools}
            onItemsChange={onDisallowedToolsChange}
          />

          <ExamplesPanel
            title={t('permissions.toolExamples.title')}
            items={[
              { code: '"Bash(git log:*)"', description: t('permissions.toolExamples.bashGitLog') },
              { code: '"Bash(git diff:*)"', description: t('permissions.toolExamples.bashGitDiff') },
              { code: '"Write"', description: t('permissions.toolExamples.write') },
              { code: '"Bash(rm:*)"', description: t('permissions.toolExamples.bashRm') },
            ]}
          />
        </div>
      </details>
    </>
  );
}

export type CursorPermissionsProps = {
  agent: 'cursor';
  skipPermissions: boolean;
  onSkipPermissionsChange: (value: boolean) => void;
  allowedCommands: string[];
  onAllowedCommandsChange: (value: string[]) => void;
  disallowedCommands: string[];
  onDisallowedCommandsChange: (value: string[]) => void;
};

export function CursorPermissions({
  skipPermissions,
  onSkipPermissionsChange,
  allowedCommands,
  onAllowedCommandsChange,
  disallowedCommands,
  onDisallowedCommandsChange,
}: Omit<CursorPermissionsProps, 'agent'>) {
  const { t } = useTranslation('settings');

  return (
    <>
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('permissions.title')}</div>
        </div>
        <div className="settings-section-body">
          <SkipPermissionsRow
            checked={skipPermissions}
            onChange={onSkipPermissionsChange}
            label={t('permissions.skipPermissions.label')}
            description={t('permissions.skipPermissions.cursorDescription')}
          />
        </div>
      </div>

      <ListEditor
        title={t('permissions.allowedCommands.title')}
        description={t('permissions.allowedCommands.description')}
        placeholder={t('permissions.allowedCommands.placeholder')}
        emptyLabel={t('permissions.allowedCommands.empty')}
        tone="ok"
        items={allowedCommands}
        onItemsChange={onAllowedCommandsChange}
        quickAdd={{ label: t('permissions.allowedCommands.quickAdd'), values: COMMON_CURSOR_COMMANDS }}
      />

      <ListEditor
        title={t('permissions.blockedCommands.title')}
        description={t('permissions.blockedCommands.description')}
        placeholder={t('permissions.blockedCommands.placeholder')}
        emptyLabel={t('permissions.blockedCommands.empty')}
        tone="err"
        items={disallowedCommands}
        onItemsChange={onDisallowedCommandsChange}
      />

      <ExamplesPanel
        title={t('permissions.shellExamples.title')}
        items={[
          { code: '"Shell(ls)"', description: t('permissions.shellExamples.ls') },
          { code: '"Shell(git status)"', description: t('permissions.shellExamples.gitStatus') },
          { code: '"Shell(npm install)"', description: t('permissions.shellExamples.npmInstall') },
          { code: '"Shell(rm -rf)"', description: t('permissions.shellExamples.rmRf') },
        ]}
      />
    </>
  );
}

export type CodexPermissionsProps = {
  agent: 'codex';
  permissionMode: CodexPermissionMode;
  onPermissionModeChange: (value: CodexPermissionMode) => void;
};

export function CodexPermissions({ permissionMode, onPermissionModeChange }: Omit<CodexPermissionsProps, 'agent'>) {
  const { t } = useTranslation('settings');

  return (
    <>
      <RadioModeSection<CodexPermissionMode>
        name="codexPermissionMode"
        title={t('permissions.codex.permissionMode')}
        description={t('permissions.codex.description')}
        value={permissionMode}
        onChange={onPermissionModeChange}
        options={[
          {
            value: 'default',
            title: t('permissions.codex.modes.default.title'),
            description: t('permissions.codex.modes.default.description'),
            tone: 'neutral',
          },
          {
            value: 'acceptEdits',
            title: t('permissions.codex.modes.acceptEdits.title'),
            description: t('permissions.codex.modes.acceptEdits.description'),
            tone: 'ok',
          },
          {
            value: 'bypassPermissions',
            title: t('permissions.codex.modes.bypassPermissions.title'),
            description: t('permissions.codex.modes.bypassPermissions.description'),
            tone: 'warn',
            warningIcon: true,
          },
        ]}
      />

      <details className="text-[var(--fs-sm)]">
        <summary className="cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)]">
          {t('permissions.codex.technicalDetails')}
        </summary>
        <div className="mt-2 flex flex-col gap-2 rounded-[var(--radius-2)] border border-[var(--line)] bg-[var(--paper-2)] p-3 text-[var(--fs-xs)] text-[var(--ink-3)]">
          <p><strong>{t('permissions.codex.modes.default.title')}:</strong> {t('permissions.codex.technicalInfo.default')}</p>
          <p><strong>{t('permissions.codex.modes.acceptEdits.title')}:</strong> {t('permissions.codex.technicalInfo.acceptEdits')}</p>
          <p><strong>{t('permissions.codex.modes.bypassPermissions.title')}:</strong> {t('permissions.codex.technicalInfo.bypassPermissions')}</p>
          <p className="opacity-75">{t('permissions.codex.technicalInfo.overrideNote')}</p>
        </div>
      </details>
    </>
  );
}

export type GeminiPermissionsProps = {
  agent: 'gemini';
  permissionMode: GeminiPermissionMode;
  onPermissionModeChange: (value: GeminiPermissionMode) => void;
};

export function GeminiPermissions({ permissionMode, onPermissionModeChange }: Omit<GeminiPermissionsProps, 'agent'>) {
  const { t } = useTranslation(['settings', 'chat']);

  return (
    <RadioModeSection<GeminiPermissionMode>
      name="geminiPermissionMode"
      title={t('gemini.permissionMode')}
      description={t('gemini.description')}
      value={permissionMode}
      onChange={onPermissionModeChange}
      options={[
        {
          value: 'default',
          title: t('gemini.modes.default.title'),
          description: t('gemini.modes.default.description'),
          tone: 'neutral',
        },
        {
          value: 'auto_edit',
          title: t('gemini.modes.autoEdit.title'),
          description: t('gemini.modes.autoEdit.description'),
          tone: 'ok',
        },
        {
          value: 'yolo',
          title: t('gemini.modes.yolo.title'),
          description: t('gemini.modes.yolo.description'),
          tone: 'warn',
          warningIcon: true,
        },
      ]}
    />
  );
}
