'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import { useBranding } from '@/lib/branding-provider';
import { useLanguage } from '@/lib/language-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Branding Tab Component
function BrandingTab() {
  const { t } = useLanguage();
  const [branding, setBranding] = useState({
    siteName: '',
    siteDescription: '',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#06b6d4',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const res = await fetch('/api/admin/branding');
      if (res.ok) {
        const data = await res.json();
        if (data.branding) {
          setBranding(data.branding);
        }
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBranding(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (fileUrl: string, fileType: 'logo' | 'favicon') => {
    if (fileType === 'logo') {
      setBranding(prev => ({
        ...prev,
        logoUrl: fileUrl
      }));
    } else {
      setBranding(prev => ({
        ...prev,
        faviconUrl: fileUrl
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('common.brandingUpdated') });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || t('admin.errorUpdating') });
      }
    } catch (error) {
      console.error('Failed to save branding:', error);
      setMessage({ type: 'error', text: t('admin.errorSaving') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('common.brandingConfig')}</h2>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du Site
          </label>
          <input
            type="text"
            name="siteName"
            value={branding.siteName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="NutriEd"
          />
        </div>

        {/* Site Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description du Site
          </label>
          <textarea
            name="siteDescription"
            value={branding.siteDescription}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Décrivez votre site..."
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo du Site
          </label>
          <FileUpload
            onSuccess={(url, publicId) => handleFileUpload(url, 'logo')}
            type="image"
            maxSize={50}
            buttonText="Télécharger Logo"
          />
          {branding.logoUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
              <img src={branding.logoUrl} alt="Logo" className="h-20" />
            </div>
          )}
        </div>

        {/* Favicon Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Favicon du Site
          </label>
          <FileUpload
            onSuccess={(url, publicId) => handleFileUpload(url, 'favicon')}
            type="image"
            maxSize={10}
            buttonText="Télécharger Favicon"
          />
          {branding.faviconUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
              <img src={branding.faviconUrl} alt="Favicon" className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur Principale
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              name="primaryColor"
              value={branding.primaryColor}
              onChange={handleInputChange}
              className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={branding.primaryColor}
              onChange={handleInputChange}
              name="primaryColor"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="#4f46e5"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur Secondaire
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              name="secondaryColor"
              value={branding.secondaryColor}
              onChange={handleInputChange}
              className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={branding.secondaryColor}
              onChange={handleInputChange}
              name="secondaryColor"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="#06b6d4"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { siteName, siteDescription, logoUrl } = useBranding();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [consultationRequests, setConsultationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserData, setEditingUserData] = useState<any>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    type: '',
    description: '',
    mediaUrl: '',
    content: '',
    category: '',
  });
  const [showContentModal, setShowContentModal] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [contentImageError, setContentImageError] = useState('');

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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, contentsRes, assessmentsRes, consultationRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/content'),
        fetch('/api/assessment'),
        fetch('/api/consultation-request'),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      } else {
        const error = await usersRes.json();
        console.error('Failed to fetch users:', usersRes.status, error);
        setError(`Failed to load users: ${error.error || usersRes.statusText}`);
      }

      if (contentsRes.ok) {
        const data = await contentsRes.json();
        setContents(data.contents || []);
      } else {
        const error = await contentsRes.json();
        console.error('Failed to fetch contents:', contentsRes.status, error);
      }

      if (assessmentsRes.ok) {
        const data = await assessmentsRes.json();
        setAssessments(data.assessments || []);
      } else {
        const error = await assessmentsRes.json();
        console.error('Failed to fetch assessments:', assessmentsRes.status, error);
      }

      if (consultationRes.ok) {
        const data = await consultationRes.json();
        setConsultationRequests(data.requests || []);
      } else {
        const error = await consultationRes.json();
        console.error('Failed to fetch consultation requests:', consultationRes.status, error);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(`Error loading data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`/api/admin/users?id=${userId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setUsers(users.filter((u) => u._id !== userId));
          setShowUserModal(false);
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const openUserModal = (user: any) => {
    setSelectedUser(user);
    setEditingUserData(JSON.parse(JSON.stringify(user))); // Deep copy
    setIsEditingUser(false);
    setShowUserModal(true);
    
    // Fetch assessment data from database
    fetchUserAssessment(user._id);
  };

  const fetchUserAssessment = async (userId: string) => {
    try {
      // Find assessment in the already fetched assessments array
      const userAssessment = assessments.find((a: any) => a.userId === userId);
      
      if (userAssessment) {
        // Update selectedUser with the assessment from DB
        setSelectedUser((prev: any) => ({
          ...prev,
          assessment: userAssessment,
        }));
        
        // Also update editingUserData if in edit mode
        setEditingUserData((prev: any) => ({
          ...prev,
          assessment: userAssessment,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
    }
  };

  // Sync selected user's assessment when assessments are updated
  useEffect(() => {
    if (selectedUser && showUserModal && assessments) {
      fetchUserAssessment(selectedUser._id);
    }
  }, [assessments, selectedUser?._id, showUserModal]);

  const startEditingUser = () => {
    const userData = JSON.parse(JSON.stringify(selectedUser));
    // Ensure profile object exists
    if (!userData.profile) {
      userData.profile = {};
    }
    // Ensure assessment object exists with all current data
    if (!userData.assessment) {
      userData.assessment = {};
    }
    setEditingUserData(userData);
    setIsEditingUser(true);
  };

  const cancelEditingUser = () => {
    setIsEditingUser(false);
    setEditingUserData(null);
  };

  const saveUserChanges = async () => {
    setIsSavingUser(true);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          ...editingUserData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data.user);
        setUsers(users.map(u => u._id === data.user._id ? data.user : u));
        setIsEditingUser(false);
        alert('Utilisateur mis à jour avec succès');
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error || 'Impossible de mettre à jour l\'utilisateur'}`);
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      alert(t('admin.errorSaving'));
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleAddContent = async () => {
    if (!newContent.title || !newContent.type || !newContent.description || !newContent.mediaUrl || !newContent.category) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const url = isEditingContent ? `/api/admin/content?id=${selectedContent._id}` : '/api/admin/content';
      const method = isEditingContent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent),
      });

      if (res.ok) {
        const data = await res.json();
        if (isEditingContent) {
          setContents(contents.map(c => c._id === data.content._id ? data.content : c));
          alert('Contenu mis à jour avec succès');
        } else {
          setContents([data.content, ...contents]);
          alert('Contenu ajouté avec succès');
        }
        setNewContent({
          title: '',
          type: '',
          description: '',
          mediaUrl: '',
          content: '',
          category: '',
        });
        setShowContentModal(false);
        setIsEditingContent(false);
        setSelectedContent(null);
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error || 'Impossible de traiter la requête'}`);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      alert(t('admin.errorSavingContent'));
    }
  };

  const openContentModal = (content?: any) => {
    if (content) {
      setSelectedContent(content);
      setNewContent({
        title: content.title,
        type: content.type,
        description: content.description,
        mediaUrl: content.mediaUrl,
        content: content.content || '',
        category: content.category,
      });
      setIsEditingContent(true);
    } else {
      setNewContent({
        title: '',
        type: '',
        description: '',
        mediaUrl: '',
        content: '',
        category: '',
      });
      setIsEditingContent(false);
      setSelectedContent(null);
    }
    setShowContentModal(true);
  };

  const closeContentModal = () => {
    setShowContentModal(false);
    setIsEditingContent(false);
    setSelectedContent(null);
    setNewContent({
      title: '',
      type: '',
      description: '',
      mediaUrl: '',
      content: '',
      category: '',
    });
  };

  const handleDeleteContent = async (contentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contenu?')) {
      try {
        const res = await fetch(`/api/admin/content?id=${contentId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setContents(contents.filter((c) => c._id !== contentId));
          alert('Contenu supprimé avec succès');
        } else {
          const error = await res.json();
          alert(`Erreur: ${error.error || 'Impossible de supprimer le contenu'}`);
        }
      } catch (error) {
        console.error('Failed to delete content:', error);
        alert(t('admin.errorDeleeting'));
      }
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

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={siteName || 'Logo'}
                  className="h-8 sm:h-10 w-auto"
                />
              )}
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-2xl font-bold text-indigo-600">{siteName || 'NutriEd'}</h1>
                {siteDescription && (
                  <p className="text-xs text-gray-500 hidden sm:block">{siteDescription.substring(0, 30)}...</p>
                )}
              </div>
            </div>
            <div className="hidden md:flex gap-2 lg:gap-4 items-center">
              <LanguageSwitcher />
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                Déconnexion
              </button>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium"
              >
                Déc.
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        {error && (
          <div className="sticky top-14 sm:top-16 z-30 mx-3 sm:mx-4 md:mx-6 lg:mx-8 mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-red-600 font-semibold text-sm sm:text-base break-words">⚠️ {error}</p>
          </div>
        )}
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 w-full overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto sticky top-14 sm:top-16 z-40 bg-white -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'users'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="inline sm:hidden">👥</span>
                <span className="hidden sm:inline">Utilisateurs</span>
              </button>
              <button
                onClick={() => setActiveTab('assessments')}
                className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'assessments'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="inline sm:hidden">📋</span>
                <span className="hidden sm:inline">Évaluations</span>
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'content'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="inline sm:hidden">📝</span>
                <span className="hidden sm:inline">Contenu</span>
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'appointments'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="inline sm:hidden">📅</span>
                <span className="hidden sm:inline">Rendez-vous</span>
              </button>
              <button
                onClick={() => setActiveTab('consultations')}
                className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'consultations'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="inline sm:hidden">💬</span>
                <span className="hidden sm:inline">Consultations</span>
              </button>
              <button
                onClick={() => setActiveTab('branding')}
                className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'branding'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="inline sm:hidden">🎨</span>
                <span className="hidden sm:inline">Branding</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-4 md:p-6 w-full overflow-hidden">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Gérer les Utilisateurs</h2>
                {loading ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-600 text-sm sm:text-base">{t('common.loading')}</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-600 text-sm sm:text-base">{t('admin.noUsers')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left font-semibold text-gray-700">Nom</th>
                          <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left font-semibold text-gray-700">E-mail</th>
                          <th className="hidden md:table-cell px-6 py-3 text-left font-semibold text-gray-700">Role</th>
                          <th className="hidden lg:table-cell px-6 py-3 text-left font-semibold text-gray-700">Rejoint le</th>
                          <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-right font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user: any) => (
                          <tr
                            key={user._id}
                            onClick={() => openUserModal(user)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-gray-900 font-medium">{user.name}</td>
                            <td className="hidden sm:table-cell px-4 md:px-6 py-3 text-gray-600">{user.email}</td>
                            <td className="hidden md:table-cell px-4 md:px-6 py-3 text-gray-600">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="hidden lg:table-cell px-6 py-3 text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(user._id);
                                }}
                                className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-semibold"
                              >
                                Sup.
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
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Évaluations</h2>
                {loading ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-600 text-sm sm:text-base">{t('common.loading')}</p>
                  </div>
                ) : assessments.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-600 text-sm sm:text-base">{t('admin.noAssessments')}</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4">
                    {assessments.map((assessment: any) => (
                      <div key={assessment._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white shadow-sm">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{assessment.userName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{assessment.userEmail}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                          {new Date(assessment.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Contenu</h2>
                  <button
                    onClick={() => openContentModal()}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                  >
                    + Ajouter
                  </button>
                </div>
                {loading ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-600 text-sm sm:text-base">{t('common.loading')}</p>
                  </div>
                ) : contents.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-600 text-sm sm:text-base">{t('admin.noContent')}</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4">
                    {contents.map((content: any) => (
                      <div key={content._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{content.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{content.type} • {content.category}</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2">{content.description}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => openContentModal(content)}
                              className="px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded transition-colors"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteContent(content._id);
                              }}
                              className="px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm rounded transition-colors"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('appointments.title')}</h2>
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">{t('appointments.management')}</p>
                  <Link
                    href="/admin/appointments"
                    className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
                  >
                    Accéder
                  </Link>
                </div>
              </div>
            )}

            {/* Consultation Requests Tab */}
            {activeTab === 'consultations' && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Demandes de Consultation</h2>
                {loading ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-600 text-sm sm:text-base">{t('common.loading')}</p>
                  </div>
                ) : consultationRequests.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-600 text-sm sm:text-base">{t('admin.noConsultationRequests')}</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4">
                    {consultationRequests.map((request: any) => (
                      <div key={request._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{request.userName}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{request.userEmail}</p>
                          </div>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                          <p><strong>Type:</strong> {request.consultationType}</p>
                          <p><strong>Urgence:</strong> {request.urgency}</p>
                          <p className="line-clamp-1"><strong>Objectifs:</strong> {request.goals}</p>
                          {request.assignedSpecialistName && (
                            <p><strong>Spécialiste:</strong> {request.assignedSpecialistName}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <BrandingTab />
            )}
          </div>
        </div>
      </div>
      </main>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] sm:max-h-[calc(100vh-2rem)] flex flex-col my-4 sm:my-0">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Détails Utilisateur</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold ml-4 flex-shrink-0"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6">
              {/* Basic User Info */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  Informations de Base
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                    {isEditingUser ? (
                      <input
                        type="text"
                        value={editingUserData?.name || ''}
                        onChange={(e) => setEditingUserData({ ...editingUserData, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold text-sm break-all">{selectedUser.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    {isEditingUser ? (
                      <input
                        type="email"
                        value={editingUserData?.email || ''}
                        onChange={(e) => setEditingUserData({ ...editingUserData, email: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold text-sm break-all">{selectedUser.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                    {isEditingUser ? (
                      <select
                        value={editingUserData?.role || 'user'}
                        onChange={(e) => setEditingUserData({ ...editingUserData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedUser.role}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Utilisateur</label>
                    <p className="text-gray-600 text-xs font-mono break-all">{selectedUser._id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
                    <p className="text-gray-900 font-semibold">
                      {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dernière mise à jour</label>
                    <p className="text-gray-900 font-semibold">
                      {new Date(selectedUser.updatedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {selectedUser.assessment?.phoneNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <p className="text-gray-900 font-semibold">{selectedUser.assessment.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment Status */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Statut d'Évaluation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700 flex-1">Évaluation Complétée:</span>
                    {isEditingUser ? (
                      <select
                        value={editingUserData?.hasCompletedAssessment ? 'true' : 'false'}
                        onChange={(e) => setEditingUserData({ ...editingUserData, hasCompletedAssessment: e.target.value === 'true' })}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="false">Non</option>
                        <option value="true">Oui</option>
                      </select>
                    ) : (
                      <span className={`font-semibold ${selectedUser.hasCompletedAssessment ? 'text-green-600' : 'text-gray-500'}`}>
                        {selectedUser.hasCompletedAssessment ? '✓ Oui' : '✗ Non'}
                      </span>
                    )}
                  </div>
                  {selectedUser.assessment?.createdAt && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date Évaluation</label>
                      <p className="text-gray-900 font-semibold text-sm">
                        {new Date(selectedUser.assessment.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                  {selectedUser.assessment?.updatedAt && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Dernière Mise à Jour Évaluation</label>
                      <p className="text-gray-900 font-semibold text-sm">
                        {new Date(selectedUser.assessment.updatedAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment Data */}
              {(selectedUser.assessment && Object.keys(selectedUser.assessment).length > 0 || isEditingUser) && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Données d'Évaluation Complètes
                  </h4>
                  
                  {/* Assessment Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <label className="text-xs font-medium text-blue-700">ID Évaluation</label>
                      <p className="text-blue-900 font-mono text-xs break-all">{selectedUser.assessment?._id || '-'}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <label className="text-xs font-medium text-green-700">Statut Enregistrement</label>
                      <p className="text-green-900 font-semibold">✓ Enregistré</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Nom Complet</label>
                      {isEditingUser ? (
                        <input
                          type="text"
                          value={editingUserData?.assessment?.fullName || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, fullName: e.target.value }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.fullName || '-'}</p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Date de Naissance</label>
                      {isEditingUser ? (
                        <input
                          type="date"
                          value={editingUserData?.assessment?.dateOfBirth || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, dateOfBirth: e.target.value }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.dateOfBirth || '-'}</p>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Sexe</label>
                      {isEditingUser ? (
                        <select
                          value={editingUserData?.assessment?.gender || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, gender: e.target.value }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Homme">Homme</option>
                          <option value="Femme">Femme</option>
                          <option value="Autre">Autre</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.gender || '-'}</p>
                      )}
                    </div>

                    {/* Region */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Région</label>
                      {isEditingUser ? (
                        <input
                          type="text"
                          value={editingUserData?.assessment?.region || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, region: e.target.value }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.region || '-'}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Téléphone</label>
                      {isEditingUser ? (
                        <input
                          type="tel"
                          value={editingUserData?.assessment?.phoneNumber || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, phoneNumber: e.target.value }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.phoneNumber || '-'}</p>
                      )}
                    </div>

                    {/* Height */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Taille (cm)</label>
                      {isEditingUser ? (
                        <input
                          type="number"
                          value={editingUserData?.assessment?.height || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, height: e.target.value }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.height || '-'}</p>
                      )}
                    </div>

                    {/* Weight */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Poids (kg)</label>
                      {isEditingUser ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editingUserData?.assessment?.weight || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, weight: e.target.value }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.weight || '-'}</p>
                      )}
                    </div>

                    {/* Physical Activity Level */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Activité Physique</label>
                      {isEditingUser ? (
                        <select
                          value={editingUserData?.assessment?.physicalActivityLevel || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, physicalActivityLevel: e.target.value }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Sélectionnez</option>
                          <option value="sedentary">Sédentaire</option>
                          <option value="moderate">Modéré</option>
                          <option value="active">Actif</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.physicalActivityLevel || '-'}</p>
                      )}
                    </div>

                    {/* Smoking */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Tabagisme</label>
                      {isEditingUser ? (
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="smoking"
                              value="yes"
                              checked={editingUserData?.assessment?.smoking === 'yes'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), smoking: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">Oui</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="smoking"
                              value="no"
                              checked={editingUserData?.assessment?.smoking === 'no'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), smoking: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">Non</span>
                          </label>
                        </div>
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.smoking || '-'}</p>
                      )}
                    </div>

                    {/* Alcohol Consumption */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Consommation Alcool</label>
                      {isEditingUser ? (
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="alcoholConsumption"
                              value="yes"
                              checked={editingUserData?.assessment?.alcoholConsumption === 'yes'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), alcoholConsumption: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">Oui</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="alcoholConsumption"
                              value="no"
                              checked={editingUserData?.assessment?.alcoholConsumption === 'no'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), alcoholConsumption: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">Non</span>
                          </label>
                        </div>
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.alcoholConsumption || '-'}</p>
                      )}
                    </div>

                    {/* Sleep Hours */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Heures Sommeil</label>
                      {isEditingUser ? (
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="sleepHours"
                              value="less_than_6"
                              checked={editingUserData?.assessment?.sleepHours === 'less_than_6'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), sleepHours: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">&lt;6h</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="sleepHours"
                              value="6_to_8"
                              checked={editingUserData?.assessment?.sleepHours === '6_to_8'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), sleepHours: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">6-8h</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="sleepHours"
                              value="more_than_8"
                              checked={editingUserData?.assessment?.sleepHours === 'more_than_8'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), sleepHours: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">&gt;8h</span>
                          </label>
                        </div>
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.sleepHours || '-'}</p>
                      )}
                    </div>

                    {/* Meals Per Day */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Repas/Jour</label>
                      {isEditingUser ? (
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="mealsPerDay"
                              value="1"
                              checked={editingUserData?.assessment?.mealsPerDay === '1'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), mealsPerDay: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">1</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="mealsPerDay"
                              value="2"
                              checked={editingUserData?.assessment?.mealsPerDay === '2'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), mealsPerDay: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">2</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="mealsPerDay"
                              value="3"
                              checked={editingUserData?.assessment?.mealsPerDay === '3'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), mealsPerDay: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">3</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="mealsPerDay"
                              value="more_than_3"
                              checked={editingUserData?.assessment?.mealsPerDay === 'more_than_3'}
                              onChange={(e) => setEditingUserData({
                                ...editingUserData,
                                assessment: { ...(editingUserData?.assessment || {}), mealsPerDay: e.target.value }
                              })}
                              className="w-4 h-4"
                            />
                            <span className="ml-2 text-sm text-gray-700">&gt;3</span>
                          </label>
                        </div>
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.mealsPerDay || '-'}</p>
                      )}
                    </div>

                    {/* Medical Treatment */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Traitement Médical</label>
                      {isEditingUser ? (
                        <textarea
                          value={editingUserData?.assessment?.medicalTreatment || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, medicalTreatment: e.target.value }
                          })}
                          rows={2}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.medicalTreatment || '-'}</p>
                      )}
                    </div>

                    {/* Main Objective */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Objectif Principal</label>
                      {isEditingUser ? (
                        <textarea
                          value={editingUserData?.assessment?.mainObjective || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, mainObjective: e.target.value }
                          })}
                          rows={2}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.mainObjective || '-'}</p>
                      )}
                    </div>

                    {/* Other Objective */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Autre Objectif</label>
                      {isEditingUser ? (
                        <textarea
                          value={editingUserData?.assessment?.otherObjective || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, otherObjective: e.target.value }
                          })}
                          rows={2}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.otherObjective || '-'}</p>
                      )}
                    </div>

                    {/* Chronic Diseases */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Maladies Chroniques</label>
                      {isEditingUser ? (
                        <input
                          type="text"
                          placeholder="Séparées par des virgules"
                          value={editingUserData?.assessment?.chronicDiseases?.join(', ') || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, chronicDiseases: e.target.value.split(',').map(d => d.trim()).filter(d => d) }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedUser.assessment?.chronicDiseases?.length ? (
                            selectedUser.assessment.chronicDiseases.map((disease: string, idx: number) => (
                              <span key={idx} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {disease}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-900">-</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Allergies/Intolerances */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Allergies/Intolérances</label>
                      {isEditingUser ? (
                        <input
                          type="text"
                          placeholder="Séparées par des virgules"
                          value={editingUserData?.assessment?.allergiesIntolerances?.join(', ') || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, allergiesIntolerances: e.target.value.split(',').map(a => a.trim()).filter(a => a) }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedUser.assessment?.allergiesIntolerances?.length ? (
                            selectedUser.assessment.allergiesIntolerances.map((allergy: string, idx: number) => (
                              <span key={idx} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                {allergy}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-900">-</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Other Allergies */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Autres Allergies</label>
                      {isEditingUser ? (
                        <textarea
                          value={editingUserData?.assessment?.otherAllergies || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            assessment: { ...editingUserData?.assessment, otherAllergies: e.target.value }
                          })}
                          rows={2}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.assessment?.otherAllergies || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Data */}
              {((selectedUser.profile && Object.keys(selectedUser.profile).length > 0) || isEditingUser) && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Profil Utilisateur
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Age */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Âge</label>
                      {isEditingUser ? (
                        <input
                          type="number"
                          value={editingUserData?.profile?.age || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            profile: { ...(editingUserData?.profile || {}), age: e.target.value ? parseInt(e.target.value) : null }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.profile?.age || '-'}</p>
                      )}
                    </div>

                    {/* Gender (Profile) */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Sexe</label>
                      {isEditingUser ? (
                        <select
                          value={editingUserData?.profile?.gender || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            profile: { ...(editingUserData?.profile || {}), gender: e.target.value }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Homme">Homme</option>
                          <option value="Femme">Femme</option>
                          <option value="Autre">Autre</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{selectedUser.profile?.gender || '-'}</p>
                      )}
                    </div>

                    {/* Lifestyle */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Mode de Vie</label>
                      {isEditingUser ? (
                        <select
                          value={editingUserData?.profile?.lifestyle || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            profile: { ...(editingUserData?.profile || {}), lifestyle: e.target.value }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Sélectionner</option>
                          <option value="sedentary">Sédentaire</option>
                          <option value="moderate">Modéré</option>
                          <option value="active">Actif</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{selectedUser.profile?.lifestyle || '-'}</p>
                      )}
                    </div>

                    {/* Habits */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Habitudes</label>
                      {isEditingUser ? (
                        <input
                          type="text"
                          placeholder="Séparées par des virgules"
                          value={editingUserData?.profile?.habits?.join(', ') || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            profile: { ...(editingUserData?.profile || {}), habits: e.target.value.split(',').map(h => h.trim()).filter(h => h) }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedUser.profile?.habits?.length ? (
                            selectedUser.profile.habits.map((habit: string, idx: number) => (
                              <span key={idx} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {habit}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-900">-</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Diseases */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Maladies Chroniques</label>
                      {isEditingUser ? (
                        <div className="space-y-2 mt-2">
                          {['Diabète', 'Obésité', 'Hypertension Artérielle', 'Troubles Digestifs', 'Dyslipidémie'].map((disease: string) => (
                            <label key={disease} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(editingUserData?.profile?.diseases || []).includes(disease)}
                                onChange={(e) => {
                                  const diseases = editingUserData?.profile?.diseases || [];
                                  if (e.target.checked) {
                                    setEditingUserData({
                                      ...editingUserData,
                                      profile: { ...(editingUserData?.profile || {}), diseases: [...diseases, disease] }
                                    });
                                  } else {
                                    setEditingUserData({
                                      ...editingUserData,
                                      profile: { ...(editingUserData?.profile || {}), diseases: diseases.filter((d: string) => d !== disease) }
                                    });
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className="ml-2 text-sm text-gray-700">{disease}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedUser.profile?.diseases?.length ? (
                            selectedUser.profile.diseases.map((disease: string, idx: number) => (
                              <span key={idx} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                {disease}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-900">-</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dietary Preferences */}
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <label className="text-xs font-medium text-gray-700">Préférences Alimentaires</label>
                      {isEditingUser ? (
                        <input
                          type="text"
                          placeholder="Séparées par des virgules"
                          value={editingUserData?.profile?.dietaryPreferences?.join(', ') || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            profile: { ...(editingUserData?.profile || {}), dietaryPreferences: e.target.value.split(',').map(p => p.trim()).filter(p => p) }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedUser.profile?.dietaryPreferences?.length ? (
                            selectedUser.profile.dietaryPreferences.map((pref: string, idx: number) => (
                              <span key={idx} className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                {pref}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-900">-</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Calorie Goal */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Calories</label>
                      {isEditingUser ? (
                        <input
                          type="number"
                          value={editingUserData?.profile?.calorieGoal || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            profile: { ...(editingUserData?.profile || {}), calorieGoal: e.target.value ? parseInt(e.target.value) : null }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.profile?.calorieGoal ? `${selectedUser.profile.calorieGoal} kcal` : '-'}</p>
                      )}
                    </div>

                    {/* Protein Goal */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Protéines (g)</label>
                      {isEditingUser ? (
                        <input
                          type="number"
                          value={editingUserData?.profile?.proteinGoal || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            profile: { ...(editingUserData?.profile || {}), proteinGoal: e.target.value ? parseInt(e.target.value) : null }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.profile?.proteinGoal || '-'}</p>
                      )}
                    </div>

                    {/* Carbs Goal */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Glucides (g)</label>
                      {isEditingUser ? (
                        <input
                          type="number"
                          value={editingUserData?.profile?.carbGoal || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            profile: { ...(editingUserData?.profile || {}), carbGoal: e.target.value ? parseInt(e.target.value) : null }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.profile?.carbGoal || '-'}</p>
                      )}
                    </div>

                    {/* Fat Goal */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Lipides (g)</label>
                      {isEditingUser ? (
                        <input
                          type="number"
                          value={editingUserData?.profile?.fatGoal || ''}
                          onChange={(e) => setEditingUserData({
                            ...editingUserData,
                            profile: { ...(editingUserData?.profile || {}), fatGoal: e.target.value ? parseInt(e.target.value) : null }
                          })}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedUser.profile?.fatGoal || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment Metadata Section */}
              {selectedUser.assessment && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Métadonnées d'Évaluation
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Nom Complet (Évaluation)</label>
                      <p className="text-gray-900 font-semibold">{selectedUser.assessment.fullName || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">E-mail (Évaluation)</label>
                      <p className="text-gray-900 font-semibold break-all">{selectedUser.assessment.userEmail || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">ID Utilisateur (Évaluation)</label>
                      <p className="text-gray-900 font-mono text-xs break-all">{selectedUser.assessment.userId || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Nom Utilisateur (Évaluation)</label>
                      <p className="text-gray-900 font-semibold">{selectedUser.assessment.userName || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Date de Création Évaluation</label>
                      <p className="text-gray-900 font-semibold text-xs">
                        {selectedUser.assessment.createdAt 
                          ? new Date(selectedUser.assessment.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-700">Date Dernière Mise à Jour</label>
                      <p className="text-gray-900 font-semibold text-xs">
                        {selectedUser.assessment.updatedAt 
                          ? new Date(selectedUser.assessment.updatedAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Actions Footer - Sticky */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 flex-shrink-0 bg-white">
              {isEditingUser ? (
                <>
                  <button
                    onClick={cancelEditingUser}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveUserChanges}
                    disabled={isSavingUser}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                  >
                    {isSavingUser ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={startEditingUser}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteUser(selectedUser._id);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {showContentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] sm:max-h-[calc(100vh-2rem)] flex flex-col my-4 sm:my-0">
            <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {isEditingContent ? 'Modifier Contenu' : 'Ajouter Contenu'}
              </h3>
              <button
                onClick={closeContentModal}
                className="text-gray-500 hover:text-gray-700 text-2xl ml-4 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="p-3 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  placeholder="Titre du contenu"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={newContent.type}
                    onChange={(e) => setNewContent({ ...newContent, type: e.target.value as any })}
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="video">Vidéo</option>
                    <option value="post">Article</option>
                    <option value="infographic">Infographie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={newContent.category}
                    onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="nutrition-basics">Bases de la Nutrition</option>
                    <option value="meal-planning">Planification des Repas</option>
                    <option value="weight-management">Gestion du Poids</option>
                    <option value="healthy-eating">Alimentation Saine</option>
                    <option value="fitness">Fitness</option>
                    <option value="mindfulness">Pleine Conscience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  placeholder="Description du contenu"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL du Média (Vidéo) *</label>
                <div className="space-y-3">
                  <FileUpload
                    onSuccess={(url) => {
                      setNewContent({ ...newContent, mediaUrl: url });
                    }}
                    onError={(error) => alert(`Erreur d'upload: ${error}`)}
                    type="video"
                    maxSize={100}
                    buttonText="Télécharger Vidéo"
                  />
                  {newContent.mediaUrl && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">Vidéo uploadée: {newContent.mediaUrl.substring(0, 50)}...</p>
                    </div>
                  )}
                  <input
                    type="url"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={newContent.mediaUrl}
                    onChange={(e) => setNewContent({ ...newContent, mediaUrl: e.target.value })}
                    placeholder="Ou collez une URL vidéo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu Détaillé *</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2 outline-none"
                  value={newContent.content}
                  onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                  placeholder="Entrez le contenu détaillé de votre post..."
                  rows={6}
                />
                <p className="text-gray-500 text-xs mt-2">💡 Vous pouvez formater votre texte librement. Pour ajouter des images, utilisez le bouton ci-dessous ou insérez directement des URLs en markdown.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Insérer une Image</label>
                <FileUpload
                  onSuccess={(url) => {
                    const imageMarkdown = `![image](${url})`;
                    setNewContent({ 
                      ...newContent, 
                      content: newContent.content ? newContent.content + '\n\n' + imageMarkdown : imageMarkdown
                    });
                    setContentImageError('');
                  }}
                  onError={(error) => setContentImageError(error)}
                  type="image"
                  maxSize={50}
                  buttonText="📤 Télécharger Image"
                />
                {contentImageError && (
                  <p className="text-red-500 text-sm mt-2">{contentImageError}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeContentModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddContent}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                {isEditingContent ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
