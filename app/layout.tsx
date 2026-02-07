import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-provider";
import { BrandingProvider } from "@/lib/branding-provider";
import { LanguageProvider } from "@/lib/language-provider";
import { NotificationProvider } from "@/lib/notification-context";
import { NotificationContainer } from "@/components/NotificationContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutriÉd - Éducation Nutritionnelle Personnalisée",
  description: "Une plateforme SaaS prête pour la production pour l'éducation nutritionnelle personnalisée et la planification des repas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <AuthProvider>
            <BrandingProvider>
              <NotificationProvider>
                <NotificationContainer />
                {children}
              </NotificationProvider>
            </BrandingProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
