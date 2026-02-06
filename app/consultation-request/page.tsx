'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ConsultationRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
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
      } else {
        setError(data.error || t('consultation.failedToSubmit'));
      }
    } catch (error) {
      setError(t('common.errorOccurred'));
      console.error('Failed to submit request:', error);
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
            <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
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
                  <h1 className="text-lg sm:text-2xl font-bold text-indigo-600">NutriEd</h1>
                )}
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Tableau de Bord
                </Link>
                <Link href="/messages" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Messages
                </Link>
                <Link href="/consultation-request" className="text-indigo-600 hover:text-indigo-700 font-medium border-b-2 border-indigo-600">
                  Consultation
                </Link>
                <Link href="/appointments" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Rendez-vous
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Profil
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <span className="text-sm text-gray-600">{session.user?.name}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
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
                Demander une Consultation
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'status'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Statut de Votre Demande
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Request Tab */}
            {activeTab === 'request' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Demander une Consultation</h2>
                <p className="text-gray-600 mb-6">
                  Remplissez ce formulaire pour demander une consultation avec un spécialiste en nutrition. Un administrateur examinera votre demande et vous assignera un spécialiste.
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
                      Type de Consultation
                    </label>
                    <select
                      value={consultationType}
                      onChange={(e) => setConsultationType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    >
                      <option value="initial">Consultation Initiale</option>
                      <option value="follow-up">Suivi</option>
                      <option value="specific-concern">Préoccupation Spécifique</option>
                    </select>
                  </div>

                  {/* Goals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vos Objectifs de Santé
                    </label>
                    <textarea
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
                      required
                      placeholder="Décrivez vos objectifs de santé et de bien-être..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 10 caractères requis</p>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau d'Urgence
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
                            {level === 'low' && 'Faible'}
                            {level === 'medium' && 'Moyen'}
                            {level === 'high' && 'Élevé'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes Supplémentaires (Optionnel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Informations supplémentaires qui pourraient être utiles..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition"
                  >
                    {loading ? 'Envoi en cours...' : 'Soumettre la Demande'}
                  </button>
                </form>
              </div>
            )}

            {/* Status Tab */}
            {activeTab === 'status' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Statut de Votre Demande</h2>

                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Vous n'avez pas encore soumis de demande de consultation.</p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Soumettre une Demande
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
                                ? 'Consultation Initiale'
                                : request.consultationType === 'follow-up'
                                ? 'Suivi'
                                : 'Préoccupation Spécifique'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Soumis le {new Date(request.createdAt).toLocaleDateString('fr-FR')}
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
                              ? 'En Attente'
                              : request.status === 'assigned'
                              ? 'Assigné'
                              : 'Rejeté'}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-3">{request.goals}</p>

                        {request.status === 'assigned' && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded p-3 mb-3">
                            <p className="text-sm text-indigo-900">
                              <strong>Spécialiste Assigné:</strong> {request.assignedSpecialistName}
                            </p>
                            <p className="text-sm text-indigo-700 mt-2">
                              {t('appointments.appointmentNowAvailable')}
                            </p>
                          </div>
                        )}

                        {request.status === 'rejected' && (
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-900">
                              <strong>Raison du Rejet:</strong> {request.rejectionReason}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-3">
                          Urgence: {request.urgency === 'low' ? 'Faible' : request.urgency === 'medium' ? 'Moyen' : 'Élevé'}
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
