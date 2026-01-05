'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-gray-900 bg-opacity-90 backdrop-blur-md sticky top-0 z-50 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">NutriEd</h1>
            <div className="flex gap-4">
              {status === 'unauthenticated' && (
                <>
                  <Link
                    href="/auth/login"
                    className="text-white hover:text-gray-200 font-semibold"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Démarrer
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Votre Parcours vers une Meilleure <span className="text-yellow-200">Nutrition</span> Commence Ici
        </h2>
        <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
          Education nutritionnelle personnalisee adaptee a votre mode de vie, vos objectifs et vos preferences. 
          Obtenez des conseils d'experts, des plans de repas et un suivi de la progression, tout en un seul endroit.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105"
          >
            Essai Gratuit
          </Link>
          <Link
            href="/auth/login"
            className="border-2 border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white px-8 py-4 rounded-lg font-bold text-lg transition"
          >
            Connexion
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Pourquoi Choisir NutriEd?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-8 text-white transition border border-gray-700">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-xl font-bold mb-3">Plans Personnalises</h4>
            <p className="text-gray-300">
              Obtenez des plans nutritionnels adaptes a votre age, votre mode de vie, vos objectifs et vos preferences alimentaires.
            </p>
          </div>

          <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-8 text-white transition border border-gray-700">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-xl font-bold mb-3">Suivre la Progression</h4>
            <p className="text-gray-300">
              Surveillez votre consommation nutritionnelle, votre perte de poids et vos metriques de sante avec des analyses detaillees.
            </p>
          </div>

          <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-8 text-white transition border border-gray-700">
            <div className="text-4xl mb-4">📚</div>
            <h4 className="text-xl font-bold mb-3">Contenu Expert</h4>
            <p className="text-gray-300">
              Apprenez des nutritionnistes et des experts en sante par le biais de videos, d'articles et d'infographies.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gray-800 border-t border-gray-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-400">10K+</div>
              <p className="text-gray-300">Utilisateurs Actifs</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-400">500+</div>
              <p className="text-gray-300">Plans de Repas</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-400">95%</div>
              <p className="text-gray-300">Taux de Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h3 className="text-3xl font-bold text-white mb-6">Pret a Transformer votre Nutrition?</h3>
        <p className="text-xl text-white mb-8">
          Rejoignez des milliers de personnes qui ont ameliore leur sante avec NutriEd
        </p>
        <Link
          href="/auth/register"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105"
        >
          Commencez Maintenant - C'est Gratuit
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center border-t border-gray-700">
        <p>&copy; 2026 NutriÉd. Tous droits réservés. | Construit avec Next.js, MongoDB & IA</p>
      </footer>
    </div>
  );
}
