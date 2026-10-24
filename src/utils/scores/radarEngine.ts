import type { RadarAxisDefinition } from './scoreTypes';

export interface Point2D {
  x: number;
  y: number;
}

export interface AxisSpoke {
  axisId: string;
  label: string;
  system: string;
  start: Point2D;
  end: Point2D;
  labelPos: Point2D;
  angleDeg: number;
}

export interface AxisLabelPosition {
  axisId: string;
  label: string;
  system: string;
  x: number;
  y: number;
  textAnchor: 'start' | 'middle' | 'end';
  dominantBaseline: 'auto' | 'middle' | 'hanging';
}

export function normalizeAxisValue(
  rawValue: number,
  baselineValue: number = 0,
  maxAxisValue: number = 1
): number {
  if (!Number.isFinite(rawValue)) return 0;
  const span = maxAxisValue - baselineValue;
  if (span === 0) return 0;
  const normalized = (rawValue - baselineValue) / span;
  return Math.max(0, Math.min(1, Number(normalized.toFixed(4))));
}

export function normalizeRadarValues(
  axes: RadarAxisDefinition[],
  rawValues: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const axis of axes) {
    const raw = rawValues[axis.id] ?? axis.baselineValue ?? 0;
    if (
      (axis.baselineValue === undefined || axis.baselineValue === 0) &&
      (axis.maxAxisValue === undefined || axis.maxAxisValue === 1)
    ) {
      result[axis.id] = Math.max(0, Math.min(1, Number.isFinite(raw) ? raw : 0));
    } else {
      result[axis.id] = normalizeAxisValue(
        raw,
        axis.baselineValue ?? 0,
        axis.maxAxisValue ?? 1
      );
    }
  }
  return result;
}

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): Point2D {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: Number((centerX + radius * Math.cos(angleInRadians)).toFixed(2)),
    y: Number((centerY + radius * Math.sin(angleInRadians)).toFixed(2)),
  };
}

export function calculateAxisAngle(index: number, totalAxes: number): number {
  if (totalAxes <= 0) return 0;
  return (360 / totalAxes) * index;
}

export function calculatePolygonPoints(
  axes: RadarAxisDefinition[],
  normalizedValues: Record<string, number>,
  centerX: number,
  centerY: number,
  maxRadius: number,
  baselineRadiusRatio: number = 0.2
): string {
  const totalAxes = axes.length;
  if (totalAxes === 0) return '';

  const points: string[] = [];

  axes.forEach((axis, idx) => {
    const angle = calculateAxisAngle(idx, totalAxes);
    const val = Math.max(0, Math.min(1, normalizedValues[axis.id] ?? 0));
    const effectiveRatio = baselineRadiusRatio + val * (1 - baselineRadiusRatio);
    const radius = maxRadius * effectiveRatio;
    const pt = polarToCartesian(centerX, centerY, radius, angle);
    points.push(`${pt.x},${pt.y}`);
  });

  return points.join(' ');
}

export function generateBaselinePolygon(
  axesOrCount: RadarAxisDefinition[] | number,
  centerX: number = 150,
  centerY: number = 150,
  maxRadius: number = 100,
  baselineRadiusRatio: number = 0.2
): string {
  const axes: RadarAxisDefinition[] =
    typeof axesOrCount === 'number'
      ? Array.from({ length: axesOrCount }, (_, i) => ({
          id: `axis_${i}`,
          label: `Axis ${i}`,
          system: 'System',
          baselineValue: 0,
          maxAxisValue: 1,
        }))
      : axesOrCount;

  const zeroMap: Record<string, number> = {};
  axes.forEach((a) => {
    zeroMap[a.id] = 0;
  });
  return calculatePolygonPoints(
    axes,
    zeroMap,
    centerX,
    centerY,
    maxRadius,
    baselineRadiusRatio
  );
}

export function generatePatientPolygon(
  axes: RadarAxisDefinition[],
  values: Record<string, number>,
  centerX: number = 150,
  centerY: number = 150,
  maxRadius: number = 100,
  baselineRadiusRatio: number = 0.2
): string {
  const normalized = normalizeRadarValues(axes, values);
  return calculatePolygonPoints(
    axes,
    normalized,
    centerX,
    centerY,
    maxRadius,
    baselineRadiusRatio
  );
}

export function generateGridRings(
  axes: RadarAxisDefinition[],
  centerX: number = 150,
  centerY: number = 150,
  maxRadius: number = 100,
  ringRatios: number[] = [0.2, 0.45, 0.7, 1.0]
): string[] {
  const totalAxes = axes.length;
  if (totalAxes === 0) return [];

  return ringRatios.map((ratio) => {
    const r = maxRadius * ratio;
    const pts = axes.map((_, idx) => {
      const angle = calculateAxisAngle(idx, totalAxes);
      const pt = polarToCartesian(centerX, centerY, r, angle);
      return `${pt.x},${pt.y}`;
    });
    return pts.join(' ');
  });
}

export function generateAxisSpokes(
  axes: RadarAxisDefinition[],
  centerX: number = 150,
  centerY: number = 150,
  maxRadius: number = 100,
  labelOffset: number = 22
): AxisSpoke[] {
  const totalAxes = axes.length;
  if (totalAxes === 0) return [];

  return axes.map((axis, idx) => {
    const angleDeg = calculateAxisAngle(idx, totalAxes);
    const start = { x: centerX, y: centerY };
    const end = polarToCartesian(centerX, centerY, maxRadius, angleDeg);
    const labelPos = polarToCartesian(
      centerX,
      centerY,
      maxRadius + labelOffset,
      angleDeg
    );

    return {
      axisId: axis.id,
      label: axis.label,
      system: axis.system,
      start,
      end,
      labelPos,
      angleDeg,
    };
  });
}

export function getAxisLabelPositions(
  axes: RadarAxisDefinition[],
  centerX: number = 150,
  centerY: number = 150,
  maxRadius: number = 100,
  labelOffset: number = 24
): AxisLabelPosition[] {
  const spokes = generateAxisSpokes(
    axes,
    centerX,
    centerY,
    maxRadius,
    labelOffset
  );

  return spokes.map((spoke) => {
    const normAngle = ((spoke.angleDeg % 360) + 360) % 360;
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    if (normAngle > 15 && normAngle < 165) {
      textAnchor = 'start';
    } else if (normAngle > 195 && normAngle < 345) {
      textAnchor = 'end';
    }

    let dominantBaseline: 'auto' | 'middle' | 'hanging' = 'middle';
    if (normAngle <= 30 || normAngle >= 330) {
      dominantBaseline = 'auto';
    } else if (normAngle >= 150 && normAngle <= 210) {
      dominantBaseline = 'hanging';
    }

    return {
      axisId: spoke.axisId,
      label: spoke.label,
      system: spoke.system,
      x: spoke.labelPos.x,
      y: spoke.labelPos.y,
      textAnchor,
      dominantBaseline,
    };
  });
}
