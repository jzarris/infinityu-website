/* eslint-disable no-console */
/**
 * Dev script that compares English source (questions.ts / eligibility.ts / products.ts)
 * with each translation file (th.ts, es.ts) and reports:
 *   - missing keys (translation file is missing an entry the source defines)
 *   - orphan keys (translation file has an entry the source no longer defines)
 *
 * Run with:  npx tsx src/components/intake/i18n/check-keys.ts
 *
 * Exits with code 1 if any drift is found, so it can be wired into CI.
 */
import {
  CONTACT_QUESTIONS,
  GOALS_QUESTION,
  BASIC_HEALTH_QUESTIONS,
  WEIGHT_LOSS_QUESTIONS,
  CANCER_SCREENING_QUESTIONS,
  MENTAL_HEALTH_QUESTIONS,
  RECOVERY_QUESTIONS,
  COGNITIVE_QUESTIONS,
  ANTI_AGING_QUESTIONS,
  ALLERGY_QUESTIONS,
  FINAL_QUESTIONS,
  ACKNOWLEDGMENT_QUESTIONS,
} from '../questions';
import { PRODUCTS } from '../products';
import { RESULTS_REFUND_ACKNOWLEDGMENT } from '../acknowledgments';
import { EN_UI, type IntakeTranslation } from './index';
import { TH } from './th';
import { ES } from './es';
import type { Question } from '../types';

const ALL_QUESTIONS: Question[] = [
  ...CONTACT_QUESTIONS,
  GOALS_QUESTION,
  ...BASIC_HEALTH_QUESTIONS,
  ...WEIGHT_LOSS_QUESTIONS,
  ...CANCER_SCREENING_QUESTIONS,
  ...MENTAL_HEALTH_QUESTIONS,
  ...RECOVERY_QUESTIONS,
  ...COGNITIVE_QUESTIONS,
  ...ANTI_AGING_QUESTIONS,
  ...ALLERGY_QUESTIONS,
  ...FINAL_QUESTIONS,
  ...ACKNOWLEDGMENT_QUESTIONS,
];

const STEP_IDS = [
  'contact',
  'goals',
  'basic_health',
  'weight_loss',
  'serious_conditions',
  'mental_health',
  'recovery',
  'cognitive',
  'anti_aging',
  'allergies',
  'confirmation',
  'results_acknowledgment',
];

// Reason keys hardcoded in eligibility.ts that are not on any disqualifier
const ELIGIBILITY_ONLY_REASON_KEYS = ['age_under_18', 'bmi_borderline', 'bmi_below_minimum'];

function collectExpectedKeys() {
  const questions = new Set<string>();
  const questionOptions = new Map<string, Set<string>>();
  const reasons = new Set<string>(ELIGIBILITY_ONLY_REASON_KEYS);

  for (const q of ALL_QUESTIONS) {
    // 'acknowledgment' type questions are translated via the acknowledgments block,
    // not the questions block — skip them from the questions key check.
    if (q.type !== 'acknowledgment') {
      questions.add(q.id);
      if (q.options) {
        const opts = new Set<string>();
        for (const opt of q.options) opts.add(opt.value);
        questionOptions.set(q.id, opts);
      }
    }
    if (q.disqualifiers) {
      for (const d of q.disqualifiers) reasons.add(d.reasonKey);
    }
  }

  return {
    questions,
    questionOptions,
    reasons,
    steps: new Set(STEP_IDS),
    products: new Set(Object.keys(PRODUCTS)),
    ui: new Set(Object.keys(EN_UI)),
    acknowledgments: new Set([RESULTS_REFUND_ACKNOWLEDGMENT.id]),
  };
}

interface Drift {
  missing: string[];
  orphan: string[];
}

function diff(expected: Set<string>, actual: Set<string>): Drift {
  const missing: string[] = [];
  const orphan: string[] = [];
  for (const k of expected) if (!actual.has(k)) missing.push(k);
  for (const k of actual) if (!expected.has(k)) orphan.push(k);
  return { missing: missing.sort(), orphan: orphan.sort() };
}

