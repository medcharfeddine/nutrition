'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState<any>(null);
  const [nextStepsCompleted, setNextStepsCompleted] = useState<{[key: number]: boolean}>({
    1: false,
    2: false,
    3: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchUserProfile();
      fetchBranding();
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              {branding?.logoUrl ? (
                <Image 
                  src={branding.logoUrl} 
                  alt={branding.siteName || 'NutriEd'} 
                  width={100}
                  height={100}
                  className="h-8 sm:h-10 w-auto object-contain"
                  quality={95}
                  priority
                />
              ) : (
                <h1 className="text-lg sm:text-2xl font-bold text-indigo-600">NutriÉd</h1>
              )}
            </Link>
            <div className="hidden md:flex gap-4 md:gap-6">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
              >
                {t('common.dashboard')}
              </Link>
              <Link
                href="/messages"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
              >
                Messages
              </Link>
              <Link
                href="/consultation-request"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
              >
                {t('common.dashboard')}
              </Link>
              <Link
                href="/appointments"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
              >
                {t('common.appointments')}
              </Link>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
              >
                {t('common.profile')}
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSwitcher />
              <span className="text-xs sm:text-sm text-gray-600">{session.user?.name}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        {session.user?.role === 'admin' && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-semibold">{t('dashboard.adminAccess')}</p>
            <p className="text-blue-700 text-sm mt-1">
              <Link href="/admin" className="underline hover:no-underline">
                {t('dashboard.goToAdminDashboard')}
              </Link>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Welcome Card */}
          <div className="md:col-span-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 sm:p-8 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t('dashboard.welcome')}, {session.user?.name}!</h2>
            <p className="text-sm sm:text-base text-indigo-100">
              {t('dashboard.welcomeMessage')}
            </p>
          </div>

          {/* Assessment Status */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('dashboard.assessment')}</h3>
            {session?.user?.hasCompletedAssessment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-green-900">{t('dashboard.assessmentComplete')}</p>
                    <p className="text-xs text-green-600">{t('dashboard.assessmentCompleteMessage')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 text-xs sm:text-sm mb-4">{t('dashboard.completeAssessment')}</p>
                <Link
                  href="/assessment"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold"
                >
                  {t('dashboard.doAssessment')}
                </Link>
              </div>
            )}
          </div>

          {/* Profile Status */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('dashboard.profileStatus')}</h3>
            {user?.profile?.age ? (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold">{t('dashboard.age')}:</span> {user.profile.age}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold">{t('dashboard.sex')}:</span> {user.profile.gender || t('dashboard.notDefined')}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold">{t('dashboard.lifestyle')}:</span>{' '}
                  {user.profile.lifestyle || t('dashboard.notDefined')}
                </p>
                <Link
                  href="/profile"
                  className="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-semibold text-xs sm:text-sm"
                >
                  {t('dashboard.updateProfile')} →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 text-xs sm:text-sm mb-4">{t('dashboard.completeProfile')}</p>
                <Link
                  href="/profile"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold"
                >
                  {t('dashboard.completeProfileBtn')}
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('dashboard.yourGoals')}</h3>
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">{t('dashboard.calories')}:</span>{' '}
                {user?.profile?.calorieGoal || t('dashboard.notDefined')} {t('dashboard.kcal')}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">{t('dashboard.proteins')}:</span>{' '}
                {user?.profile?.proteinGoal || t('dashboard.notDefined')}g
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">{t('dashboard.carbs')}:</span> {user?.profile?.carbGoal || t('dashboard.notDefined')}g
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">{t('dashboard.fats')}:</span> {user?.profile?.fatGoal || t('dashboard.notDefined')}g
              </p>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('dashboard.educationalResources')}</h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-4">
              {t('dashboard.accessContent')}
            </p>
            <button
              onClick={() => router.push('/resources')}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold"
            >
              {t('dashboard.browseResources')}
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('dashboard.nextSteps')}</h3>
          <ul className="space-y-3 text-xs sm:text-sm">
            {[
              { label: t('dashboard.completeEvaluation'), completed: session?.user?.hasCompletedAssessment || false },
              { label: t('dashboard.setGoals'), completed: nextStepsCompleted[1] },
              { label: t('dashboard.getMealPlan'), completed: nextStepsCompleted[2] },
              { label: t('dashboard.trackProgress'), completed: nextStepsCompleted[3] },
            ]
              .filter((step) => !step.completed || nextStepsCompleted[Object.keys(nextStepsCompleted).find(k => nextStepsCompleted[parseInt(k)] === step.completed) as any])
              .map((step, index) => (
                <li key={index} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={(e) => {
                      const stepIndex = [
                        { label: t('dashboard.completeEvaluation'), completed: session?.user?.hasCompletedAssessment || false },
                        { label: t('dashboard.setGoals'), completed: nextStepsCompleted[1] },
                        { label: t('dashboard.getMealPlan'), completed: nextStepsCompleted[2] },
                        { label: t('dashboard.trackProgress'), completed: nextStepsCompleted[3] },
                      ].findIndex(s => s.label === step.label);
                      if (stepIndex > 0) {
                        setNextStepsCompleted((prev) => ({
                          ...prev,
                          [stepIndex]: e.target.checked,
                        }));
                      }
                    }}
                    disabled={step.label === t('dashboard.completeEvaluation')}
                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className={`text-gray-700 ${step.completed ? 'line-through text-gray-400' : ''}`}>{step.label}</span>
                </li>
              ))}
            {session?.user?.hasCompletedAssessment && (
              <li className="text-sm text-green-600 font-semibold">✓ {t('dashboard.evaluationCompleted')}</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
