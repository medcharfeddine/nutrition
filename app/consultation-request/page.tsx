'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-provider';
import { useNotification } from '@/lib/notification-context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ConsultationRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('request');
  const [consultationType, setConsultationType] = useState<'initial' | 'follow-up' | 'specific-concern'>('initial');
  const [goals, setGoals] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [branding, setBranding] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchRequests();
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

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/consultation-request');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/consultation-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationType,
          goals,
          urgency,
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(t('consultation.requestSubmitted'));
        setGoals('');
        setNotes('');
        setConsultationType('initial');
        setUrgency('medium');
        fetchRequests();
        
        // Show success notification
        addNotification({
          type: 'success',
          title: t('consultation.notifications.submitSuccess'),
          message: t('consultation.notifications.submitSuccessDesc'),
          duration: 5000,
        });
      } else {
        setError(data.error || t('consultation.failedToSubmit'));
        
        // Show error notification
        addNotification({
          type: 'error',
          title: t('common.error'),
          message: data.error || t('consultation.notifications.submitError'),
          duration: 4000,
        });
      }
    } catch (error) {
      setError(t('common.errorOccurred'));
      console.error('Failed to submit request:', error);
      
      // Show error notification
      addNotification({
        type: 'error',
        title: t('consultation.notifications.connectionError'),
        message: t('consultation.notifications.connectionErrorDesc'),
        duration: 4000,
      });
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
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
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
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">{t('common.appName')}</h1>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-4 md:gap-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base">
                {t('common.dashboard')}
              </Link>
              <Link href="/messages" className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base">
                {t('common.messages')}
              </Link>
              <Link href="/consultation-request" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm md:text-base border-b-2 border-indigo-600">
                {t('common.consultation')}
              </Link>
              <Link href="/appointments" className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base">
                {t('common.appointments')}
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base">
                {t('common.profile')}
              </Link>
            </div>

            {/* Mobile & Desktop Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <LanguageSwitcher />
              <span className="hidden sm:inline text-xs md:text-sm text-gray-600 truncate max-w-[100px] md:max-w-none">{session.user?.name}</span>
              
              {/* Desktop Logout Button */}
              <button
                onClick={handleSignOut}
                className="hidden md:block bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium"
              >
                {t('common.logout')}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-3 space-y-2">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.dashboard')}
              </Link>
              <Link
                href="/messages"
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.messages')}
              </Link>
              <Link
                href="/consultation-request"
                className="block px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium text-sm bg-indigo-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.consultation')}
              </Link>
              <Link
                href="/appointments"
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.appointments')}
              </Link>
              <Link
                href="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.profile')}
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm mt-2"
              >
                {t('common.logout')}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('request')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'request'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                {t('consultation.tabs.request')}
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'status'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                {t('consultation.tabs.status')}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Request Tab */}
            {activeTab === 'request' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('consultation.form.heading')}</h2>
                <p className="text-gray-600 mb-6">
                  {t('consultation.form.description')}
                </p>

                {message && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">{message}</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Consultation Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('consultation.form.type')}
                    </label>
                    <select
                      value={consultationType}
                      onChange={(e) => setConsultationType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    >
                      <option value="initial">{t('consultation.form.typeInitial')}</option>
                      <option value="follow-up">{t('consultation.form.typeFollowUp')}</option>
                      <option value="specific-concern">{t('consultation.form.typeSpecificConcern')}</option>
                    </select>
                  </div>

                  {/* Goals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('consultation.form.goals')}
                    </label>
                    <textarea
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
                      required
                      placeholder={t('consultation.form.goalsPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('consultation.form.goalsHelp')}</p>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('consultation.form.urgency')}
                    </label>
                    <div className="flex gap-4">
                      {['low', 'medium', 'high'].map((level) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="radio"
                            name="urgency"
                            value={level}
                            checked={urgency === level}
                            onChange={(e) => setUrgency(e.target.value as any)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            {level === 'low' && t('consultation.form.urgencyLow')}
                            {level === 'medium' && t('consultation.form.urgencyMedium')}
                            {level === 'high' && t('consultation.form.urgencyHigh')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('consultation.form.notes')}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('consultation.form.notesPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition"
                  >
                    {loading ? t('consultation.form.submitting') : t('consultation.form.submitButton')}
                  </button>
                </form>
              </div>
            )}

            {/* Status Tab */}
            {activeTab === 'status' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('consultation.status.heading')}</h2>

                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">{t('consultation.status.empty')}</p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      {t('consultation.status.submitButton')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div
                        key={request._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.consultationType === 'initial'
                                ? t('consultation.form.typeInitial')
                                : request.consultationType === 'follow-up'
                                ? t('consultation.form.typeFollowUp')
                                : t('consultation.form.typeSpecificConcern')}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {t('consultation.status.submitted')} {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              request.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'assigned'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {request.status === 'pending'
                              ? t('consultation.status.pending')
                              : request.status === 'assigned'
                              ? t('consultation.status.assigned')
                              : t('consultation.status.rejected')}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-3">{request.goals}</p>

                        {request.status === 'assigned' && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded p-3 mb-3">
                            <p className="text-sm text-indigo-900">
                              <strong>{t('consultation.status.assignedSpecialist')}</strong> {request.assignedSpecialistName}
                            </p>
                            <p className="text-sm text-indigo-700 mt-2">
                              {t('appointments.appointmentNowAvailable')}
                            </p>
                          </div>
                        )}

                        {request.status === 'rejected' && (
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-900">
                              <strong>{t('consultation.status.rejectionReason')}</strong> {request.rejectionReason}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-3">
                          {t('consultation.status.urgencyLabel')} {request.urgency === 'low' ? t('consultation.form.urgencyLow') : request.urgency === 'medium' ? t('consultation.form.urgencyMedium') : t('consultation.form.urgencyHigh')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
