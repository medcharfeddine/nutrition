'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('auth.loginError'));
      } else if (result?.ok) {
        router.push('/assessment');
      }
    } catch (err) {
      setError(t('common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-3 sm:px-4 py-8 sm:py-0 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          {branding?.logoUrl ? (
            <Image 
              src={branding.logoUrl} 
              alt={branding.siteName || 'NutriEd'} 
              width={200}
              height={200}
              className="h-16 sm:h-20 w-auto mx-auto mb-4 object-contain"
              priority
              quality={95}
            />
          ) : (
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">NutriEd</h1>
          )}
          <p className="text-gray-600 text-sm sm:text-base">{t('common.appDescription')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-6">
            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('common.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('common.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Entrez votre mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {loading ? t('common.loading') : t('common.signIn')}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          {t('auth.noAccount')}{' '}
          <Link href="/auth/register" className="text-indigo-600 hover:underline font-semibold">
            {t('common.signUp')}
          </Link>
        </p>

        <p className="text-center text-gray-600 text-sm mt-4">
          {t('auth.demoAdmin')}
        </p>
      </div>
    </div>
  );
}
