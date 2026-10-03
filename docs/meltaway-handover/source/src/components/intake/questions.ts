import { Question, GoalCategory } from './types';

// ============================================
// US STATES FOR TELEHEALTH ELIGIBILITY
// ============================================

export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington D.C.' },
];

// ============================================
// STEP 1: CONTACT INFORMATION
// ============================================

export const CONTACT_QUESTIONS: Question[] = [
  {
    id: 'firstName',
    text: 'First Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your first name',
  },
  {
    id: 'lastName',
    text: 'Last Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your last name',
  },
  {
    id: 'email',
    text: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'your@email.com',
    helpText: 'We\'ll use this to send your consultation information',
  },
  {
    id: 'phone',
    text: 'Phone Number',
    type: 'phone',
    required: true,
    placeholder: '(555) 123-4567',
    helpText: 'For appointment confirmations, provider contact, and identity verification',
  },
  {
    id: 'dateOfBirth',
    text: 'Date of Birth',
    type: 'date',
    required: true,
    helpText: 'You must be 18 or older to qualify',
  },
  {
    id: 'state',
    text: 'State of Residence',
    type: 'select',
    required: true,
    options: US_STATES,
    helpText: 'Telehealth services are available in select states',
  },
  {
    id: 'biologicalSex',
    text: 'Sex Assigned at Birth',
    type: 'select',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
    helpText: 'This information helps our medical providers determine safe treatment options. If you are transgender, please select the sex assigned at birth - you can discuss your specific health needs with your provider.',
  },
];

// ============================================
// STEP 2: GOALS SELECTION
// ============================================

export const GOALS_QUESTION: Question = {
  id: 'goals',
  text: 'What are your wellness goals?',
  type: 'multiselect',
  required: true,
  helpText: 'Select all that apply - this helps us determine which treatments may be right for you',
  options: [
    { value: 'weight_loss', label: 'Weight Management - Support for healthy, sustainable weight loss' },
    { value: 'anti_aging', label: 'Anti-Aging & Longevity - Cellular health and skin rejuvenation' },
    { value: 'energy_wellness', label: 'Energy & Wellness - Boost energy and overall vitality' },
    { value: 'recovery_healing', label: 'Recovery & Healing - Faster recovery from injuries' },
    { value: 'cognitive_mood', label: 'Cognitive & Mood - Mental clarity and emotional wellbeing' },
  ],
};

// ============================================
// STEP 3: BASIC HEALTH SCREENING
// ============================================

export const BASIC_HEALTH_QUESTIONS: Question[] = [
  {
    id: 'heightFeet',
    text: 'Height (feet)',
    type: 'number',
    required: true,
    placeholder: '5',
    validation: { min: 3, max: 8 },
    // No relevantGoals - show for all goals
  },
  {
    id: 'heightInches',
    text: 'Height (inches)',
    type: 'number',
    required: true,
    placeholder: '6',
    validation: { min: 0, max: 11 },
    // No relevantGoals - show for all goals
  },
  {
    id: 'currentWeight',
    text: 'Current Weight (lbs)',
    type: 'number',
    required: true,
    placeholder: '180',
    validation: { min: 80, max: 700 },
    // No relevantGoals - show for all goals
    helpText: 'This helps us understand your overall health profile',
  },
  {
    id: 'pregnantOrBreastfeeding',
    text: 'Are you currently pregnant, breastfeeding, or planning to become pregnant in the next 6 months?',
    type: 'boolean',
    required: true,
    disqualifiers: [
      { productId: 'tirzepatide', condition: { operator: 'equals', value: true }, reasonKey: 'pregnancy_unsafe', reason: 'Not safe during pregnancy or breastfeeding' },
      { productId: 'semaglutide', condition: { operator: 'equals', value: true }, reasonKey: 'pregnancy_unsafe', reason: 'Not safe during pregnancy or breastfeeding' },
      { productId: 'aod9604', condition: { operator: 'equals', value: true }, reasonKey: 'pregnancy_unsafe', reason: 'Not safe during pregnancy or breastfeeding' },
      { productId: 'nad_plus', condition: { operator: 'equals', value: true }, reasonKey: 'pregnancy_unsafe', reason: 'Not safe during pregnancy or breastfeeding' },
      { productId: 'sermorelin', condition: { operator: 'equals', value: true }, reasonKey: 'pregnancy_unsafe', reason: 'Not safe during pregnancy or breastfeeding' },
      { productId: 'glutathione', condition: { operator: 'equals', value: true }, reasonKey: 'pregnancy_limited_data', reason: 'Limited safety data during pregnancy' },
      { productId: 'mots_c', condition: { operator: 'equals', value: true }, reasonKey: 'pregnancy_unsafe', reason: 'Not safe during pregnancy or breastfeeding' },
      { productId: 'ghk_cu', condition: { operator: 'equals', value: true }, reasonKey: 'pregnancy_unsafe', reason: 'Not safe during pregnancy or breastfeeding' },
      { productId: 'bpc157_tb500', condition: { operator: 'equals', value: true }, reasonKey: 'pregnancy_unsafe', reason: 'Not safe during pregnancy or breastfeeding' },
      { productId: 'semax_selank', condition: { operator: 'equals', value: true }, reasonKey: 'pregnancy_unsafe', reason: 'Not safe during pregnancy or breastfeeding' },
    ],
  },
];

