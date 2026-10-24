import React from 'react';
import type { RadarAxisDefinition, RiskSeverityLevel } from '../../utils/scores/scoreTypes';
import {
  generateAxisSpokes,
  generateBaselinePolygon,
  generateGridRings,
  generatePatientPolygon,
  getAxisLabelPositions,
  normalizeRadarValues,
  polarToCartesian,
} from '../../utils/scores/radarEngine';

interface ScorePhysiologicalRadarProps {
  axes: RadarAxisDefinition[];
  values: Record<string, number>;
  severityLevel?: RiskSeverityLevel;
  size?: number;
}

const SEVERITY_COLORS: Record<
  RiskSeverityLevel,
  { stroke: string; fill: string }
> = {
  low: {
    stroke: '#10b981',
    fill: 'rgba(16, 185, 129, 0.22)',
  },
  intermediate: {
    stroke: '#f59e0b',
    fill: 'rgba(245, 158, 11, 0.24)',
  },
  high: {
    stroke: '#f97316',
    fill: 'rgba(249, 115, 22, 0.26)',
  },
  critical: {
    stroke: '#ef4444',
    fill: 'rgba(239, 68, 68, 0.28)',
  },
};

export const ScorePhysiologicalRadar: React.FC<ScorePhysiologicalRadarProps> = ({
  axes,
  values,
  severityLevel = 'low',
  size = 300,
}) => {
  if (!axes || axes.length === 0) return null;

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.31;
  const baselineRatio = 0.22;

  const gridRings = generateGridRings(axes, centerX, centerY, maxRadius, [
    0.22,
    0.48,
    0.74,
    1.0,
  ]);
  const baselinePoints = generateBaselinePolygon(
    axes,
    centerX,
    centerY,
    maxRadius,
    baselineRatio
  );
  const patientPoints = generatePatientPolygon(
    axes,
    values,
    centerX,
    centerY,
    maxRadius,
    baselineRatio
  );
  const spokes = generateAxisSpokes(axes, centerX, centerY, maxRadius, 22);
  const labels = getAxisLabelPositions(axes, centerX, centerY, maxRadius, 24);
  const normalizedValues = normalizeRadarValues(axes, values);

  const colors = SEVERITY_COLORS[severityLevel] ?? SEVERITY_COLORS.low;

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 p-3"
      data-state="idle"
    >
      <div className="mb-1.5 flex w-full items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Radar Fisiológico (60fps)
        </span>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500/40 ring-1 ring-emerald-500" />
            Basal
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: colors.stroke }}
            />
            Paciente
          </span>
        </div>
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="max-h-64 max-w-64 overflow-visible select-none"
        role="img"
        aria-label="Gráfico polar de desvio fisiológico multissistêmico"
      >
        {gridRings.map((ringPts, idx) => (
          <polygon
            key={`ring-${idx}`}
            points={ringPts}
            fill="none"
            stroke="currentColor"
            className="text-slate-300/70 dark:text-slate-700"
            strokeWidth={idx === 0 ? 1.2 : 0.75}
            strokeDasharray={idx === 0 ? '3 2' : undefined}
          />
        ))}

        {spokes.map((spoke) => (
          <line
            key={`spoke-${spoke.axisId}`}
            x1={spoke.start.x}
            y1={spoke.start.y}
            x2={spoke.end.x}
            y2={spoke.end.y}
            stroke="currentColor"
            className="text-slate-300/80 dark:text-slate-700"
            strokeWidth={1}
          />
        ))}

        <polygon
          points={baselinePoints}
          fill="rgba(16, 185, 129, 0.08)"
          stroke="#10b981"
          strokeWidth={1.25}
          strokeDasharray="3 2"
        />

        <polygon
          points={patientPoints}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={2.25}
          style={{
            transition:
              'all 240ms cubic-bezier(0.22, 1, 0.36, 1), fill 200ms ease, stroke 200ms ease',
          }}
        />

        {axes.map((axis, idx) => {
          const val = normalizedValues[axis.id] ?? 0;
          const effectiveRatio = baselineRatio + val * (1 - baselineRatio);
          const angle = (360 / axes.length) * idx;
          const pt = polarToCartesian(
            centerX,
            centerY,
            maxRadius * effectiveRatio,
            angle
          );

          return (
            <circle
              key={`vertex-${axis.id}`}
              cx={pt.x}
              cy={pt.y}
              r={val > 0 ? 4 : 3}
              fill={val > 0 ? colors.stroke : '#10b981'}
              stroke="#0f172a"
              strokeWidth={1.2}
              style={{
                transition: 'cx 240ms ease, cy 240ms ease, fill 200ms ease',
              }}
            />
          );
        })}

        {labels.map((lbl) => {
          const valPct = Math.round((normalizedValues[lbl.axisId] ?? 0) * 100);
          return (
            <g key={`label-${lbl.axisId}`}>
              <text
                x={lbl.x}
                y={lbl.y}
                textAnchor={lbl.textAnchor}
                dominantBaseline={lbl.dominantBaseline}
                className="fill-slate-700 dark:fill-slate-200 text-[9.5px] font-semibold"
              >
                {lbl.label.length > 20 ? `${lbl.label.slice(0, 18)}…` : lbl.label}
              </text>
              <text
                x={lbl.x}
                y={lbl.y + 11}
                textAnchor={lbl.textAnchor}
                dominantBaseline={lbl.dominantBaseline}
                className="fill-slate-500 dark:fill-slate-400 font-mono text-[8.5px] clinical-tabular-nums"
              >
                {lbl.system} ({valPct}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
