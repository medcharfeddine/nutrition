'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [branding, setBranding] = useState<any>(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    lifestyle: '',
    habits: [] as string[],
    diseases: [] as string[],
    dietaryPreferences: [] as string[],
    calorieGoal: '',
    proteinGoal: '',
    carbGoal: '',
    fatGoal: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchUserProfile();
      fetchBranding();
    }
  }, [status, router]);

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

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.user.profile) {
          setFormData({
            age: data.user.profile.age || '',
            gender: data.user.profile.gender || '',
            lifestyle: data.user.profile.lifestyle || '',
            habits: data.user.profile.habits || [],
            diseases: data.user.profile.diseases || [],
            dietaryPreferences: data.user.profile.dietaryPreferences || [],
            calorieGoal: data.user.profile.calorieGoal || '',
            proteinGoal: data.user.profile.proteinGoal || '',
            carbGoal: data.user.profile.carbGoal || '',
            fatGoal: data.user.profile.fatGoal || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSaved(false);
  };

  const handleCheckboxChange = (category: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [category]: (prev[category] as string[]).includes(value)
        ? (prev[category] as string[]).filter((item) => item !== value)
        : [...(prev[category] as string[]), value],
    }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
                {branding?.logoUrl ? (
                  <Image 
                    src={branding.logoUrl} 
                    alt={branding.siteName || 'NutriEd'} 
                    width={40}
                    height={40}
                    className="h-10 w-auto"
                    priority
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-indigo-600">NutriEd</h1>
                )}
              </Link>
              <div className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Tableau de Bord
                </Link>
                <Link
                  href="/profile"
                  className="text-indigo-600 font-medium border-b-2 border-indigo-600"
                >
                  Profil
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user?.name}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Deconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Profil Nutritionnel</h2>

          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-600 font-semibold">Profil enregistre avec succes!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Informations de Base</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age (ans)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="Entrez votre age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sexe
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Selectionnez le Sexe</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mode de Vie
                  </label>
                  <select
                    name="lifestyle"
                    value={formData.lifestyle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Selectionnez le Mode de Vie</option>
                    <option value="sedentary">Sedentaire (peu ou pas d'exercice)</option>
                    <option value="light">Leger (1-3 jours/semaine)</option>
                    <option value="moderate">Modere (3-5 jours/semaine)</option>
                    <option value="active">Actif (6-7 jours/semaine)</option>
                    <option value="very-active">Tres Actif (exercice intense)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Health Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Informations de Sante</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Conditions de Sante (Selectionnez tous les elements qui s'appliquent)
                </label>
                <div className="space-y-2">
                  {[
                    'Diabete',
                    'Hypertension',
                    'Maladie Cardiaque',
                    'Obesite',
                    'Maladie Celiaque',
                    'Intolerance au Lactose',
                  ].map((disease) => (
                    <label key={disease} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(formData.diseases as string[]).includes(disease)}
                        onChange={() => handleCheckboxChange('diseases', disease)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-gray-700">{disease}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferences Alimentaires
                </label>
                <div className="space-y-2">
                  {[
                    'Vegetarien',
                    'Vegane',
                    'Sans Gluten',
                    'Sans Lactose',
                    'Faible Teneur en Glucides',
                    'Keto',
                    'Mediterraneenne',
                  ].map((pref) => (
                    <label key={pref} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(formData.dietaryPreferences as string[]).includes(pref)}
                        onChange={() => handleCheckboxChange('dietaryPreferences', pref)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-gray-700">{pref}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Goals */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Objectifs Nutritionnels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif Calorique Quotidien (kcal)
                  </label>
                  <input
                    type="number"
                    name="calorieGoal"
                    value={formData.calorieGoal}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="p.ex., 2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif de Proteines (grammes)
                  </label>
                  <input
                    type="number"
                    name="proteinGoal"
                    value={formData.proteinGoal}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="p.ex., 100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif de Glucides (grammes)
                  </label>
                  <input
                    type="number"
                    name="carbGoal"
                    value={formData.carbGoal}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="p.ex., 250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif de Matieres Grasses (grammes)
                  </label>
                  <input
                    type="number"
                    name="fatGoal"
                    value={formData.fatGoal}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="p.ex., 65"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer le Profil'}
              </button>
              <Link
                href="/dashboard"
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-6 rounded-lg transition duration-200"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