// ============================================
// STEP 4: WEIGHT LOSS SPECIFIC QUESTIONS
// ============================================

export const WEIGHT_LOSS_QUESTIONS: Question[] = [
  {
    id: 'weightLossAttempts',
    text: 'Have you tried to lose weight through diet and exercise in the past?',
    type: 'select',
    required: true,
    relevantGoals: ['weight_loss'],
    options: [
      { value: 'never', label: 'No, this is my first attempt' },
      { value: 'some', label: 'Yes, a few times with limited success' },
      { value: 'many', label: 'Yes, many times without lasting results' },
      { value: 'currently', label: 'Yes, I am currently working on it' },
    ],
  },
  {
    id: 'diabetesStatus',
    text: 'Do you have diabetes?',
    type: 'select',
    required: true,
    relevantGoals: ['weight_loss'],
    relevantProducts: ['tirzepatide', 'semaglutide', 'sermorelin'],
    options: [
      { value: 'none', label: 'No' },
      { value: 'prediabetes', label: 'Pre-diabetes' },
      { value: 'type2_controlled', label: 'Type 2 Diabetes (well controlled)' },
      { value: 'type2_uncontrolled', label: 'Type 2 Diabetes (not well controlled)' },
      { value: 'type1', label: 'Type 1 Diabetes' },
    ],
    disqualifiers: [
      { productId: 'tirzepatide', condition: { operator: 'equals', value: 'type1' }, reasonKey: 'type1_diabetes', reason: 'Not indicated for Type 1 Diabetes' },
      { productId: 'semaglutide', condition: { operator: 'equals', value: 'type1' }, reasonKey: 'type1_diabetes', reason: 'Not indicated for Type 1 Diabetes' },
      { productId: 'sermorelin', condition: { operator: 'equals', value: 'type2_uncontrolled' }, reasonKey: 'diabetes_uncontrolled', reason: 'Diabetes must be well controlled' },
    ],
  },
  {
    id: 'weightRelatedConditions',
    text: 'Do you have any of these weight-related health conditions?',
    type: 'multiselect',
    required: true,
    relevantGoals: ['weight_loss'],
    helpText: 'These conditions may support eligibility for certain treatments at lower BMI',
    options: [
      { value: 'high_blood_pressure', label: 'High Blood Pressure (Hypertension)' },
      { value: 'high_cholesterol', label: 'High Cholesterol (Dyslipidemia)' },
      { value: 'sleep_apnea', label: 'Sleep Apnea' },
      { value: 'fatty_liver', label: 'Fatty Liver Disease (NAFLD)' },
      { value: 'pcos', label: 'Polycystic Ovary Syndrome (PCOS)' },
      { value: 'joint_pain', label: 'Joint Pain from Excess Weight' },
      { value: 'none', label: 'None of the above' },
    ],
  },
  {
    id: 'thyroidHistory',
    text: 'Do you or any blood relatives have a history of thyroid cancer or Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)?',
    type: 'select',
    required: true,
    relevantGoals: ['weight_loss'],
    relevantProducts: ['tirzepatide', 'semaglutide'],
    options: [
      { value: 'no', label: 'No' },
      { value: 'personal_mtc', label: 'Yes, I have/had medullary thyroid carcinoma' },
      { value: 'family_mtc', label: 'Yes, a family member has/had medullary thyroid carcinoma' },
      { value: 'men2', label: 'Yes, MEN 2 syndrome in myself or family' },
      { value: 'other_thyroid', label: 'Other thyroid condition (not cancer)' },
      { value: 'unsure', label: 'I\'m not sure' },
    ],
    disqualifiers: [
      { productId: 'tirzepatide', condition: { operator: 'equals', value: 'personal_mtc' }, reasonKey: 'mtc_personal', reason: 'Contraindicated with personal history of MTC' },
      { productId: 'tirzepatide', condition: { operator: 'equals', value: 'family_mtc' }, reasonKey: 'mtc_family', reason: 'Contraindicated with family history of MTC' },
      { productId: 'tirzepatide', condition: { operator: 'equals', value: 'men2' }, reasonKey: 'men2_syndrome', reason: 'Contraindicated with MEN 2 syndrome' },
      { productId: 'semaglutide', condition: { operator: 'equals', value: 'personal_mtc' }, reasonKey: 'mtc_personal', reason: 'Contraindicated with personal history of MTC' },
      { productId: 'semaglutide', condition: { operator: 'equals', value: 'family_mtc' }, reasonKey: 'mtc_family', reason: 'Contraindicated with family history of MTC' },
      { productId: 'semaglutide', condition: { operator: 'equals', value: 'men2' }, reasonKey: 'men2_syndrome', reason: 'Contraindicated with MEN 2 syndrome' },
    ],
  },
  {
    id: 'pancreatitisHistory',
    text: 'Have you ever had pancreatitis (inflammation of the pancreas)?',
    type: 'boolean',
    required: true,
    relevantGoals: ['weight_loss'],
    relevantProducts: ['tirzepatide', 'semaglutide'],
    disqualifiers: [
      { productId: 'tirzepatide', condition: { operator: 'equals', value: true }, reasonKey: 'pancreatitis_history', reason: 'History of pancreatitis is a contraindication' },
      { productId: 'semaglutide', condition: { operator: 'equals', value: true }, reasonKey: 'pancreatitis_history', reason: 'History of pancreatitis is a contraindication' },
    ],
  },
  {
    id: 'giConditions',
    text: 'Do you have any of these gastrointestinal conditions?',
    type: 'multiselect',
    required: true,
    relevantGoals: ['weight_loss'],
    relevantProducts: ['tirzepatide', 'semaglutide'],
    options: [
      { value: 'gastroparesis', label: 'Gastroparesis (delayed stomach emptying)' },
      { value: 'ibd', label: 'Inflammatory Bowel Disease (Crohn\'s, Ulcerative Colitis)' },
      { value: 'severe_gerd', label: 'Severe GERD/Acid Reflux' },
      { value: 'gallbladder', label: 'Gallbladder problems or history of gallstones' },
      { value: 'none', label: 'None of the above' },
    ],
    helpText: 'Some treatments may not be suitable for certain GI conditions',
  },
];

