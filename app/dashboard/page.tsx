'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface UserProfile {
  age?: number;
  gender?: string;
  lifestyle?: string;
  habits?: string[];
  diseases?: string[];
  dietaryPreferences?: string[];
  calorieGoal?: number;
  proteinGoal?: number;
  carbGoal?: number;
  fatGoal?: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile: UserProfile;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextStepsCompleted, setNextStepsCompleted] = useState<{[key: number]: boolean}>({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
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

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-indigo-600">NutriÉd</h1>
              <div className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Tableau de Bord
                </Link>
                <Link
                  href="/messages"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Messages
                </Link>
                <Link
                  href="/consultation-request"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Consultation
                </Link>
                <Link
                  href="/appointments"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Rendez-vous
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
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
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {session.user?.role === 'admin' && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-semibold">Accès Administrateur</p>
            <p className="text-blue-700 text-sm mt-1">
              <Link href="/admin" className="underline hover:no-underline">
                Aller au Tableau de Bord Admin
              </Link>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Welcome Card */}
          <div className="md:col-span-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Bienvenue, {session.user?.name}!</h2>
            <p className="text-indigo-100">
              Commencez votre parcours d'éducation nutritionnelle personnalisée aujourd'hui
            </p>
          </div>

          {/* Profile Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Etat du Profil</h3>
            {user?.profile?.age ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Age:</span> {user.profile.age}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Sexe:</span> {user.profile.gender || 'Non defini'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Mode de vie:</span>{' '}
                  {user.profile.lifestyle || 'Non defini'}
                </p>
                <Link
                  href="/profile"
                  className="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                >
                  Mettre a jour le Profil →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 text-sm mb-4">Completez votre profil nutritionnel pour commencer</p>
                <Link
                  href="/profile"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Completer le Profil
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vos Objectifs</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Calories:</span>{' '}
                {user?.profile?.calorieGoal || 'Non defini'} kcal
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Proteines:</span>{' '}
                {user?.profile?.proteinGoal || 'Non defini'}g
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Glucides:</span> {user?.profile?.carbGoal || 'Non defini'}g
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Graisses:</span> {user?.profile?.fatGoal || 'Non defini'}g
              </p>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ressources Educatives</h3>
            <p className="text-gray-600 text-sm mb-4">
              Accedez au contenu nutritionnel cree par des experts
            </p>
            <button
              onClick={() => router.push('/resources')}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Parcourir les Ressources
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaines Etapes</h3>
          <ul className="space-y-3">
            {[
              'Terminer l\'evaluation nutritionnelle',
              'Definir les objectifs alimentaires',
              'Obtenir un plan de repas personnalise',
              'Suivre votre progression',
            ].map((step, index) => (
              <li key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={nextStepsCompleted[index]}
                  onChange={(e) =>
                    setNextStepsCompleted((prev) => ({
                      ...prev,
                      [index]: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                />
                <span className={`text-gray-700 ${ nextStepsCompleted[index] ? 'line-through text-gray-400' : ''}`}>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
