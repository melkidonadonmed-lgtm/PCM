import React, { useState, useRef, useEffect } from 'react';
import { Layers, Check, ChevronDown } from 'lucide-react';
import { WatermarkType } from '../types';
import { PRESET_WATERMARKS } from '../data/presetAssets';

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
        className="h-9 px-3 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-tactile-sm transition-all"
        title="Selecionar marca d'água de papel timbrado para a folha A4"
      >
        <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        <span className="hidden sm:inline font-sans">
          {compact ? currentPreset.name.split('—')[0].trim() : `Marca d'água: ${currentPreset.name.split('—')[0].trim()}`}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-72 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
          <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-navy-800">
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Marca d'Água no Papel A4
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
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
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-bold border border-sky-200 dark:border-sky-800'
                      : 'hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs leading-snug">{item.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
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