function checkLanguage(lang: string, translation: IntakeTranslation, expected: ReturnType<typeof collectExpectedKeys>) {
  let hasDrift = false;

  // Questions
  const actualQuestions = new Set(Object.keys(translation.questions));
  const qDrift = diff(expected.questions, actualQuestions);
  if (qDrift.missing.length) {
    console.log(`  [${lang}] missing question keys: ${qDrift.missing.join(', ')}`);
    hasDrift = true;
  }
  if (qDrift.orphan.length) {
    console.log(`  [${lang}] orphan question keys: ${qDrift.orphan.join(', ')}`);
    hasDrift = true;
  }

  // Question option keys — only check if the translation file partially defines options for the question.
  for (const [qid, expectedOpts] of expected.questionOptions) {
    const providedOpts = translation.questions[qid]?.options;
    if (!providedOpts) continue;
    const actualOpts = new Set(Object.keys(providedOpts));
    const optDrift = diff(expectedOpts, actualOpts);
    if (optDrift.missing.length) {
      console.log(`  [${lang}] question "${qid}" missing options: ${optDrift.missing.join(', ')}`);
      hasDrift = true;
    }
    if (optDrift.orphan.length) {
      console.log(`  [${lang}] question "${qid}" orphan options: ${optDrift.orphan.join(', ')}`);
      hasDrift = true;
    }
  }

  // Steps
  const actualSteps = new Set(Object.keys(translation.steps));
  const sDrift = diff(expected.steps, actualSteps);
  if (sDrift.missing.length) {
    console.log(`  [${lang}] missing step keys: ${sDrift.missing.join(', ')}`);
    hasDrift = true;
  }
  if (sDrift.orphan.length) {
    console.log(`  [${lang}] orphan step keys: ${sDrift.orphan.join(', ')}`);
    hasDrift = true;
  }

  // Reasons
  const actualReasons = new Set(Object.keys(translation.reasons));
  const rDrift = diff(expected.reasons, actualReasons);
  if (rDrift.missing.length) {
    console.log(`  [${lang}] missing reason keys: ${rDrift.missing.join(', ')}`);
    hasDrift = true;
  }
  if (rDrift.orphan.length) {
    console.log(`  [${lang}] orphan reason keys: ${rDrift.orphan.join(', ')}`);
    hasDrift = true;
  }

  // Product descriptions
  const actualProducts = new Set(Object.keys(translation.productDescriptions));
  const pDrift = diff(expected.products, actualProducts);
  if (pDrift.missing.length) {
    console.log(`  [${lang}] missing product descriptions: ${pDrift.missing.join(', ')}`);
    hasDrift = true;
  }
  if (pDrift.orphan.length) {
    console.log(`  [${lang}] orphan product descriptions: ${pDrift.orphan.join(', ')}`);
    hasDrift = true;
  }

  // UI
  const actualUi = new Set(Object.keys(translation.ui));
  const uDrift = diff(expected.ui, actualUi);
  if (uDrift.missing.length) {
    console.log(`  [${lang}] missing UI keys: ${uDrift.missing.join(', ')}`);
    hasDrift = true;
  }
  if (uDrift.orphan.length) {
    console.log(`  [${lang}] orphan UI keys: ${uDrift.orphan.join(', ')}`);
    hasDrift = true;
  }

  // Acknowledgments (legal text; paragraph count must match the English source)
  const actualAcks = new Set(Object.keys(translation.acknowledgments));
  const aDrift = diff(expected.acknowledgments, actualAcks);
  if (aDrift.missing.length) {
    console.log(`  [${lang}] missing acknowledgment keys: ${aDrift.missing.join(', ')}`);
    hasDrift = true;
  }
  if (aDrift.orphan.length) {
    console.log(`  [${lang}] orphan acknowledgment keys: ${aDrift.orphan.join(', ')}`);
    hasDrift = true;
  }
  const ack = translation.acknowledgments[RESULTS_REFUND_ACKNOWLEDGMENT.id];
  if (ack && ack.paragraphs.length !== RESULTS_REFUND_ACKNOWLEDGMENT.paragraphs.length) {
    console.log(`  [${lang}] acknowledgment "${RESULTS_REFUND_ACKNOWLEDGMENT.id}" has ${ack.paragraphs.length} paragraphs, English has ${RESULTS_REFUND_ACKNOWLEDGMENT.paragraphs.length}`);
    hasDrift = true;
  }

  if (!hasDrift) console.log(`  [${lang}] ✓ all keys in sync`);
  return hasDrift;
}

const expected = collectExpectedKeys();
console.log('Checking intake translation key drift...\n');

let anyDrift = false;
anyDrift = checkLanguage('th', TH, expected) || anyDrift;
anyDrift = checkLanguage('es', ES, expected) || anyDrift;

if (anyDrift) {
  console.log('\n✗ Drift detected. Fix the translation files above.');
  process.exit(1);
} else {
  console.log('\n✓ All translation files are in sync with the English source.');
}
