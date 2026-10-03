import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { RESULTS_REFUND_ACKNOWLEDGMENT, isResultsAcknowledgmentEnabled } from '@/components/intake/acknowledgments';
import { formatPhoneNumber } from '@/lib/twilio';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';
import { sendWeightManagementAssessmentEmail, isEmailConfigured } from '@/lib/email';
import { getContactNotificationEmail } from '@/lib/settings';
import { cookies } from 'next/headers';
import { SIM_ACCESS_COOKIE, issueSimAccessToken, simAccessCookieOptions } from '@/lib/sim-access';
import { simulatorAvailability } from '@/lib/simulator-service';

// Health Assessment questionnaire schema
const questionnaireSchema = z.object({
  contactInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
    dateOfBirth: z.string().min(1),
    state: z.string().min(1),
    biologicalSex: z.string().optional(),
  }),
  selectedGoals: z.array(z.string()),
  answers: z.record(z.string(), z.unknown()),
  eligibleProducts: z.array(z.string()),
  ineligibleProducts: z.array(z.object({
    productId: z.string(),
    reason: z.string(),
  })),
  timestamp: z.string(),
  // Legal acknowledgments ticked on the final step, with the exact text shown.
  acknowledgments: z.array(z.object({
    id: z.string().min(1),
    version: z.string().min(1),
    title: z.string(),
    text: z.string().min(1),
    checkboxLabel: z.string().min(1),
    acceptedAt: z.string(),
  })).optional(),
  smsConsent: z.object({
    transactional: z.boolean(),
    marketing: z.boolean(),
  }).optional(),
  submissionLanguage: z.string().optional(),
  languagesUsed: z.array(z.string()).optional(),
});

// Goal labels for display
const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Management',
  anti_aging: 'Anti-Aging & Longevity',
  energy_wellness: 'Energy & Wellness',
  recovery_healing: 'Recovery & Healing',
  cognitive_mood: 'Cognitive & Mood Support',
};

// Product labels for display
const PRODUCT_LABELS: Record<string, string> = {
  tirzepatide: 'GLP-1/GIP Therapy',
  semaglutide: 'GLP-1 Therapy',
  aod9604: 'Fat Metabolism Peptide',
  lipo_b: 'Lipotropic Injection',
  nad_plus: 'NAD+ Therapy',
  sermorelin: 'Growth Hormone Peptide',
  glutathione: 'Antioxidant Therapy',
  mots_c: 'Metabolic Peptide',
  ghk_cu: 'Copper Peptide',
  bpc157_tb500: 'Healing Peptides',
  semax_selank: 'Cognitive Peptides',
};

