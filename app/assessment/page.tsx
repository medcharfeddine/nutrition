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
  const [currentSection, setCurrentSection] = useState(2);
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
            <span className="text-sm font-semibold text-gray-700">Section {currentSection - 1} de 6</span>
            <span className="text-sm text-gray-600">{Math.round(((currentSection - 1) / 6) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection - 1) / 6) * 100}%` }}
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
            <p className="text-green-600 text-sm font-semibold">Évaluation enregistrée avec succès! Redirection en cours...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 2: Identification */}
          {currentSection === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Identification</h3>
                <p className="text-gray-600 text-sm">Section 2 de 7</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identifiant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Votre nom complet"
                />
              </div>

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
                  <option value="">Sélectionnez</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>

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
                  placeholder="Votre région"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de Téléphone <span className="text-red-500">*</span>
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
                    placeholder="p.ex., 170"
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
                    placeholder="p.ex., 70"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Lifestyle */}
          {currentSection === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mode de Vie</h3>
                <p className="text-gray-600 text-sm">Section 3 de 7</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optionnel)
                </label>
                <textarea
                  name="lifestyleDescription"
                  value={formData.lifestyleDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Décrivez votre mode de vie en général..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Fumez-vous? <span className="text-red-500">*</span>
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
                    <span className="ml-2 text-gray-700">Oui</span>
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
                    <span className="ml-2 text-gray-700">Non</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Consommez-vous de l'alcool? <span className="text-red-500">*</span>
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
                    <span className="ml-2 text-gray-700">Oui</span>
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
                    <span className="ml-2 text-gray-700">Non</span>
                  </label>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="p.ex., 7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pratiquez-vous une activité physique? <span className="text-red-500">*</span>
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
                    <span className="ml-2 text-gray-700">Oui</span>
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
                    <span className="ml-2 text-gray-700">Non</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Physical Activity */}
          {currentSection === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Activité Physique</h3>
                <p className="text-gray-600 text-sm">Section 4 de 7</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optionnel)
                </label>
                <textarea
                  name="physicalActivityDescription"
                  value={formData.physicalActivityDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Décrivez votre activité physique..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type d'Activité Physique
                </label>
                <div className="space-y-2">
                  {['Marche', 'Sport', 'Autre'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="physicalActivityType"
                        value={type}
                        checked={formData.physicalActivityType === type}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Fréquence
                </label>
                <div className="space-y-2">
                  {['1-2 fois/semaine', '≥ 3 fois/semaine'].map((freq) => (
                    <label key={freq} className="flex items-center">
                      <input
                        type="radio"
                        name="physicalActivityFrequency"
                        value={freq}
                        checked={formData.physicalActivityFrequency === freq}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{freq}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Health Status */}
          {/* Section 5: Eating Habits */}
          {currentSection === 5 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Habitudes Alimentaires</h3>
                <p className="text-gray-600 text-sm">Section 5 de 7</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optionnel)
                </label>
                <textarea
                  name="dietaryDescription"
                  value={formData.dietaryDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Décrivez vos habitudes alimentaires..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nombre de Repas par Jour <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['1 repas', '2 repas', '3 repas', 'Autre'].map((meal) => (
                    <label key={meal} className="flex items-center">
                      <input
                        type="radio"
                        name="mealsPerDay"
                        value={meal}
                        checked={formData.mealsPerDay === meal}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{meal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Prenez-vous des collations entre les repas?
                </label>
                <div className="space-y-2">
                  {['Oui, régulièrement', 'Oui, occasionnellement', 'Non'].map((snack) => (
                    <label key={snack} className="flex items-center">
                      <input
                        type="radio"
                        name="snacksBetweenMeals"
                        value={snack}
                        checked={formData.snacksBetweenMeals === snack}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{snack}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Diabetes */}
          {currentSection === 6 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Patient Diabétique</h3>
                <p className="text-gray-600 text-sm">Section 6 de 7</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optionnel)
                </label>
                <textarea
                  name="diabetesDescription"
                  value={formData.diabetesDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Informations supplémentaires sur votre diabète..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quel est votre type de diabète? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['Diabète de type 1', 'Diabète de type 2', 'Gestationnel (femme enceinte)'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="diabetesType"
                        value={type}
                        checked={formData.diabetesType === type}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Depuis quand? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['< 1 an', '1-5 ans', '> 5 ans', 'Autre'].map((duration) => (
                    <label key={duration} className="flex items-center">
                      <input
                        type="radio"
                        name="diabetesDuration"
                        value={duration}
                        checked={formData.diabetesDuration === duration}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{duration}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quel est votre traitement antidiabétique actuel? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['Insuline basale', 'Insuline rapide', 'Antidiabétiques oraux', 'Régime alimentaire équilibré seul', 'Autre'].map((treatment) => (
                    <label key={treatment} className="flex items-center">
                      <input
                        type="radio"
                        name="diabeticTreatment"
                        value={treatment}
                        checked={formData.diabeticTreatment === treatment}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{treatment}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Avez-vous d'autres maladies associées?
                </label>
                <div className="space-y-2">
                  {['Maladie coeliaque', 'Maladie cardiovasculaire', 'Hypertension artérielle', 'Dyslipidémie', 'Maladies endocriniennes et hormonales (SOPK, dysthyroïdie, etc)', 'Obésité', 'Autre'].map((disease) => (
                    <label key={disease} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.associatedDiseases.includes(disease)}
                        onChange={() => handleCheckboxChange('associatedDiseases', disease)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{disease}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Avez-vous une allergie ou intolérance alimentaire? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['Gluten', 'Lactose', 'Oeufs', 'Aucune', 'Autre'].map((allergy) => (
                    <label key={allergy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.foodAllergiesIntolerances.includes(allergy)}
                        onChange={() => handleCheckboxChange('foodAllergiesIntolerances', allergy)}
                        required
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{allergy}</span>
                    </label>
                  ))}
                </div>
                {formData.foodAllergiesIntolerances.includes('Autre') && (
                  <input
                    type="text"
                    name="otherAllergies"
                    value={formData.otherAllergies}
                    onChange={handleInputChange}
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Veuillez spécifier"
                  />
                )}
              </div>
            </div>
          )}

          {/* Section 7: Objectives */}
          {currentSection === 7 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Objectifs et Motivation</h3>
                <p className="text-gray-600 text-sm">Section 7 de 7</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optionnel)
                </label>
                <textarea
                  name="objectivesDescription"
                  value={formData.objectivesDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Décrivez vos motivations supplémentaires..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quels sont vos objectifs en intégrant le programme Nutri Ed? (Question Type)
                </label>
                <div className="space-y-2">
                  {[
                    'Mieux contrôler la glycémie',
                    'Mieux comprendre le lien entre alimentation et diabète',
                    'Adapter les doses d\'insuline en fonction des repas',
                    'Prévenir les complications liées au diabète',
                    'Renforcer l\'autonomie dans la gestion de la maladie',
                    'Renforcer la motivation et l\'engagement',
                    'Autre'
                  ].map((objective) => (
                    <label key={objective} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.objectives.includes(objective)}
                        onChange={() => handleCheckboxChange('objectives', objective)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{objective}</span>
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
              onClick={() => setCurrentSection(Math.max(2, currentSection - 1))}
              disabled={currentSection === 2}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Précédent
            </button>

            {currentSection < 7 ? (
              <button
                type="button"
                onClick={() => setCurrentSection(currentSection + 1)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-semibold transition"
              >
                {loading ? 'Enregistrement...' : 'Soumettre l\'Évaluation'}
              </button>
            )}
          </div>
        </form>

        {/* Note */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Ce formulaire est obligatoire pour compléter votre profil.</p>
        </div>
      </div>
    </div>
  );
}
