'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-provider';
import { useNotification } from '@/lib/notification-context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'view' | 'book'>('view');
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [assignedSpecialist, setAssignedSpecialist] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState<
    'initial' | 'follow-up' | 'check-in'
  >('initial');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchAppointments();
      fetchSpecialists();
      fetchAssignedSpecialist();
    }
  }, [status, router, filterStatus]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/appointments?filter=${filterStatus}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialists = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        const admins = data.users.filter(
          (user: any) => user.role === 'admin'
        );
        setSpecialists(admins);
      }
    } catch (error) {
      console.error('Failed to fetch specialists:', error);
    }
  };

  const fetchAssignedSpecialist = async () => {
    try {
      const res = await fetch('/api/consultation-request');
      if (res.ok) {
        const data = await res.json();
        const requests = data.requests || [];
        // Find assigned consultation request
        const assignedRequest = requests.find((req: any) => req.status === 'assigned');
        
        if (assignedRequest && assignedRequest.assignedSpecialistId) {
          // Auto-fill the specialist
          setSelectedSpecialist(assignedRequest.assignedSpecialistId);
          setAssignedSpecialist({
            id: assignedRequest.assignedSpecialistId,
            name: assignedRequest.assignedSpecialistName,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch assigned specialist:', error);
    }
  };

  const fetchAvailability = async (specialistId: string, date: string) => {
    if (!specialistId || !date) return;

    try {
      const res = await fetch(
        `/api/appointments/availability?specialistId=${specialistId}&date=${date}`
      );
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.availableSlots);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot('');
    fetchAvailability(selectedSpecialist, date);
  };

  const handleSpecialistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const specialistId = e.target.value;
    setSelectedSpecialist(specialistId);
    setSelectedSlot('');
    setAvailableSlots([]);
    if (selectedDate) {
      fetchAvailability(specialistId, selectedDate);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSpecialist || !selectedDate || !selectedSlot) {
      setErrorMessage('Please select a specialist, date, and time');
      addNotification({
        type: 'warning',
        title: 'Sélection Incomplète',
        message: 'Veuillez sélectionner un spécialiste, une date et une heure.',
        duration: 4000,
      });
      return;
    }

    setBookingLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const appointmentDateTime = new Date(`${selectedDate}T${selectedSlot}`);
      const endTime = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
      const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistId: selectedSpecialist,
          appointmentDate: appointmentDateTime.toISOString(),
          startTime: selectedSlot,
          endTime: endTimeStr,
          duration: 60,
          consultationType,
          notes,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (res.ok) {
        setSuccessMessage(
          'Appointment request sent! Awaiting specialist confirmation.'
        );
        setSelectedSpecialist('');
        setSelectedDate('');
        setSelectedSlot('');
        setNotes('');
        setConsultationType('initial');
        setActiveTab('view');
        fetchAppointments();
        
        // Show success notification
        addNotification({
          type: 'success',
          title: 'Rendez-vous Réservé',
          message: 'Votre demande de rendez-vous a été envoyée avec succès. En attente de confirmation du spécialiste.',
          duration: 5000,
        });
      } else {
        const error = await res.json();
        setErrorMessage(error.error || 'Failed to book appointment');
        
        // Show error notification
        addNotification({
          type: 'error',
          title: 'Erreur',
          message: error.error || 'Impossible de réserver le rendez-vous. Veuillez réessayer.',
          duration: 4000,
        });
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('Failed to book appointment:', error);
      
      // Show error notification
      addNotification({
        type: 'error',
        title: 'Erreur de Connexion',
        message: 'Une erreur est survenue lors de la réservation du rendez-vous.',
        duration: 4000,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <h1 className="text-lg sm:text-2xl font-bold text-indigo-600">NutriEd</h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                Dashboard
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
                href="/profile"
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                Profile
              </Link>
              <span className="text-sm text-gray-600">{session.user?.name}</span>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/auth/login' })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('view')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'view'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                My Appointments ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('book')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'book'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Book Appointment
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* View Appointments Tab */}
            {activeTab === 'view' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    My Appointments
                  </h2>
                  <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            filterStatus === status
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No appointments found</p>
                    <button
                      onClick={() => setActiveTab('book')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Book an Appointment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div
                        key={apt._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {apt.specialistName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(apt.appointmentDate).toLocaleDateString(
                                'fr-FR',
                                {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                }
                              )}{' '}
                              at {apt.startTime}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Type: {apt.consultationType}
                            </p>
                            {apt.notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                Notes: {apt.notes}
                              </p>
                            )}
                            {apt.meetingLink && (
                              <a
                                href={apt.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                              >
                                Join Meeting
                              </a>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}
                          >
                            {apt.status.charAt(0).toUpperCase() +
                              apt.status.slice(1)}
                          </span>
                        </div>
                        {apt.status === 'pending' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-yellow-600">
                              ⏳ Awaiting specialist confirmation
                            </p>
                          </div>
                        )}
                        {apt.adminNotes && apt.status === 'rejected' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-red-600">
                              Reason: {apt.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Book Appointment Tab */}
            {activeTab === 'book' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Book an Appointment
                </h2>

                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-600 font-semibold">
                      ✓ {successMessage}
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600 font-semibold">✗ {errorMessage}</p>
                  </div>
                )}

                {!assignedSpecialist ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">📋</div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                          Submit a Consultation Request First
                        </h3>
                        <p className="text-blue-700 mb-4">
                          To book an appointment, you need to submit a consultation request first. 
                          An administrator will review your request and assign you a specialist.
                        </p>
                        <Link
                          href="/consultation-request"
                          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
                        >
                          Submit Consultation Request
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBookAppointment} className="space-y-6">
                    {/* Specialist Display (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Assigned Specialist
                      </label>
                      <div className="w-full px-4 py-3 border border-green-300 rounded-lg bg-green-50">
                        <p className="text-green-900 font-semibold">
                          ✓ {assignedSpecialist.name}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          You can only book appointments with this specialist
                        </p>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  {/* Time Selection */}
                  {selectedDate && selectedSpecialist && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Times *
                      </label>
                      {availableSlots.length === 0 ? (
                        <p className="text-red-600 text-sm">
                          No available slots for this date. Please choose another date.
                        </p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                                selectedSlot === slot
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Consultation Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation Type
                    </label>
                    <select
                      value={consultationType}
                      onChange={(e) =>
                        setConsultationType(
                          e.target.value as 'initial' | 'follow-up' | 'check-in'
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    >
                      <option value="initial">Initial Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="check-in">Check-in</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Share any relevant information or questions..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={bookingLoading || !selectedSpecialist || !selectedDate || !selectedSlot}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200"
                  >
                    {bookingLoading ? 'Booking...' : 'Request Appointment'}
                  </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
