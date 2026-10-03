// ============================================
// HEALTH ASSESSMENT QUESTIONNAIRE TYPES
// ============================================

export type GoalCategory =
  | 'weight_loss'
  | 'anti_aging'
  | 'energy_wellness'
  | 'recovery_healing'
  | 'cognitive_mood';

export type ProductId =
  | 'tirzepatide'
  | 'semaglutide'
  | 'aod9604'
  | 'lipo_b'
  | 'nad_plus'
  | 'sermorelin'
  | 'glutathione'
  | 'mots_c'
  | 'ghk_cu'
  | 'bpc157_tb500'
  | 'semax_selank';

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  category: GoalCategory[];
  contraindications: string[];
  requiredScreening: string[];
}

import type { IntakeAcknowledgment } from './acknowledgments';

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'number' | 'select' | 'multiselect' | 'boolean' | 'scale' | 'acknowledgment';
  options?: { value: string; label: string }[];
  required: boolean;
  /** For type 'acknowledgment': the legal text and checkbox label shown. */
  acknowledgment?: IntakeAcknowledgment;
  placeholder?: string;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  relevantProducts?: ProductId[];
  relevantGoals?: GoalCategory[];
  disqualifiers?: {
    productId: ProductId;
    condition: {
      operator: 'equals' | 'includes' | 'greater_than' | 'less_than';
      value: string | number | boolean | string[];
    };
    /** Translation key for the reason — used to look up localized text in i18n/. */
    reasonKey: string;
    /** English fallback text. Persisted to the API and shown when no translation is available. */
    reason: string;
  }[];
}

export interface QuestionnaireStep {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  state: string;
  biologicalSex?: string;
}

export interface QuestionnaireResponse {
  contactInfo: ContactInfo;
  selectedGoals: GoalCategory[];
  answers: Record<string, string | number | boolean | string[]>;
  eligibleProducts: ProductId[];
  ineligibleProducts: { productId: ProductId; reason: string }[];
  timestamp: string;
}
