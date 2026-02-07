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
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
          {t('common.appName')}
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
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">{t('landing.keyFeatures')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="p-6 sm:p-8 border border-gray-200 rounded-lg hover:shadow-lg transition bg-gray-50">
              <div className="text-4xl mb-4">📋</div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('landing.personalizedAssessments')}</h4>
              <p className="text-gray-600">{t('landing.personalizedAssessmentsDesc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 sm:p-8 border border-gray-200 rounded-lg hover:shadow-lg transition bg-gray-50">
              <div className="text-4xl mb-4">🗓️</div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('landing.easyScheduling')}</h4>
              <p className="text-gray-600">{t('landing.easySchedulingDesc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 sm:p-8 border border-gray-200 rounded-lg hover:shadow-lg transition bg-gray-50">
              <div className="text-4xl mb-4">💬</div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('landing.directMessaging')}</h4>
              <p className="text-gray-600">{t('landing.directMessagingDesc')}</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 sm:p-8 border border-gray-200 rounded-lg hover:shadow-lg transition bg-gray-50">
              <div className="text-4xl mb-4">📚</div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('landing.educationalResources')}</h4>
              <p className="text-gray-600">{t('landing.educationalResourcesDesc')}</p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 sm:p-8 border border-gray-200 rounded-lg hover:shadow-lg transition bg-gray-50">
              <div className="text-4xl mb-4">👤</div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('landing.profileManagement')}</h4>
              <p className="text-gray-600">{t('landing.profileManagementDesc')}</p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 sm:p-8 border border-gray-200 rounded-lg hover:shadow-lg transition bg-gray-50">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('landing.securePrivate')}</h4>
              <p className="text-gray-600">{t('landing.securePrivateDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-indigo-50 to-blue-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">{t('landing.whyChoose')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="text-2xl text-indigo-600">✓</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('landing.expertNutritionists')}</h4>
                  <p className="text-gray-700">{t('landing.expertNutritionistsDesc')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl text-indigo-600">✓</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('landing.personalizedPlans')}</h4>
                  <p className="text-gray-700">{t('landing.personalizedPlansDesc')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl text-indigo-600">✓</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('landing.access24_7')}</h4>
                  <p className="text-gray-700">{t('landing.access24_7Desc')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="text-2xl text-indigo-600">✓</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('landing.provenResults')}</h4>
                  <p className="text-gray-700">{t('landing.provenResultsDesc')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl text-indigo-600">✓</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('landing.affordable')}</h4>
                  <p className="text-gray-700">{t('landing.affordableDesc')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl text-indigo-600">✓</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('landing.multiLanguageSupport')}</h4>
                  <p className="text-gray-700">{t('landing.multiLanguageSupportDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">{t('landing.howItWorks')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-4">
            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h4 className="font-bold text-gray-900 mb-2">{t('landing.signUp')}</h4>
              <p className="text-gray-600 text-sm">{t('landing.signUpDesc')}</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h4 className="font-bold text-gray-900 mb-2">{t('landing.assessment')}</h4>
              <p className="text-gray-600 text-sm">{t('landing.assessmentDesc')}</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h4 className="font-bold text-gray-900 mb-2">{t('landing.schedule')}</h4>
              <p className="text-gray-600 text-sm">{t('landing.scheduleDesc')}</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h4 className="font-bold text-gray-900 mb-2">{t('landing.succeed')}</h4>
              <p className="text-gray-600 text-sm">{t('landing.succeedDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">{t('landing.readyToStart')}</h3>
          <p className="text-base sm:text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">{t('landing.readyToStartDesc')}</p>
          <Link
            href="/auth/register"
            className="inline-block bg-white hover:bg-gray-100 text-indigo-600 px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition transform hover:scale-105"
          >
            {t('landing.getStartedToday')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="text-white font-bold mb-4">{t('landing.footerAbout')} {t('common.appName')}</h5>
              <p className="text-sm">{t('common.appDescription')}</p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">{t('landing.footerServices')}</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">{t('landing.assessmentsLink')}</a></li>
                <li><a href="#" className="hover:text-white transition">{t('landing.consultationsLink')}</a></li>
                <li><a href="#" className="hover:text-white transition">{t('landing.resourcesLink')}</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">{t('landing.footerQuickLinks')}</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">{t('landing.privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-white transition">{t('landing.termsOfService')}</a></li>
                <li><a href="#" className="hover:text-white transition">{t('landing.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">{t('landing.footerContact')}</h5>
              <ul className="space-y-2 text-sm">
                <li>📧 {t('landing.supportEmail')}</li>
                <li>📞 {t('landing.supportPhone')}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 {t('common.appName')}. {t('landing.footerCopyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
