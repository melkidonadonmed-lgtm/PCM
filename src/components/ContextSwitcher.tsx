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
      className={`px-2 py-1.5 border border-white/10 bg-white/[0.05] hover:border-white/20 transition-colors surface-inset rounded-xl ${collapsed ? 'text-center' : ''}`}
    >
      {!collapsed && (
        <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sidebar-text-muted,#94A3B8)] flex items-center gap-1 min-w-0">
            <Icon name="verified_user" size={13} className="text-emerald-400 shrink-0" />
            <span className="truncate">Local de Atuação (SUS)</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-sky-200 border border-white/15 shrink-0 whitespace-nowrap leading-none shadow-xs clinical-tabular-nums">
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
          className="w-full h-7 text-xs font-semibold rounded-lg bg-white/[0.08] text-[var(--sidebar-text-primary,#F8FAFC)] border border-white/15 pl-2 pr-6 appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 truncate shadow-tactile-sm hover:bg-white/[0.14] hover:border-white/25 transition duration-150 ui-btn-tactile"
        >
          {contexts.map((ctx) => (
            <option key={ctx.id} value={ctx.id} className="bg-slate-900 text-white">
              {ctx.sphere === 'municipal' ? '[Municipal] ' : ctx.sphere === 'state' ? '[Estadual] ' : '[Particular] '}
              {ctx.name}
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
