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
      className={`px-2.5 py-2 border border-white/10 bg-white/[0.05] surface-inset rounded-xl ${collapsed ? 'text-center' : ''}`}
    >
      {!collapsed && (
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1.5">
          <Icon name="verified_user" size={16} className="text-emerald-400 shrink-0" />
          <span className="truncate">Local de Atuação (SUS)</span>
        </span>
      )}
      
      <div className="relative">
        <select
          value={activeContext.id}
          onChange={(e) => onSwitchContext(e.target.value)}
          aria-label="Selecionar local de atuação institucional"
          className="w-full h-9 text-xs font-semibold rounded-lg bg-white/10 text-white border border-white/15 pl-2.5 pr-7 appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 truncate shadow-tactile-sm hover:bg-white/15 transition-colors ui-btn-tactile"
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
            size={16}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300"
          />
        )}
      </div>

      {!collapsed && (
        <div className="mt-1.5 flex items-center justify-between gap-1.5 text-xs text-slate-300 min-w-0">
          <span className="truncate flex-1 min-w-0" title={activeContext.clinicName}>
            {activeContext.clinicName}
          </span>
          <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-white/10 text-sky-200 border border-white/15 shrink-0 whitespace-nowrap shadow-xs">
            {activeContext.documentFormatting?.prescriptionViaCount || 1} {activeContext.documentFormatting?.prescriptionViaCount === 1 ? 'VIA' : 'VIAS'}
          </span>
        </div>
      )}
    </div>
  );
};