// ============================================
// STEP 5: CANCER & SERIOUS CONDITION SCREENING
// ============================================

export const CANCER_SCREENING_QUESTIONS: Question[] = [
  {
    id: 'cancerHistory',
    text: 'Have you ever been diagnosed with cancer?',
    type: 'select',
    required: true,
    options: [
      { value: 'never', label: 'No, never' },
      { value: 'active', label: 'Yes, currently undergoing treatment' },
      { value: 'remission_recent', label: 'Yes, in remission (less than 5 years)' },
      { value: 'remission_long', label: 'Yes, in remission (more than 5 years)' },
    ],
    disqualifiers: [
      { productId: 'aod9604', condition: { operator: 'equals', value: 'active' }, reasonKey: 'cancer_active_treatment', reason: 'Not recommended during active cancer treatment' },
      { productId: 'aod9604', condition: { operator: 'equals', value: 'remission_recent' }, reasonKey: 'oncologist_review', reason: 'Discuss with oncologist first' },
      { productId: 'nad_plus', condition: { operator: 'equals', value: 'active' }, reasonKey: 'cancer_active', reason: 'Not recommended during active cancer' },
      { productId: 'sermorelin', condition: { operator: 'equals', value: 'active' }, reasonKey: 'cancer_active_contraindicated', reason: 'Contraindicated with active cancer' },
      { productId: 'sermorelin', condition: { operator: 'equals', value: 'remission_recent' }, reasonKey: 'oncologist_review', reason: 'Discuss with oncologist first' },
      { productId: 'mots_c', condition: { operator: 'equals', value: 'active' }, reasonKey: 'cancer_active', reason: 'Not recommended during active cancer' },
      { productId: 'bpc157_tb500', condition: { operator: 'equals', value: 'active' }, reasonKey: 'cancer_active', reason: 'Not recommended during active cancer' },
      { productId: 'bpc157_tb500', condition: { operator: 'equals', value: 'remission_recent' }, reasonKey: 'oncologist_review', reason: 'Discuss with oncologist first' },
    ],
  },
  {
    id: 'kidneyDisease',
    text: 'Do you have kidney disease or reduced kidney function?',
    type: 'select',
    required: true,
    options: [
      { value: 'none', label: 'No kidney problems' },
      { value: 'mild', label: 'Mild (Stage 1-2, eGFR > 60)' },
      { value: 'moderate', label: 'Moderate (Stage 3, eGFR 30-60)' },
      { value: 'severe', label: 'Severe (Stage 4-5, eGFR < 30)' },
      { value: 'dialysis', label: 'On dialysis' },
      { value: 'unknown', label: 'I don\'t know' },
    ],
    disqualifiers: [
      { productId: 'tirzepatide', condition: { operator: 'equals', value: 'severe' }, reasonKey: 'severe_kidney_disease', reason: 'Not recommended for severe kidney disease' },
      { productId: 'tirzepatide', condition: { operator: 'equals', value: 'dialysis' }, reasonKey: 'dialysis', reason: 'Not recommended for patients on dialysis' },
      { productId: 'semaglutide', condition: { operator: 'equals', value: 'severe' }, reasonKey: 'severe_kidney_disease', reason: 'Not recommended for severe kidney disease' },
      { productId: 'lipo_b', condition: { operator: 'equals', value: 'severe' }, reasonKey: 'kidney_caution', reason: 'Caution with severe kidney disease' },
    ],
  },
  {
    id: 'liverDisease',
    text: 'Do you have liver disease?',
    type: 'select',
    required: true,
    options: [
      { value: 'none', label: 'No liver problems' },
      { value: 'fatty_liver', label: 'Fatty liver (NAFLD)' },
      { value: 'hepatitis', label: 'Hepatitis (active or chronic)' },
      { value: 'cirrhosis', label: 'Cirrhosis or severe liver disease' },
      { value: 'unknown', label: 'I don\'t know' },
    ],
    disqualifiers: [
      { productId: 'aod9604', condition: { operator: 'equals', value: 'cirrhosis' }, reasonKey: 'severe_liver_disease', reason: 'Not recommended for severe liver disease' },
    ],
  },
];

