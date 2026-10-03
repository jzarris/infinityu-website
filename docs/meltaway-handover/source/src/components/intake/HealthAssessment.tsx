'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { GoalCategory, Question, ContactInfo, ProductId } from './types';
import { PRODUCTS } from './products';
import { getQuestionnaireSteps, CONTACT_QUESTIONS } from './questions';
import { calculateEligibility, prepareSubmissionData, type EligibilityResult, type ReasonRef } from './eligibility';
import { acknowledgmentRecord } from './acknowledgments';
import { LANGUAGES, useIntakeTranslation, type LanguageCode, type TranslationHelpers } from './i18n';
import { FlagIcon } from './i18n/flags';
import { Button } from '@/components/ui/Button';
import { CheckCircle, ArrowLeft, ArrowRight, Phone, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// HEALTH ASSESSMENT COMPONENT
// ============================================

interface HealthAssessmentSubmission extends ReturnType<typeof prepareSubmissionData> {
  submissionLanguage: LanguageCode;
  languagesUsed: LanguageCode[];
}

interface HealthAssessmentProps {
  onSubmit?: (data: HealthAssessmentSubmission) => Promise<void>;
  className?: string;
}

/** Renders English text always; if a translation is provided, stacks it underneath in a muted style. */
function BilingualText({
  english,
  translation,
  className = '',
  translationClassName = 'text-[var(--color-text-muted)] text-sm mt-0.5',
}: {
  english: ReactNode;
  translation?: string;
  className?: string;
  translationClassName?: string;
}) {
  return (
    <span className={className}>
      <span>{english}</span>
      {translation && <span className={cn('block', translationClassName)}>{translation}</span>}
    </span>
  );
}

function resolveReason(reason: ReasonRef, t: TranslationHelpers): { english: string; translation?: string } {
  return {
    english: reason.text,
    translation: t.tReason(reason.key, reason.params),
  };
}

export function HealthAssessment({ onSubmit, className = '' }: HealthAssessmentProps) {
  // i18n
  const t = useIntakeTranslation();
  const [languagesUsed, setLanguagesUsed] = useState<LanguageCode[]>(['en']);

  // Track every language the user activates during the session (deduped, in order of first activation)
  useEffect(() => {
    setLanguagesUsed(prev => (prev.includes(t.language) ? prev : [...prev, t.language]));
  }, [t.language]);

  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<GoalCategory[]>([]);
  const [contactInfo, setContactInfo] = useState<Partial<ContactInfo>>({});
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [simulatorAvailable, setSimulatorAvailable] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);

  // SMS consent state
  const [smsTransactionalConsent, setSmsTransactionalConsent] = useState(true);
  const [smsMarketingConsent, setSmsMarketingConsent] = useState(false);

  // Phone verification state
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const steps = getQuestionnaireSteps(selectedGoals);
  const currentStep = steps[currentStepIndex];

  // Handle answer changes
  const handleAnswerChange = useCallback((questionId: string, value: unknown) => {
    if (questionId === 'goals') {
      setSelectedGoals(value as GoalCategory[]);
    } else if (CONTACT_QUESTIONS.some(q => q.id === questionId)) {
      setContactInfo(prev => ({ ...prev, [questionId]: value }));
    }
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const validateStep = useCallback((): boolean => {
    if (!currentStep) return false;
    for (const question of currentStep.questions) {
      const answer = answers[question.id];
      if (question.required) {
        if (answer === undefined || answer === '' ||
            (Array.isArray(answer) && answer.length === 0)) {
          return false;
        }
      }
      // An acknowledgment is only satisfied by an explicit tick.
      if (question.type === 'acknowledgment' && answer !== true) return false;
      // Numbers must be within the declared range (0 is a valid value, e.g. 0 inches).
      if (question.type === 'number' && typeof answer === 'number') {
        const { min, max } = question.validation || {};
        if (Number.isNaN(answer)) return false;
        if (min !== undefined && answer < min) return false;
        if (max !== undefined && answer > max) return false;
      }
    }
    return true;
  }, [currentStep, answers]);

  const numberRangeError = (question: Question): string | null => {
    const answer = answers[question.id];
    if (question.type !== 'number' || typeof answer !== 'number') return null;
    const { min, max } = question.validation || {};
    if ((min !== undefined && answer < min) || (max !== undefined && answer > max)) {
      return `Enter a value between ${min ?? '…'} and ${max ?? '…'}.`;
    }
    return null;
  };

  // Phone verification functions
  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const startResendCountdown = useCallback(() => {
    setCanResend(false);
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendVerificationCode = useCallback(async () => {
    const phone = contactInfo.phone;
    if (!phone) return;
    setIsSendingCode(true);
    setVerificationError('');
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'intake' }),
      });
      const result = await response.json();
      if (!result.success) {
        setVerificationError(result.error || 'Failed to send code');
        return;
      }
      startResendCountdown();
    } catch {
      setVerificationError('Failed to send verification code');
    } finally {
      setIsSendingCode(false);
    }
  }, [contactInfo.phone, startResendCountdown]);

  const verifyPhoneCode = useCallback(async () => {
    const phone = contactInfo.phone;
    if (!phone || !verificationCode) return;
    setIsVerifying(true);
    setVerificationError('');
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: verificationCode, purpose: 'intake' }),
      });
      const result = await response.json();
      if (!result.success) {
        setVerificationError(result.error || 'Invalid code');
        return;
      }
      if (result.verified) {
        setPhoneVerified(true);
        setShowPhoneVerification(false);
        setCurrentStepIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setVerificationError('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [contactInfo.phone, verificationCode]);

  const goToNextStep = useCallback(async () => {
    if (currentStepIndex === 0 && !phoneVerified) {
      setShowPhoneVerification(true);
      await sendVerificationCode();
      return;
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const result = calculateEligibility(
        selectedGoals,
        answers,
        { dateOfBirth: contactInfo.dateOfBirth || '' }
      );
      setEligibilityResult(result);
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStepIndex, steps.length, selectedGoals, answers, contactInfo.dateOfBirth, phoneVerified, sendVerificationCode]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  const handleSubmit = useCallback(async () => {
    if (!eligibilityResult) return;
    setIsSubmitting(true);
    try {
      const submissionData = prepareSubmissionData(
        contactInfo as ContactInfo,
        selectedGoals,
        answers,
        eligibilityResult
      );

      const submissionWithMeta: HealthAssessmentSubmission = {
        ...submissionData,
        submissionLanguage: t.language,
        languagesUsed,
      };

      // Legal acknowledgments the person ticked, with the exact text and time.
      const acceptedAt = new Date().toISOString();
      const acknowledgments = steps
        .flatMap((s) => s.questions)
        .filter((q) => q.type === 'acknowledgment' && q.acknowledgment && answers[q.id] === true)
        .map((q) => acknowledgmentRecord(q.acknowledgment!, acceptedAt));

      // Add SMS consent data to submission
      const fullPayload = {
        ...submissionWithMeta,
        acknowledgments,
        smsConsent: {
          transactional: smsTransactionalConsent,
          marketing: smsMarketingConsent,
        },
      };

      if (onSubmit) {
        await onSubmit(submissionWithMeta);
      } else {
        const response = await fetch('/api/intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullPayload),
        });
        const result = await response.json();
        if (!response.ok) {
          console.error('API error response:', result);
          throw new Error(result.message || 'Failed to submit assessment');
        }
        setSimulatorAvailable(result.simulatorAvailable === true);
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [eligibilityResult, contactInfo, selectedGoals, answers, onSubmit, smsTransactionalConsent, smsMarketingConsent, t.language, languagesUsed, steps]);

  // Render the input control for a question. Bilingual text is rendered by the
  // surrounding label, not here — these are pure input controls.
  const renderQuestion = (question: Question) => {
    const value = answers[question.id];
    const placeholderTranslation = t.tQuestion(question.id, 'placeholder');
    const placeholder = placeholderTranslation
      ? `${question.placeholder ?? ''}${question.placeholder ? ' / ' : ''}${placeholderTranslation}`
      : question.placeholder;

    switch (question.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            type={question.type === 'phone' ? 'tel' : question.type}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white text-[var(--color-text)]"
            required={question.required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white text-[var(--color-text)]"
            required={question.required}
          />
        );

      case 'number': {
        // 0 is a real answer (0 inches); an empty box is stored as '' so it fails
        // the required check instead of silently becoming 0.
        const rangeError = numberRangeError(question);
        return (
          <div>
            <input
              type="number"
              inputMode="decimal"
              value={value === undefined || value === '' ? '' : String(value)}
              onChange={(e) => {
                const raw = e.target.value;
                const parsed = raw === '' ? '' : parseFloat(raw);
                handleAnswerChange(question.id, Number.isNaN(parsed) ? '' : parsed);
              }}
              placeholder={placeholder}
              min={question.validation?.min}
              max={question.validation?.max}
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white text-[var(--color-text)]"
              required={question.required}
            />
            {rangeError && <p className="text-xs text-[var(--color-error)] mt-1">{rangeError}</p>}
          </div>
        );
      }

      case 'select': {
        const selectPlaceholder = t.tUi('selectOption')
          ? `${t.enUi('selectOption')} / ${t.tUi('selectOption')}`
          : t.enUi('selectOption');
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white text-[var(--color-text)]"
            required={question.required}
          >
            <option value="">{selectPlaceholder}</option>
            {question.options?.map((option) => {
              const optionTranslation = t.tOption(question.id, option.value);
              const label = optionTranslation
                ? `${option.label} / ${optionTranslation}`
                : option.label;
              return (
                <option key={option.value} value={option.value}>
                  {label}
                </option>
              );
            })}
          </select>
        );
      }

      case 'multiselect': {
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const optionTranslation = t.tOption(question.id, option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-start p-4 border rounded-[var(--radius-md)] cursor-pointer transition-colors',
                    selectedValues.includes(option.value)
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (option.value === 'none') {
                          handleAnswerChange(question.id, ['none']);
                        } else {
                          const newValues = [...selectedValues.filter(v => v !== 'none'), option.value];
                          handleAnswerChange(question.id, newValues);
                        }
                      } else {
                        handleAnswerChange(
                          question.id,
                          selectedValues.filter((v) => v !== option.value)
                        );
                      }
                    }}
                    className="mt-1 mr-3 h-4 w-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-[var(--color-text)]">
                    <BilingualText english={option.label} translation={optionTranslation} />
                  </span>
                </label>
              );
            })}
          </div>
        );
      }

      case 'acknowledgment': {
        const ack = question.acknowledgment;
        if (!ack) return null;
        // English is always shown and is what gets recorded; a translation, when
        // the person chose another language, is stacked under each paragraph.
        const ackTranslation = t.tAcknowledgment(ack.id);
        return (
          <div className="space-y-4">
            <div className="text-sm leading-relaxed text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 space-y-3">
              {ack.paragraphs.map((paragraph, i) => (
                <p key={i}>
                  <BilingualText english={paragraph} translation={ackTranslation?.paragraphs[i]} translationClassName="text-[var(--color-text-muted)] mt-1" />
                </p>
              ))}
            </div>
            <label
              className={cn(
                'flex items-start gap-3 p-4 border rounded-[var(--radius-md)] cursor-pointer transition-colors',
                value === true
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
              )}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={value === true}
                onChange={(e) => handleAnswerChange(question.id, e.target.checked)}
              />
              <span className="text-sm font-medium text-[var(--color-text)]">
                <BilingualText english={ack.checkboxLabel} translation={ackTranslation?.checkboxLabel} translationClassName="text-[var(--color-text-muted)] font-normal mt-1" />
              </span>
            </label>
          </div>
        );
      }

      case 'boolean':
        return (
          <div className="flex gap-4">
            <label
              className={cn(
                'flex-1 p-4 border rounded-[var(--radius-md)] cursor-pointer text-center transition-colors',
                value === true
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
              )}
            >
              <input
                type="radio"
                name={question.id}
                checked={value === true}
                onChange={() => handleAnswerChange(question.id, true)}
                className="sr-only"
              />
              <span className="font-medium text-[var(--color-text)]">
                <BilingualText english={t.enUi('yes')} translation={t.tUi('yes')} />
              </span>
            </label>
            <label
              className={cn(
                'flex-1 p-4 border rounded-[var(--radius-md)] cursor-pointer text-center transition-colors',
                value === false
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
              )}
            >
              <input
                type="radio"
                name={question.id}
                checked={value === false}
                onChange={() => handleAnswerChange(question.id, false)}
                className="sr-only"
              />
              <span className="font-medium text-[var(--color-text)]">
                <BilingualText english={t.enUi('no')} translation={t.tUi('no')} />
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Language selector — flag buttons above the form. Native labels under each
  // flag mean non-English speakers can recognize their language without reading
  // English text.
  const renderLanguageSelector = () => (
    <div className="mb-6 flex items-center justify-end gap-2" role="group" aria-label="Language">
      {LANGUAGES.map(l => {
        const active = t.language === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => t.setLanguage(l.code)}
            aria-label={l.label}
            aria-pressed={active}
            title={l.label}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] text-sm transition-colors border',
              active
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-text)] font-medium'
                : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'
            )}
          >
            <FlagIcon code={l.code} className="h-3.5 w-auto rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" />
            <span>{l.nativeLabel}</span>
          </button>
        );
      })}
    </div>
  );

  // Submitted confirmation
  if (isSubmitted) {
    return (
      <div className={className}>
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-[var(--color-success)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">
            <BilingualText english={t.enUi('submittedTitle')} translation={t.tUi('submittedTitle')} />
          </h2>
          <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
            <BilingualText
              english={t.enUi('submittedThanks', { firstName: contactInfo.firstName || '' })}
              translation={t.tUi('submittedThanks', { firstName: contactInfo.firstName || '' })}
            />
          </p>
          <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
            <BilingualText
              english={t.enUi('submittedNotice', { email: contactInfo.email || '' })}
              translation={t.tUi('submittedNotice', { email: contactInfo.email || '' })}
            />
          </p>
          {simulatorAvailable && (
            <div className="mb-8">
              <a
                href="/simulate"
                className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-medium"
              >
                See what your goal could look like
              </a>
              <p className="text-xs text-[var(--color-text-light)] mt-2">Optional. Takes one photo and about a minute.</p>
            </div>
          )}
          <div className="border-t border-[var(--color-border)] pt-6">
            <p className="text-sm text-[var(--color-text-light)]">
              <BilingualText english={t.enUi('submittedFooter')} translation={t.tUi('submittedFooter')} />
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Phone verification screen
  if (showPhoneVerification) {
    return (
      <div className={className}>
        {renderLanguageSelector()}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            <BilingualText english={t.enUi('verifyTitle')} translation={t.tUi('verifyTitle')} />
          </h2>
          <p className="text-[var(--color-text-muted)]">
            <BilingualText
              english={t.enUi('verifySubtitle', { phone: formatPhoneDisplay(contactInfo.phone || '') })}
              translation={t.tUi('verifySubtitle', { phone: formatPhoneDisplay(contactInfo.phone || '') })}
            />
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-3 max-w-md mx-auto">
            <BilingualText english={t.enUi('verifyExplain')} translation={t.tUi('verifyExplain')} />
          </p>
        </div>

        {verificationError && (
          <div className="mb-6 p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-[var(--radius-md)] text-sm text-[var(--color-error)]">
            {verificationError}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              <BilingualText english={t.enUi('verifyCodeLabel')} translation={t.tUi('verifyCodeLabel')} />
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="000000"
              autoFocus
              autoComplete="one-time-code"
            />
          </div>

          <Button
            onClick={verifyPhoneCode}
            disabled={verificationCode.length < 6 || isVerifying}
            isLoading={isVerifying}
            className="w-full"
          >
            <BilingualText
              english={isVerifying ? t.enUi('verifying') : t.enUi('verifyButton')}
              translation={isVerifying ? t.tUi('verifying') : t.tUi('verifyButton')}
            />
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setShowPhoneVerification(false);
                setVerificationCode('');
                setVerificationError('');
              }}
              className="text-[var(--color-primary)] hover:underline text-left"
            >
              <BilingualText english={t.enUi('changeNumber')} translation={t.tUi('changeNumber')} />
            </button>

            {canResend ? (
              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={isSendingCode}
                className="text-[var(--color-primary)] hover:underline flex items-start gap-1 text-right"
              >
                <RefreshCw className={cn('h-3 w-3 mt-1', isSendingCode && 'animate-spin')} />
                <BilingualText english={t.enUi('resendCode')} translation={t.tUi('resendCode')} />
              </button>
            ) : resendCountdown > 0 ? (
              <span className="text-[var(--color-text-muted)] text-right">
                <BilingualText
                  english={t.enUi('resendCountdown', { seconds: resendCountdown })}
                  translation={t.tUi('resendCountdown', { seconds: resendCountdown })}
                />
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)] text-center">
            <BilingualText english={t.enUi('verifyFooter')} translation={t.tUi('verifyFooter')} />
          </p>
        </div>
      </div>
    );
  }

  // Results screen (pre-submission review)
  if (showResults && eligibilityResult) {
    return (
      <div className={className}>
        {renderLanguageSelector()}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-[var(--color-success)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">
            <BilingualText english={t.enUi('resultsTitle')} translation={t.tUi('resultsTitle')} />
          </h2>
        </div>

        <div className="max-w-none mb-8 space-y-6">
          {eligibilityResult.bmiCalculated !== undefined && (
            <p className="text-[var(--color-text)]">
              <strong>
                <BilingualText english={t.enUi('resultsBmiLabel')} translation={t.tUi('resultsBmiLabel')} />:
              </strong>{' '}
              {eligibilityResult.bmiCalculated.toFixed(1)}
            </p>
          )}

          {eligibilityResult.eligible.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text)]">
                <BilingualText english={t.enUi('resultsEligibleHeading')} translation={t.tUi('resultsEligibleHeading')} />
              </h3>
              <p className="text-[var(--color-text-muted)] mb-3">
                <BilingualText english={t.enUi('resultsEligibleIntro')} translation={t.tUi('resultsEligibleIntro')} />
              </p>
              <ul className="space-y-2">
                {eligibilityResult.eligible.map((productId: ProductId) => {
                  const product = PRODUCTS[productId];
                  const descriptionTranslation = t.tProductDescription(productId);
                  return (
                    <li key={productId} className="flex items-start gap-2 pl-4">
                      <span className="text-[var(--color-primary)]">•</span>
                      <span className="text-[var(--color-text)]">
                        <strong>{product.name}</strong>
                        {' — '}
                        <BilingualText
                          english={product.description}
                          translation={descriptionTranslation}
                          translationClassName="text-[var(--color-text-muted)] text-sm mt-0.5 pl-2"
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {eligibilityResult.needsReview.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text)]">
                <BilingualText english={t.enUi('resultsReviewHeading')} translation={t.tUi('resultsReviewHeading')} />
              </h3>
              <ul className="space-y-2">
                {eligibilityResult.needsReview.map((item) => {
                  const product = PRODUCTS[item.productId];
                  return (
                    <li key={item.productId} className="flex items-start gap-2 pl-4">
                      <span className="text-[var(--color-primary)]">•</span>
                      <span className="text-[var(--color-text)]">
                        <strong>{product.name}</strong>:
                        <span className="block mt-1 space-y-1">
                          {item.reasons.map((r, idx) => {
                            const { english, translation } = resolveReason(r, t);
                            return (
                              <span key={`${r.key}-${idx}`} className="block">
                                <BilingualText english={english} translation={translation} />
                              </span>
                            );
                          })}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {eligibilityResult.ineligible.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text)]">
                <BilingualText english={t.enUi('resultsIneligibleHeading')} translation={t.tUi('resultsIneligibleHeading')} />
              </h3>
              <p className="text-[var(--color-text-muted)] mb-3">
                <BilingualText english={t.enUi('resultsIneligibleIntro')} translation={t.tUi('resultsIneligibleIntro')} />
              </p>
              <ul className="space-y-2">
                {eligibilityResult.ineligible.map((item) => {
                  const product = PRODUCTS[item.productId];
                  return (
                    <li key={item.productId} className="flex items-start gap-2 pl-4">
                      <span className="text-[var(--color-primary)]">•</span>
                      <span className="text-[var(--color-text)]">
                        <strong>{product.name}</strong>:
                        <span className="block mt-1 space-y-1">
                          {item.reasons.map((r, idx) => {
                            const { english, translation } = resolveReason(r, t);
                            return (
                              <span key={`${r.key}-${idx}`} className="block">
                                <BilingualText english={english} translation={translation} />
                              </span>
                            );
                          })}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <hr className="border-[var(--color-border)]" />
          <p className="text-sm text-[var(--color-text-light)] italic">
            <BilingualText english={t.enUi('resultsDisclaimer')} translation={t.tUi('resultsDisclaimer')} />
          </p>
        </div>

        <div className="border-t border-[var(--color-border)] pt-6 space-y-4">
          <p className="text-[var(--color-text-muted)]">
            <BilingualText
              english={t.enUi('resultsReadyToProceed', { firstName: contactInfo.firstName || '' })}
              translation={t.tUi('resultsReadyToProceed', { firstName: contactInfo.firstName || '' })}
            />
          </p>
          <p className="text-[var(--color-text-muted)]">
            <BilingualText
              english={t.enUi('resultsContactNotice', { email: contactInfo.email || '' })}
              translation={t.tUi('resultsContactNotice', { email: contactInfo.email || '' })}
            />
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setShowResults(false);
              setCurrentStepIndex(0);
              setAnswers({});
              setSelectedGoals([]);
              setContactInfo({});
            }}
            className="flex-1"
          >
            <BilingualText english={t.enUi('startOver')} translation={t.tUi('startOver')} />
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="flex-1"
          >
            <BilingualText
              english={isSubmitting ? t.enUi('submitting') : t.enUi('submit')}
              translation={isSubmitting ? t.tUi('submitting') : t.tUi('submit')}
            />
          </Button>
        </div>
      </div>
    );
  }

  // Main questionnaire screen
  const percent = Math.round(((currentStepIndex + 1) / steps.length) * 100);
  return (
    <div className={className}>
      {renderLanguageSelector()}

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-[var(--color-text-muted)] mb-2 gap-4">
          <span>
            <BilingualText
              english={t.enUi('stepProgress', { current: currentStepIndex + 1, total: steps.length })}
              translation={t.tUi('stepProgress', { current: currentStepIndex + 1, total: steps.length })}
            />
          </span>
          <span className="text-right">
            <BilingualText
              english={t.enUi('percentComplete', { percent })}
              translation={t.tUi('percentComplete', { percent })}
            />
          </span>
        </div>
        <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          <BilingualText
            english={currentStep?.title}
            translation={currentStep ? t.tStep(currentStep.id, 'title') : undefined}
          />
        </h2>
        {currentStep?.description && (
          <p className="text-[var(--color-text-muted)] mb-6">
            <BilingualText
              english={currentStep.description}
              translation={t.tStep(currentStep.id, 'description')}
            />
          </p>
        )}

        <div className="space-y-6">
          {currentStep?.questions.map((question) => {
            const textTranslation = t.tQuestion(question.id, 'text');
            const helpTranslation = t.tQuestion(question.id, 'helpText');
            return (
              <div key={question.id}>
                {question.type !== 'acknowledgment' && (
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    <BilingualText english={question.text} translation={textTranslation} />
                    {question.required && <span className="text-[var(--color-error)] ml-1">*</span>}
                  </label>
                )}
                {question.helpText && (
                  <p className="text-sm text-[var(--color-text-light)] mb-2">
                    <BilingualText english={question.helpText} translation={helpTranslation} />
                  </p>
                )}
                {renderQuestion(question)}

                {question.id === 'phone' && (
                  <div className="mt-6 p-4 bg-[var(--color-surface)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
                    <p className="text-sm font-medium text-[var(--color-text)] mb-4">
                      <BilingualText english={t.enUi('smsPreferencesTitle')} translation={t.tUi('smsPreferencesTitle')} />
                    </p>
                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smsTransactionalConsent}
                          onChange={(e) => setSmsTransactionalConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] border-[var(--color-border)]"
                        />
                        <span className="text-sm text-[var(--color-text-muted)]">
                          <BilingualText english={t.enUi('smsTransactionalConsent')} translation={t.tUi('smsTransactionalConsent')} />
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smsMarketingConsent}
                          onChange={(e) => setSmsMarketingConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] border-[var(--color-border)]"
                        />
                        <span className="text-sm text-[var(--color-text-muted)]">
                          <BilingualText english={t.enUi('smsMarketingConsent')} translation={t.tUi('smsMarketingConsent')} />
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-[var(--color-border)] gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            <BilingualText english={t.enUi('previous')} translation={t.tUi('previous')} />
          </Button>
          <Button
            type="button"
            onClick={goToNextStep}
            disabled={!validateStep()}
            rightIcon={currentStepIndex < steps.length - 1 ? <ArrowRight className="h-4 w-4" /> : undefined}
          >
            <BilingualText
              english={currentStepIndex === steps.length - 1 ? t.enUi('seeResults') : t.enUi('continue')}
              translation={currentStepIndex === steps.length - 1 ? t.tUi('seeResults') : t.tUi('continue')}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HealthAssessment;
