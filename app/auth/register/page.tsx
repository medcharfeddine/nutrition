'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1); // 1 for basic info, 2+ for assessment
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [userId, setUserId] = useState('');
  const [branding, setBranding] = useState<any>(null);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const res = await fetch('/api/admin/branding');
      if (res.ok) {
        const data = await res.json();
        setBranding(data.branding);
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    }
  };

  // Assessment form data - 6 sections matching form.txt
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
    // Section 3: Physical Activity
    physicalActivityType: '',
    physicalActivityFrequency: '',
    // Section 4: Eating Habits
    mealsPerDay: '',
    snacksBetweenMeals: '',
    // Section 5: Diabete
    isDiabetic: 'yes', // Default value for backward compatibility
    diabetesType: '',
    diabetesDuration: '',
    diabeticTreatment: '',
    associatedDiseases: [] as string[],
    foodAllergiesIntolerances: [] as string[],
    // Section 6: Objectives
    objectives: [] as string[],
  });

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setRegistrationComplete(true);
        setUserId(data.user.id);
        setFormData((prev) => ({
          ...prev,
          fullName: name,
        }));
        setCurrentStep(2);
      }
    } catch (err) {
      setError(t('common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

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

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
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
      const submitData = {
        ...formData,
        userId,
        userEmail: email,
      };
      
      console.log('Submitting assessment data:', submitData);

      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
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

      // Redirect directly to dashboard after successful registration
      router.push('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('common.errorOccurred');
      setError(errorMsg);
      console.error('Assessment submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 3 && formData.practicesPhysicalActivity === 'no') {
      setCurrentStep(2); // Skip from eating habits back to lifestyle
    } else if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 3 && formData.practicesPhysicalActivity === 'no') {
      setCurrentStep(5); // Skip section 3 (Physical Activity Details) if "no" for physical activity
    } else if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Step 1: Basic Account Registration
  if (currentStep === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-3 sm:px-4 py-8 sm:py-0">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            {branding?.logoUrl ? (
              <Image 
                src={branding.logoUrl} 
                alt={branding.siteName || 'NutriEd'} 
                width={200}
                height={200}
                className="h-16 sm:h-20 w-auto mx-auto mb-3 sm:mb-4 object-contain"
                priority
                quality={95}
              />
            ) : (
              <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">{t('common.appName')}</h1>
            )}
            <p className="text-gray-600 text-sm sm:text-base">{t('common.educationalPlatform')}</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">{t('auth.stepText')} 1 {t('auth.ofText')} 2</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-6">
              <p className="text-red-600 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder={t('auth.namePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.emailAddress')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.passwordLabel')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder={t('auth.passwordPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder={t('auth.confirmPasswordPlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 rounded-lg transition duration-200"
            >
              {loading ? t('auth.registering') : t('auth.continue')}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link href="/auth/login" className="text-indigo-600 hover:underline font-semibold">
              {t('common.signIn')}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Steps 2-7: Assessment Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">{t('common.appName')}</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('auth.assessmentForm')}</h2>
          <p className="text-gray-600 mb-6">
            {t('auth.assessmentFormDesc')}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">{t('auth.section')} {currentStep - 1} {t('auth.ofText')} 6</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep - 1) / 6) * 100)}{t('auth.percentage')}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={currentStep === 7 ? handleAssessmentSubmit : (e) => { e.preventDefault(); goToNextStep(); }} className="space-y-6">
          {/* Section 1: Identification */}
          {currentStep === 2 && (
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
                  value={formData.fullName || name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.yourFullName')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Section 2: Mode de Vie */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.lifestyleTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section2Of6')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.doYouSmoke')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['yes', 'no'].map((value) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="smoking"
                        value={value}
                        checked={formData.smoking === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{value === 'yes' ? t('assessment.yes') : t('assessment.no')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.doYouConsumeAlcohol')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['yes', 'no'].map((value) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="alcoholConsumption"
                        value={value}
                        checked={formData.alcoholConsumption === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{value === 'yes' ? t('assessment.yes') : t('assessment.no')}</span>
                    </label>
                  ))}
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
                  min="0"
                  max="24"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('assessment.sleepPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('assessment.doYouExercise')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['yes', 'no'].map((value) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="practicesPhysicalActivity"
                        value={value}
                        checked={formData.practicesPhysicalActivity === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{value === 'yes' ? t('assessment.yes') : t('assessment.no')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Type d'activité physique */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.physicalActivityTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section3Of6')}</p>
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

          {/* Section 4: Habitudes Alimentaires */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.eatingHabitsTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section4Of6')}</p>
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
                  {t('assessment.snacksBetweenMeals')} <span className="text-red-500">*</span>
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
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{snack.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Patient Diabétique */}
          {currentStep === 6 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.diabetesPatientTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section5Of6')}</p>
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
              </div>
            </div>
          )}

          {/* Section 6: Objectifs et Motivation */}
          {currentStep === 7 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.objectivesTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('assessment.section6Of6')}</p>
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
          <div className="flex justify-between gap-4">
            {currentStep > 2 && (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                {t('assessment.previousButton')}
              </button>
            )}
            <div className="flex-1"></div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition"
            >
              {loading ? t('assessment.savingAssessment') : currentStep === 7 ? t('assessment.submitAssessment') : t('assessment.nextButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
