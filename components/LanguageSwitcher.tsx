'use client';

import { useLanguage } from '@/lib/language-provider';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('fr')}
        disabled={language === 'fr'}
        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
          language === 'fr'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        } ${language === 'fr' ? 'opacity-100 cursor-not-allowed' : ''}`}
      >
        Français
      </button>
      <button
        onClick={() => setLanguage('ar')}
        disabled={language === 'ar'}
        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
          language === 'ar'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        } ${language === 'ar' ? 'opacity-100 cursor-not-allowed' : ''}`}
      >
        العربية
      </button>
    </div>
  );
}
