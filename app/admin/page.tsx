'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [consultationRequests, setConsultationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [contentError, setContentError] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [messageRecipientId, setMessageRecipientId] = useState<string>('');
  const [messageRecipientName, setMessageRecipientName] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'video' as 'video' | 'post' | 'infographic',
    description: '',
    mediaUrl: '',
    content: '',
    category: 'nutrition-basics',
    tags: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchData();
      }
    }
  }, [status, router, session]);

  useEffect(() => {
    if (!selectedUserId) return;

    const pollMessages = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${selectedUserId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    pollMessages();
    const interval = setInterval(pollMessages, 10000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, contentsRes, assessmentsRes, consultationRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/content'),
        fetch('/api/assessment'),
        fetch('/api/consultation-request'),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }

      if (contentsRes.ok) {
        const data = await contentsRes.json();
        setContents(data.contents);
      }

      if (assessmentsRes.ok) {
        const data = await assessmentsRes.json();
        setAssessments(data.assessments);
      } else {
        console.error('Failed to fetch assessments:', assessmentsRes.status);
        setAssessments([]);
      }

      if (consultationRes.ok) {
        const data = await consultationRes.json();
        setConsultationRequests(data.requests || []);
      } else {
        console.error('Failed to fetch consultation requests:', consultationRes.status);
        setConsultationRequests([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setContentError('');

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contentForm,
          tags: contentForm.tags ? contentForm.tags.split(',').map((t) => t.trim()).filter(t => t) : [],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setContentForm({
          title: '',
          type: 'video',
          description: '',
          mediaUrl: '',
          content: '',
          category: 'nutrition-basics',
          tags: '',
        });
        setShowContentForm(false);
        setContentError('');
        fetchData();
      } else {
        const errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        setContentError(errorMsg || 'Failed to add content');
      }
    } catch (error) {
      setContentError('An error occurred. Please try again.');
      console.error('Failed to add content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`/api/admin/users?id=${userId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setUsers(users.filter((u) => u._id !== userId));
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        const res = await fetch(`/api/admin/content?id=${contentId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setContents(contents.filter((c) => c._id !== contentId));
        }
      } catch (error) {
        console.error('Failed to delete content:', error);
      }
    }
  };

  const openMessageModal = async (userId: string, userName: string) => {
    setMessageRecipientId(userId);
    setMessageRecipientName(userName);
    setSelectedUserId(userId);
    setMessageLoading(true);

    try {
      const res = await fetch(`/api/messages?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim()) return;

    setMessageLoading(true);
    const currentMessageContent = messageContent;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: messageRecipientId,
          content: messageContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessageContent('');
        // Optimistically add the message immediately using functional setState
        setMessages(prevMessages => [...prevMessages, data.message]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleAssignSpecialist = async (requestId: string, specialistId: string) => {
    if (!specialistId) {
      alert('Veuillez sélectionner un spécialiste');
      return;
    }

    try {
      const res = await fetch('/api/consultation-request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'assign',
          specialistId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update the consultation requests list
        setConsultationRequests(
          consultationRequests.map((req) =>
            req._id === requestId ? data.request : req
          )
        );
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de l\'assignation');
      }
    } catch (error) {
      console.error('Failed to assign specialist:', error);
      alert('Erreur lors de l\'assignation');
    }
  };

  const handleRejectConsultationRequest = async (requestId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Veuillez fournir une raison de rejet');
      return;
    }

    try {
      const res = await fetch('/api/consultation-request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'reject',
          rejectionReason: reason,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update the consultation requests list
        setConsultationRequests(
          consultationRequests.map((req) =>
            req._id === requestId ? data.request : req
          )
        );
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors du rejet');
      }
    } catch (error) {
      console.error('Failed to reject consultation request:', error);
      alert('Erreur lors du rejet');
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
              <h1 className="text-2xl font-bold text-indigo-600">NutriEd Admin</h1>
              <div className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin: {session.user?.name}</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'users'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Utilisateurs ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('assessments')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'assessments'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Evaluations ({assessments.length})
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'content'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Contenu ({contents.length})
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'messages'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Messages
              </button>
              <button
                onClick={() => setActiveTab('consultation-requests')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'consultation-requests'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Demandes de Consultation ({consultationRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'appointments'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Rendez-vous
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerer les Utilisateurs</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">E-mail</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rejoint le</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600 hover:text-red-800 text-sm font-semibold"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Assessments Tab */}
            {activeTab === 'assessments' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Evaluations Nutritionnelles</h2>
                {assessments.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">Aucune evaluation enregistree</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">E-mail</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom Complet</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Age</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Taille (cm)</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Poids (kg)</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Objectif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {assessments.map((assessment) => (
                          <tr 
                            key={assessment._id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setShowAssessmentModal(true);
                            }}
                          >
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{assessment.userName || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{assessment.userEmail || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{assessment.fullName || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {assessment.dateOfBirth 
                                ? new Date().getFullYear() - new Date(assessment.dateOfBirth).getFullYear()
                                : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{assessment.height || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{assessment.weight || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{assessment.mainObjective || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Gerer le Contenu</h2>
                  <button
                    onClick={() => setShowContentForm(!showContentForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                  >
                    {showContentForm ? 'Annuler' : 'Ajouter du Contenu'}
                  </button>
                </div>

                {showContentForm && (
                  <form onSubmit={handleAddContent} className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
                    {contentError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm font-semibold">{contentError}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre
                        </label>
                        <input
                          type="text"
                          value={contentForm.title}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, title: e.target.value })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                          placeholder="Content title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={contentForm.type}
                          onChange={(e) =>
                            setContentForm({
                              ...contentForm,
                              type: e.target.value as 'video' | 'post' | 'infographic',
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        >
                          <option value="video">Video</option>
                          <option value="post">Article</option>
                          <option value="infographic">Infographie</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categorie
                        </label>
                        <select
                          value={contentForm.category}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, category: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        >
                          <option value="nutrition-basics">Nutrition Basics</option>
                          <option value="meal-planning">Meal Planning</option>
                          <option value="weight-management">Weight Management</option>
                          <option value="healthy-eating">Healthy Eating</option>
                          <option value="fitness">Fitness</option>
                          <option value="mindfulness">Mindfulness</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL Media
                        </label>
                        <input
                          type="url"
                          value={contentForm.mediaUrl}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, mediaUrl: e.target.value })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                          placeholder="https://example.com/media"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={contentForm.description}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, description: e.target.value })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                          placeholder="Content description"
                          rows={2}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contenu
                        </label>
                        <textarea
                          value={contentForm.content}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, content: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                          placeholder="Texte du contenu complet"
                          rows={4}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Etiquettes (separees par des virgules)
                        </label>
                        <input
                          type="text"
                          value={contentForm.tags}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, tags: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                          placeholder="nutrition, weight-loss, recipes"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 rounded-lg transition duration-200"
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer le Contenu'}
                    </button>
                  </form>
                )}

                {loading && !showContentForm ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contents.map((content) => (
                      <div key={content._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                            {content.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{content.description}</p>
                        <div className="mb-3">
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded mr-2">
                            {content.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteContent(content._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Users List */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisateurs</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {users.map((user) => (
                        <button
                          key={user._id}
                          onClick={() => openMessageModal(user._id, user.name)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition ${
                            selectedUserId === user._id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <p className="font-medium">{user.name}</p>
                          <p className={`text-xs ${selectedUserId === user._id ? 'text-indigo-100' : 'text-gray-500'}`}>
                            {user.email}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Messages View */}
                  <div className="lg:col-span-2 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white">
                    {selectedUserId ? (
                      <>
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                          <h3 className="text-lg font-bold text-white">Conversation avec {messageRecipientName}</h3>
                        </div>

                        {/* Messages Display */}
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4 max-h-96">
                          {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-gray-500">
                              <p>Aucun message dans cette conversation</p>
                            </div>
                          ) : (
                            messages.map((message: any, index: number) => (
                              <div
                                key={index}
                                className={`flex ${
                                  message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-xs px-4 py-2 rounded-lg ${
                                    message.senderId === session?.user?.id
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-white text-gray-900 border border-gray-200'
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      message.senderId === session?.user?.id
                                        ? 'text-indigo-200'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="border-t border-gray-200 p-4 bg-white">
                          <form onSubmit={handleSendMessage} className="flex gap-3">
                            <input
                              type="text"
                              value={messageContent}
                              onChange={(e) => setMessageContent(e.target.value)}
                              placeholder="Tapez votre message..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                              disabled={messageLoading}
                            />
                            <button
                              type="submit"
                              disabled={messageLoading || !messageContent.trim()}
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
                            >
                              {messageLoading ? 'Envoi...' : 'Envoyer'}
                            </button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>Sélectionnez un utilisateur pour commencer une conversation</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Modal */}
        {showAssessmentModal && selectedAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Détails de l'Évaluation</h2>
                <button
                  onClick={() => setShowAssessmentModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {/* User Info Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Informations Utilisateur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nom d'utilisateur</label>
                      <p className="text-gray-900">{selectedAssessment.userName || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">E-mail</label>
                      <p className="text-gray-900">{selectedAssessment.userEmail || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* General Info Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Informations Générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nom Complet</label>
                      <p className="text-gray-900">{selectedAssessment.fullName || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date de Naissance</label>
                      <p className="text-gray-900">
                        {selectedAssessment.dateOfBirth 
                          ? new Date(selectedAssessment.dateOfBirth).toLocaleDateString('fr-FR')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Genre</label>
                      <p className="text-gray-900">{selectedAssessment.gender || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Région</label>
                      <p className="text-gray-900">{selectedAssessment.region || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Numéro de Téléphone</label>
                      <p className="text-gray-900">{selectedAssessment.phoneNumber || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Physical Measurements */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Mesures Physiques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Taille (cm)</label>
                      <p className="text-gray-900">{selectedAssessment.height || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Poids (kg)</label>
                      <p className="text-gray-900">{selectedAssessment.weight || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Niveau d'Activité Physique</label>
                      <p className="text-gray-900">{selectedAssessment.physicalActivityLevel || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Lifestyle Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Mode de Vie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tabagisme</label>
                      <p className="text-gray-900">{selectedAssessment.smoking || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Consommation d'Alcool</label>
                      <p className="text-gray-900">{selectedAssessment.alcoholConsumption || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Heures de Sommeil</label>
                      <p className="text-gray-900">{selectedAssessment.sleepHours || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Eating Habits Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Habitudes Alimentaires</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Repas par Jour</label>
                    <p className="text-gray-900">{selectedAssessment.mealsPerDay || '-'}</p>
                  </div>
                </div>

                {/* Health Status Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Santé</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Maladies Chroniques</label>
                      <p className="text-gray-900">
                        {selectedAssessment.chronicDiseases && selectedAssessment.chronicDiseases.length > 0
                          ? selectedAssessment.chronicDiseases.join(', ')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Traitement Médical</label>
                      <p className="text-gray-900">{selectedAssessment.medicalTreatment || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Allergies/Intolérances</label>
                      <p className="text-gray-900">
                        {selectedAssessment.allergiesIntolerances && selectedAssessment.allergiesIntolerances.length > 0
                          ? selectedAssessment.allergiesIntolerances.join(', ')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Autres Allergies</label>
                      <p className="text-gray-900">{selectedAssessment.otherAllergies || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Objectives Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Objectifs</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Objectif Principal</label>
                      <p className="text-gray-900">{selectedAssessment.mainObjective || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Autre Objectif</label>
                      <p className="text-gray-900">{selectedAssessment.otherObjective || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Submission Date */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Informations de Soumission</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date de Soumission</label>
                      <p className="text-gray-900">
                        {selectedAssessment.createdAt 
                          ? new Date(selectedAssessment.createdAt).toLocaleDateString('fr-FR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dernière Mise à Jour</label>
                      <p className="text-gray-900">
                        {selectedAssessment.updatedAt 
                          ? new Date(selectedAssessment.updatedAt).toLocaleDateString('fr-FR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAssessmentModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      openMessageModal(selectedAssessment.userId, selectedAssessment.userName);
                      setActiveTab('messages');
                      setShowAssessmentModal(false);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Envoyer un Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Consultation Requests Tab */}
        {activeTab === 'consultation-requests' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Demandes de Consultation</h2>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : consultationRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Aucune demande de consultation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultationRequests.map((request) => (
                  <div
                    key={request._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                  >
                    {/* Request Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.userName}
                        </h3>
                        <p className="text-sm text-gray-600">{request.userEmail}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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
                          ? 'Assignée'
                          : 'Rejetée'}
                      </span>
                    </div>

                    {/* Request Details */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Type de Consultation
                        </label>
                        <p className="text-gray-900">
                          {request.consultationType === 'initial'
                            ? 'Consultation Initiale'
                            : request.consultationType === 'follow-up'
                            ? 'Suivi'
                            : 'Demande Spécifique'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Urgence</label>
                        <p className="text-gray-900">
                          {request.urgency === 'low'
                            ? 'Faible'
                            : request.urgency === 'medium'
                            ? 'Moyen'
                            : 'Haute'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Objectifs</label>
                        <p className="text-gray-900">{request.goals}</p>
                      </div>
                      {request.notes && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Notes</label>
                          <p className="text-gray-900">{request.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Status-based Actions */}
                    {request.status === 'pending' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Assigner un Spécialiste
                          </label>
                          <select
                            id={`specialist-select-${request._id}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                          >
                            <option value="">-- Sélectionner un spécialiste --</option>
                            {users
                              .filter((u) => u.role === 'admin')
                              .map((specialist) => (
                                <option key={specialist._id} value={specialist._id}>
                                  {specialist.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              const selectElement = document.getElementById(
                                `specialist-select-${request._id}`
                              ) as HTMLSelectElement;
                              handleAssignSpecialist(request._id, selectElement.value);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                          >
                            Assigner
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Entrez la raison du rejet:');
                              if (reason) {
                                handleRejectConsultationRequest(request._id, reason);
                              }
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                          >
                            Rejeter
                          </button>
                        </div>
                      </div>
                    )}

                    {request.status === 'assigned' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-green-700">
                          ✓ Assignée à {request.assignedSpecialistName}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Le spécialiste et l'utilisateur ont été notifiés
                        </p>
                      </div>
                    )}

                    {request.status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-red-700">
                          ✗ Rejetée
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Raison: {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Rendez-vous</h2>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Les rendez-vous des spécialistes</p>
                <Link
                  href="/admin/appointments"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Accéder à la Gestion des Rendez-vous
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
