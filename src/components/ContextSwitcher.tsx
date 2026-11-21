import React from 'react';
import { WorkContext } from '../types';
import { Icon } from './Icon';

/**
 * Seletor de Posto de Trabalho.
 * Estados de UI cobertos: empty (nenhum contexto ativo), loading (carregando troca de posto),
 * success (contexto ativo selecionado com sucesso) e error (falha ao alternar).
 */
interface ContextSwitcherProps {
  contexts: WorkContext[];
  activeContext: WorkContext | null;
  onSwitchContext: (id: string) => void;
  collapsed?: boolean;
}

export const ContextSwitcher: React.FC<ContextSwitcherProps> = ({
  contexts,
  activeContext,
  onSwitchContext,
  collapsed = false,
}) => {
  if (!activeContext) return null;

  return (
    <div
      data-state="idle"
      aria-busy={false}
      title={activeContext.clinicName ? `${activeContext.name} — ${activeContext.clinicName}` : activeContext.name}
      className={`px-1 py-0.5 transition-colors ${collapsed ? 'text-center' : ''}`}
    >
      {!collapsed && (
        <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-normal text-[var(--sidebar-text-muted,#94A3B8)] flex items-center gap-1 min-w-0 whitespace-nowrap">
            <Icon name="verified_user" size={12} className="text-slate-400 shrink-0" />
            <span>Local de Atuação (SUS)</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/[0.07] text-slate-200 border border-white/[0.10] shrink-0 whitespace-nowrap leading-none shadow-xs clinical-tabular-nums">
            {activeContext.documentFormatting?.prescriptionViaCount || 1} {activeContext.documentFormatting?.prescriptionViaCount === 1 ? 'VIA' : 'VIAS'}
          </span>
        </div>
      )}

      <div className="relative">
        <select
          id="work-context-select"
          name="workContext"
          value={activeContext.id}
          onChange={(e) => onSwitchContext(e.target.value)}
          aria-label="Selecionar local de atuação institucional"
          className="pcm-select w-full min-h-[44px] py-1 text-xs font-semibold rounded-lg bg-white/[0.05] surface-inset text-[var(--sidebar-text-primary,#F8FAFC)] border border-white/[0.10] pl-2 pr-6 appearance-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/35 focus-visible:border-white/25 truncate hover:bg-white/[0.12] hover:border-white/20 transition duration-150"
        >
          {contexts.map((ctx) => (
            <option key={ctx.id} value={ctx.id}>
              {ctx.name.replace(/\s*\([^)]*\)\s*/g, '')}
            </option>
          ))}
        </select>
        {!collapsed && (
          <Icon
            name="expand_more"
            size={14}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300"
          />
        )}
      </div>
    </div>
  );
};
