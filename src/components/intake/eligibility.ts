import { ProductId, GoalCategory, Question, QuestionnaireResponse } from './types';
import { PRODUCTS, getProductsForGoals } from './products';
import { getQuestionnaireSteps } from './questions';

// ============================================
// ELIGIBILITY CALCULATION
// ============================================

/** A reason attached to an eligibility decision. `key` lets the UI translate; `text` is the English fallback that also flows to the API. */
export interface ReasonRef {
  key: string;
  params?: Record<string, string | number>;
  text: string;
}

export interface EligibilityResult {
  eligible: ProductId[];
  ineligible: { productId: ProductId; reasons: ReasonRef[] }[];
  needsReview: { productId: ProductId; reasons: ReasonRef[] }[];
  bmiCalculated?: number;
}

/**
 * Calculate BMI from height and weight
 */
export function calculateBMI(heightFeet: number, heightInches: number, weightLbs: number): number {
  const totalInches = (heightFeet * 12) + heightInches;
  const heightMeters = totalInches * 0.0254;
  const weightKg = weightLbs * 0.453592;
  return weightKg / (heightMeters * heightMeters);
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Check if a disqualifier condition is met
 */
function checkDisqualifier(
  condition: { operator: string; value: unknown },
  answerValue: unknown
): boolean {
  switch (condition.operator) {
    case 'equals':
      return answerValue === condition.value;
    case 'includes':
      if (Array.isArray(answerValue) && Array.isArray(condition.value)) {
        return (condition.value as string[]).some(v => (answerValue as string[]).includes(v));
      }
      if (Array.isArray(answerValue)) {
        return (answerValue as string[]).includes(condition.value as string);
      }
      return false;
    case 'greater_than':
      return (answerValue as number) > (condition.value as number);
    case 'less_than':
      return (answerValue as number) < (condition.value as number);
    default:
      return false;
  }
}

/**
 * Check BMI eligibility for weight management treatments
 */
function checkBMIEligibility(
  bmi: number,
  hasComorbidities: boolean
): { eligible: boolean; reason?: ReasonRef } {
  // BMI >= 30 qualifies without comorbidities
  if (bmi >= 30) {
    return { eligible: true };
  }
  // BMI 27-29.9 qualifies with weight-related comorbidities
  if (bmi >= 27 && hasComorbidities) {
    return { eligible: true };
  }
  // BMI 25-26.9 - may qualify based on provider evaluation
  if (bmi >= 25) {
    return {
      eligible: true,
      reason: {
        key: 'bmi_borderline',
        text: 'BMI is borderline; provider will evaluate',
      },
    };
  }
  // BMI < 25 - not a candidate for weight loss treatments
  const bmiFormatted = bmi.toFixed(1);
  return {
    eligible: false,
    reason: {
      key: 'bmi_below_minimum',
      params: { bmi: bmiFormatted },
      text: `BMI of ${bmiFormatted} does not meet minimum requirements (typically BMI ≥ 27 with comorbidities or ≥ 30)`,
    },
  };
}

/**
 * Main eligibility calculation function
 */
export function calculateEligibility(
  selectedGoals: GoalCategory[],
  answers: Record<string, unknown>,
  contactInfo: { dateOfBirth: string }
): EligibilityResult {
  const result: EligibilityResult = {
    eligible: [],
    ineligible: [],
    needsReview: [],
  };

  // Get products relevant to selected goals
  const relevantProducts = getProductsForGoals(selectedGoals);

  // Calculate age
  const age = calculateAge(contactInfo.dateOfBirth);

  // Always calculate BMI (height/weight are now collected for all goals)
  let bmi: number | undefined;
  let hasWeightComorbidities = false;

  const heightFeet = answers['heightFeet'] as number;
  const heightInches = answers['heightInches'] as number;
  const weight = answers['currentWeight'] as number;

  if (heightFeet && weight) {
    bmi = calculateBMI(heightFeet, heightInches || 0, weight);
    result.bmiCalculated = bmi;
  }

  // Check for weight-related comorbidities (only relevant for weight loss)
  if (selectedGoals.includes('weight_loss')) {
    const conditions = answers['weightRelatedConditions'] as string[] || [];
    hasWeightComorbidities = conditions.length > 0 && !conditions.includes('none');
  }

  // Get all questions to check disqualifiers
  const allSteps = getQuestionnaireSteps(selectedGoals);
  const allQuestions: Question[] = allSteps.flatMap(step => step.questions);

  // Check each relevant product
  for (const productId of relevantProducts) {
    const disqualifyingReasons: ReasonRef[] = [];
    const reviewReasons: ReasonRef[] = [];

    // Age check
    if (age < 18) {
      disqualifyingReasons.push({
        key: 'age_under_18',
        text: 'Must be 18 years or older',
      });
    }

    // BMI check for weight management treatments
    if ((productId === 'tirzepatide' || productId === 'semaglutide') && bmi !== undefined) {
      const bmiCheck = checkBMIEligibility(bmi, hasWeightComorbidities);
      if (!bmiCheck.eligible && bmiCheck.reason) {
        disqualifyingReasons.push(bmiCheck.reason);
      } else if (bmiCheck.reason) {
        reviewReasons.push(bmiCheck.reason);
      }
    }

    // Check all question disqualifiers
    for (const question of allQuestions) {
      if (!question.disqualifiers) continue;

      const answerValue = answers[question.id];
      if (answerValue === undefined) continue;

      for (const disqualifier of question.disqualifiers) {
        if (disqualifier.productId !== productId) continue;

        if (checkDisqualifier(disqualifier.condition, answerValue)) {
          disqualifyingReasons.push({
            key: disqualifier.reasonKey,
            text: disqualifier.reason,
          });
        }
      }
    }

    // Deduplicate by key
    const dedupe = (refs: ReasonRef[]): ReasonRef[] => {
      const seen = new Set<string>();
      const out: ReasonRef[] = [];
      for (const r of refs) {
        if (seen.has(r.key)) continue;
        seen.add(r.key);
        out.push(r);
      }
      return out;
    };

    // Categorize the product
    if (disqualifyingReasons.length > 0) {
      result.ineligible.push({
        productId,
        reasons: dedupe(disqualifyingReasons),
      });
    } else if (reviewReasons.length > 0) {
      result.needsReview.push({
        productId,
        reasons: dedupe(reviewReasons),
      });
      result.eligible.push(productId); // Still eligible, just needs review
    } else {
      result.eligible.push(productId);
    }
  }

  return result;
}

/**
 * Prepare response data for submission. Reasons are flattened to their English
 * `text` so the API/CRM payload format is unchanged.
 */
export function prepareSubmissionData(
  contactInfo: QuestionnaireResponse['contactInfo'],
  selectedGoals: GoalCategory[],
  answers: Record<string, unknown>,
  eligibilityResult: EligibilityResult
): QuestionnaireResponse {
  return {
    contactInfo,
    selectedGoals,
    answers: answers as Record<string, string | number | boolean | string[]>,
    eligibleProducts: eligibilityResult.eligible,
    ineligibleProducts: eligibilityResult.ineligible.map(item => ({
      productId: item.productId,
      reason: item.reasons.map(r => r.text).join('; '),
    })),
    timestamp: new Date().toISOString(),
  };
}

// Re-export for product list used by the results screen
export { PRODUCTS };
