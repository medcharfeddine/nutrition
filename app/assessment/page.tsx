'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function AssessmentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Section 1: Identification
    fullName: '',
    dateOfBirth: '',
    gender: '',
    region: '',
    phoneNumber: '',
    height: '',
    weight: '',

    // Section 2: Mode de Vie
    smoking: '',
    alcoholConsumption: '',
    sleepHours: '',
    practicesPhysicalActivity: '',
    lifestyleDescription: '',

    // Section 3: Physical Activity
    physicalActivityType: '',
    physicalActivityFrequency: '',
    physicalActivityDescription: '',

    // Section 4: Eating Habits
    mealsPerDay: '',
    snacksBetweenMeals: '',
    dietaryDescription: '',

    // Section 5: Diabetes
    isDiabetic: 'yes', // Default value for backward compatibility
    diabetesType: '',
    diabetesDuration: '',
    diabeticTreatment: '',
    diabetesDescription: '',
    associatedDiseases: [] as string[],
    foodAllergiesIntolerances: [] as string[],
    otherAllergies: '',

    // Section 6: Objectives
    objectives: [] as string[],
    objectivesDescription: '',
  });

  // Handle navigation redirects
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.hasCompletedAssessment) {
      router.push('/dashboard');
    }
  }, [status, session?.user?.hasCompletedAssessment, router]);

  // Helper function to get next section, skipping section 3 if no physical activity
  const getNextSection = (current: number): number => {
    if (current === 2 && formData.practicesPhysicalActivity === 'no') {
      return 4; // Skip section 3 if user selected "no" for physical activity
    }
    return current + 1;
  };

  // Helper function to get previous section, skipping section 3 if no physical activity
  const getPreviousSection = (current: number): number => {
    if (current === 4 && formData.practicesPhysicalActivity === 'no') {
      return 2; // Skip back to section 2 if no physical activity
    }
    return current - 1;
  };

  // Show loading while checking auth or redirecting
  if (status === 'loading' || status === 'unauthenticated' || session?.user?.hasCompletedAssessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-600 text-lg">{t('common.loading')}</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (field: 'associatedDiseases' | 'foodAllergiesIntolerances' | 'objectives', value: string) => {
    setFormData((prev) => {
      const array = prev[field] as string[];
      if (array.includes(value)) {
        return {
          ...prev,
          [field]: array.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [field]: [...array, value],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate all required fields before submitting
    const requiredFields = [
      'fullName',
      'dateOfBirth',
      'gender',
      'region',
      'phoneNumber',
      'height',
      'weight',
      'smoking',
      'alcoholConsumption',
      'practicesPhysicalActivity',
      'mealsPerDay',
      'snacksBetweenMeals',
      'diabetesType',
      'diabetesDuration',
      'diabeticTreatment',
    ];

    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);
    
    // Check if food allergies are selected (at least one option required)
    if (formData.foodAllergiesIntolerances.length === 0) {
      setError(t('assessment.pleaseSelectAllergy') || 'Veuillez sélectionner au moins une option pour les allergies alimentaires');
      setLoading(false);
      return;
    }
    
    if (missingFields.length > 0) {
      setError(`Veuillez compléter tous les champs requis: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting assessment data:', formData);

      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        
        // Handle Zod validation errors
        if (Array.isArray(data.error)) {
          const errorMessages = data.error
            .map((err: any) => err.message || 'Validation error')
            .join(', ');
          throw new Error(errorMessages);
        } else if (typeof data.error === 'string') {
          throw new Error(data.error);
        } else if (typeof data.error === 'object') {
          throw new Error(JSON.stringify(data.error));
        } else {
          throw new Error(t('common.errorOccurred'));
        }
      }

      setSuccess(true);
      // Redirect directly to dashboard after successful submission
      router.push('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('common.errorOccurred');
      setError(errorMsg);
      console.error('Assessment submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">{t('common.appName')}</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Programme Nutri Ed</h2>
          <p className="text-gray-600 mb-6">
            Évaluation Complète pour Patients Diabétiques
          </p>
          <p className="text-gray-500 text-sm">Veuillez compléter ce formulaire pour personaliser votre programme</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Section {currentSection} de 6</span>
            <span className="text-sm text-gray-600">{Math.round((currentSection / 6) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600 text-sm font-semibold">{t('assessment.submitted')}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identification */}
          {currentSection === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.identification')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section1Of6')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.identifier')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.yourFullName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.dateOfBirthLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.genderLabel')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">{t('assessment.select')}</option>
                  <option value="male">{t('assessment.male')}</option>
                  <option value="female">{t('assessment.female')}</option>
                  <option value="other">{t('assessment.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.regionLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.yourRegion')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.phoneNumberLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.yourPhoneNumber')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('assessment.heightLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder={t('assessment.heightPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('assessment.weightLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder={t('assessment.weightPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Lifestyle */}
          {currentSection === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.lifestyleTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section2Of6')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.descriptionOptional')}
                </label>
                <textarea
                  name="lifestyleDescription"
                  value={formData.lifestyleDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.describeYourLifestyle')}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.doYouSmoke')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="smoking"
                      value="yes"
                      checked={formData.smoking === 'yes'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">{t('assessment.yes')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="smoking"
                      value="no"
                      checked={formData.smoking === 'no'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">{t('assessment.no')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.doYouConsumeAlcohol')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="alcoholConsumption"
                      value="yes"
                      checked={formData.alcoholConsumption === 'yes'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">{t('assessment.yes')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="alcoholConsumption"
                      value="no"
                      checked={formData.alcoholConsumption === 'no'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">{t('assessment.no')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.sleepHoursPerNight')}
                </label>
                <input
                  type="number"
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.sleepPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.doYouExercise')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="practicesPhysicalActivity"
                      value="yes"
                      checked={formData.practicesPhysicalActivity === 'yes'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">{t('assessment.yes')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="practicesPhysicalActivity"
                      value="no"
                      checked={formData.practicesPhysicalActivity === 'no'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">{t('assessment.no')}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Physical Activity */}
          {currentSection === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.physicalActivityTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section3Of6')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.descriptionOptional')}
                </label>
                <textarea
                  name="physicalActivityDescription"
                  value={formData.physicalActivityDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.describeYourActivity')}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.typeOfPhysicalActivity')}
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'walking', label: t('assessment.walking') },
                    { key: 'sport', label: t('assessment.sport') },
                    { key: 'other', label: t('assessment.other') }
                  ].map((type) => (
                    <label key={type.key} className="flex items-center">
                      <input
                        type="radio"
                        name="physicalActivityType"
                        value={type.key}
                        checked={formData.physicalActivityType === type.key}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.frequency')}
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'freq1to2', label: t('assessment.frequencyPerWeek1to2') },
                    { key: 'freq3plus', label: t('assessment.frequencyPerWeek3OrMore') }
                  ].map((freq) => (
                    <label key={freq.key} className="flex items-center">
                      <input
                        type="radio"
                        name="physicalActivityFrequency"
                        value={freq.key}
                        checked={formData.physicalActivityFrequency === freq.key}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{freq.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Eating Habits */}
          {currentSection === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.eatingHabitsTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section4Of6')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.descriptionOptional')}
                </label>
                <textarea
                  name="dietaryDescription"
                  value={formData.dietaryDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.describeYourDiet')}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.mealsPerDayLabel')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'meal1', label: t('assessment.mealOption1') },
                    { key: 'meal2', label: t('assessment.mealOption2') },
                    { key: 'meal3', label: t('assessment.mealOption3') },
                    { key: 'mealOther', label: t('assessment.mealOptionOther') }
                  ].map((meal) => (
                    <label key={meal.key} className="flex items-center">
                      <input
                        type="radio"
                        name="mealsPerDay"
                        value={meal.key}
                        checked={formData.mealsPerDay === meal.key}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{meal.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.snacksBetweenMeals')}
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'regulary', label: t('assessment.snackOptionRegularly') },
                    { key: 'occasionally', label: t('assessment.snackOptionOccasionally') },
                    { key: 'no', label: t('assessment.snackOptionNo') }
                  ].map((snack) => (
                    <label key={snack.key} className="flex items-center">
                      <input
                        type="radio"
                        name="snacksBetweenMeals"
                        value={snack.key}
                        checked={formData.snacksBetweenMeals === snack.key}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{snack.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Diabetes */}
          {currentSection === 5 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.diabetesPatientTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section5Of6')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.descriptionOptional')}
                </label>
                <textarea
                  name="diabetesDescription"
                  value={formData.diabetesDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.describeYourDiabetes')}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.diabetesType')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'type1', label: t('assessment.diabetesType1') },
                    { key: 'type2', label: t('assessment.diabetesType2') },
                    { key: 'gestational', label: t('assessment.diabetesGestational') }
                  ].map((type) => (
                    <label key={type.key} className="flex items-center">
                      <input
                        type="radio"
                        name="diabetesType"
                        value={type.key}
                        checked={formData.diabetesType === type.key}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.diabetesDurationLabel')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'lessThan1Year', label: t('assessment.durationLessThan1Year') },
                    { key: '1to5Years', label: t('assessment.duration1to5Years') },
                    { key: 'moreThan5Years', label: t('assessment.durationMoreThan5Years') },
                    { key: 'other', label: t('assessment.durationOther') }
                  ].map((duration) => (
                    <label key={duration.key} className="flex items-center">
                      <input
                        type="radio"
                        name="diabetesDuration"
                        value={duration.key}
                        checked={formData.diabetesDuration === duration.key}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{duration.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.diabetesCurrentTreatment')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'basalInsulin', label: t('assessment.treatmentBasalInsulin') },
                    { key: 'rapidInsulin', label: t('assessment.treatmentRapidInsulin') },
                    { key: 'oralMedicines', label: t('assessment.treatmentOralMedicines') },
                    { key: 'dietOnly', label: t('assessment.treatmentDietOnly') },
                    { key: 'other', label: t('assessment.treatmentOther') }
                  ].map((treatment) => (
                    <label key={treatment.key} className="flex items-center">
                      <input
                        type="radio"
                        name="diabeticTreatment"
                        value={treatment.key}
                        checked={formData.diabeticTreatment === treatment.key}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{treatment.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.associatedDiseases')}
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'celiac', label: t('assessment.diseaseCeliac') },
                    { key: 'cardiovascular', label: t('assessment.diseaseCardiovascular') },
                    { key: 'hypertension', label: t('assessment.diseaseHypertension') },
                    { key: 'dyslipidemia', label: t('assessment.dyslipidemia') },
                    { key: 'endocrine', label: t('assessment.diseaseEndocrine') },
                    { key: 'obesity', label: t('assessment.diseaseObesity') },
                    { key: 'other', label: t('assessment.diseaseOther') }
                  ].map((disease) => (
                    <label key={disease.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.associatedDiseases.includes(disease.key)}
                        onChange={() => handleCheckboxChange('associatedDiseases', disease.key)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{disease.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.haveAllergiesOrIntolerances')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'gluten', label: t('assessment.allergyGluten') },
                    { key: 'lactose', label: t('assessment.allergyLactose') },
                    { key: 'eggs', label: t('assessment.allergyEggs') },
                    { key: 'none', label: t('assessment.allergyNone') },
                    { key: 'other', label: t('assessment.allergyOther') }
                  ].map((allergy) => (
                    <label key={allergy.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.foodAllergiesIntolerances.includes(allergy.key)}
                        onChange={() => handleCheckboxChange('foodAllergiesIntolerances', allergy.key)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{allergy.label}</span>
                    </label>
                  ))}
                </div>
                {formData.foodAllergiesIntolerances.includes('other') && (
                  <input
                    type="text"
                    name="otherAllergies"
                    value={formData.otherAllergies}
                    onChange={handleInputChange}
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder={t('assessment.pleaseSpecify')}
                  />
                )}
              </div>
            </div>
          )}

          {/* Section 6: Objectives */}
          {currentSection === 6 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.objectivesTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section6Of6')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('assessment.descriptionOptional')}
                </label>
                <textarea
                  name="objectivesDescription"
                  value={formData.objectivesDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.describeYourMotivation')}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.programObjectives')}
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'bloodSugar', label: t('assessment.objectiveBloodSugar') },
                    { key: 'understandLink', label: t('assessment.objectiveUnderstandLink') },
                    { key: 'insulinDoses', label: t('assessment.objectiveInsulinDoses') },
                    { key: 'preventComplications', label: t('assessment.objectivePreventComplications') },
                    { key: 'autonomy', label: t('assessment.objectiveAutonomy') },
                    { key: 'motivation', label: t('assessment.objectiveMotivation') },
                    { key: 'other', label: t('assessment.objectiveOther') }
                  ].map((objective) => (
                    <label key={objective.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.objectives.includes(objective.key)}
                        onChange={() => handleCheckboxChange('objectives', objective.key)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{objective.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={() => setCurrentSection(getPreviousSection(currentSection))}
              disabled={currentSection === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {t('assessment.previousButton')}
            </button>

            {currentSection < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentSection(getNextSection(currentSection))}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
              >
                {t('assessment.nextButton')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-semibold transition"
              >
                {loading ? t('assessment.savingAssessment') : t('assessment.submitAssessment')}
              </button>
            )}
          </div>
        </form>

        {/* Note */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>{t('assessment.formRequiredNote')}</p>
        </div>
      </div>
    </div>
  );
}
