'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/language-provider';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
    fetchBranding();
  }, [session, router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white bg-opacity-90 backdrop-blur-md sticky top-0 z-50 shadow-lg border-b border-gray-200">
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
                  priority
                  quality={95}
                />
              ) : (
                <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 drop-shadow-lg">{t('common.appName')}</h1>
              )}
            </Link>
            <div className="flex gap-2 sm:gap-4 items-center">
              <LanguageSwitcher />
              {status === 'unauthenticated' && (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-gray-900 font-semibold text-sm sm:text-base"
                  >
                    {t('common.signIn')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm sm:text-base"
                  >
                    {t('common.signUp')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
          {t('common.appDescription')}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto">
          {t('common.appDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition transform hover:scale-105"
          >
            {t('common.signUp')}
          </Link>
          <Link
            href="/auth/login"
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition"
          >
            {t('common.signIn')}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-8 text-center border-t border-gray-200 mt-12">
        <p>&copy; 2026 {t('common.appName')}. {t('common.appDescription')}</p>
      </footer>
    </div>
  );
}
