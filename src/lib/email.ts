// Email service stub — wire up a real provider when ready.
// The intake route imports these; returning safe no-ops keeps it functional without credentials.

export interface WeightManagementAssessmentData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  biologicalSex?: string;
  heightFeet: number;
  heightInches: number;
  weightLbs: number;
  bmi: number;
  wellnessGoals: string[];
  eligibleProducts: string[];
  ineligibleProducts: Array<{ productId: string; reason: string }>;
}

export async function isEmailConfigured(): Promise<boolean> {
  return false;
}

export async function sendWeightManagementAssessmentEmail(
  _data: WeightManagementAssessmentData,
  _to: string
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Email not configured' };
}
