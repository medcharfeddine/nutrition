'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function ResourcesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<any[]>([]);
  const [filteredContents, setFilteredContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
  const [likeCount, setLikeCount] = useState<{ [key: string]: number }>({});
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchContents();
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

  const toggleLike = (contentId: string) => {
    setLikes(prev => ({
      ...prev,
      [contentId]: !prev[contentId]
    }));
    setLikeCount(prev => ({
      ...prev,
      [contentId]: (prev[contentId] || 0) + (likes[contentId] ? -1 : 1)
    }));
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
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
                {branding?.logoUrl ? (
                  <Image 
                    src={branding.logoUrl} 
                    alt={branding.siteName || 'NutriEd'} 
                    width={40}
                    height={40}
                    className="h-10 w-auto"
                    priority
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-indigo-600">NutriEd</h1>
                )}
              </Link>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Ressources Éducatives</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Découvrez des conseils nutritionnels d'experts, des guides de planification des repas et des informations sur la santé pour atteindre vos objectifs
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* If a post is selected, show detail view */}
        {selectedPost ? (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Retour aux ressources
            </button>

            {/* Post Detail View */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Post Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    NE
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">NutriEd</p>
                    <p className="text-gray-500 text-sm">{selectedPost.category}</p>
                  </div>
                  <span className="ml-auto px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-full text-sm">
                    {selectedPost.type === 'video' && '📹 Vidéo'}
                    {selectedPost.type === 'post' && '📝 Article'}
                    {selectedPost.type === 'infographic' && '📊 Infographie'}
                  </span>
                </div>
              </div>

              {/* Media Display */}
              <div className="w-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
                {selectedPost.mediaUrl ? (
                  <>
                    {selectedPost.type === 'video' ? (
                      <video 
                        src={selectedPost.mediaUrl}
                        controls
                        className="w-full h-auto"
                      />
                    ) : (
                      <img 
                        src={selectedPost.mediaUrl}
                        alt={selectedPost.title}
                        className="w-full h-auto"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-6xl">
                    {selectedPost.type === 'video' && '📹'}
                    {selectedPost.type === 'post' && '📝'}
                    {selectedPost.type === 'infographic' && '📊'}
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="p-8">
                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-6">{selectedPost.title}</h1>

                {/* Engagement Stats */}
                <div className="flex gap-8 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">❤️</span>
                    <div>
                      <p className="text-sm text-gray-500">J'aime</p>
                      <p className="font-bold text-gray-900 text-xl">{likeCount[selectedPost._id] || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">À propos</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">{selectedPost.description}</p>
                </div>

                {/* Full Content */}
                {selectedPost.content && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contenu</h2>
                    <div className="bg-gray-50 rounded-lg p-6 text-gray-700 leading-relaxed">
                      {selectedPost.content.split('\n').map((line: string, idx: number) => {
                        // Check if line is an image markdown
                        if (line.includes('![')) {
                          const urlMatch = line.match(/!\[.*?\]\((.*?)\)/);
                          if (urlMatch) {
                            return (
                              <img 
                                key={idx}
                                src={urlMatch[1]} 
                                alt="Post content"
                                className="w-full rounded-lg my-6"
                              />
                            );
                          }
                        }
                        // Regular text
                        return line.trim() && (
                          <p key={idx} className="mb-4 text-base">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-3">
                      {selectedPost.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement Buttons */}
                <div className="border-t border-gray-200 pt-8 flex gap-4">
                  <button 
                    onClick={() => toggleLike(selectedPost._id)}
                    className="flex-1 flex items-center justify-center gap-3 py-3 rounded-lg transition font-semibold text-lg"
                    style={{
                      backgroundColor: likes[selectedPost._id] ? '#ffe0e6' : '#f3f4f6',
                      color: likes[selectedPost._id] ? '#dc2626' : '#6b7280'
                    }}
                  >
                    <span className="text-2xl">{likes[selectedPost._id] ? '❤️' : '🤍'}</span>
                    {likes[selectedPost._id] ? 'Aimé' : 'J\'aime'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des ressources..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filtrer par Catégorie
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
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">Aucune ressource trouvée. Essayez d'ajuster vos filtres.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                <span className="font-bold text-indigo-600">{filteredContents.length}</span> ressource{filteredContents.length !== 1 ? 's' : ''} trouvée{filteredContents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {filteredContents.map((content) => (
                <div
                  key={content._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {content.type === 'video' ? '📹' : content.type === 'post' ? '📝' : '📊'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">NutriEd</p>
                        <p className="text-gray-500 text-xs">{content.category?.replace(/-/g, ' ').charAt(0).toUpperCase() + content.category?.replace(/-/g, ' ').slice(1)}</p>
                      </div>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {content.type === 'video' ? 'Vidéo' : content.type === 'post' ? 'Article' : 'Infographie'}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div>
                    {/* Media/Image */}
                    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-72 flex items-center justify-center relative overflow-hidden">
                      {content.mediaUrl ? (
                        content.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900 relative group">
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center">
                              <div className="text-white text-7xl">▶️</div>
                            </div>
                          </div>
                        ) : (
                          <img src={content.mediaUrl} alt={content.title} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="text-white text-center">
                          <div className="text-6xl mb-2">
                            {content.type === 'video' && '📹'}
                            {content.type === 'post' && '📝'}
                            {content.type === 'infographic' && '📊'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Caption */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{content.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {content.description}
                      </p>

                      {content.tags && content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {content.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="text-indigo-600 text-sm"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Engagement Buttons */}
                    <div className="px-4 py-3 border-t border-gray-100">
                      <div className="flex gap-4 mb-3">
                        <button 
                          onClick={() => toggleLike(content._id)}
                          className="flex items-center gap-2 transition group"
                        >
                          <span className={`group-hover:scale-125 transition ${likes[content._id] ? 'text-red-600' : 'text-gray-500'}`}>
                            {likes[content._id] ? '❤️' : '🤍'}
                          </span>
                          <span className={`text-sm ${likes[content._id] ? 'text-red-600' : 'text-gray-500'}`}>
                            {likeCount[content._id] || 0}
                          </span>
                        </button>
                        <button 
                          onClick={() => setSelectedPost(content)}
                          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition group ml-auto"
                        >
                          <span className="group-hover:scale-125 transition">👁️</span>
                          <span className="text-sm">Voir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
          </>
        )}
      </main>
    </div>
  );
}
