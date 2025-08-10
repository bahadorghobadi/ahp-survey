'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateAHP } from '@/lib/ahp';
import ComparisonMatrix from '@/components/ComparisonMatrix';

interface FormData {
  name: string;
  email?: string;
  org?: string;
  position?: string;
  [key: string]: any;
}

interface StepConfig {
  title: string;
  criteria: string[];
  criteriaKeys: string[];
}

export default function SurveyPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [currentStep, setCurrentStep] = useState(0);
  const [matrixValues, setMatrixValues] = useState<Record<string, Record<string, number>>>({});
  const [ahpResults, setAhpResults] = useState<Record<string, any>>({});
  const [participantId, setParticipantId] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const steps: StepConfig[] = [
    {
      title: t('step0.title'),
      criteria: [],
      criteriaKeys: []
    },
    {
      title: t('step1.title'),
      criteria: [
        t('step1.criteria.naturalHazards'),
        t('step1.criteria.naturalNoise'),
        t('step1.criteria.artificialNoise')
      ],
      criteriaKeys: ['naturalHazards', 'naturalNoise', 'artificialNoise']
    },
    {
      title: t('step2.title'),
      criteria: [
        t('step2.criteria.geology'),
        t('step2.criteria.faults'),
        t('step2.criteria.earthquake')
      ],
      criteriaKeys: ['geology', 'faults', 'earthquake']
    },
    {
      title: t('step3.title'),
      criteria: [
        t('step3.criteria.topography'),
        t('step3.criteria.coastlines'),
        t('step3.criteria.anomalies')
      ],
      criteriaKeys: ['topography', 'coastlines', 'anomalies']
    },
    {
      title: t('step4.title'),
      criteria: [
        t('step4.criteria.powerLines'),
        t('step4.criteria.powerPlants'),
        t('step4.criteria.dcRailway'),
        t('step4.criteria.mines'),
        t('step4.criteria.gasPipelines'),
        t('step4.criteria.ruralAreas'),
        t('step4.criteria.mainRoads'),
        t('step4.criteria.industrialAreas'),
        t('step4.criteria.railway')
      ],
      criteriaKeys: [
        'powerLines', 'powerPlants', 'dcRailway', 'mines', 'gasPipelines',
        'ruralAreas', 'mainRoads', 'industrialAreas', 'railway'
      ]
    }
  ];

  const getCurrentStepKey = () => {
    const stepKeys = ['personal', 'main', 'naturalHazards', 'naturalNoise', 'artificialNoise'];
    return stepKeys[currentStep] || 'unknown';
  };

  const createMatrix = (size: number, values: Record<string, number>) => {
    const matrix: number[][] = Array(size).fill(null).map(() => Array(size).fill(1));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i < j) {
          const key = `${i}_${j}`;
          matrix[i][j] = values[key] || 1;
          matrix[j][i] = 1 / matrix[i][j];
        }
      }
    }

    return matrix;
  };

  const handleMatrixChange = (key: string, value: number) => {
    const stepKey = getCurrentStepKey();
    setMatrixValues(prev => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        [key]: value
      }
    }));
  };

  const calculateCurrentStepAHP = () => {
    const stepKey = getCurrentStepKey();
    const currentValues = matrixValues[stepKey] || {};
    const size = steps[currentStep].criteria.length;

    if (size === 0) return null;

    const matrix = createMatrix(size, currentValues);
    const result = calculateAHP(matrix);

    setAhpResults(prev => ({
      ...prev,
      [stepKey]: result
    }));

    return result;
  };

  const saveParticipant = async (data: FormData) => {
    try {
      const { data: participant, error } = await supabase
        .from('participants')
        .insert([{
          name: data.name,
          email: data.email || null,
          org: data.org || null,
          position: data.position || null
        }])
        .select()
        .single();

      if (error) throw error;

      setParticipantId(participant.id);
      return participant.id;
    } catch (error) {
      console.error('Error saving participant:', error);
      throw error;
    }
  };

  const saveResponse = async (stepKey: string, result: any) => {
    if (!participantId) return;

    try {
      const stepValues = matrixValues[stepKey] || {};
      const size = steps[currentStep].criteria.length;
      const matrix = createMatrix(size, stepValues);

      await supabase.from('responses').insert([{
        participant_id: participantId,
        section: stepKey,
        matrix: matrix,
        weights: result.weights,
        cr: result.cr
      }]);
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Handle participant registration
      const formData = new FormData();
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      const orgInput = document.querySelector('input[name="org"]') as HTMLInputElement;

      if (!nameInput?.value.trim()) {
        alert('لطفاً نام خود را وارد کنید');
        return;
      }

      try {
        const participantId = await saveParticipant({
          name: nameInput.value,
          email: emailInput?.value || '',
          org: orgInput?.value || ''
        });
        setCurrentStep(1);
      } catch (error) {
        alert('خطا در ثبت اطلاعات');
      }
    } else {
      // Handle matrix step
      const result = calculateCurrentStepAHP();
      if (result) {
        await saveResponse(getCurrentStepKey(), result);
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const result = calculateCurrentStepAHP();
    if (result) {
      await saveResponse(getCurrentStepKey(), result);
      // Redirect to results or show thank you message
      alert(t('results.thanks'));
    }
  };

  const currentStepConfig = steps[currentStep];
  const currentResult = ahpResults[getCurrentStepKey()];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              مرحله {currentStep + 1} از {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-utBlue h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            {currentStepConfig.title}
          </h2>

          {currentStep === 0 ? (
            /* Personal Information Form */
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('step0.name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('step0.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('step0.org')}
                </label>
                <input
                  type="text"
                  name="org"
                  className="input"
                />
              </div>
            </div>
          ) : (
            /* Matrix Comparison */
            <div className="space-y-8">
              {currentStepConfig.description && (
                <p className="text-center text-gray-600 mb-6">
                  {currentStepConfig.description}
                </p>
              )}

              <ComparisonMatrix
                criteria={currentStepConfig.criteria}
                values={matrixValues[getCurrentStepKey()] || {}}
                onChange={handleMatrixChange}
                locale={locale}
              />

              {currentResult && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-utBlue mb-4">
                    {t('consistency.title')}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-mono">
                      {t('consistency.value')} {currentResult.cr.toFixed(3)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentResult.cr <= 0.1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {currentResult.cr <= 0.1 
                        ? t('consistency.good')
                        : t('consistency.warning')
                      }
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      {t('results.weights')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                      {currentResult.weights.map((weight: number, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{currentStepConfig.criteria[index]}:</span>
                          <span className="font-mono">{weight.toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('prev')}
            </button>

            <button
              type="button"
              onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
              className="btn-primary"
            >
              {currentStep === steps.length - 1 ? t('submit') : t('next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}