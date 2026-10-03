'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProductId } from '../types';
import { COMPANY_NAME } from '../acknowledgments';

// ============================================
// LANGUAGE REGISTRY
// ============================================

export type LanguageCode = 'en' | 'th' | 'es';

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'th', label: 'Thai', nativeLabel: 'ไทย' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
];

const STORAGE_KEY = 'infinityu.intake.language';

// ============================================
// TRANSLATION SHAPE
// ============================================

export interface QuestionTranslation {
  text?: string;
  helpText?: string;
  placeholder?: string;
  options?: Record<string, string>;
}

export interface StepTranslation {
  title?: string;
  description?: string;
}

export interface UiStrings {
  stepProgress: string; // template with {current} and {total}
  percentComplete: string; // template with {percent}
  previous: string;
  continue: string;
  seeResults: string;
  yes: string;
  no: string;
  selectOption: string;
  smsPreferencesTitle: string;
  smsTransactionalConsent: string;
  smsMarketingConsent: string;
  verifyTitle: string;
  verifySubtitle: string; // template with {phone}
  verifyExplain: string;
  verifyCodeLabel: string;
  verifyButton: string;
  verifying: string;
  changeNumber: string;
  resendCode: string;
  resendCountdown: string; // template with {seconds}
  verifyFooter: string;
  resultsTitle: string;
  resultsBmiLabel: string;
  resultsEligibleHeading: string;
  resultsEligibleIntro: string;
  resultsReviewHeading: string;
  resultsIneligibleHeading: string;
  resultsIneligibleIntro: string;
  resultsDisclaimer: string;
  resultsReadyToProceed: string; // template with {firstName}
  resultsContactNotice: string; // template with {email}
  startOver: string;
  submit: string;
  submitting: string;
  submittedTitle: string;
  submittedThanks: string; // template with {firstName}
  submittedNotice: string; // template with {email}
  submittedFooter: string;
}

/** Legal acknowledgment text. Paragraphs may contain a {company} token. */
export interface AcknowledgmentTranslation {
  paragraphs: string[];
  checkboxLabel: string;
}

export interface IntakeTranslation {
  questions: Record<string, QuestionTranslation>;
  steps: Record<string, StepTranslation>;
  reasons: Record<string, string>; // reasonKey -> translated text (may include {param} tokens)
  productDescriptions: Partial<Record<ProductId, string>>;
  acknowledgments: Record<string, AcknowledgmentTranslation>; // acknowledgment id -> text
  ui: UiStrings;
}

// ============================================
// TRANSLATION REGISTRY
// ============================================

import { TH } from './th';
import { ES } from './es';

const TRANSLATIONS: Record<Exclude<LanguageCode, 'en'>, IntakeTranslation> = {
  th: TH,
  es: ES,
};

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = params[key];
    return v === undefined ? `{${key}}` : String(v);
  });
}

// ============================================
// HOOK
// ============================================

export interface TranslationHelpers {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  /** Translation of a question field, or undefined if not available (English source). */
  tQuestion: (questionId: string, field: 'text' | 'helpText' | 'placeholder') => string | undefined;
  /** Translation of an option label by option.value, or undefined. */
  tOption: (questionId: string, optionValue: string) => string | undefined;
  /** Translation of a step field, or undefined. */
  tStep: (stepId: string, field: 'title' | 'description') => string | undefined;
  /** Translation of a reason key with optional params, or undefined to fall back to English text. */
  tReason: (reasonKey: string, params?: Record<string, string | number>) => string | undefined;
  /** Translation of a product description, or undefined. */
  tProductDescription: (productId: ProductId) => string | undefined;
  /** Translation of a legal acknowledgment (company name interpolated), or undefined. */
  tAcknowledgment: (acknowledgmentId: string) => AcknowledgmentTranslation | undefined;
  /** UI string by key. Returns undefined when language is English or no translation exists — English comes from `enUi`. */
  tUi: <K extends keyof UiStrings>(key: K, params?: Record<string, string | number>) => string | undefined;
  /** Always English UI string (canonical source). */
  enUi: <K extends keyof UiStrings>(key: K, params?: Record<string, string | number>) => string;
}

