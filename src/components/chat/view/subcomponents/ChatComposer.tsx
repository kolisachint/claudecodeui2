import { useTranslation } from 'react-i18next';
import type {
  ChangeEvent,
  ClipboardEvent,
  Dispatch,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
  SetStateAction,
  TouchEvent,
} from 'react';
import { useState, useEffect, useRef } from 'react';
import { PaperclipIcon, XIcon, ArrowDownIcon, ChevronDown } from 'lucide-react';

import { getProviderDescriptor } from '../../../../providers/provider-registry';

import type { PendingPermissionRequest, PermissionMode, Provider } from '../../types/types';
import {
  PromptInput,
  PromptInputHeader,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from '../../../../shared/view/ui';

import CommandMenu from './CommandMenu';

import ImageAttachment from './ImageAttachment';
import PermissionRequestsBanner from './PermissionRequestsBanner';
import ThinkingModeSelector from './ThinkingModeSelector';
import TokenUsagePie from './TokenUsagePie';

interface MentionableFile {
  name: string;
  path: string;
}

interface SlashCommand {
  name: string;
  description?: string;
  namespace?: string;
  path?: string;
  type?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ChatComposerProps {
  pendingPermissionRequests: PendingPermissionRequest[];
  handlePermissionDecision: (
    requestIds: string | string[],
    decision: { allow?: boolean; message?: string; rememberEntry?: string | null; updatedInput?: unknown },
  ) => void;
  handleGrantToolPermission: (suggestion: { entry: string; toolName: string }) => { success: boolean };
  isLoading: boolean;
  onAbortSession: () => void;
  provider: Provider | string;
  permissionMode: PermissionMode | string;
  onModeSwitch: () => void;
  thinkingMode: string;
  setThinkingMode: Dispatch<SetStateAction<string>>;
  tokenBudget: { used?: number; total?: number } | null;
  slashCommandsCount: number;
  onToggleCommandMenu: () => void;
  hasInput: boolean;
  onClearInput: () => void;
  isUserScrolledUp: boolean;
  hasMessages: boolean;
  onScrollToBottom: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => void;
  isDragActive: boolean;
  attachedImages: File[];
  onRemoveImage: (index: number) => void;
  uploadingImages: Map<string, number>;
  imageErrors: Map<string, string>;
  showFileDropdown: boolean;
  filteredFiles: MentionableFile[];
  selectedFileIndex: number;
  onSelectFile: (file: MentionableFile) => void;
  filteredCommands: SlashCommand[];
  selectedCommandIndex: number;
  onCommandSelect: (command: SlashCommand, index: number, isHover: boolean) => void;
  onCloseCommandMenu: () => void;
  isCommandMenuOpen: boolean;
  frequentCommands: SlashCommand[];
  getRootProps: (...args: unknown[]) => Record<string, unknown>;
  getInputProps: (...args: unknown[]) => Record<string, unknown>;
  openImagePicker: () => void;
  inputHighlightRef: RefObject<HTMLDivElement>;
  renderInputWithMentions: (text: string) => ReactNode;
  textareaRef: RefObject<HTMLTextAreaElement>;
  input: string;
  onInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onTextareaClick: (event: MouseEvent<HTMLTextAreaElement>) => void;
  onTextareaKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onTextareaPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onTextareaScrollSync: (target: HTMLTextAreaElement) => void;
  onTextareaInput: (event: FormEvent<HTMLTextAreaElement>) => void;
  onInputFocusChange?: (focused: boolean) => void;
  placeholder: string;
  isTextareaExpanded: boolean;
  sendByCtrlEnter?: boolean;
  activeModel: string;
  modelOptions: { value: string; label: string }[];
  onModelChange: (value: string) => void;
  /** Whether the active model supports extended thinking (driven by the live catalog). */
  thinkingAvailable?: boolean;
}

export default function ChatComposer({
  pendingPermissionRequests,
  handlePermissionDecision,
  handleGrantToolPermission,
  isLoading,
  onAbortSession,
  provider,
  permissionMode,
  onModeSwitch,
  thinkingMode,
  setThinkingMode,
  tokenBudget,
  slashCommandsCount,
  onToggleCommandMenu,
  hasInput,
  onClearInput,
  isUserScrolledUp,
  hasMessages,
  onScrollToBottom,
  onSubmit,
  isDragActive,
  attachedImages,
  onRemoveImage,
  uploadingImages,
  imageErrors,
  showFileDropdown,
  filteredFiles,
  selectedFileIndex,
  onSelectFile,
  filteredCommands,
  selectedCommandIndex,
  onCommandSelect,
  onCloseCommandMenu,
  isCommandMenuOpen,
  frequentCommands,
  getRootProps,
  getInputProps,
  openImagePicker,
  inputHighlightRef,
  renderInputWithMentions,
  textareaRef,
  input,
  onInputChange,
  onTextareaClick,
  onTextareaKeyDown,
  onTextareaPaste,
  onTextareaScrollSync,
  onTextareaInput,
  onInputFocusChange,
  placeholder,
  isTextareaExpanded,
  sendByCtrlEnter,
  activeModel,
  modelOptions,
  onModelChange,
  thinkingAvailable = true,
}: ChatComposerProps) {
  const { t } = useTranslation('chat');
  const textareaRect = textareaRef.current?.getBoundingClientRect();

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!modelDropdownOpen) return;
    const handleClick = (e: globalThis.MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [modelDropdownOpen]);
  const providerDesc = getProviderDescriptor(provider as string);
  const currentModelLabel = modelOptions.find(o => o.value === activeModel)?.label || activeModel;
  const commandMenuPosition = {
    top: textareaRect ? Math.max(16, textareaRect.top - 316) : 0,
    left: textareaRect ? textareaRect.left : 16,
    bottom: textareaRect ? window.innerHeight - textareaRect.top + 8 : 90,
  };

  // Detect if the AskUserQuestion interactive panel is active
  const hasQuestionPanel = pendingPermissionRequests.some(
    (r) => r.toolName === 'AskUserQuestion'
  );

  return (
    <div className="composer">
      {pendingPermissionRequests.length > 0 && (
        <div className="mb-3 w-full">
          <PermissionRequestsBanner
            pendingPermissionRequests={pendingPermissionRequests}
            handlePermissionDecision={handlePermissionDecision}
            handleGrantToolPermission={handleGrantToolPermission}
          />
        </div>
      )}

      {!hasQuestionPanel && <div className="relative w-full">
        {isUserScrolledUp && hasMessages && (
          <div className="absolute -top-10 left-0 right-0 z-10 flex justify-center">
            <button
              type="button"
              onClick={onScrollToBottom}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-3)] shadow-sm transition-all duration-200 hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
              title={t('input.scrollToBottom', { defaultValue: 'Scroll to bottom' })}
            >
              <ArrowDownIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        {showFileDropdown && filteredFiles.length > 0 && (
          <div
            role="listbox"
            aria-label={t('input.mentionFile', { defaultValue: 'Mention file' })}
            className="command-menu absolute bottom-full left-0 right-0 z-50 mb-2 max-h-[300px] overflow-y-auto rounded-lg border border-border bg-background p-2 shadow-lg dark:bg-muted"
          >
            {filteredFiles.map((file, index) => {
              const isSelected = index === selectedFileIndex;
              return (
                <div
                  key={file.path}
                  role="option"
                  aria-selected={isSelected}
                  className={`command-item mb-0.5 flex cursor-pointer touch-manipulation items-start rounded-md px-3 py-2 transition-colors ${
                    isSelected ? 'bg-[var(--brand-accent)]/5 dark:bg-[var(--brand-accent)]/10' : 'bg-transparent'
                  }`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onSelectFile(file);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[var(--fs-md)] font-semibold text-foreground">{file.name}</div>
                    <div className="truncate font-mono text-[var(--fs-sm)] text-muted-foreground">{file.path}</div>
                  </div>
                  {isSelected && (
                    <span className="ml-2 shrink-0 text-[var(--fs-sm)] font-semibold text-[var(--brand-accent)]">{'<-'}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <CommandMenu
          commands={filteredCommands}
          selectedIndex={selectedCommandIndex}
          onSelect={onCommandSelect}
          onClose={onCloseCommandMenu}
          position={commandMenuPosition}
          isOpen={isCommandMenuOpen}
          frequentCommands={frequentCommands}
        />

        <PromptInput
          onSubmit={onSubmit as (event: FormEvent<HTMLFormElement>) => void}
          status={isLoading ? 'streaming' : 'ready'}
          className={isTextareaExpanded ? 'chat-input-expanded' : ''}
          {...getRootProps()}
        >
          {isDragActive && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[var(--radius-2)] border border-dashed border-[var(--accent)] bg-[var(--accent-soft)]">
              <div className="rounded-[var(--radius-1)] border border-[var(--line)] bg-[var(--paper)] p-3">
                <p className="text-[var(--fs-md)] font-medium text-[var(--ink)]">Drop images here</p>
              </div>
            </div>
          )}

          {attachedImages.length > 0 && (
            <PromptInputHeader>
              <div className="flex flex-wrap gap-2">
                {attachedImages.map((file, index) => (
                  <ImageAttachment
                    key={index}
                    file={file}
                    onRemove={() => onRemoveImage(index)}
                    uploadProgress={uploadingImages.get(file.name)}
                    error={imageErrors.get(file.name)}
                  />
                ))}
              </div>
            </PromptInputHeader>
          )}

          <input {...getInputProps()} />

          <PromptInputTools>
            <PromptInputButton
              tooltip={{ content: t('input.attachImages') }}
              onClick={openImagePicker}
            >
              <PaperclipIcon size={14} />
            </PromptInputButton>

            <PromptInputButton
              tooltip={{ content: t('input.mentionFile', { defaultValue: 'Mention file' }) }}
              onClick={() => {
                const ta = textareaRef.current;
                if (!ta) return;
                const start = ta.selectionStart ?? input.length;
                const end = ta.selectionEnd ?? input.length;
                const prefix = input.slice(0, start);
                const suffix = input.slice(end);
                const needsSpace = start > 0 && !/\s$/.test(prefix);
                const insertion = `${needsSpace ? ' ' : ''}@`;
                const nextValue = `${prefix}${insertion}${suffix}`;
                const syntheticEvent = {
                  target: { ...ta, value: nextValue },
                  currentTarget: { ...ta, value: nextValue },
                } as unknown as ChangeEvent<HTMLTextAreaElement>;
                onInputChange(syntheticEvent);
                requestAnimationFrame(() => {
                  ta.focus();
                  const caret = prefix.length + insertion.length;
                  try { ta.setSelectionRange(caret, caret); } catch { /* ignore */ }
                });
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)' }}>@</span>
            </PromptInputButton>

            <PromptInputButton
              tooltip={{ content: t('input.showAllCommands') }}
              onClick={onToggleCommandMenu}
              className="relative"
            >
              <span style={{ fontFamily: 'var(--font-mono)' }}>/</span>
            </PromptInputButton>

            <span className="composer-divider" />

            <div className="relative" ref={modelDropdownRef}>
              <button
                type="button"
                className="modelpick-card"
                onClick={() => setModelDropdownOpen(o => !o)}
                title={t('header.modelLabel', { defaultValue: 'Active model' })}
              >
                <span className="modelpick-glyph">{providerDesc?.glyph || '◆'}</span>
                <span className="modelpick-provider">{providerDesc?.label || String(provider)}</span>
                <span style={{ color: 'var(--ink-4)' }}>·</span>
                <span className="modelpick-model">{currentModelLabel}</span>
                <ChevronDown size={11} className="modelpick-chev" />
              </button>
              {modelDropdownOpen && (
                <div className="think-dropdown" style={{ width: 280, left: 0, right: 'auto', bottom: 'calc(100% + 6px)' }}>
                  <div className="modelpick-list">
                    {modelOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`think-option ${option.value === activeModel ? 'active' : ''}`}
                        onClick={() => { onModelChange(option.value); setModelDropdownOpen(false); }}
                      >
                        <div className="think-option-head">
                          <span className="think-option-name">{option.label}</span>
                          {option.value === activeModel && <span className="think-option-active-pill">active</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onModeSwitch}
              className="composer-mode"
              title={t('input.clickToChangeMode')}
            >
              <span className="composer-mode-dot" data-mode={permissionMode} />
              <span className="hidden whitespace-nowrap sm:inline">
                {t(`codex.modes.${permissionMode}`, { defaultValue: permissionMode })}
              </span>
            </button>

            {providerDesc?.supportsThinking && thinkingAvailable && (
              <ThinkingModeSelector selectedMode={thinkingMode} onModeChange={setThinkingMode} onClose={() => {}} className="" variant="pill" />
            )}

            {hasInput && (
              <PromptInputButton
                tooltip={{ content: t('input.clearInput', { defaultValue: 'Clear input' }) }}
                onClick={onClearInput}
              >
                <XIcon />
              </PromptInputButton>
            )}

            <span className="composer-spacer" />

            <TokenUsagePie used={tokenBudget?.used || 0} total={tokenBudget?.total || parseInt(import.meta.env.VITE_CONTEXT_WINDOW) || 160000} />
          </PromptInputTools>

          <PromptInputBody>
            <div ref={inputHighlightRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--radius-2)]">
              <div className="chat-input-placeholder block w-full whitespace-pre-wrap break-words px-[var(--s-3)] py-[var(--s-3)] text-transparent">
                {renderInputWithMentions(input)}
              </div>
            </div>

            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={onInputChange}
              onClick={onTextareaClick}
              onKeyDown={onTextareaKeyDown}
              onPaste={onTextareaPaste}
              onScroll={(event) => onTextareaScrollSync(event.target as HTMLTextAreaElement)}
              onFocus={() => onInputFocusChange?.(true)}
              onBlur={() => onInputFocusChange?.(false)}
              onInput={onTextareaInput}
              placeholder={placeholder}
              rows={2}
            />
          </PromptInputBody>

          <PromptInputFooter>
            <span className="composer-hint">
              {sendByCtrlEnter ? t('input.hintText.ctrlEnter') : t('input.hintText.enter')}
            </span>
            <PromptInputSubmit
              disabled={!input.trim() && !isLoading}
              label={t('input.send', { defaultValue: 'Send' })}
              stopLabel={t('input.stop', { defaultValue: 'Stop' })}
              onMouseDown={(event) => {
                event.preventDefault();
                if (isLoading) {
                  onAbortSession();
                } else {
                  onSubmit(event as unknown as MouseEvent<HTMLButtonElement>);
                }
              }}
              onTouchStart={(event) => {
                event.preventDefault();
                if (isLoading) {
                  onAbortSession();
                } else {
                  onSubmit(event as unknown as TouchEvent<HTMLButtonElement>);
                }
              }}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>}
    </div>
  );
}