// ============================================
// STEP 6: MENTAL HEALTH SCREENING
// ============================================

export const MENTAL_HEALTH_QUESTIONS: Question[] = [
  {
    id: 'mentalHealthConditions',
    text: 'Do you have any of these mental health conditions?',
    type: 'multiselect',
    required: true,
    relevantProducts: ['nad_plus', 'semax_selank', 'tirzepatide', 'semaglutide'],
    options: [
      { value: 'depression', label: 'Depression' },
      { value: 'anxiety', label: 'Anxiety disorder' },
      { value: 'bipolar', label: 'Bipolar disorder' },
      { value: 'schizophrenia', label: 'Schizophrenia or psychotic disorder' },
      { value: 'ptsd', label: 'PTSD' },
      { value: 'none', label: 'None of the above' },
    ],
    disqualifiers: [
      { productId: 'nad_plus', condition: { operator: 'includes', value: ['bipolar'] }, reasonKey: 'bipolar_mania_risk', reason: 'May trigger manic episodes in bipolar disorder' },
      { productId: 'semax_selank', condition: { operator: 'includes', value: ['bipolar'] }, reasonKey: 'bipolar_contraindicated', reason: 'Not recommended for bipolar disorder' },
      { productId: 'semax_selank', condition: { operator: 'includes', value: ['schizophrenia'] }, reasonKey: 'psychotic_disorders', reason: 'Not recommended for psychotic disorders' },
    ],
  },
  {
    id: 'suicidalHistory',
    text: 'In the past year, have you had thoughts of harming yourself or suicide?',
    type: 'boolean',
    required: true,
    relevantProducts: ['tirzepatide', 'semaglutide'],
    helpText: 'This is asked because some weight loss treatments require mental health screening',
    disqualifiers: [
      { productId: 'tirzepatide', condition: { operator: 'equals', value: true }, reasonKey: 'mental_health_eval_required', reason: 'Requires mental health evaluation before starting' },
      { productId: 'semaglutide', condition: { operator: 'equals', value: true }, reasonKey: 'mental_health_eval_required', reason: 'Requires mental health evaluation before starting' },
    ],
  },
];

