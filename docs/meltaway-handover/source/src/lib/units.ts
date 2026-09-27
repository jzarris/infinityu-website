/**
 * Units and goal rules for the simulator. Everything is stored in metric; the
 * units the person chose are used for every string shown back to them.
 * Pure functions, unit tested.
 */

export const LB_PER_KG = 2.2046226218;
export const CM_PER_IN = 2.54;

export type Units = 'metric' | 'imperial';
export type Sex = 'female' | 'male' | 'other';

export interface MetricParams {
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  sex: Sex;
  age: number;
}

export interface DisplayParams {
  height: string;
  weight: string;
  target_weight: string;
  loss: string;
  units: Units;
}

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}
export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}
export function cmToIn(cm: number): number {
  return cm / CM_PER_IN;
}
export function inToCm(inches: number): number {
  return inches * CM_PER_IN;
}

export function formatWeight(kg: number, units: Units): string {
  return units === 'imperial' ? `${Math.round(kgToLb(kg))} lb` : `${Math.round(kg)} kg`;
}

export function formatHeight(cm: number, units: Units): string {
  if (units === 'imperial') {
    const total = Math.round(cmToIn(cm));
    const ft = Math.floor(total / 12);
    const inch = total - ft * 12;
    return `${ft}'${inch}"`;
  }
  return `${Math.round(cm)} cm`;
}

export function formatLength(cm: number, units: Units): string {
  return units === 'imperial' ? `${cmToIn(cm).toFixed(1)} in` : `${cm.toFixed(1)} cm`;
}

export function displayFor(p: MetricParams, units: Units): DisplayParams {
  return {
    height: formatHeight(p.height_cm, units),
    weight: formatWeight(p.weight_kg, units),
    target_weight: formatWeight(p.target_weight_kg, units),
    loss: '-' + formatWeight(p.weight_kg - p.target_weight_kg, units),
    units,
  };
}

export function bmi(kg: number, cm: number): number {
  const m = cm / 100;
  return kg / (m * m);
}

export const MIN_TARGET_BMI = 18.5;

export interface GoalDecision {
  appliedKg: number;
  capped: boolean;
  reason: 'none' | 'max_loss_fraction' | 'bmi_floor';
}

/**
 * The goal actually simulated. Never below the program cap (a fraction of the
 * current weight) and never below a healthy BMI. Both the requested and the
 * applied values are recorded on the simulation.
 */
export function applyGoalCap(
  weightKg: number,
  requestedKg: number,
  heightCm: number,
  maxLossFraction: number
): GoalDecision {
  let applied = requestedKg;
  let reason: GoalDecision['reason'] = 'none';
  const floorByFraction = weightKg * (1 - maxLossFraction);
  if (applied < floorByFraction) {
    applied = floorByFraction;
    reason = 'max_loss_fraction';
  }
  const m = heightCm / 100;
  const floorByBmi = MIN_TARGET_BMI * m * m;
  if (applied < floorByBmi) {
    applied = floorByBmi;
    reason = 'bmi_floor';
  }
  return { appliedKg: applied, capped: reason !== 'none', reason };
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export function validateMetricParams(p: Partial<MetricParams>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
  if (!num(p.height_cm) || p.height_cm! < 120 || p.height_cm! > 230) issues.push({ field: 'height', message: 'Height must be between 120 and 230 cm (3\'11" to 7\'6").' });
  if (!num(p.weight_kg) || p.weight_kg! < 30 || p.weight_kg! > 350) issues.push({ field: 'weight', message: 'Weight must be between 30 and 350 kg (66 to 770 lb).' });
  if (!num(p.target_weight_kg) || p.target_weight_kg! <= 0) issues.push({ field: 'target', message: 'Enter a goal weight.' });
  else if (num(p.weight_kg) && p.target_weight_kg! >= p.weight_kg!) issues.push({ field: 'target', message: 'Goal weight must be below your current weight.' });
  if (!['female', 'male', 'other'].includes(String(p.sex))) issues.push({ field: 'sex', message: 'Select a sex.' });
  if (!num(p.age) || p.age! < 18 || p.age! > 100) issues.push({ field: 'age', message: 'Age must be between 18 and 100.' });
  return issues;
}
