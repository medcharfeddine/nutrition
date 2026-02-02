'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
      setError('Les mots de passe ne correspondent pas');
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
      setError('Une erreur s\'est produite. Veuillez reessayer.');
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
        throw new Error(typeof data.error === 'string' ? data.error : 'Une erreur s\'est produite');
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur s\'est produite');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            {branding?.logoUrl ? (
              <Image 
                src={branding.logoUrl} 
                alt={branding.siteName || 'NutriEd'} 
                width={80}
                height={80}
                className="h-20 w-auto mx-auto mb-4"
                priority
              />
            ) : (
              <h1 className="text-4xl font-bold text-indigo-600 mb-2">NutriÉd</h1>
            )}
            <p className="text-gray-600">Créez Votre Compte</p>
            <p className="text-gray-500 text-sm mt-2">Étape 1 sur 2</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom Complet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le Mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="Confirm password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 rounded-lg transition duration-200"
            >
              {loading ? 'Inscription en cours...' : 'Continuer'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Vous avez déjà un compte?{' '}
            <Link href="/auth/login" className="text-indigo-600 hover:underline font-semibold">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Steps 2-7: Assessment Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">NutriÉd</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Formulaire d'Évaluation Nutritionnel</h2>
          <p className="text-gray-600 mb-6">
            Ce formulaire a pour objectif de recueillir les informations générales, nutritionnelles et de santé nécessaires à la création de votre profil nutritionnel personnalisé.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Section {currentStep - 1} de 6</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep - 1) / 6) * 100)}%</span>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Informations Générales</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom et Prénom <span className="text-red-500">*</span>
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
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Mode de Vie</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vous fumez? <span className="text-red-500">*</span>
                </label>
                <select
                  name="smoking"
                  value={formData.smoking}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Sélectionnez</option>
                  <option value="never">Jamais</option>
                  <option value="former">Ancien fumeur</option>
                  <option value="current">Oui</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consommation d'Alcool <span className="text-red-500">*</span>
                </label>
                <select
                  name="alcoholConsumption"
                  value={formData.alcoholConsumption}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Sélectionnez</option>
                  <option value="never">Jamais</option>
                  <option value="occasional">Occasionnel</option>
                  <option value="regular">Régulière</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heures de Sommeil par Nuit <span className="text-red-500">*</span>
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
                  placeholder="p.ex., 7"
                />
              </div>
            </div>
          )}

          {/* Section 4: Eating Habits */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Habitudes Alimentaires</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Repas par Jour <span className="text-red-500">*</span>
                </label>
                <select
                  name="mealsPerDay"
                  value={formData.mealsPerDay}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Sélectionnez</option>
                  <option value="1">1 repas</option>
                  <option value="2">2 repas</option>
                  <option value="3">3 repas</option>
                  <option value="4">4 repas</option>
                  <option value="5">5+ repas</option>
                </select>
              </div>
            </div>
          )}

          {/* Section 5: Health Status */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">État de Santé</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Maladies Chroniques
                </label>
                <div className="space-y-2">
                  {['Diabète', 'Hypertension', 'Maladie Cardiaque', 'Obésité', 'Aucune'].map((disease) => (
                    <label key={disease} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.chronicDiseases.includes(disease)}
                        onChange={() => handleCheckboxChange('chronicDiseases', disease)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">{disease}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traitement Médical en Cours
                </label>
                <textarea
                  name="medicalTreatment"
                  value={formData.medicalTreatment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Décrivez vos traitements..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Allergies et Intolérances
                </label>
                <div className="space-y-2">
                  {['Arachides', 'Noix', 'Fruits de Mer', 'Lait', 'Gluten', 'Oeufs', 'Autres'].map((allergy) => (
                    <label key={allergy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.allergiesIntolerances.includes(allergy)}
                        onChange={() => handleCheckboxChange('allergiesIntolerances', allergy)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.allergiesIntolerances.includes('Autres') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Veuillez spécifier
                  </label>
                  <input
                    type="text"
                    name="otherAllergies"
                    value={formData.otherAllergies}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Autres allergies..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Section 6: Nutritional Objectives */}
          {currentStep === 6 && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Objectifs Nutritionnels</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objectif Principal <span className="text-red-500">*</span>
                </label>
                <select
                  name="mainObjective"
                  value={formData.mainObjective}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Sélectionnez</option>
                  <option value="weight-loss">Perdre du Poids</option>
                  <option value="weight-gain">Gagner du Poids</option>
                  <option value="muscle-gain">Gagner de la Masse Musculaire</option>
                  <option value="health-improvement">Améliorer la Santé</option>
                  <option value="performance">Améliorer les Performances</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autres Objectifs
                </label>
                <textarea
                  name="otherObjective"
                  value={formData.otherObjective}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Décrivez vos autres objectifs..."
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
                Retour
              </button>
            )}
            <div className="flex-1"></div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition"
            >
              {loading ? 'Traitement...' : currentStep === 6 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