// ============================================
// STEP 7: RECOVERY/HEALING SPECIFIC
// ============================================

export const RECOVERY_QUESTIONS: Question[] = [
  {
    id: 'currentInjury',
    text: 'What type of injury or condition are you looking to heal?',
    type: 'multiselect',
    required: true,
    relevantGoals: ['recovery_healing'],
    options: [
      { value: 'muscle_strain', label: 'Muscle strain or tear' },
      { value: 'tendon', label: 'Tendon injury (tendinitis, partial tear)' },
      { value: 'ligament', label: 'Ligament injury (sprain, partial tear)' },
      { value: 'joint', label: 'Joint pain or inflammation' },
      { value: 'post_surgery', label: 'Post-surgical recovery' },
      { value: 'chronic_pain', label: 'Chronic pain condition' },
      { value: 'skin_wound', label: 'Skin wound or scar healing' },
      { value: 'general_recovery', label: 'General recovery and wellness' },
    ],
  },
  {
    id: 'autoimmune',
    text: 'Do you have an autoimmune condition?',
    type: 'select',
    required: true,
    relevantGoals: ['recovery_healing'],
    relevantProducts: ['bpc157_tb500'],
    options: [
      { value: 'none', label: 'No' },
      { value: 'ra', label: 'Rheumatoid Arthritis' },
      { value: 'lupus', label: 'Lupus' },
      { value: 'ms', label: 'Multiple Sclerosis' },
      { value: 'hashimotos', label: 'Hashimoto\'s Thyroiditis' },
      { value: 'psoriasis', label: 'Psoriasis/Psoriatic Arthritis' },
      { value: 'other', label: 'Other autoimmune condition' },
    ],
    helpText: 'Some healing treatments may affect immune function',
  },
  {
    id: 'activeInfection',
    text: 'Do you currently have an active infection?',
    type: 'boolean',
    required: true,
    relevantGoals: ['recovery_healing'],
    relevantProducts: ['bpc157_tb500', 'ghk_cu'],
    disqualifiers: [
      { productId: 'bpc157_tb500', condition: { operator: 'equals', value: true }, reasonKey: 'active_infection', reason: 'Must resolve infection before starting' },
      { productId: 'ghk_cu', condition: { operator: 'equals', value: true }, reasonKey: 'active_infection', reason: 'Must resolve infection before starting' },
    ],
  },
];

