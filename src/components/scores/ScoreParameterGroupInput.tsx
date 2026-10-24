import React from 'react';
import { Icon } from '../Icon';
import type { ParameterGroup, ScoreInputValue } from '../../utils/scores/scoreTypes';

interface ScoreParameterGroupInputProps {
  group: ParameterGroup;
  selectedValue: ScoreInputValue;
  onChange: (groupId: string, value: string | number | boolean) => void;
}

export const ScoreParameterGroupInput: React.FC<ScoreParameterGroupInputProps> = ({
  group,
  selectedValue,
  onChange,
}) => {
  const baselineOption =
    group.options.find((o) => o.isNormalBaseline) ?? group.options[0];
  const currentOptionId =
    typeof selectedValue === 'string' ? selectedValue : baselineOption?.id;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-3.5 transition-colors hover:border-slate-300 dark:hover:border-slate-600">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {group.name}
            {group.unit ? (
              <span className="ml-1.5 rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 font-mono text-[11px] font-normal text-slate-600 dark:text-slate-300 clinical-unit">
                {group.unit}
              </span>
            ) : null}
          </span>
          {group.helpText ? (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {group.helpText}
            </p>
          ) : null}
        </div>
      </div>

      {group.inputType === 'numeric_input' && group.options.length === 0 ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            aria-label={group.name}
            min={group.minValue}
            max={group.maxValue}
            placeholder={
              group.placeholder ?? `Ex.: ${group.normalBaselineValue}`
            }
            value={
              typeof selectedValue === 'number'
                ? selectedValue
                : group.normalBaselineValue
            }
            onChange={(e) =>
              onChange(group.id, parseFloat(e.target.value) || 0)
            }
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 font-mono text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none clinical-tabular-nums"
          />
          {group.unit ? (
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 clinical-unit">
              {group.unit}
            </span>
          ) : null}
        </div>
      ) : (
        <div
          className="mt-2 grid grid-cols-1 gap-1.5"
          role="radiogroup"
          aria-label={group.name}
        >
          {group.options.map((opt) => {
            const isSelected = currentOptionId === opt.id;
            const isSubtraction = group.inputType === 'pupil_reactivity';
            const pointPrefix = isSubtraction
              ? opt.pointValue > 0
                ? '-'
                : ''
              : opt.pointValue > 0
                ? '+'
                : '';

            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(group.id, opt.id)}
                className={`group flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs transition cursor-pointer ${
                  isSelected
                    ? opt.isNormalBaseline
                      ? 'border-emerald-500/70 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-xs'
                      : 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? opt.isNormalBaseline
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-400 dark:border-slate-500 bg-transparent'
                    }`}
                  >
                    {isSelected ? (
                      <Icon name="check" className="text-[11px]" />
                    ) : null}
                  </span>
                  <div>
                    <div className="font-medium leading-snug">{opt.label}</div>
                    {opt.description ? (
                      <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        {opt.description}
                      </div>
                    ) : null}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded px-2 py-0.5 font-mono text-[11px] font-bold clinical-tabular-nums ${
                    isSelected
                      ? opt.isNormalBaseline
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                        : 'bg-blue-500/20 text-blue-800 dark:text-blue-200'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {pointPrefix}
                  {opt.pointValue} pt{Math.abs(opt.pointValue) !== 1 ? 's' : ''}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
