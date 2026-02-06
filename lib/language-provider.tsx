'use client';

import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import fr from '@/messages/fr.json';
import ar from '@/messages/ar.json';
import { LanguageContext } from './language-context';

type Language = 'fr' | 'ar';

const translations: Record<Language, Record<string, any>> = {
  fr,
  ar,
};

function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return the key if not found
    }
  }
  
  return typeof value === 'string' ? value : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['fr', 'ar'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
    } else {
      // Set default to French
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'fr';
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string): string => {
    return getNestedValue(translations[language], key);
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return a safe default for server-side rendering
    return {
      language: 'fr' as Language,
      setLanguage: () => {},
      t: (key: string) => getNestedValue(translations.fr, key),
    };
  }
  return context;
}
