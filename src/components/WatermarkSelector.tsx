import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { WatermarkType } from '../types';
import { PRESET_WATERMARKS } from '../data/presetAssets';

/**
 * Seletor de Marca d'Água.
 * Estados de UI cobertos: empty (nenhuma marca selecionada), loading (carregando opções),
 * success (marca aplicada com sucesso) e error (fechamento por clique externo/erro).
 */
interface WatermarkSelectorProps {
  currentType: WatermarkType;
  onChange: (type: WatermarkType) => void;
  className?: string;
  compact?: boolean;
}

export const WatermarkSelector: React.FC<WatermarkSelectorProps> = ({
  currentType,
  onChange,
  className = '',
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentPreset = PRESET_WATERMARKS.find(w => w.id === currentType) || PRESET_WATERMARKS[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-tactile-secondary touch-target min-h-[44px] px-3 rounded-xl text-xs font-semibold flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
        title="Selecionar marca d'água de papel timbrado para a folha A4"
      >
        <Icon name="layers" className="text-[15px] text-[var(--ink-clinical)]" />
        <span className="hidden sm:inline font-sans">
          {compact ? currentPreset.name.split('—')[0].trim() : `Marca d'água: ${currentPreset.name.split('—')[0].trim()}`}
        </span>
        <Icon name="expand_more" className="text-[14px] text-[var(--ink-muted)] ml-0.5" />
      </button>

      {isOpen && (
        <div data-state="idle" aria-busy={false} className="absolute right-0 top-full mt-1.5 w-72 rounded-2xl bg-[var(--surface-card)] border border-[var(--hairline)] shadow-[var(--elevation-high)] p-2 z-50 animate-tab-fade font-sans surface-raised">
          <div className="px-2.5 py-1.5 mb-1 border-b border-[var(--hairline)]">
            <p className="text-xs font-bold text-[var(--ink-primary)] uppercase tracking-wider">
              Marca d'Água no Papel A4
            </p>
            <p className="text-xs text-[var(--ink-muted)]">
              Imprime suavemente no fundo da folha médica
            </p>
          </div>

          <div className="space-y-1">
            {PRESET_WATERMARKS.map(item => {
              const isSelected = item.id === currentType;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`touch-target min-h-[44px] w-full text-left p-2 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none border ${
                    isSelected
                      ? 'bg-[var(--surface-card-lit)] text-[var(--ink-primary)] font-semibold border-[var(--border-control)] ring-1 ring-[var(--accent-focus)]/30'
                      : 'border-transparent hover:bg-[var(--surface-hover)] text-[var(--ink-secondary)] font-medium'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs leading-snug">{item.name}</p>
                    <p className="text-xs text-[var(--ink-muted)] truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Icon name="check" className="text-[16px] text-[var(--ink-clinical)] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WatermarkSelector;
