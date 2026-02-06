'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status, router]);

  // Real-time message polling
  useEffect(() => {
    if (status !== 'authenticated') return;

    const pollMessages = async () => {
      try {
        const res = await fetch('/api/messages');
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    // Poll immediately
    pollMessages();

    // Set up polling interval (every 10 seconds)
    const interval = setInterval(pollMessages, 10000);

    return () => clearInterval(interval);
  }, [status]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim()) return;

    setMessageLoading(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: 'admin', // Send to admin
          content: messageContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessageContent('');
        // Optimistically add the message immediately using functional setState
        setMessages(prevMessages => [...prevMessages, data.message]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
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
            <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
              <h1 className="text-lg sm:text-2xl font-bold text-indigo-600">Messages</h1>
              <div className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Tableau de Bord
                </Link>
                <Link
                  href="/messages"
                  className="text-indigo-600 hover:text-indigo-700 font-medium border-b-2 border-indigo-600"
                >
                  Messages
                </Link>
                <Link
                  href="/consultation-request"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Consultation
                </Link>
                <Link
                  href="/appointments"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Rendez-vous
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
              <LanguageSwitcher />
              <span className="text-sm text-gray-600">{session.user?.name}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-screen max-h-96">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Conversation avec Support</h2>
            <p className="text-indigo-100 text-sm">Connectez-vous avec notre équipe d'administration</p>
          </div>

          {/* Messages Display */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-500">
                <p>{t('messages.noMessages')}</p>
              </div>
            ) : (
              messages.map((message: any, index: number) => (
                <div
                  key={index}
                  className={`flex ${
                    message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      message.senderId === session?.user?.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm font-medium text-xs mb-1">
                      {message.senderName}
                    </p>
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.senderId === session?.user?.id
                          ? 'text-indigo-200'
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-6 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                disabled={messageLoading}
              />
              <button
                type="submit"
                disabled={messageLoading || !messageContent.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                {messageLoading ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
