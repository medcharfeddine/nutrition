'use client';

import { useState } from 'react';
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
    // Section 2: General Information
    fullName: '',
    dateOfBirth: '',
    gender: '',
    region: '',
    phoneNumber: '',
    height: '',
    weight: '',
    physicalActivityLevel: '',

    // Section 3: Lifestyle
    smoking: '',
    alcoholConsumption: '',
    sleepHours: '',

    // Section 4: Eating Habits
    mealsPerDay: '',

    // Section 5: Health Status
    chronicDiseases: [] as string[],
    medicalTreatment: '',
    allergiesIntolerances: [] as string[],
    otherAllergies: '',

    // Section 6: Nutritional Objectives
    mainObjective: '',
    otherObjective: '',
  });

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  } else if (status === 'authenticated' && session?.user?.hasCompletedAssessment) {
    router.push('/dashboard');
    return null;
  }

  if (status === 'loading') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === 'string' ? data.error : 'Une erreur s\'est produite');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur s\'est produite');
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
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">NutriÉd</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Formulaire d'Évaluation Nutritionnel</h2>
          <p className="text-gray-600 mb-6">
            Ce formulaire a pour objectif de recueillir les informations générales, nutritionnelles et de santé nécessaires à la création de votre profil nutritionnel personnalisé.
          </p>
          <p className="text-gray-500 text-sm">Merci pour votre participation</p>
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
            <p className="text-green-600 text-sm font-semibold">Évaluation enregistrée avec succès! Redirection en cours...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 2: General Information */}
          {currentSection === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Informations Générales</h3>
                <p className="text-gray-600 text-sm">(Optionnel)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom et Prénom <span className="text-red-500">*</span>
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
                    <option value="">Sélectionnez</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
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
                    placeholder="Votre région"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau d'Activité Physique <span className="text-red-500">*</span>
                </label>
                <select
                  name="physicalActivityLevel"
                  value={formData.physicalActivityLevel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Sélectionnez</option>
                  <option value="sedentary">Sédentaire</option>
                  <option value="moderate">Modéré</option>
                  <option value="active">Actif</option>
                </select>
              </div>
            </div>
          )}

          {/* Section 3: Lifestyle */}
          {currentSection === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mode de Vie</h3>
                <p className="text-gray-600 text-sm">(Optionnel)</p>
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
                  Consommation d'Alcool <span className="text-red-500">*</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nombre d'Heures de Sommeil par Nuit <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sleepHours"
                      value="less_than_6"
                      checked={formData.sleepHours === 'less_than_6'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">&lt;6 heures</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sleepHours"
                      value="6_to_8"
                      checked={formData.sleepHours === '6_to_8'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">6-8 heures</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sleepHours"
                      value="more_than_8"
                      checked={formData.sleepHours === 'more_than_8'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">≥8 heures</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Eating Habits */}
          {currentSection === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Habitudes Alimentaires</h3>
                <p className="text-gray-600 text-sm">(Optionnel)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nombre de Repas par Jour <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mealsPerDay"
                      value="1"
                      checked={formData.mealsPerDay === '1'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">1</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mealsPerDay"
                      value="2"
                      checked={formData.mealsPerDay === '2'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">2</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mealsPerDay"
                      value="3"
                      checked={formData.mealsPerDay === '3'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">3</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mealsPerDay"
                      value="more_than_3"
                      checked={formData.mealsPerDay === 'more_than_3'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">Plus de 3</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Health Status */}
          {currentSection === 5 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">État de Santé</h3>
                <p className="text-gray-600 text-sm">(Optionnel)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Avez-vous une ou plusieurs maladies chroniques? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['Diabète', 'Obésité', 'Hypertension Artérielle', 'Troubles Digestifs', 'Dyslipidémie'].map((disease) => (
                    <label key={disease} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.chronicDiseases.includes(disease)}
                        onChange={() => handleCheckboxChange('chronicDiseases', disease)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{disease}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Suivez-vous un traitement médical? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="medicalTreatment"
                      value="yes"
                      checked={formData.medicalTreatment === 'yes'}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">Oui</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="medicalTreatment"
                      value="no"
                      checked={formData.medicalTreatment === 'no'}
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
                  Avez-vous une allergie ou intolérance alimentaire? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['Aucune', 'Gluten', 'Lactose', 'Oeufs'].map((allergy) => (
                    <label key={allergy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.allergiesIntolerances.includes(allergy)}
                        onChange={() => handleCheckboxChange('allergiesIntolerances', allergy)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{allergy}</span>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  name="otherAllergies"
                  value={formData.otherAllergies}
                  onChange={handleInputChange}
                  className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Autre (optionnel)"
                />
              </div>
            </div>
          )}

          {/* Section 6: Nutritional Objectives */}
          {currentSection === 6 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Objectifs Nutritionnels</h3>
                <p className="text-gray-600 text-sm">(Optionnel)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Objectif Principal <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['Perte de Poids', 'Contrôle de la Glycémie', 'Amélioration de l\'Alimentation'].map((objective) => (
                    <label key={objective} className="flex items-center">
                      <input
                        type="radio"
                        name="mainObjective"
                        value={objective}
                        checked={formData.mainObjective === objective}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{objective}</span>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  name="otherObjective"
                  value={formData.otherObjective}
                  onChange={handleInputChange}
                  className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Autre objectif (optionnel)"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
              disabled={currentSection === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Précédent
            </button>

            {currentSection < 6 ? (
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
