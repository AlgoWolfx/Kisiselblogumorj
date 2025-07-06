'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Home, 
  FileText, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import '../globals.css';
import { Inter, Merriweather } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'sonner';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const merriweather = Merriweather({ 
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  display: 'swap',
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/admin/login');
        return;
      }
      
      setLoading(false);
    };

    checkAuth();
    fetchUnreadMessages();
  }, [router]);

  const fetchUnreadMessages = async () => {
    try {
      const { count, error } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);
      
      if (error) {
        console.error('Okunmamış mesajlar sayılırken hata oluştu:', error);
        return;
      }
      
      setUnreadMessages(count || 0);
    } catch (error) {
      console.error('Okunmamış mesajlar sayılırken hata oluştu:', error);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      await supabase.auth.signOut();
      router.push('/admin/login');
    }
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <html lang="tr" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="bg-gray-50 dark:bg-gray-900">
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Mobil menü açma/kapama butonu */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Kenar çubuğu */}
            <div
              className={`${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
            >
              <div className="flex flex-col h-full">
                <div className="px-6 py-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Admin Panel
                  </h1>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                  <Link
                    href="/admin"
                    className={`flex items-center px-3 py-2 rounded-md ${
                      isActive('/admin') 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Dashboard
                  </Link>

                  <Link
                    href="/admin/posts"
                    className={`flex items-center px-3 py-2 rounded-md ${
                      isActive('/admin/posts') 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Yazılar
                  </Link>

                  <Link
                    href="/admin/messages"
                    className={`flex items-center px-3 py-2 rounded-md ${
                      isActive('/admin/messages') 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="relative">
                      <Mail className="h-5 w-5 mr-2" />
                      {unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                      )}
                    </div>
                    Mesajlar
                  </Link>

                  <Link
                    href="/admin/about"
                    className={`flex items-center px-3 py-2 rounded-md ${
                      isActive('/admin/about') 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Hakkımda
                  </Link>

                  <Link
                    href="/admin/settings"
                    className={`flex items-center px-3 py-2 rounded-md ${
                      isActive('/admin/settings') 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Ayarlar
                  </Link>
                </nav>

                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>

            {/* Ana içerik */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
              <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                <Toaster position="top-right" />
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}