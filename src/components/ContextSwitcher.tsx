import React from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { WorkContext } from '../types';

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
    <div className={`px-3 py-2 border-b border-[var(--border-subtle)] ${collapsed ? 'text-center' : ''}`}>
      {!collapsed && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1 mb-1">
          <ShieldCheck size={12} className="text-emerald-500" /> Local de Atuação (SUS)
        </span>
      )}
      
      <div className="relative">
        <select
          value={activeContext.id}
          onChange={(e) => onSwitchContext(e.target.value)}
          aria-label="Selecionar local de atuação institucional"
          className="w-full text-xs font-semibold rounded-lg bg-[var(--surface-card)] text-[var(--text-main)] border border-[var(--border-subtle)] py-1.5 pl-2 pr-7 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent-sky)] truncate shadow-sm"
        >
          {contexts.map((ctx) => (
            <option key={ctx.id} value={ctx.id}>
              {ctx.sphere === 'municipal' ? '🏙️ ' : ctx.sphere === 'state' ? '🏛️ ' : '🏥 '}
              {ctx.name}
            </option>
          ))}
        </select>
        {!collapsed && (
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"
          />
        )}
      </div>

      {!collapsed && (
        <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
          <span className="truncate max-w-[170px]">{activeContext.clinicName}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--bg-app)] border border-[var(--border-subtle)]">
            {activeContext.regulatoryRules.restrictToRemume ? 'REMUME' : 'RENAME'}
          </span>
        </div>
      )}
    </div>
  );
};
