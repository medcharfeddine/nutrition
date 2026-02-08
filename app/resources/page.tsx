'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ResourcesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [contents, setContents] = useState<any[]>([]);
  const [filteredContents, setFilteredContents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
  const [likeCount, setLikeCount] = useState<{ [key: string]: number }>({});
  const [branding, setBranding] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchContents();
      fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        // Format categories for filter display
        const formattedCategories = [
          { value: 'all', label: t('resources.allResources') },
          ...data.categories.map((cat: any) => ({
            value: cat.slug,
            label: cat.name,
          })),
        ];
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to default categories if fetch fails
      const defaultCategories = [
        { value: 'all', label: t('resources.allResources') },
        { value: 'nutrition-basics', label: 'Bases de la Nutrition' },
        { value: 'meal-planning', label: 'Planification des Repas' },
        { value: 'weight-management', label: 'Gestion du Poids' },
        { value: 'healthy-eating', label: 'Alimentation Saine' },
        { value: 'fitness', label: 'Forme Physique' },
        { value: 'mindfulness', label: 'Pleine Conscience' },
      ];
      setCategories(defaultCategories);
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
          <p className="mt-4 text-gray-600">{t('common.loadingResources')}</p>
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
            <div className="flex items-center gap-2 sm:gap-3 md:gap-6 lg:gap-8">
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0">
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
              <div className="hidden md:flex gap-2 lg:gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
                >
                  Tableau de Bord
                </Link>
                <Link
                  href="/resources"
                  className="text-indigo-600 font-medium border-b-2 border-indigo-600 text-sm md:text-base"
                >
                  Ressources
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
                >
                  Profil
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
              <LanguageSwitcher />
              {/* Mobile Search Icon */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden text-gray-600 hover:text-indigo-600 text-lg"
                title="Rechercher"
              >
                🔍
              </button>
              
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">{session.user?.name}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium"
              >
                {t('common.logout')}
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-600 hover:text-indigo-600 text-lg"
                title="Menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-3 px-2 space-y-2">
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                📊 Tableau de Bord
              </Link>
              <Link
                href="/resources"
                className="block px-3 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                📚 Ressources
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                👤 Profil
              </Link>
              <Link
                href="/consultation-request"
                className="block px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                💬 Consultation
              </Link>
              <Link
                href="/appointments"
                className="block px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                📅 Rendez-vous
              </Link>
            </div>
          )}

          {/* Mobile Search Bar */}
          {mobileSearchOpen && (
            <div className="md:hidden border-t border-gray-200 py-3 px-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">{t('resources.resourcesHeader')}</h1>
          <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl">
            Découvrez des conseils nutritionnels d'experts, des guides de planification des repas et des informations sur la santé pour atteindre vos objectifs
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        {/* If a post is selected, show detail view */}
        {selectedPost ? (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← {t('resources.back')}
            </button>

            {/* Post Detail View */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Post Header */}
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    NE
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-lg">NutriEd</p>
                    <p className="text-gray-500 text-xs sm:text-sm">{selectedPost.category}</p>
                  </div>
                  <span className="ml-auto sm:ml-auto px-3 sm:px-4 py-1 sm:py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-full text-xs sm:text-sm">
                    {selectedPost.type === 'video' && '📹 Vidéo'}
                    {selectedPost.type === 'post' && '📝 Article'}
                    {selectedPost.type === 'infographic' && '📊 Infographie'}
                  </span>
                </div>
              </div>

              {/* Media Display */}
              <div className="w-full bg-gray-200 flex items-center justify-center relative overflow-hidden py-8">
                <div className="max-w-md w-full px-4">
                  {selectedPost.mediaUrl ? (
                    <>
                      {selectedPost.type === 'video' ? (
                        <video 
                          src={selectedPost.mediaUrl}
                          controls
                          className="w-full h-auto rounded-lg"
                        />
                      ) : (
                        <img 
                          src={selectedPost.mediaUrl}
                          alt={selectedPost.title}
                          className="w-full h-auto rounded-lg"
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
              </div>

              {/* Post Content */}
              <div className="p-4 sm:p-6 md:p-8">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{selectedPost.title}</h1>

                {/* Engagement Stats */}
                <div className="flex gap-4 sm:gap-8 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">❤️</span>
                    <div>
                      <p className="text-sm text-gray-500">J'aime</p>
                      <p className="font-bold text-gray-900 text-xl">{likeCount[selectedPost._id] || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">À propos</h2>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{selectedPost.description}</p>
                </div>

                {/* Full Content */}
                {selectedPost.content && (
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Contenu</h2>
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-gray-700 leading-relaxed text-sm sm:text-base">
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
                <div className="border-t border-gray-200 pt-6 sm:pt-8 flex gap-3 sm:gap-4">
                  <button 
                    onClick={() => toggleLike(selectedPost._id)}
                    className="flex-1 flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 rounded-lg transition font-semibold text-sm sm:text-lg"
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
              placeholder={t('resources.searchPlaceholder')}
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
            <p className="text-gray-600 text-lg">{t('resources.notFound')}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                <span className="font-bold text-indigo-600">{filteredContents.length}</span> ressource{filteredContents.length !== 1 ? 's' : ''} trouvée{filteredContents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
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
                  <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-48 sm:h-56 md:h-72 flex items-center justify-center relative overflow-hidden">
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
                    <div className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">{content.title}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-3">
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