// ============================================
// STEP 8: COGNITIVE/MOOD SPECIFIC
// ============================================

export const COGNITIVE_QUESTIONS: Question[] = [
  {
    id: 'cognitiveGoals',
    text: 'What cognitive or mood improvements are you looking for?',
    type: 'multiselect',
    required: true,
    relevantGoals: ['cognitive_mood'],
    options: [
      { value: 'focus', label: 'Better focus and concentration' },
      { value: 'memory', label: 'Improved memory' },
      { value: 'brain_fog', label: 'Reduce brain fog' },
      { value: 'anxiety', label: 'Reduce anxiety' },
      { value: 'mood', label: 'Better mood stability' },
      { value: 'motivation', label: 'Increased motivation' },
      { value: 'stress', label: 'Better stress resilience' },
    ],
  },
  {
    id: 'seizureHistory',
    text: 'Do you have a history of seizures or epilepsy?',
    type: 'boolean',
    required: true,
    relevantGoals: ['cognitive_mood'],
    relevantProducts: ['semax_selank'],
    disqualifiers: [
      { productId: 'semax_selank', condition: { operator: 'equals', value: true }, reasonKey: 'seizure_history', reason: 'Not recommended with seizure history' },
    ],
  },
  {
    id: 'bloodPressure',
    text: 'Do you have high blood pressure (hypertension)?',
    type: 'select',
    required: true,
    relevantGoals: ['cognitive_mood'],
    relevantProducts: ['semax_selank'],
    options: [
      { value: 'normal', label: 'Normal blood pressure' },
      { value: 'elevated', label: 'Elevated (120-129 / <80)' },
      { value: 'stage1', label: 'Stage 1 Hypertension (130-139 / 80-89)' },
      { value: 'stage2', label: 'Stage 2 Hypertension (140+ / 90+)' },
      { value: 'severe', label: 'Severe / Uncontrolled' },
      { value: 'unknown', label: 'I don\'t know' },
    ],
    disqualifiers: [
      { productId: 'semax_selank', condition: { operator: 'equals', value: 'severe' }, reasonKey: 'blood_pressure_caution', reason: 'Some treatments may affect blood pressure' },
    ],
  },
];

// ============================================
// STEP 9: ANTI-AGING SPECIFIC
// ============================================

export const ANTI_AGING_QUESTIONS: Question[] = [
  {
    id: 'antiAgingGoals',
    text: 'What anti-aging benefits are you most interested in?',
    type: 'multiselect',
    required: true,
    relevantGoals: ['anti_aging'],
    options: [
      { value: 'skin', label: 'Skin health and appearance' },
      { value: 'energy', label: 'Increased energy and vitality' },
      { value: 'sleep', label: 'Better sleep quality' },
      { value: 'muscle', label: 'Maintain muscle mass' },
      { value: 'longevity', label: 'Cellular health and longevity' },
      { value: 'hair', label: 'Hair health' },
      { value: 'immune', label: 'Immune system support' },
    ],
  },
  {
    id: 'thyroidCondition',
    text: 'Do you have a thyroid condition?',
    type: 'select',
    required: true,
    relevantGoals: ['anti_aging'],
    relevantProducts: ['sermorelin'],
    options: [
      { value: 'none', label: 'No thyroid issues' },
      { value: 'hypothyroid_treated', label: 'Hypothyroidism (treated/controlled)' },
      { value: 'hypothyroid_untreated', label: 'Hypothyroidism (untreated)' },
      { value: 'hyperthyroid', label: 'Hyperthyroidism' },
      { value: 'nodules', label: 'Thyroid nodules' },
      { value: 'other', label: 'Other thyroid condition' },
    ],
    disqualifiers: [
      { productId: 'sermorelin', condition: { operator: 'equals', value: 'hypothyroid_untreated' }, reasonKey: 'thyroid_untreated', reason: 'Thyroid must be treated before starting' },
    ],
  },
  {
    id: 'wilsonDisease',
    text: 'Do you have Wilson\'s disease or any copper metabolism disorder?',
    type: 'boolean',
    required: true,
    relevantGoals: ['anti_aging', 'recovery_healing'],
    relevantProducts: ['ghk_cu'],
    disqualifiers: [
      { productId: 'ghk_cu', condition: { operator: 'equals', value: true }, reasonKey: 'wilsons_disease', reason: 'Copper peptides contraindicated with Wilson\'s disease' },
    ],
  },
];

