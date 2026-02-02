'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface BrandingContextType {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  loading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingContextType>({
    siteName: 'NutriÉd',
    siteDescription: 'Plateforme de nutrition personnalisée',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#A855F7',
    loading: true,
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch('/api/admin/branding');
        if (res.ok) {
          const data = await res.json();
          setBranding({
            siteName: data.branding.siteName,
            siteDescription: data.branding.siteDescription,
            logoUrl: data.branding.logoUrl || '',
            faviconUrl: data.branding.faviconUrl || '',
            primaryColor: data.branding.primaryColor || '#4F46E5',
            secondaryColor: data.branding.secondaryColor || '#A855F7',
            loading: false,
          });

          // Update favicon
          if (data.branding.faviconUrl) {
            const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (link) {
              link.href = data.branding.faviconUrl;
            }
          }

          // Update title
          if (data.branding.siteName) {
            document.title = data.branding.siteName;
          }
        }
      } catch (error) {
        console.error('Failed to fetch branding:', error);
        setBranding((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
}
