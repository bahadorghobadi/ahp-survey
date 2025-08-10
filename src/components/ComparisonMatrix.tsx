'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

interface ComparisonMatrixProps {
  criteria: string[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  locale: string;
}

const scaleValues = [
  { value: 1/9, label: '1/9' },
  { value: 1/8, label: '1/8' },
  { value: 1/7, label: '1/7' },
  { value: 1/6, label: '1/6' },
  { value: 1/5, label: '1/5' },
  { value: 1/4, label: '1/4' },
  { value: 1/3, label: '1/3' },
  { value: 1/2, label: '1/2' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
];

export default function ComparisonMatrix({ 
  criteria, 
  values, 
  onChange, 
  locale 
}: ComparisonMatrixProps) {
  const t = useTranslations();

  const getMatrixKey = (i: number, j: number) => `${i}_${j}`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="matrix-cell matrix-header border-gray-300"></th>
            {criteria.map((criterion, index) => (
              <th key={index} className="matrix-cell matrix-header border-gray-300 text-sm">
                {criterion}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criteria.map((criterion, i) => (
            <tr key={i}>
              <th className="matrix-cell matrix-header border-gray-300 text-sm">
                {criterion}
              </th>
              {criteria.map((_, j) => {
                const key = getMatrixKey(i, j);

                if (i === j) {
                  return (
                    <td key={j} className="matrix-cell border-gray-300 bg-gray-100 font-semibold">
                      1
                    </td>
                  );
                }

                if (i > j) {
                  const reciprocalKey = getMatrixKey(j, i);
                  const reciprocalValue = values[reciprocalKey] || 1;
                  const displayValue = reciprocalValue === 1 ? '1' : `1/${reciprocalValue}`;
                  return (
                    <td key={j} className="matrix-cell border-gray-300 bg-gray-50 text-gray-600">
                      {displayValue}
                    </td>
                  );
                }

                return (
                  <td key={j} className="matrix-cell border-gray-300 p-1">
                    <select
                      value={values[key] || 1}
                      onChange={(e) => onChange(key, parseFloat(e.target.value))}
                      className="w-full text-sm border rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-utBlue"
                    >
                      {scaleValues.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}