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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Section 1 de 6: Identification</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identifiant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName || name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Votre nom complet"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de Naissance <span className="text-red-500">*</span>
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
                    Sexe <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Région <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="ex: Casablanca"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Votre numéro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taille (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="170"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poids (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="75"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Mode de Vie */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Section 2 de 6: Mode de Vie</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Fumez-vous? <span className="text-red-500">*</span>
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
                      <span className="ml-2 text-gray-700">{value === 'yes' ? 'Oui' : 'Non'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Consommez-vous de l'alcool? <span className="text-red-500">*</span>
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
                      <span className="ml-2 text-gray-700">{value === 'yes' ? 'Oui' : 'Non'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre d'heures de sommeil par nuit
                </label>
                <input
                  type="number"
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleInputChange}
                  min="0"
                  max="24"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pratiquez-vous une activité physique? <span className="text-red-500">*</span>
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
                      <span className="ml-2 text-gray-700">{value === 'yes' ? 'Oui' : 'Non'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Type d'activité physique */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Section 3 de 6: Type d'Activité Physique</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type d'activité physique <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'marche', label: 'Marche' },
                    { value: 'sport', label: 'Sport' },
                    { value: 'autre', label: 'Autre' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="physicalActivityType"
                        value={value}
                        checked={formData.physicalActivityType === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Fréquence
                </label>
                <div className="space-y-2">
                  {[
                    { value: '1-2fois', label: '1-2 fois/semaine' },
                    { value: '3-4fois', label: '≥ 3 fois/semaine' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="physicalActivityFrequency"
                        value={value}
                        checked={formData.physicalActivityFrequency === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Habitudes Alimentaires */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Section 4 de 6: Habitudes Alimentaires</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nombre de repas par jour <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: '1', label: '1 repas' },
                    { value: '2', label: '2 repas' },
                    { value: '3', label: '3 repas' },
                    { value: 'autre', label: 'Autre' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="mealsPerDay"
                        value={value}
                        checked={formData.mealsPerDay === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Prenez-vous des collations entre les repas? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'regulierement', label: 'Oui, régulièrement' },
                    { value: 'occasionnellement', label: 'Oui, occasionnellement' },
                    { value: 'non', label: 'Non' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="snacksBetweenMeals"
                        value={value}
                        checked={formData.snacksBetweenMeals === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Patient Diabétique */}
          {currentStep === 6 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Section 5 de 6: Patient Diabétique</h3>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quel est votre type de diabète? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'type1', label: 'Diabète de type 1' },
                    { value: 'type2', label: 'Diabète de type 2' },
                    { value: 'gestationnel', label: 'Gestationnel (femme enceinte)' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="diabetesType"
                        value={value}
                        checked={formData.diabetesType === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Depuis quand? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'moins1an', label: '< 1 an' },
                    { value: '1-5ans', label: '1-5 ans' },
                    { value: 'plus5ans', label: '> 5 ans' },
                    { value: 'autre', label: 'Autre' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="diabetesDuration"
                        value={value}
                        checked={formData.diabetesDuration === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quel est votre traitement antidiabétique actuel? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'insuline_basale', label: 'Insuline basale' },
                    { value: 'insuline_rapide', label: 'Insuline rapide' },
                    { value: 'oraux', label: 'Antidiabétiques oraux' },
                    { value: 'regime', label: 'Régime alimentaire équilibré seul' },
                    { value: 'autre', label: 'Autre' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="diabeticTreatment"
                        value={value}
                        checked={formData.diabeticTreatment === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Avez-vous d'autres maladies associées? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'coaliaque', label: 'Maladie cœliaque' },
                    { value: 'cardiovasculaire', label: 'Maladie cardiovasculaire' },
                    { value: 'hta', label: 'Hypertension artérielle' },
                    { value: 'dyslipidemia', label: 'Dyslipidémie' },
                    { value: 'endocrinienne', label: 'Maladies endocriniennes et hormonales' },
                    { value: 'obesity', label: 'Obésité' },
                    { value: 'autre', label: 'Autre' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={value}
                        checked={formData.associatedDiseases.includes(value)}
                        onChange={() => handleCheckboxChange('associatedDiseases', value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Avez-vous une allergie ou intolérance alimentaire? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'gluten', label: 'Gluten' },
                    { value: 'lactose', label: 'Lactose' },
                    { value: 'eggs', label: 'Œufs' },
                    { value: 'aucune', label: 'Aucune' },
                    { value: 'autre', label: 'Autre' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={value}
                        checked={formData.foodAllergiesIntolerances.includes(value)}
                        onChange={() => handleCheckboxChange('foodAllergiesIntolerances', value)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Objectifs et Motivation */}
          {currentStep === 7 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Section 6 de 6: Objectifs et Motivation</h3>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quels sont vos objectifs en intégrant le programme Nutri Ed? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'glycemie', label: 'Mieux contrôler la glycémie' },
                    { value: 'lien_alimentation', label: 'Mieux comprendre le lien entre alimentation et diabète' },
                    { value: 'doses_insuline', label: 'Adapter les doses d\'insuline en fonction des repas' },
                    { value: 'prevenir_complications', label: 'Prévenir les complications liées au diabète' },
                    { value: 'autonomie', label: 'Renforcer l\'autonomie dans la gestion de la maladie' },
                    { value: 'motivation', label: 'Renforcer la motivation et l\'engagement' },
                    { value: 'autre', label: 'Autre' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={value}
                        checked={formData.objectives.includes(value)}
                        onChange={() => handleCheckboxChange('objectives', value)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-gray-700">{label}</span>
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
                {t('auth.previous')}
              </button>
            )}
            <div className="flex-1"></div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition"
            >
              {loading ? t('auth.processing') : currentStep === 7 ? t('auth.finish') : t('auth.next')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
