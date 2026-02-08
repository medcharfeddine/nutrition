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

  // Assessment form data
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    region: '',
    phoneNumber: '',
    height: '',
    weight: '',
    physicalActivityLevel: '',
    smoking: '',
    alcoholConsumption: '',
    sleepHours: '',
    mealsPerDay: '',
    chronicDiseases: [] as string[],
    medicalTreatment: '',
    allergiesIntolerances: [] as string[],
    otherAllergies: '',
    mainObjective: '',
    otherObjective: '',
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

  const handleCheckboxChange = (field: 'chronicDiseases' | 'allergiesIntolerances', value: string) => {
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

    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          userEmail: email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === 'string' ? data.error : t('common.errorOccurred'));
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep < 7) {
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
              <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">NutriÉd</h1>
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
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">NutriÉd</h1>
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
          {/* Section 2: General Information */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.personalInfo')}</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.fullName')} <span className="text-red-500">{t('auth.required')}</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName || name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('auth.namePlaceholder')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.dateOfBirth')} <span className="text-red-500">{t('auth.required')}</span>
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
                    {t('auth.gender')} <span className="text-red-500">{t('auth.required')}</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    <option value="">{t('auth.selectOption')}</option>
                    <option value="male">{t('auth.male')}</option>
                    <option value="female">{t('auth.female')}</option>
                    <option value="other">{t('auth.other')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.region')} <span className="text-red-500">{t('auth.required')}</span>
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.height')} <span className="text-red-500">{t('auth.required')}</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder={t('auth.heightPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.weight')} <span className="text-red-500">{t('auth.required')}</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder={t('auth.weightPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.physicalActivityLevel')} <span className="text-red-500">{t('auth.required')}</span>
                </label>
                <select
                  name="physicalActivityLevel"
                  value={formData.physicalActivityLevel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">{t('auth.selectOption')}</option>
                  <option value="sedentary">{t('auth.sedentary')}</option>
                  <option value="moderate">{t('auth.moderate')}</option>
                  <option value="active">{t('auth.active')}</option>
                </select>
              </div>
            </div>
          )}

          {/* Section 3: Lifestyle */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.lifestyle')}</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.smoking')} <span className="text-red-500">{t('auth.required')}</span>
                </label>
                <select
                  name="smoking"
                  value={formData.smoking}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">{t('auth.selectOption')}</option>
                  <option value="never">{t('auth.never')}</option>
                  <option value="former">{t('auth.formerSmoker')}</option>
                  <option value="current">{t('auth.currentSmoker')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.alcoholConsumption')} <span className="text-red-500">{t('auth.required')}</span>
                </label>
                <select
                  name="alcoholConsumption"
                  value={formData.alcoholConsumption}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">{t('auth.selectOption')}</option>
                  <option value="never">{t('auth.never')}</option>
                  <option value="occasional">{t('auth.occasional')}</option>
                  <option value="regular">{t('auth.regular')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.sleepHours')} <span className="text-red-500">{t('auth.required')}</span>
                </label>
                <input
                  type="number"
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="24"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('auth.sleepHoursPlaceholder')}
                />
              </div>
            </div>
          )}

          {/* Section 4: Eating Habits */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.eatingHabits')}</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.mealsPerDay')} <span className="text-red-500">{t('auth.required')}</span>
                </label>
                <select
                  name="mealsPerDay"
                  value={formData.mealsPerDay}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">{t('auth.selectOption')}</option>
                  <option value="1">1 {t('auth.mealsPerDay')}</option>
                  <option value="2">2 {t('auth.mealsPerDay')}</option>
                  <option value="3">3 {t('auth.mealsPerDay')}</option>
                  <option value="4">4 {t('auth.mealsPerDay')}</option>
                  <option value="5">5+ {t('auth.mealsPerDay')}</option>
                </select>
              </div>
            </div>
          )}

          {/* Section 5: Health Status */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.healthStatus')}</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('auth.chronicDiseases')}
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'diabetes', label: t('auth.diabetes') },
                    { key: 'hypertension', label: t('auth.hypertension') },
                    { key: 'heart', label: t('auth.heartDisease') },
                    { key: 'obesity', label: t('auth.obesity') },
                    { key: 'none', label: t('auth.none') }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        value={key}
                        checked={formData.chronicDiseases.includes(key)}
                        onChange={() => handleCheckboxChange('chronicDiseases', key)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.medicalTreatment')}
                </label>
                <textarea
                  name="medicalTreatment"
                  value={formData.medicalTreatment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('auth.medicalTreatmentPlaceholder')}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('auth.allergiesAndIntolerances')}
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'peanuts', label: t('auth.peanuts') },
                    { key: 'nuts', label: t('auth.nuts') },
                    { key: 'seafood', label: t('auth.seafood') },
                    { key: 'dairy', label: t('auth.dairy') },
                    { key: 'gluten', label: t('auth.gluten') },
                    { key: 'eggs', label: t('auth.eggs') },
                    { key: 'other', label: t('auth.other') }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        value={key}
                        checked={formData.allergiesIntolerances.includes(key)}
                        onChange={() => handleCheckboxChange('allergiesIntolerances', key)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.allergiesIntolerances.includes('other') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.pleaseSpecify')}
                  </label>
                  <input
                    type="text"
                    name="otherAllergies"
                    value={formData.otherAllergies}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder={t('auth.otherAllergiesPlaceholder')}
                  />
                </div>
              )}
            </div>
          )}

          {/* Section 6: Nutritional Objectives */}
          {currentStep === 6 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.nutritionalObjectives')}</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.mainObjective')} <span className="text-red-500">{t('auth.required')}</span>
                </label>
                <select
                  name="mainObjective"
                  value={formData.mainObjective}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">{t('auth.selectOption')}</option>
                  <option value="weight-loss">{t('auth.weightLoss')}</option>
                  <option value="weight-gain">{t('auth.weightGain')}</option>
                  <option value="muscle-gain">{t('auth.muscleMass')}</option>
                  <option value="health-improvement">{t('auth.healthImprovement')}</option>
                  <option value="performance">{t('auth.performance')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.otherObjectives')}
                </label>
                <textarea
                  name="otherObjective"
                  value={formData.otherObjective}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder={t('auth.otherObjectivesPlaceholder')}
                  rows={4}
                />
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
                {t('auth.previous')}
              </button>
            )}
            <div className="flex-1"></div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition"
            >
              {loading ? t('auth.processing') : currentStep === 6 ? t('auth.finish') : t('auth.next')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
