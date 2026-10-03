import { Product, ProductId, GoalCategory } from './types';

// ============================================
// TREATMENT CATALOG
// ============================================

export const PRODUCTS: Record<ProductId, Product> = {
  tirzepatide: {
    id: 'tirzepatide',
    name: 'GLP-1/GIP Therapy',
    description: 'Dual-action receptor agonist for weight management',
    category: ['weight_loss'],
    contraindications: [
      'Personal or family history of medullary thyroid carcinoma (MTC)',
      'Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)',
      'History of pancreatitis',
      'Severe gastrointestinal disease',
      'Type 1 diabetes',
      'Diabetic ketoacidosis',
      'Pregnancy or planning to become pregnant',
      'Breastfeeding',
      'Severe kidney disease (eGFR < 30)',
      'History of suicidal thoughts or behavior',
    ],
    requiredScreening: ['BMI', 'diabetes_status', 'thyroid_history', 'gi_conditions', 'kidney_function'],
  },

  semaglutide: {
    id: 'semaglutide',
    name: 'GLP-1 Therapy',
    description: 'Receptor agonist for weight management',
    category: ['weight_loss'],
    contraindications: [
      'Personal or family history of medullary thyroid carcinoma (MTC)',
      'Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)',
      'History of pancreatitis',
      'Severe gastrointestinal disease',
      'Type 1 diabetes',
      'Diabetic ketoacidosis',
      'Pregnancy or planning to become pregnant',
      'Breastfeeding',
      'Severe kidney disease',
      'History of suicidal thoughts or behavior',
    ],
    requiredScreening: ['BMI', 'diabetes_status', 'thyroid_history', 'gi_conditions', 'kidney_function'],
  },

  aod9604: {
    id: 'aod9604',
    name: 'Fat Metabolism Peptide',
    description: 'Peptide derived from growth hormone for metabolism support',
    category: ['weight_loss'],
    contraindications: [
      'Active cancer or history of cancer',
      'Pregnancy or breastfeeding',
      'Severe liver disease',
      'Under 18 years old',
    ],
    requiredScreening: ['cancer_history', 'liver_conditions'],
  },

  lipo_b: {
    id: 'lipo_b',
    name: 'Lipotropic Injection',
    description: 'MIC + B12 for metabolism and energy support',
    category: ['weight_loss', 'energy_wellness'],
    contraindications: [
      'Allergy to any B vitamins',
      'Cobalt allergy',
      'Leber disease (hereditary optic neuropathy)',
      'Severe kidney disease',
    ],
    requiredScreening: ['allergies', 'kidney_function'],
  },

  nad_plus: {
    id: 'nad_plus',
    name: 'NAD+ Therapy',
    description: 'Cellular energy and anti-aging support',
    category: ['anti_aging', 'energy_wellness', 'cognitive_mood'],
    contraindications: [
      'Active cancer',
      'Pregnancy or breastfeeding',
      'Bipolar disorder (may trigger mania)',
      'History of severe anxiety',
    ],
    requiredScreening: ['cancer_history', 'mental_health'],
  },

  sermorelin: {
    id: 'sermorelin',
    name: 'Growth Hormone Peptide',
    description: 'Growth hormone releasing peptide for anti-aging and wellness',
    category: ['anti_aging', 'energy_wellness', 'recovery_healing'],
    contraindications: [
      'Active cancer or history of cancer',
      'Untreated hypothyroidism',
      'Diabetes (uncontrolled)',
      'Pregnancy or breastfeeding',
      'History of intracranial lesions',
      'Carpal tunnel syndrome (may worsen)',
    ],
    requiredScreening: ['cancer_history', 'thyroid_conditions', 'diabetes_status'],
  },

  glutathione: {
    id: 'glutathione',
    name: 'Antioxidant Therapy',
    description: 'Master antioxidant for detoxification and skin health',
    category: ['anti_aging', 'energy_wellness'],
    contraindications: [
      'Asthma (inhaled form can trigger attacks)',
      'Allergy to sulfur-containing compounds',
      'Pregnancy or breastfeeding (limited data)',
    ],
    requiredScreening: ['respiratory_conditions', 'allergies'],
  },

  mots_c: {
    id: 'mots_c',
    name: 'Metabolic Peptide',
    description: 'Mitochondrial peptide for metabolic health and exercise performance',
    category: ['weight_loss', 'energy_wellness', 'anti_aging'],
    contraindications: [
      'Active cancer',
      'Pregnancy or breastfeeding',
      'Severe metabolic disorders',
    ],
    requiredScreening: ['cancer_history'],
  },

  ghk_cu: {
    id: 'ghk_cu',
    name: 'Copper Peptide',
    description: 'Peptide for skin rejuvenation and tissue repair',
    category: ['anti_aging', 'recovery_healing'],
    contraindications: [
      'Wilson disease (copper overload)',
      'Copper allergy',
      'Active skin infection at injection site',
      'Pregnancy or breastfeeding',
    ],
    requiredScreening: ['allergies', 'skin_conditions'],
  },

  bpc157_tb500: {
    id: 'bpc157_tb500',
    name: 'Healing Peptides',
    description: 'Peptides for injury recovery and tissue repair',
    category: ['recovery_healing'],
    contraindications: [
      'Active cancer or history of cancer',
      'Pregnancy or breastfeeding',
      'Active infection',
      'Autoimmune conditions (relative)',
    ],
    requiredScreening: ['cancer_history', 'autoimmune_conditions', 'current_injuries'],
  },

  semax_selank: {
    id: 'semax_selank',
    name: 'Cognitive Peptides',
    description: 'Nootropic peptides for cognitive enhancement and mood support',
    category: ['cognitive_mood'],
    contraindications: [
      'Bipolar disorder',
      'Schizophrenia or psychotic disorders',
      'Pregnancy or breastfeeding',
      'Severe hypertension',
      'History of seizures',
    ],
    requiredScreening: ['mental_health', 'blood_pressure', 'neurological_conditions'],
  },
};

// Goal to product mapping
export const GOAL_PRODUCTS: Record<GoalCategory, ProductId[]> = {
  weight_loss: ['tirzepatide', 'semaglutide', 'aod9604', 'lipo_b', 'mots_c'],
  anti_aging: ['nad_plus', 'sermorelin', 'glutathione', 'mots_c', 'ghk_cu'],
  energy_wellness: ['nad_plus', 'sermorelin', 'glutathione', 'lipo_b', 'mots_c'],
  recovery_healing: ['bpc157_tb500', 'ghk_cu', 'sermorelin'],
  cognitive_mood: ['nad_plus', 'semax_selank'],
};

// Goal display information
export const GOALS: Record<GoalCategory, { title: string; description: string }> = {
  weight_loss: {
    title: 'Weight Management',
    description: 'Support for healthy, sustainable weight loss',
  },
  anti_aging: {
    title: 'Anti-Aging & Longevity',
    description: 'Cellular health, skin rejuvenation, and healthy aging',
  },
  energy_wellness: {
    title: 'Energy & Wellness',
    description: 'Boost energy levels, metabolism, and overall vitality',
  },
  recovery_healing: {
    title: 'Recovery & Healing',
    description: 'Faster recovery from injuries and tissue repair',
  },
  cognitive_mood: {
    title: 'Cognitive & Mood Support',
    description: 'Mental clarity, focus, and emotional wellbeing',
  },
};

export function getProductsForGoals(goals: GoalCategory[]): ProductId[] {
  const products = new Set<ProductId>();
  goals.forEach(goal => {
    GOAL_PRODUCTS[goal].forEach(productId => products.add(productId));
  });
  return Array.from(products);
}
