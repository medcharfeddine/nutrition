'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function ResourcesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<any[]>([]);
  const [filteredContents, setFilteredContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchContents();
    }
  }, [status, router]);

  const fetchContents = async () => {
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const data = await res.json();
        setContents(data.contents);
        setFilteredContents(data.contents);
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = contents;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContents(filtered);
  }, [selectedCategory, searchTerm, contents]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement des ressources...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const categories = [
    { value: 'all', label: 'Toutes les Ressources' },
    { value: 'nutrition-basics', label: 'Bases de la Nutrition' },
    { value: 'meal-planning', label: 'Planification des Repas' },
    { value: 'weight-management', label: 'Gestion du Poids' },
    { value: 'healthy-eating', label: 'Alimentation Saine' },
    { value: 'fitness', label: 'Forme Physique' },
    { value: 'mindfulness', label: 'Pleine Conscience' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-indigo-600">NutriEd</h1>
              <div className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Tableau de Bord
                </Link>
                <Link
                  href="/resources"
                  className="text-indigo-600 font-medium border-b-2 border-indigo-600"
                >
                  Ressources
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Profil
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user?.name}</span>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Ressources Educatives</h2>
          <p className="text-gray-600">
            Decouvrez des conseils nutritionnels d'experts, des guides de planification des repas et des informations sur la sante
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des ressources..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    selectedCategory === cat.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredContents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucune ressource trouvee. Essayez d'ajuster vos filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => (
              <div
                key={content._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-40 flex items-center justify-center text-white text-5xl">
                  {content.type === 'video' && '📹'}
                  {content.type === 'post' && '📝'}
                  {content.type === 'infographic' && '📊'}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">{content.title}</h3>
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
                      {content.type}
                    </span>
                  </div>

                  <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded mb-3">
                    {content.category?.replace('-', ' ').toUpperCase()}
                  </span>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {content.description}
                  </p>

                  {content.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {content.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {content.mediaUrl && (
                      <a
                        href={content.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center transition"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Trouve <span className="font-bold text-indigo-600">{filteredContents.length}</span> ressources
          </p>
        </div>
      </main>
    </div>
  );
}
