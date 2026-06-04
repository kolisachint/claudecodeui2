import { useState, useRef, useEffect, useCallback } from 'react';
import { Brain, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { thinkingModes } from '../../constants/thinkingModes';

type ThinkingModeSelectorProps = {
  selectedMode: string;
  onModeChange: (modeId: string) => void;
  onClose?: () => void;
  className?: string;
  variant?: 'icon' | 'pill';
};

function ThinkingModeSelector({ selectedMode, onModeChange, onClose, className = '', variant = 'icon' }: ThinkingModeSelectorProps) {
  const { t } = useTranslation('chat');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mapping from mode ID to translation key
  const modeKeyMap: Record<string, string> = {
    'think-hard': 'thinkHard',
    'think-harder': 'thinkHarder'
  };
  // Create translated modes for display
  const translatedModes = thinkingModes.map(mode => {
    const modeKey = modeKeyMap[mode.id] || mode.id;
    return {
      ...mode,
      name: t(`thinkingMode.modes.${modeKey}.name`),
      description: t(`thinkingMode.modes.${modeKey}.description`),
      prefix: t(`thinkingMode.modes.${modeKey}.prefix`)
    };
  });

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (containerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return;
      }

      closeDropdown();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeDropdown]);

  const currentMode = translatedModes.find(mode => mode.id === selectedMode) || translatedModes[0];
  const IconComponent = currentMode.icon || Brain;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            closeDropdown();
            return;
          }

          setIsOpen(true);
        }}
        className={variant === 'pill'
          ? `composer-think ${selectedMode === 'none' ? 'off' : ''}`
          : `flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 sm:h-10 sm:w-10 ${selectedMode === 'none'
              ? 'bg-[var(--paper-2)] hover:bg-[var(--paper-3)]'
              : 'bg-[var(--brand-accent-soft)] hover:bg-[var(--brand-accent-soft)]'
            }`
        }
        title={t('thinkingMode.buttonTitle', { mode: currentMode.name })}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <IconComponent size={variant === 'pill' ? 13 : 20} className={variant === 'pill' ? '' : `h-5 w-5 ${currentMode.color}`} />
        {variant === 'pill' && (
          <span>
            {currentMode.name === 'No thinking'
              ? 'no think'
              : currentMode.name.toLowerCase().replace('think ', '')}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{ maxHeight: 'min(70vh, 420px)' }}
          className="think-dropdown flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="false"
        >
          <div className="think-dropdown-head">
            <div>
              <h4>{t('thinkingMode.selector.title')}</h4>
              <p>{t('thinkingMode.selector.description')}</p>
            </div>
            <button
              type="button"
              onClick={closeDropdown}
              className="rounded p-1 hover:bg-[var(--paper-2)]"
            >
              <X className="h-4 w-4 text-[var(--ink-3)]" />
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto">
            {translatedModes.map((mode) => {
              const ModeIcon = mode.icon;
              const isSelected = mode.id === selectedMode;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    onModeChange(mode.id);
                    closeDropdown();
                  }}
                  className={`think-option ${isSelected ? 'active' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${mode.icon ? mode.color : 'text-[var(--ink-4)]'}`}>
                      {ModeIcon ? <ModeIcon className="h-4 w-4" /> : <div className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="think-option-head">
                        <span className="think-option-name">{mode.name}</span>
                        {isSelected && (
                          <span className="think-option-active-pill">
                            {t('thinkingMode.selector.active')}
                          </span>
                        )}
                      </div>
                      <p className="think-option-desc">{mode.description}</p>
                      {mode.prefix && (
                        <code className="think-option-prefix">{mode.prefix}</code>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-[var(--line)] bg-[var(--paper-2)] p-3">
            <p className="text-[var(--fs-sm)] text-[var(--ink-3)] m-0">
              <strong>Tip:</strong> {t('thinkingMode.selector.tip')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThinkingModeSelector;
