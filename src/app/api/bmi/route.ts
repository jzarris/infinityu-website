import { NextRequest, NextResponse } from 'next/server';

function calcBMI(weight: number, height: number, unit: 'imperial' | 'metric'): number {
  if (unit === 'imperial') {
    return (weight / (height * height)) * 703;
  }
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

function getCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const weight = parseFloat(searchParams.get('weight') || '');
  const height = parseFloat(searchParams.get('height') || '');
  const unit = searchParams.get('unit') === 'metric' ? 'metric' : 'imperial';

  if (!weight || weight <= 0 || !height || height <= 0) {
    return NextResponse.json(
      { error: 'Valid height and weight are required' },
      { status: 400 },
    );
  }

  const bmi = Math.round(calcBMI(weight, height, unit) * 10) / 10;
  const category = getCategory(bmi);

  return NextResponse.json({ bmi, category, unit });
}