// ============================================
// STEP 10: ALLERGIES & MEDICATIONS
// ============================================

export const ALLERGY_QUESTIONS: Question[] = [
  {
    id: 'allergies',
    text: 'Do you have any of these allergies?',
    type: 'multiselect',
    required: true,
    options: [
      { value: 'b_vitamins', label: 'B vitamins' },
      { value: 'cobalt', label: 'Cobalt' },
      { value: 'sulfur', label: 'Sulfur compounds' },
      { value: 'copper', label: 'Copper' },
      { value: 'none', label: 'None of the above' },
    ],
    disqualifiers: [
      { productId: 'lipo_b', condition: { operator: 'includes', value: ['b_vitamins'] }, reasonKey: 'allergy_b_vitamins', reason: 'Contains B vitamins' },
      { productId: 'lipo_b', condition: { operator: 'includes', value: ['cobalt'] }, reasonKey: 'allergy_cobalt', reason: 'B12 contains cobalt' },
      { productId: 'glutathione', condition: { operator: 'includes', value: ['sulfur'] }, reasonKey: 'allergy_sulfur', reason: 'Contains sulfur' },
      { productId: 'ghk_cu', condition: { operator: 'includes', value: ['copper'] }, reasonKey: 'allergy_copper', reason: 'Contains copper' },
    ],
  },
  {
    id: 'asthma',
    text: 'Do you have asthma or respiratory conditions?',
    type: 'boolean',
    required: true,
    relevantProducts: ['glutathione'],
    disqualifiers: [
      { productId: 'glutathione', condition: { operator: 'equals', value: true }, reasonKey: 'asthma_trigger', reason: 'May trigger asthma symptoms' },
    ],
  },
  {
    id: 'currentMedications',
    text: 'Are you currently taking any prescription medications?',
    type: 'select',
    required: true,
    options: [
      { value: 'none', label: 'No prescription medications' },
      { value: 'diabetes', label: 'Diabetes medications (insulin, metformin, etc.)' },
      { value: 'blood_thinners', label: 'Blood thinners (warfarin, aspirin, etc.)' },
      { value: 'thyroid', label: 'Thyroid medications' },
      { value: 'psychiatric', label: 'Psychiatric medications (antidepressants, etc.)' },
      { value: 'other', label: 'Other prescription medications' },
      { value: 'multiple', label: 'Multiple of the above' },
    ],
    helpText: 'Our providers will review all medications for interactions',
  },
];

// ============================================
// STEP 11: FINAL CONFIRMATION
// ============================================

export const FINAL_QUESTIONS: Question[] = [
  {
    id: 'healthcareProvider',
    text: 'Do you have a primary care physician or healthcare provider?',
    type: 'boolean',
    required: true,
  },
  {
    id: 'understandDisclaimer',
    text: 'I understand that completing this questionnaire does not guarantee approval for any treatment, and that a licensed medical provider will make the final determination based on my complete health profile.',
    type: 'boolean',
    required: true,
  },
  {
    id: 'consentToContact',
    text: 'I consent to being contacted by a medical provider to discuss my wellness goals and potential treatment options.',
    type: 'boolean',
    required: true,
  },
];

// ============================================
// ASSEMBLE QUESTIONNAIRE STEPS
// ============================================

import { QuestionnaireStep } from './types';
import {
  RESULTS_ACKNOWLEDGMENT_QUESTION_ID,
  RESULTS_REFUND_ACKNOWLEDGMENT,
  isResultsAcknowledgmentEnabled,
} from './acknowledgments';

