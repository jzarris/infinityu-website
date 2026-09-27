import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyGoalCap, displayFor, formatHeight, formatWeight, lbToKg, validateMetricParams } from './units.ts';

test('imperial and metric formatting', () => {
  assert.equal(formatWeight(68.04, 'imperial'), '150 lb');
  assert.equal(formatWeight(68.04, 'metric'), '68 kg');
  assert.equal(formatHeight(152.4, 'imperial'), `5'0"`);
  assert.equal(formatHeight(175.26, 'imperial'), `5'9"`);
  assert.equal(formatHeight(152.4, 'metric'), '152 cm');
  const d = displayFor({ height_cm: 152.4, weight_kg: lbToKg(150), target_weight_kg: lbToKg(110), sex: 'female', age: 47 }, 'imperial');
  assert.equal(d.loss, '-40 lb');
  assert.equal(d.target_weight, '110 lb');
});

test('goal cap by program fraction and BMI floor', () => {
  // 90 kg, 170 cm, goal 60 kg, cap 20% -> applied 72 kg
  const a = applyGoalCap(90, 60, 170, 0.2);
  assert.equal(a.capped, true);
  assert.equal(a.reason, 'max_loss_fraction');
  assert.ok(Math.abs(a.appliedKg - 72) < 1e-9);
  // within cap -> untouched
  const b = applyGoalCap(90, 80, 170, 0.2);
  assert.equal(b.capped, false);
  assert.equal(b.appliedKg, 80);
  // 55 kg, 170 cm, goal 45 kg, generous cap -> BMI floor 53.5 kg
  const c = applyGoalCap(55, 45, 170, 0.35);
  assert.equal(c.reason, 'bmi_floor');
  assert.ok(c.appliedKg > 53 && c.appliedKg < 54);
});

test('validation catches bad inputs', () => {
  assert.deepEqual(validateMetricParams({ height_cm: 170, weight_kg: 90, target_weight_kg: 80, sex: 'female', age: 40 }), []);
  const issues = validateMetricParams({ height_cm: 50, weight_kg: 90, target_weight_kg: 95, sex: 'x' as never, age: 10 });
  assert.deepEqual(issues.map((i) => i.field).sort(), ['age', 'height', 'sex', 'target']);
});
