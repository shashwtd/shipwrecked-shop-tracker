'use client';

import { useState } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { ShellDisplay } from './ShellDisplay';

interface HourlyCalculatorProps {
  onRateChange?: (rate: number) => void;
}

export function HourlyCalculator({ onRateChange }: HourlyCalculatorProps) {
  const [hourlyRate, setHourlyRate] = useState(5);
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618
  const shellsPerHour = Math.round(phi * 10); // ≈ 16 shells per hour

  const handleRateChange = (newRate: number) => {
    setHourlyRate(newRate);
    onRateChange?.(newRate);
  };

  const shellsPerDollar = shellsPerHour / hourlyRate;
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Shell Value Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Hourly Rate
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => handleRateChange(Number(e.target.value) || 0)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5.00"
              step="0.50"
              min="0"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">/hr</span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-sm text-blue-600 font-medium mb-1">Shells per Hour</div>
          <div className="text-2xl font-bold text-blue-900">
            <ShellDisplay amount={shellsPerHour} className="text-2xl font-bold" />
          </div>
          <div className="text-xs text-blue-600 mt-1">φ × 10 ≈ {shellsPerHour}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-sm text-green-600 font-medium mb-1">Shells per Dollar</div>
          <div className="text-2xl font-bold text-green-900">
            <ShellDisplay amount={shellsPerDollar} className="text-2xl font-bold" />
          </div>
          <div className="text-xs text-green-600 mt-1">Real value of your time</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <strong>How it works:</strong> For every approved hour you work, you earn{' '}
          <ShellDisplay amount={shellsPerHour} className="font-medium" />.
          At ${hourlyRate}/hr, each shell is worth approximately ${(hourlyRate / shellsPerHour).toFixed(3)}.
        </div>
      </div>
    </div>
  );
}
