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
  const { t, language } = useLanguage();
  const [contents, setContents] = useState<any[]>([]);
  const [filteredContents, setFilteredContents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
  const [likeCount, setLikeCount] = useState<{ [key: string]: number }>({});
  const [branding, setBranding] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchContents();
      fetchCategories();
      fetchBranding();
    }
  }, [status, router, language]);

  const fetchBranding = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch('/api/admin/branding', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setBranding(data.branding);
      }
    } catch (error) {
      // Silently fail - don't spam console
    }
  };

  // Helper function to convert category slug to translation key
  const getCategoryLabel = (slug: string): string => {
    const categoryTranslationMap: { [key: string]: string } = {
      'nutrition-basics': 'categories.nutritionBasics',
      'meal-planning': 'categories.mealPlanning',
      'weight-management': 'categories.weightManagement',
      'healthy-eating': 'categories.healthyEating',
      'fitness': 'categories.fitness',
      'mindfulness': 'categories.mindfulness',
    };
    
    const translationKey = categoryTranslationMap[slug];
    return translationKey ? t(translationKey) : slug;
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        // Format categories for filter display - use the appropriate language name
        const formattedCategories = [
          { value: 'all', label: t('resources.allResources') },
          ...data.categories.map((cat: any) => ({
            value: cat.slug,
            label: language === 'ar' ? (cat.nameAr || cat.name) : cat.name,
          })),
        ];
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to default categories if fetch fails
      const defaultCategories = [
        { value: 'all', label: t('resources.allResources') },
        { value: 'nutrition-basics', label: t('categories.nutritionBasics') },
        { value: 'meal-planning', label: t('categories.mealPlanning') },
        { value: 'weight-management', label: t('categories.weightManagement') },
        { value: 'healthy-eating', label: t('categories.healthyEating') },
        { value: 'fitness', label: t('categories.fitness') },
        { value: 'mindfulness', label: t('categories.mindfulness') },
      ];
      setCategories(defaultCategories);
    }
  };

  const fetchContents = async () => {
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const data = await res.json();
        // Rename populated category to categoryData for consistent rendering
        const contentsWithCategoryData = data.contents.map((c: any) => ({
          ...c,
          categoryData: typeof c.category === 'object' ? c.category : null,
        }));
        setContents(contentsWithCategoryData);
        setFilteredContents(contentsWithCategoryData);
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
      // Filter by category slug, handling both object and string formats
      filtered = filtered.filter((c) => {
        if (typeof c.category === 'object' && c.category?.slug) {
          return c.category.slug === selectedCategory;
        }
        return c.category === selectedCategory;
      });
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
            {/* Logo */}
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
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">{t('common.appName')}</h1>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-4 md:gap-6">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
              >
                {t('common.dashboard')}
              </Link>
              <Link
                href="/messages"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
              >
                {t('common.messages')}
              </Link>
              <Link
                href="/consultation-request"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
              >
                {t('common.consultation')}
              </Link>
              <Link
                href="/appointments"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
              >
                {t('common.appointments')}
              </Link>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm md:text-base"
              >
                {t('common.profile')}
              </Link>
              <Link
                href="/resources"
                className="text-indigo-600 font-medium text-sm md:text-base border-b-2 border-indigo-600"
              >
                {t('common.resources')}
              </Link>
            </div>

            {/* Mobile & Desktop Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
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
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium text-sm"
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
              <Link
                href="/resources"
                className="block px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium text-sm bg-indigo-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.resources')}
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
            {t('resources.heroDescription')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('resources.searchLabel')}
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
              {t('resources.filterByCategory')}
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
                <span className="font-bold text-indigo-600">{filteredContents.length}</span> {filteredContents.length !== 1 ? t('resources.resourcesFoundPlural') : t('resources.resourcesFound')}
              </p>
            </div>

            {/* Direct Content Display - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContents.map((content) => (
                <div
                  key={content._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                  onClick={() => {
                    setSelectedContent(content);
                    setIsModalOpen(true);
                  }}
                >
                  {/* Media Display */}
                  {content.mediaUrl ? (
                    <div className="relative w-full aspect-square bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden flex items-center justify-center">
                      {content.type === 'video' ? (
                        <video 
                          src={content.mediaUrl}
                          controls
                          preload="metadata"
                          crossOrigin="anonymous"
                          playsInline
                          className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img 
                          src={content.mediaUrl}
                          alt={content.title}
                          className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%234f46e5" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" dy=".3em" fill="white" font-size="80"%3E📸%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <div className="text-white text-6xl">
                        {content.type === 'video' && '📹'}
                        {content.type === 'post' && '📝'}
                        {content.type === 'infographic' && '📊'}
                      </div>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Header with Badge */}
                    <div className="flex items-start gap-3 mb-3">
                      <span className="inline-flex px-3 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded-full text-xs whitespace-nowrap">
                        {content.type === 'video' && '📹'}
                        {content.type === 'post' && '📝'}
                        {content.type === 'infographic' && '📊'}
                      </span>
                      <span className="inline-flex px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs whitespace-nowrap">
                        {content.categoryData ? (language === 'ar' ? (content.categoryData.nameAr || content.categoryData.name) : content.categoryData.name) : (typeof content.category === 'object' ? (language === 'ar' ? (content.category.nameAr || content.category.name) : content.category.name) : getCategoryLabel(content.category))}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {content.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {content.description}
                    </p>

                    {/* Tags */}
                    {content.tags && content.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {content.tags.slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-indigo-600 text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                        {content.tags.length > 2 && (
                          <span className="text-gray-500 text-xs font-medium">+{content.tags.length - 2}</span>
                        )}
                      </div>
                    )}

                    {/* Footer with Like Button */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(content._id);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 hover:bg-red-50"
                      >
                        <span className="text-xl">{likes[content._id] ? '❤️' : '🤍'}</span>
                        <span className={`text-sm font-semibold ${likes[content._id] ? 'text-red-600' : 'text-gray-600'}`}>
                          {likeCount[content._id] || 0}
                        </span>
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContent(content);
                          setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Voir plus →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && selectedContent && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => {
            setIsModalOpen(false);
            setSelectedContent(null);
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 flex justify-between items-center p-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedContent.title}</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedContent(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Media Display */}
              {selectedContent.mediaUrl && (
                <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg overflow-hidden flex items-center justify-center h-96">
                  {selectedContent.type === 'video' ? (
                    <video 
                      src={selectedContent.mediaUrl}
                      controls
                      preload="metadata"
                      crossOrigin="anonymous"
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img 
                      src={selectedContent.mediaUrl}
                      alt={selectedContent.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%234f46e5" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" dy=".3em" fill="white" font-size="80"%3E📸%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  )}
                </div>
              )}

              {/* Category and Type Badges */}
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-full text-sm">
                  {selectedContent.type === 'video' && '📹 Video'}
                  {selectedContent.type === 'post' && '📝 Article'}
                  {selectedContent.type === 'infographic' && '📊 Infographic'}
                </span>
                <span className="inline-flex px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {selectedContent.categoryData ? (language === 'ar' ? (selectedContent.categoryData.nameAr || selectedContent.categoryData.name) : selectedContent.categoryData.name) : (typeof selectedContent.category === 'object' ? (language === 'ar' ? (selectedContent.category.nameAr || selectedContent.category.name) : selectedContent.category.name) : getCategoryLabel(selectedContent.category))}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedContent.description}</p>
              </div>

              {/* Full Content */}
              {selectedContent.content && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenu</h3>
                  <div className="bg-gray-50 rounded-lg p-6 text-gray-700 leading-relaxed space-y-4 prose prose-sm max-w-none">
                    {selectedContent.content.split('\n').map((line: string, idx: number) => {
                      if (line.includes('![')) {
                        const urlMatch = line.match(/!\[.*?\]\((.*?)\)/);
                        if (urlMatch) {
                          return (
                            <img 
                              key={idx}
                              src={urlMatch[1]} 
                              alt="Content"
                              className="w-full rounded-lg my-4"
                            />
                          );
                        }
                      }
                      return line.trim() && (
                        <p key={idx}>{line}</p>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedContent.tags && selectedContent.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedContent.tags.map((tag: string) => (
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

              {/* Like Button */}
              <div className="border-t border-gray-200 pt-6">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(selectedContent._id);
                  }}
                  className="flex items-center gap-3 px-6 py-3 rounded-lg transition font-semibold text-lg"
                  style={{
                    backgroundColor: likes[selectedContent._id] ? '#ffe0e6' : '#f3f4f6',
                    color: likes[selectedContent._id] ? '#dc2626' : '#6b7280'
                  }}
                >
                  <span className="text-2xl">{likes[selectedContent._id] ? '❤️' : '🤍'}</span>
                  {likes[selectedContent._id] ? t('resources.liked') : t('resources.like')} ({likeCount[selectedContent._id] || 0})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
