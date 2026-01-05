'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchAppointments();
      }
    }
  }, [status, router, session, filterStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
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

  const openDetailsModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setMeetingLink(appointment.meetingLink || '');
    setAdminNotes(appointment.adminNotes || '');
    setShowDetailsModal(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleApproveAppointment = async () => {
    if (!meetingLink.trim()) {
      setErrorMessage('Please provide a meeting link');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          status: 'confirmed',
          meetingLink,
          adminNotes,
        }),
      });

      if (res.ok) {
        setSuccessMessage('Appointment confirmed successfully!');
        setShowDetailsModal(false);
        fetchAppointments();
      } else {
        const error = await res.json();
        setErrorMessage(error.error || 'Failed to confirm appointment');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('Failed to confirm appointment:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAppointment = async () => {
    if (!adminNotes.trim()) {
      setErrorMessage('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          status: 'rejected',
          adminNotes,
        }),
      });

      if (res.ok) {
        setSuccessMessage('Appointment rejected');
        setShowDetailsModal(false);
        fetchAppointments();
      } else {
        const error = await res.json();
        setErrorMessage(error.error || 'Failed to reject appointment');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('Failed to reject appointment:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          status: 'completed',
        }),
      });

      if (res.ok) {
        setSuccessMessage('Appointment marked as completed');
        setShowDetailsModal(false);
        fetchAppointments();
      } else {
        const error = await res.json();
        setErrorMessage(error.error || 'Failed to update appointment');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('Failed to update appointment:', error);
    } finally {
      setActionLoading(false);
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
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-indigo-600">
                NutriEd Admin
              </h1>
              <div className="hidden md:flex gap-6">
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Admin: {session.user?.name}
              </span>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/auth/login' })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Deconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
              <div className="flex gap-2">
                {['all', 'pending', 'confirmed', 'completed', 'rejected'].map(
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

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-600 font-semibold">✓ {successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 font-semibold">✗ {errorMessage}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No appointments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <p className="font-medium">{appointment.userName}</p>
                            <p className="text-gray-500">{appointment.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(appointment.appointmentDate).toLocaleDateString(
                            'fr-FR'
                          )}{' '}
                          at {appointment.startTime}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {appointment.consultationType}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openDetailsModal(appointment)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Appointment Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  User Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="text-gray-900">{selectedAppointment.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {selectedAppointment.userEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Appointment Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(
                        selectedAppointment.appointmentDate
                      ).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Time
                    </label>
                    <p className="text-gray-900">
                      {selectedAppointment.startTime} -{' '}
                      {selectedAppointment.endTime}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Type
                    </label>
                    <p className="text-gray-900">
                      {selectedAppointment.consultationType}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedAppointment.status)}`}
                    >
                      {selectedAppointment.status.charAt(0).toUpperCase() +
                        selectedAppointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Notes */}
              {selectedAppointment.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    User Notes
                  </h3>
                  <p className="text-gray-600">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Action Forms */}
              {selectedAppointment.status === 'pending' && (
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Action
                  </h3>

                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm font-semibold">
                        ✗ {errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Confirm Appointment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Link *
                    </label>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any notes for the user..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleApproveAppointment}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                    >
                      {actionLoading ? 'Processing...' : 'Confirm Appointment'}
                    </button>
                  </div>

                  {/* Reject Appointment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection (if rejecting)
                    </label>
                    <textarea
                      placeholder="Explain why you're rejecting this appointment..."
                      defaultValue={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <button
                    onClick={handleRejectAppointment}
                    disabled={actionLoading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {actionLoading ? 'Processing...' : 'Reject Appointment'}
                  </button>
                </div>
              )}

              {selectedAppointment.status === 'confirmed' && (
                <div className="border-t border-gray-200 pt-6">
                  {selectedAppointment.meetingLink && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Meeting Link
                      </label>
                      <a
                        href={selectedAppointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 block"
                      >
                        {selectedAppointment.meetingLink}
                      </a>
                    </div>
                  )}

                  <button
                    onClick={handleMarkCompleted}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {actionLoading ? 'Processing...' : 'Mark as Completed'}
                  </button>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-600 font-semibold">✓ {successMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
