'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';
import { Calculator } from 'lucide-react';

type Unit = 'imperial' | 'metric';

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
}

function calcBMI(weight: number, height: number, unit: Unit): number {
  if (unit === 'imperial') {
    // weight in lbs, height in inches
    return (weight / (height * height)) * 703;
  }
  // weight in kg, height in cm
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

function getCategory(bmi: number): { category: string; color: string } {
  if (bmi < 18.5) return { category: 'Underweight', color: '#3b82f6' };
  if (bmi < 25) return { category: 'Normal', color: '#22c55e' };
  if (bmi < 30) return { category: 'Overweight', color: '#f59e0b' };
  return { category: 'Obese', color: '#ef4444' };
}

export function BMICalculator() {
  const searchParams = useSearchParams();
  const [unit, setUnit] = useState<Unit>('imperial');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<BMIResult | null>(null);

  useEffect(() => {
    const heightParam = searchParams.get('height');
    const weightParam = searchParams.get('weight');

    if (heightParam) {
      const totalInches = parseFloat(heightParam);
      if (totalInches > 0) {
        setFeet(String(Math.floor(totalInches / 12)));
        setInches(String(totalInches % 12));
      }
    }
    if (weightParam) {
      const w = parseFloat(weightParam);
      if (w > 0) setWeight(String(w));
    }
  }, [searchParams]);

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();

    const w = parseFloat(weight);
    if (!w || w <= 0) return;

    let h: number;
    if (unit === 'imperial') {
      const ft = parseFloat(feet) || 0;
      const inc = parseFloat(inches) || 0;
      h = ft * 12 + inc;
    } else {
      h = parseFloat(heightCm);
    }

    if (!h || h <= 0) return;

    const bmi = calcBMI(w, h, unit);
    const { category, color } = getCategory(bmi);
    setResult({ bmi, category, color });
  }

  function handleReset() {
    setFeet('');
    setInches('');
    setHeightCm('');
    setWeight('');
    setResult(null);
  }

  const inputCls =
    'w-full px-4 py-3 rounded-lg border border-border bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors text-sm';

  return (
    <Card className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center">
          <Calculator className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold">BMI Calculator</h3>
          <p className="text-text-muted text-xs">Check your Body Mass Index</p>
        </div>
      </div>

      {/* Unit toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden mb-5">
        {(['imperial', 'metric'] as Unit[]).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => {
              setUnit(u);
              setResult(null);
            }}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: unit === u ? 'var(--color-accent)' : 'transparent',
              color: unit === u ? 'white' : 'var(--color-text-muted)',
            }}
          >
            {u === 'imperial' ? 'Imperial (lbs/ft)' : 'Metric (kg/cm)'}
          </button>
        ))}
      </div>

      <form onSubmit={handleCalculate} className="space-y-4">
        {/* Height */}
        {unit === 'imperial' ? (
          <div>
            <label className="block text-sm font-medium mb-1.5">Height</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="8"
                  placeholder="5"
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  className={inputCls}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light text-xs">
                  ft
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="11"
                  placeholder="6"
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  className={inputCls}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light text-xs">
                  in
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1.5">Height</label>
            <div className="relative">
              <input
                type="number"
                min="50"
                max="250"
                placeholder="170"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className={inputCls}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light text-xs">
                cm
              </span>
            </div>
          </div>
        )}

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Weight</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="999"
              step="0.1"
              placeholder={unit === 'imperial' ? '150' : '70'}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={inputCls}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light text-xs">
              {unit === 'imperial' ? 'lbs' : 'kg'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg font-medium text-sm transition-colors"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
          }}
        >
          Calculate BMI
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-6 pt-6 border-t border-border text-center animate-fade-in">
          <p className="text-text-muted text-sm mb-1">Your BMI</p>
          <p className="text-4xl font-bold mb-1" style={{ color: result.color }}>
            {result.bmi.toFixed(1)}
          </p>
          <p className="font-medium text-sm mb-4" style={{ color: result.color }}>
            {result.category}
          </p>

          {/* Scale bar */}
          <div className="relative h-3 rounded-full overflow-hidden mb-2">
            <div className="absolute inset-0 flex">
              <div className="flex-1" style={{ backgroundColor: '#3b82f6' }} />
              <div className="flex-1" style={{ backgroundColor: '#22c55e' }} />
              <div className="flex-1" style={{ backgroundColor: '#f59e0b' }} />
              <div className="flex-1" style={{ backgroundColor: '#ef4444' }} />
            </div>
            {/* Pointer */}
            <div
              className="absolute top-0 h-full w-1 bg-white shadow-sm rounded-full transition-all"
              style={{
                left: `${Math.min(Math.max(((result.bmi - 15) / 25) * 100, 0), 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-text-light mb-5">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>

          <p className="text-text-muted text-xs mb-4">
            BMI is a screening tool — not a diagnosis. Our physicians can help
            you understand your results and build a plan tailored to your body.
          </p>

          <div className="flex gap-3">
            {BUSINESS.bookingUrl && (
              <Button href={BUSINESS.bookingUrl} variant="accent" size="sm" className="flex-1">
                Book Consultation
              </Button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm rounded-lg border border-border text-text-muted hover:bg-surface transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
