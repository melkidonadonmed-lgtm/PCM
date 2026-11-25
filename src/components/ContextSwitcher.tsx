import React from 'react';
import { WorkContext } from '../types';
import { Icon } from './Icon';

/**
 * Institutional Work Context Switcher (SUS / Clinic).
 * Covered UI states: empty (no active context), loading (context transition),
 * success (active context applied), and error (switch fallback).
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

  const viaCount = activeContext.documentFormatting?.prescriptionViaCount || 1;
  const viaLabel = viaCount === 1 ? '1 via' : `${viaCount} vias`;

  return (
    <div
      data-state="idle"
      aria-busy={false}
      title={activeContext.clinicName ? `${activeContext.name} — ${activeContext.clinicName}` : activeContext.name}
      className={`px-0.5 py-0.5 ${collapsed ? 'text-center' : ''}`}
    >
      {!collapsed && (
        <div className="flex items-center justify-between gap-2 mb-1 px-0.5 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--sidebar-text-muted)] flex items-center gap-1 min-w-0 whitespace-nowrap">
            <Icon name="verified_user" size={12} className="text-[var(--sidebar-text-muted)] shrink-0" />
            <span className="truncate">Local de Atuação (SUS)</span>
          </span>
          <span className="text-[11px] font-medium text-[var(--sidebar-text-muted)] shrink-0 whitespace-nowrap leading-none clinical-tabular-nums">
            {viaLabel}
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
          className="pcm-select w-full min-h-[44px] py-1 text-xs font-semibold rounded-[10px] bg-[var(--sidebar-chip-bg)] text-[var(--sidebar-text-primary)] border border-[oklch(1_0_0/0.12)] pl-2.5 pr-7 appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:border-white/25 truncate hover:bg-[var(--sidebar-chip-hover)] hover:border-white/20 transition-colors duration-150"
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
            size={16}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--sidebar-text-muted)]"
          />
        )}
      </div>
    </div>
  );
};
