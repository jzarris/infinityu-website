import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createContact, createLead, createCustomRecord, isZohoConfiguredAsync } from '@/lib/zoho';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { formatPhoneNumber, notifyAdminOfIntake } from '@/lib/twilio';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';
import { sendWeightManagementAssessmentEmail, isEmailConfigured } from '@/lib/email';
import { getContactNotificationEmail } from '@/lib/settings';
import { cookies } from 'next/headers';
import { SIM_ACCESS_COOKIE, issueSimAccessToken, simAccessCookieOptions } from '@/lib/sim-access';
import { simulatorAvailability } from '@/lib/simulator-service';
import { isAestheticIQConfigured, createClientFromLocalPatient } from '@/lib/aestheticiq';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'config', 'settings.json');

/**
 * Add state-based tag (CA or NoCA) to a user
 */
async function addStateTag(userId: string, state: string): Promise<void> {
  try {
    const isCA = state.toUpperCase() === 'CA' || state.toLowerCase() === 'california';
    const tagName = isCA ? 'CA' : 'NoCA';
    const tagColor = isCA ? '#3B82F6' : '#F59E0B'; // Blue for CA, Amber for NoCA

    // Find or create the tag
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: {
        name: tagName,
        color: tagColor,
      },
    });

    // Check if user already has this tag
    const existingTag = await prisma.userTag.findUnique({
      where: {
        userId_tagId: {
          userId,
          tagId: tag.id,
        },
      },
    });

    if (!existingTag) {
      await prisma.userTag.create({
        data: {
          userId,
          tagId: tag.id,
        },
      });
      console.log(`Added ${tagName} tag to user ${userId}`);
    }
  } catch (error) {
    console.error('Failed to add state tag:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Push a newly-created/updated intake patient to AestheticIQ as a client.
 * Fire-and-forget: never blocks the intake response, never throws.
 * Skips if AestheticIQ isn't configured or the user is already linked.
 */
async function pushPatientToAestheticIQ(
  userId: string,
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    dateOfBirth: string | null;
    biologicalSex: string | null;
  }
): Promise<void> {
  try {
    if (!(await isAestheticIQConfigured())) return;

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { aestheticIqClientId: true },
    });
    if (existing?.aestheticIqClientId) return;

    const result = await createClientFromLocalPatient(patient);

    if (!result.success) {
      // The sync route will pick this up later via email match
      console.warn(`AestheticIQ create skipped for ${patient.email}: ${result.error}`);
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { aestheticIqClientId: result.clientId },
    });
    console.log(`Created AestheticIQ client ${result.clientId} for ${patient.email}`);
  } catch (err) {
    console.error('pushPatientToAestheticIQ failed:', err);
  }
}

interface ZohoModuleConfig {
  enabled: boolean;
  moduleName: string;
}

interface ZohoSettings {
  zoho_intake_contacts?: ZohoModuleConfig;
  zoho_intake_leads?: ZohoModuleConfig;
  zoho_intake_custom?: ZohoModuleConfig;
}