export async function POST(request: NextRequest) {
  console.log('=== INTAKE FORM SUBMISSION START ===');
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = questionnaireSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Intake validation failed:', {
        errors: validationResult.error.flatten(),
        receivedKeys: Object.keys(body),
        contactInfoKeys: body.contactInfo ? Object.keys(body.contactInfo) : 'missing',
      });

      // Audit log the failed submission
      const { ipAddress, userAgent } = getRequestInfo(request);
      await logAuditEvent({
        action: 'intake_failed',
        target: body.contactInfo?.email || 'unknown',
        ipAddress,
        userAgent,
        details: {
          reason: 'validation_failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        success: false,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    console.log('Validation passed');

    const { contactInfo, selectedGoals, answers, eligibleProducts, ineligibleProducts, acknowledgments, smsConsent, submissionLanguage, languagesUsed } = validationResult.data;

    // When the results & refund acknowledgment is enabled for this site, a
    // submission without it is refused server-side, not just in the browser.
    if (isResultsAcknowledgmentEnabled()) {
      const ack = (acknowledgments || []).find((a) => a.id === RESULTS_REFUND_ACKNOWLEDGMENT.id);
      if (!ack || ack.version !== RESULTS_REFUND_ACKNOWLEDGMENT.version) {
        return NextResponse.json(
          { success: false, message: 'Please read and accept the Results & Refund Acknowledgment to continue.' },
          { status: 400 }
        );
      }
    }

    // Log all raw answers for debugging

    // Build comprehensive health info summary for CRM
    const healthInfoParts: string[] = [];

    // Add header with timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
    });
    healthInfoParts.push('========================================');
    healthInfoParts.push('HEALTH ASSESSMENT SUBMISSION');
    healthInfoParts.push(`Submitted: ${timestamp}`);
    healthInfoParts.push('========================================');
    healthInfoParts.push('');

    // Language(s) used during the assessment
    const finalLang = submissionLanguage || 'en';
    const langList = languagesUsed && languagesUsed.length > 0 ? languagesUsed.join(', ') : 'en';
    healthInfoParts.push(`FORM LANGUAGE: ${finalLang} (used during session: ${langList})`);

    // Goals
    const goalLabels = selectedGoals.map(g => GOAL_LABELS[g] || g).join(', ');
    healthInfoParts.push(`WELLNESS GOALS: ${goalLabels}`);

    // Physical info with BMI calculation
    if (answers.heightFeet && answers.currentWeight) {
      const heightFeet = answers.heightFeet as number;
      const heightInches = (answers.heightInches as number) || 0;
      const weightLbs = answers.currentWeight as number;

      // Calculate BMI: weight (kg) / height (m)^2
      const totalInches = (heightFeet * 12) + heightInches;
      const heightMeters = totalInches * 0.0254;
      const weightKg = weightLbs * 0.453592;
      const bmi = weightKg / (heightMeters * heightMeters);

      healthInfoParts.push(`HEIGHT/WEIGHT: ${heightFeet}'${heightInches}" / ${weightLbs} lbs`);
      healthInfoParts.push(`CALCULATED BMI: ${bmi.toFixed(1)}`);
    }

    // Eligible treatments
    if (eligibleProducts.length > 0) {
      const eligible = eligibleProducts.map(p => PRODUCT_LABELS[p] || p).join(', ');
      healthInfoParts.push(`POTENTIALLY ELIGIBLE FOR: ${eligible}`);
    }

    // Not eligible
    if (ineligibleProducts.length > 0) {
      const notEligible = ineligibleProducts
        .map(p => `${PRODUCT_LABELS[p.productId] || p.productId} (${p.reason})`)
        .join('; ');
      healthInfoParts.push(`NOT ELIGIBLE FOR: ${notEligible}`);
    }

    // Key screening answers
    const keyAnswers: string[] = [];

    if (answers.diabetesStatus && answers.diabetesStatus !== 'none') {
      keyAnswers.push(`Diabetes: ${answers.diabetesStatus}`);
    }
    if (answers.thyroidHistory && answers.thyroidHistory !== 'no') {
      keyAnswers.push(`Thyroid history: ${answers.thyroidHistory}`);
    }
    if (answers.cancerHistory && answers.cancerHistory !== 'never') {
      keyAnswers.push(`Cancer history: ${answers.cancerHistory}`);
    }
    if (answers.kidneyDisease && answers.kidneyDisease !== 'none') {
      keyAnswers.push(`Kidney: ${answers.kidneyDisease}`);
    }
    if (answers.currentMedications && answers.currentMedications !== 'none') {
      keyAnswers.push(`Medications: ${answers.currentMedications}`);
    }
    if (answers.pregnantOrBreastfeeding === true) {
      keyAnswers.push('Pregnant/breastfeeding: Yes');
    }

    if (keyAnswers.length > 0) {
      healthInfoParts.push(`KEY MEDICAL INFO:\n${keyAnswers.join('\n')}`);
    }

    // Weight-related conditions
    const weightConditions = answers.weightRelatedConditions as string[] | undefined;
    if (weightConditions && weightConditions.length > 0 && !weightConditions.includes('none')) {
      healthInfoParts.push(`WEIGHT-RELATED CONDITIONS: ${weightConditions.join(', ')}`);
    }

    // Allergies
    const allergies = answers.allergies as string[] | undefined;
    if (allergies && allergies.length > 0 && !allergies.includes('none')) {
      healthInfoParts.push(`ALLERGIES: ${allergies.join(', ')}`);
    }

    // Always include a complete screening summary section
    healthInfoParts.push('');
    healthInfoParts.push('--- COMPLETE SCREENING RESPONSES ---');

    // Add all screening answers (including defaults)
    const allScreeningAnswers: string[] = [];

    // Basic demographics
    if (contactInfo.biologicalSex) {
      allScreeningAnswers.push(`Biological Sex: ${contactInfo.biologicalSex}`);
    }
    allScreeningAnswers.push(`State: ${contactInfo.state}`);
    allScreeningAnswers.push(`Date of Birth: ${contactInfo.dateOfBirth}`);

    // Physical measurements with calculated BMI
    if (answers.heightFeet) {
      const hFeet = answers.heightFeet as number;
      const hInches = (answers.heightInches as number) || 0;
      allScreeningAnswers.push(`Height: ${hFeet}'${hInches}"`);
    }
    if (answers.currentWeight) {
      allScreeningAnswers.push(`Weight: ${answers.currentWeight} lbs`);
    }
    // Calculate BMI for display
    if (answers.heightFeet && answers.currentWeight) {
      const hFeet = answers.heightFeet as number;
      const hInches = (answers.heightInches as number) || 0;
      const wLbs = answers.currentWeight as number;
      const totalIn = (hFeet * 12) + hInches;
      const hMeters = totalIn * 0.0254;
      const wKg = wLbs * 0.453592;
      const calculatedBmi = wKg / (hMeters * hMeters);
      allScreeningAnswers.push(`BMI: ${calculatedBmi.toFixed(1)}`);
    }

    // Medical history - always include even if "none"
    allScreeningAnswers.push(`Diabetes: ${answers.diabetesStatus || 'Not answered'}`);
    allScreeningAnswers.push(`Thyroid History: ${answers.thyroidHistory || 'Not answered'}`);
    allScreeningAnswers.push(`Cancer History: ${answers.cancerHistory || 'Not answered'}`);
    allScreeningAnswers.push(`Kidney Disease: ${answers.kidneyDisease || 'Not answered'}`);
    allScreeningAnswers.push(`Pancreatitis History: ${answers.pancreatitisHistory || 'Not answered'}`);
    allScreeningAnswers.push(`Current Medications: ${answers.currentMedications || 'Not answered'}`);
    allScreeningAnswers.push(`Pregnant/Breastfeeding: ${answers.pregnantOrBreastfeeding === true ? 'Yes' : answers.pregnantOrBreastfeeding === false ? 'No' : 'Not answered'}`);

    // Weight-related conditions
    const allWeightConditions = answers.weightRelatedConditions as string[] | undefined;
    allScreeningAnswers.push(`Weight-Related Conditions: ${allWeightConditions && allWeightConditions.length > 0 ? allWeightConditions.join(', ') : 'None reported'}`);

    // Allergies
    const allAllergies = answers.allergies as string[] | undefined;
    allScreeningAnswers.push(`Allergies: ${allAllergies && allAllergies.length > 0 && !allAllergies.includes('none') ? allAllergies.join(', ') : 'None reported'}`);

    // Additional screening questions that may exist
    if (answers.gallbladderHistory !== undefined) {
      allScreeningAnswers.push(`Gallbladder Issues: ${answers.gallbladderHistory}`);
    }
    if (answers.eatingDisorderHistory !== undefined) {
      allScreeningAnswers.push(`Eating Disorder History: ${answers.eatingDisorderHistory}`);
    }
    if (answers.familyMTC !== undefined) {
      allScreeningAnswers.push(`Family History of MTC: ${answers.familyMTC}`);
    }
    if (answers.familyMEN2 !== undefined) {
      allScreeningAnswers.push(`Family History of MEN2: ${answers.familyMEN2}`);
    }

    healthInfoParts.push(allScreeningAnswers.join('\n'));
    healthInfoParts.push('--- END SCREENING RESPONSES ---');

    const healthInfo = healthInfoParts.join('\n');

    // Determine primary program interest based on goals
    const programInterest = selectedGoals.includes('weight_loss')
      ? 'weight-management'
      : selectedGoals[0] || 'wellness';
    console.log('Program interest:', programInterest);

    // Create or update patient user account with verified phone
    console.log('=== DATABASE USER SECTION ===');
    const normalizedPhone = contactInfo.phone.replace(/\D/g, '').slice(-10);
    let patientUserId: string | null = null;
    try {
      // Check if user exists by email or phone
      // Only ever attach an intake to a patient account. A staff (admin) account
      // that happens to share the email or phone must not be modified or used.
      const existingUser = await prisma.user.findFirst({
        where: {
          role: 'patient',
          OR: [
            { email: contactInfo.email },
            { phone: { contains: normalizedPhone } },
          ],
        },
      });
      console.log('Existing user found:', existingUser ? existingUser.id : 'none');

      if (existingUser) {
        // Update existing user
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: `${contactInfo.firstName} ${contactInfo.lastName}`,
            phone: formatPhoneNumber(contactInfo.phone),
            phoneVerified: true,
            dateOfBirth: contactInfo.dateOfBirth,
          },
        });
        patientUserId = existingUser.id;
        console.log('Updated existing patient user:', existingUser.id);
      } else {
        // Create new user
        const newUser = await prisma.user.create({
          data: {
            email: contactInfo.email,
            name: `${contactInfo.firstName} ${contactInfo.lastName}`,
            phone: formatPhoneNumber(contactInfo.phone),
            phoneVerified: true,
            dateOfBirth: contactInfo.dateOfBirth,
            role: 'patient',
          },
        });
        patientUserId = newUser.id;
        console.log('Created new patient user:', newUser.id);
      }
    } catch (dbError) {
      // Typically a unique-email collision with a non-patient account. The
      // assessment still goes through; only the account link (and therefore the
      // simulator) is skipped.
      console.error('Failed to create/update patient user:', dbError instanceof Error ? dbError.name : 'unknown');
    }

    // Save questionnaire submission to database (always)
    console.log('=== SAVING QUESTIONNAIRE SUBMISSION ===');
    const { ipAddress: submissionIP, userAgent: submissionUA } = getRequestInfo(request);
    try {
      const questionnaireSubmission = await prisma.questionnaireSubmission.create({
        data: {
          userId: patientUserId,
          email: contactInfo.email,
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          phone: formatPhoneNumber(contactInfo.phone),
          dateOfBirth: contactInfo.dateOfBirth,
          state: contactInfo.state,
          biologicalSex: contactInfo.biologicalSex || null,
          selectedGoals: JSON.stringify(selectedGoals),
          answers: JSON.stringify(answers),
          eligibleProducts: JSON.stringify(eligibleProducts),
          ineligibleProducts: JSON.stringify(ineligibleProducts),
          submissionLanguage: submissionLanguage || 'en',
          languagesUsed: JSON.stringify(languagesUsed && languagesUsed.length > 0 ? languagesUsed : ['en']),
          healthSummary: healthInfo,
          acknowledgments: acknowledgments && acknowledgments.length > 0 ? JSON.stringify(acknowledgments) : null,
          ipAddress: submissionIP,
          userAgent: submissionUA,
        },
      });
      console.log('Saved questionnaire submission:', questionnaireSubmission.id);
    } catch (questionnaireError) {
      console.error('Failed to save questionnaire submission:', questionnaireError);
      // Don't fail the request if questionnaire save fails
    }

    // Record SMS consent (if provided)
    if (smsConsent) {
      console.log('=== RECORDING SMS CONSENT ===');
      const consentIP = submissionIP;
      const consentUA = submissionUA;

      // Record transactional consent
      try {
        await prisma.smsConsent.create({
          data: {
            email: contactInfo.email,
            phone: formatPhoneNumber(contactInfo.phone),
            firstName: contactInfo.firstName,
            lastName: contactInfo.lastName,
            consentType: 'transactional',
            consented: smsConsent.transactional,
            ipAddress: consentIP,
            userAgent: consentUA,
            source: 'intake_form',
            consentText: 'I agree to receive SMS messages from InfinityU Med Spa for appointment reminders, account updates, and customer support. Message and data rates may apply. Reply STOP to opt out.',
          },
        });
        console.log('Recorded transactional SMS consent:', smsConsent.transactional);
      } catch (consentError) {
        console.error('Failed to record transactional SMS consent:', consentError);
      }

      // Record marketing consent
      try {
        await prisma.smsConsent.create({
          data: {
            email: contactInfo.email,
            phone: formatPhoneNumber(contactInfo.phone),
            firstName: contactInfo.firstName,
            lastName: contactInfo.lastName,
            consentType: 'marketing',
            consented: smsConsent.marketing,
            ipAddress: consentIP,
            userAgent: consentUA,
            source: 'intake_form',
            consentText: 'I agree to receive promotional SMS messages from InfinityU Med Spa about special offers, health tips, and program updates. Message and data rates may apply. Reply STOP to opt out.',
          },
        });
        console.log('Recorded marketing SMS consent:', smsConsent.marketing);
      } catch (consentError) {
        console.error('Failed to record marketing SMS consent:', consentError);
      }
    }

    // Send weight management assessment email if weight_loss is a selected goal
    if (selectedGoals.includes('weight_loss')) {
      console.log('=== SENDING WEIGHT MANAGEMENT ASSESSMENT EMAIL ===');
      try {
        const emailConfigured = await isEmailConfigured();
        const notificationEmail = await getContactNotificationEmail();

        if (emailConfigured && notificationEmail) {
          // Calculate BMI for the email
          const heightFeet = (answers.heightFeet as number) || 0;
          const heightInches = (answers.heightInches as number) || 0;
          const weightLbs = (answers.currentWeight as number) || 0;
          const totalInches = (heightFeet * 12) + heightInches;
          const heightMeters = totalInches * 0.0254;
          const weightKg = weightLbs * 0.453592;
          const bmi = heightMeters > 0 ? weightKg / (heightMeters * heightMeters) : 0;

          const emailResult = await sendWeightManagementAssessmentEmail(
            {
              firstName: contactInfo.firstName,
              lastName: contactInfo.lastName,
              dateOfBirth: contactInfo.dateOfBirth,
              biologicalSex: contactInfo.biologicalSex,
              heightFeet,
              heightInches,
              weightLbs,
              bmi,
              wellnessGoals: selectedGoals.map(g => GOAL_LABELS[g] || g),
              eligibleProducts,
              ineligibleProducts,
            },
            notificationEmail
          );

          if (emailResult.success) {
            console.log('Weight management assessment email sent');
          } else {
            console.error('Failed to send weight management assessment email:', emailResult.error);
          }
        } else {
          console.log('Email not configured or no notification email set - skipping weight management email');
        }
      } catch (emailError) {
        console.error('Error sending weight management assessment email:', emailError);
      }
    }

    // Audit log the successful submission
    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({
      action: 'intake_submitted',
      target: contactInfo.email,
      ipAddress,
      userAgent,
      details: {
        name: `${contactInfo.firstName} ${contactInfo.lastName}`,
        state: contactInfo.state,
        goals: selectedGoals,
        eligibleProducts: eligibleProducts,
      },
      success: true,
    });

    // Simulator access for the pre-signup path: a short-lived, purpose-bound
    // httpOnly cookie tied to the user record just created. No token in any URL.
    let simulatorAvailableFlag = false;
    if (patientUserId && process.env.NEXTAUTH_SECRET) {
      const availability = await simulatorAvailability();
      if (availability.ok) {
        const cookieStore = await cookies();
        cookieStore.set(
          SIM_ACCESS_COOKIE,
          issueSimAccessToken(patientUserId, process.env.NEXTAUTH_SECRET),
          simAccessCookieOptions()
        );
        simulatorAvailableFlag = true;
      }
    }

    console.log('=== INTAKE FORM SUBMISSION COMPLETE ===');
    return NextResponse.json({
      success: true,
      simulatorAvailable: simulatorAvailableFlag,
      message:
        'Thank you for completing your health assessment. A licensed provider will review your information within 24-48 hours.',
    });
  } catch (error) {
    console.error('Intake form error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    // Audit log the error
    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({
      action: 'intake_failed',
      ipAddress,
      userAgent,
      details: {
        reason: 'server_error',
        error: error instanceof Error ? error.message : String(error),
      },
      success: false,
    });

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred processing your request. Please try again.',
      },
      { status: 500 }
    );
  }
}