// Defined unconditionally so the translation drift checker sees it; only
// shown when the acknowledgment is enabled (see getQuestionnaireSteps).
export const ACKNOWLEDGMENT_QUESTIONS: Question[] = [
  {
    id: RESULTS_ACKNOWLEDGMENT_QUESTION_ID,
    text: RESULTS_REFUND_ACKNOWLEDGMENT.checkboxLabel,
    type: 'acknowledgment',
    required: true,
    acknowledgment: RESULTS_REFUND_ACKNOWLEDGMENT,
  },
];

export function getQuestionnaireSteps(selectedGoals: GoalCategory[]): QuestionnaireStep[] {
  const steps: QuestionnaireStep[] = [
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Let\'s start with your basic information',
      questions: CONTACT_QUESTIONS,
    },
    {
      id: 'goals',
      title: 'Your Wellness Goals',
      description: 'What would you like to achieve?',
      questions: [GOALS_QUESTION],
    },
    {
      id: 'basic_health',
      title: 'Basic Health Information',
      description: 'Help us understand your current health status',
      questions: filterQuestionsByGoals(BASIC_HEALTH_QUESTIONS, selectedGoals),
    },
  ];

  // Add goal-specific steps
  if (selectedGoals.includes('weight_loss')) {
    steps.push({
      id: 'weight_loss',
      title: 'Weight Management Screening',
      description: 'Questions specific to weight loss treatments',
      questions: WEIGHT_LOSS_QUESTIONS,
    });
  }

  // Always include cancer screening (applies to many products)
  steps.push({
    id: 'serious_conditions',
    title: 'Medical History',
    description: 'Important health conditions to review',
    questions: CANCER_SCREENING_QUESTIONS,
  });

  // Mental health screening for relevant products
  if (selectedGoals.includes('cognitive_mood') || selectedGoals.includes('weight_loss')) {
    steps.push({
      id: 'mental_health',
      title: 'Mental Health',
      description: 'These questions help us ensure treatments are safe for you',
      questions: filterQuestionsByGoals(MENTAL_HEALTH_QUESTIONS, selectedGoals),
    });
  }

  if (selectedGoals.includes('recovery_healing')) {
    steps.push({
      id: 'recovery',
      title: 'Recovery & Healing',
      description: 'Tell us about what you\'re looking to heal',
      questions: RECOVERY_QUESTIONS,
    });
  }

  if (selectedGoals.includes('cognitive_mood')) {
    steps.push({
      id: 'cognitive',
      title: 'Cognitive & Mood Goals',
      description: 'Help us understand your cognitive wellness needs',
      questions: COGNITIVE_QUESTIONS,
    });
  }

  if (selectedGoals.includes('anti_aging')) {
    steps.push({
      id: 'anti_aging',
      title: 'Anti-Aging & Longevity',
      description: 'Tell us about your anti-aging goals',
      questions: ANTI_AGING_QUESTIONS,
    });
  }

  // Always include allergies and final confirmation
  steps.push({
    id: 'allergies',
    title: 'Allergies & Medications',
    description: 'Important safety information',
    questions: ALLERGY_QUESTIONS,
  });

  steps.push({
    id: 'confirmation',
    title: 'Review & Confirm',
    description: 'Almost done!',
    questions: FINAL_QUESTIONS,
  });

  // Results & refund acknowledgment: the last questionnaire step, before the
  // results screen and the simulator. Site-specific; see acknowledgments.ts.
  if (isResultsAcknowledgmentEnabled()) {
    steps.push({
      id: 'results_acknowledgment',
      title: RESULTS_REFUND_ACKNOWLEDGMENT.title,
      description: RESULTS_REFUND_ACKNOWLEDGMENT.description,
      questions: ACKNOWLEDGMENT_QUESTIONS,
    });
  }

  return steps;
}

function filterQuestionsByGoals(questions: Question[], goals: GoalCategory[]): Question[] {
  return questions.filter(q => {
    if (!q.relevantGoals || q.relevantGoals.length === 0) return true;
    return q.relevantGoals.some(g => goals.includes(g));
  });
}