async function getZohoModuleSettings(): Promise<ZohoSettings> {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(data);
    return {
      zoho_intake_contacts: settings.zoho_intake_contacts ?? { enabled: true, moduleName: 'Contacts' },
      zoho_intake_leads: settings.zoho_intake_leads ?? { enabled: true, moduleName: 'Leads' },
      zoho_intake_custom: settings.zoho_intake_custom ?? { enabled: false, moduleName: '' },
    };
  } catch {
    // Default settings if file doesn't exist
    return {
      zoho_intake_contacts: { enabled: true, moduleName: 'Contacts' },
      zoho_intake_leads: { enabled: true, moduleName: 'Leads' },
      zoho_intake_custom: { enabled: false, moduleName: '' },
    };
  }
}

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

    const { contactInfo, selectedGoals, answers, eligibleProducts, ineligibleProducts, smsConsent, submissionLanguage, languagesUsed } = validationResult.data;

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

        // Add state-based tag to existing user if not already present
        await addStateTag(existingUser.id, contactInfo.state);
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

        // Add state-based tag to new user
        await addStateTag(newUser.id, contactInfo.state);
      }
    } catch (dbError) {
      // Typically a unique-email collision with a non-patient account. The
      // assessment still goes through; only the account link (and therefore the
      // simulator) is skipped.
      console.error('Failed to create/update patient user:', dbError instanceof Error ? dbError.name : 'unknown');
    }

    // Fire-and-forget: push patient to AestheticIQ as a client
    if (patientUserId) {
      pushPatientToAestheticIQ(patientUserId, {
        id: patientUserId,
        name: `${contactInfo.firstName} ${contactInfo.lastName}`,
        email: contactInfo.email,
        phone: formatPhoneNumber(contactInfo.phone),
        dateOfBirth: contactInfo.dateOfBirth,
        biologicalSex: contactInfo.biologicalSex ?? null,
      }).catch((err) => {
        console.error('AestheticIQ push failed (non-fatal):', err);
      });
    }

    // Track Zoho IDs for questionnaire submission
    let zohoContactId: string | null = null;
    let zohoLeadId: string | null = null;

    // Try to create records in Zoho CRM
    const zohoConfigured = await isZohoConfiguredAsync();
    console.log('=== ZOHO SECTION ===');
    console.log('Zoho configured:', zohoConfigured);

    if (zohoConfigured) {
      // Get module settings
      const moduleSettings = await getZohoModuleSettings();
      console.log('Module settings:', JSON.stringify(moduleSettings, null, 2));

      // Create Contact if enabled
      if (moduleSettings.zoho_intake_contacts?.enabled) {
        const result = await createContact({
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          dateOfBirth: contactInfo.dateOfBirth,
          address: {
            street: '',
            city: '',
            state: contactInfo.state,
            zip: '',
          },
          programInterest: programInterest,
          healthInfo: healthInfo,
        });

        console.log('Zoho createContact result:', JSON.stringify(result, null, 2));
        if (!result.success) {
          console.error('Failed to create Zoho contact:', result.error);
        } else {
          zohoContactId = result.id || null;
          console.log('Created Zoho contact:', result.id, result.updated ? '(updated existing)' : '(new)');
        }
      } else {
        console.log('Contacts module disabled - skipping');
      }

      // Create Lead if enabled
      if (moduleSettings.zoho_intake_leads?.enabled) {
        const leadResult = await createLead({
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          interest: goalLabels,
          message: healthInfo,
          source: 'Website - Health Assessment',
        });

        console.log('Zoho createLead result:', JSON.stringify(leadResult, null, 2));
        if (!leadResult.success) {
          console.error('Failed to create Zoho lead:', leadResult.error);
        } else {
          zohoLeadId = leadResult.id || null;
          console.log('Created Zoho lead:', leadResult.id, leadResult.updated ? '(updated existing)' : '(new)');
        }
      } else {
        console.log('Leads module disabled - skipping');
      }

      // Create Custom record if enabled
      if (moduleSettings.zoho_intake_custom?.enabled && moduleSettings.zoho_intake_custom?.moduleName) {
        console.log('Attempting to create Zoho custom record in:', moduleSettings.zoho_intake_custom.moduleName);
        const customResult = await createCustomRecord(moduleSettings.zoho_intake_custom.moduleName, {
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          description: healthInfo,
        });
        console.log('[INTAKE] createCustomRecord returned');

        console.log('Zoho createCustomRecord result:', JSON.stringify(customResult, null, 2));
        if (!customResult.success) {
          console.error('Failed to create Zoho custom record:', customResult.error);
        } else {
          console.log('Created Zoho custom record:', customResult.id, customResult.updated ? '(updated existing)' : '(new)');
        }
      } else {
        console.log('Custom module disabled or not configured - skipping');
      }
    } else {
      console.log('Zoho NOT configured - skipping CRM');
      // Zoho not configured - save to local JSON file as fallback
      console.warn('Zoho CRM not configured - saving submission locally');

      const submission = {
        id: `intake_${Date.now()}`,
        timestamp: validationResult.data.timestamp,
        contactInfo: {
          name: `${contactInfo.firstName} ${contactInfo.lastName}`,
          email: contactInfo.email,
          phone: contactInfo.phone,
          dateOfBirth: contactInfo.dateOfBirth,
          state: contactInfo.state,
          biologicalSex: contactInfo.biologicalSex,
        },
        goals: goalLabels,
        eligibleProducts: eligibleProducts.map(p => PRODUCT_LABELS[p] || p),
        ineligibleProducts: ineligibleProducts.map(p => ({
          product: PRODUCT_LABELS[p.productId] || p.productId,
          reason: p.reason,
        })),
        healthInfo: healthInfo,
        rawAnswers: answers,
      };

      // Save to data directory
      const dataDir = path.join(process.cwd(), 'data', 'submissions');
      await mkdir(dataDir, { recursive: true });

      const filename = `${submission.id}.json`;
      await writeFile(
        path.join(dataDir, filename),
        JSON.stringify(submission, null, 2)
      );

      console.log(`Saved submission to data/submissions/${filename}`);
    }

    // Save questionnaire submission to database (always, regardless of Zoho)
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
          ipAddress: submissionIP,
          userAgent: submissionUA,
          zohoContactId,
          zohoLeadId,
          zohoSyncedAt: (zohoContactId || zohoLeadId) ? new Date() : null,
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
            consentText: 'I agree to receive SMS messages from MeltAwayMD for appointment reminders, account updates, and customer support. Message and data rates may apply. Reply STOP to opt out.',
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
            consentText: 'I agree to receive promotional SMS messages from MeltAwayMD about special offers, health tips, and program updates. Message and data rates may apply. Reply STOP to opt out.',
          },
        });
        console.log('Recorded marketing SMS consent:', smsConsent.marketing);
      } catch (consentError) {
        console.error('Failed to record marketing SMS consent:', consentError);
      }
    }

    // Send admin SMS notification (don't await - fire and forget)
    notifyAdminOfIntake(
      `${contactInfo.firstName} ${contactInfo.lastName}`,
      contactInfo.phone
    ).catch((err) => {
      console.error('Failed to send admin notification:', err);
    });

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
        zohoConfigured: zohoConfigured,
      },
      success: true,
    });

    // Simulator access for the pre-signup path: a short-lived, purpose-bound
    // httpOnly cookie tied to the user record just created. No token in any URL.
    let simulatorAvailable = false;
    if (patientUserId && process.env.NEXTAUTH_SECRET) {
      const availability = await simulatorAvailability();
      if (availability.ok) {
        const cookieStore = await cookies();
        cookieStore.set(
          SIM_ACCESS_COOKIE,
          issueSimAccessToken(patientUserId, process.env.NEXTAUTH_SECRET),
          simAccessCookieOptions()
        );
        simulatorAvailable = true;
      }
    }

    console.log('=== INTAKE FORM SUBMISSION COMPLETE ===');
    return NextResponse.json({
      success: true,
      simulatorAvailable,
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