export const EN_UI: UiStrings = {
  stepProgress: 'Step {current} of {total}',
  percentComplete: '{percent}% complete',
  previous: 'Previous',
  continue: 'Continue',
  seeResults: 'See Results',
  yes: 'Yes',
  no: 'No',
  selectOption: 'Select an option...',
  smsPreferencesTitle: 'SMS Communication Preferences',
  smsTransactionalConsent:
    'I agree to receive SMS messages from InfinityU Med Spa for appointment reminders, account updates, and customer support. Message and data rates may apply. Reply STOP to opt out.',
  smsMarketingConsent:
    'I agree to receive promotional SMS messages from InfinityU Med Spa about special offers, health tips, and program updates. Message and data rates may apply. Reply STOP to opt out.',
  verifyTitle: 'Verify Your Phone',
  verifySubtitle: 'We sent a 6-digit code to {phone}',
  verifyExplain:
    'This verification helps ensure your health information is secure and belongs to you.',
  verifyCodeLabel: 'Verification Code',
  verifyButton: 'Verify & Continue',
  verifying: 'Verifying...',
  changeNumber: '← Change number',
  resendCode: 'Resend code',
  resendCountdown: 'Resend in {seconds}s',
  verifyFooter:
    'This verification helps protect your health information and creates your patient account.',
  resultsTitle: 'Your Screening Results',
  resultsBmiLabel: 'Calculated BMI',
  resultsEligibleHeading: 'Potentially Eligible Treatments',
  resultsEligibleIntro: 'Based on your responses, you may be a candidate for:',
  resultsReviewHeading: 'Require Provider Review',
  resultsIneligibleHeading: 'Not Recommended at This Time',
  resultsIneligibleIntro: 'Based on your responses, the following may not be appropriate:',
  resultsDisclaimer:
    'This is a preliminary screening only. A licensed medical provider will review your complete health profile to make final treatment recommendations.',
  resultsReadyToProceed: 'Ready to proceed, {firstName}?',
  resultsContactNotice:
    "Click below to submit your assessment. We'll contact you at {email} to discuss your options and schedule a consultation with a licensed medical provider.",
  startOver: 'Start Over',
  submit: 'Submit & Get Started',
  submitting: 'Submitting...',
  submittedTitle: 'Assessment Submitted!',
  submittedThanks: 'Thank you, {firstName}! Your health assessment has been received.',
  submittedNotice:
    'A licensed medical provider will review your information and contact you at {email} within 24-48 hours to discuss your options.',
  submittedFooter: 'Questions? Contact us at services@infinity-u.com',
};

export function useIntakeTranslation(): TranslationHelpers {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, code);
    }
  }, []);

  const active = language === 'en' ? null : TRANSLATIONS[language];

  const tQuestion = useCallback(
    (questionId: string, field: 'text' | 'helpText' | 'placeholder') => {
      return active?.questions[questionId]?.[field];
    },
    [active]
  );

  const tOption = useCallback(
    (questionId: string, optionValue: string) => {
      return active?.questions[questionId]?.options?.[optionValue];
    },
    [active]
  );

  const tStep = useCallback(
    (stepId: string, field: 'title' | 'description') => {
      return active?.steps[stepId]?.[field];
    },
    [active]
  );

  const tReason = useCallback(
    (reasonKey: string, params?: Record<string, string | number>) => {
      const template = active?.reasons[reasonKey];
      if (template === undefined) return undefined;
      return interpolate(template, params);
    },
    [active]
  );

  const tProductDescription = useCallback(
    (productId: ProductId) => {
      return active?.productDescriptions[productId];
    },
    [active]
  );

  const tAcknowledgment = useCallback(
    (acknowledgmentId: string) => {
      const a = active?.acknowledgments[acknowledgmentId];
      if (!a) return undefined;
      const params = { company: COMPANY_NAME };
      return {
        paragraphs: a.paragraphs.map((p) => interpolate(p, params)),
        checkboxLabel: interpolate(a.checkboxLabel, params),
      };
    },
    [active]
  );

  const tUi = useCallback(
    <K extends keyof UiStrings>(key: K, params?: Record<string, string | number>) => {
      const template = active?.ui[key];
      if (template === undefined) return undefined;
      return interpolate(template, params);
    },
    [active]
  );

  const enUi = useCallback(
    <K extends keyof UiStrings>(key: K, params?: Record<string, string | number>) => {
      return interpolate(EN_UI[key], params);
    },
    []
  );

  return {
    language,
    setLanguage,
    tQuestion,
    tOption,
    tStep,
    tReason,
    tProductDescription,
    tAcknowledgment,
    tUi,
    enUi,
  };
}
