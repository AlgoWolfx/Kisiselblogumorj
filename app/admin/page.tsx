'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Clock, Edit, FilePlus, Mail, Trash, User, Settings, FileText, BarChart2, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';

// TypeScript için window tipini genişlet
declare global {
  interface Window {
    ENV: {
      NEXT_PUBLIC_ADMIN_SECRET?: string;
    };
  }
}

interface Post {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  created_at: string;
  category: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  created_at: string;
  read: boolean;
  user_id?: string;
  avatar_url?: string | null;
  profiles?: { 
    avatar_url?: string | null 
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalMessages: 0,
    unreadMessages: 0
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Ana veri yükleme
  useEffect(() => {
    fetchData();
  }, []);

  // Sadece mesajları güncelle
  const refreshMessages = async () => {
    setRefreshingMessages(true);
    try {
      // Mesaj istatistikleri
      const { count: totalMessages } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });
        
      const { count: unreadMessages } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);

      // Son 5 mesajı al
      const { data: messages } = await supabase
        .from('contact_messages')
        .select('id, name, email, subject, created_at, read, avatar_url, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      // Verileri güncelle
      if (messages) {
        setRecentMessages(messages);
      }
      
      // İstatistikleri güncelle
      setStats(prev => ({
        ...prev,
        totalMessages: totalMessages || prev.totalMessages,
        unreadMessages: unreadMessages || prev.unreadMessages
      }));

      showNotification('info', 'Mesajlar güncellendi');
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      showNotification('error', 'Mesajlar güncellenirken hata oluştu');
    } finally {
      setRefreshingMessages(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Yazı verilerini getir
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published_at, created_at, category');

      if (postsError) {
        console.error('Yazılar yüklenirken hata:', postsError);
        showNotification('error', 'Yazılar yüklenirken hata oluştu');
        return;
      }

      // Mesaj istatistikleri
      const { count: totalMessages, error: totalMessagesError } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });
        
      if (totalMessagesError) {
        console.error('Mesaj sayısı alınırken hata:', totalMessagesError);
        showNotification('error', 'Mesaj istatistikleri yüklenirken hata oluştu');
        return;
      }
        
      const { count: unreadMessages, error: unreadMessagesError } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);

      if (unreadMessagesError) {
        console.error('Okunmamış mesaj sayısı alınırken hata:', unreadMessagesError);
        showNotification('error', 'Mesaj istatistikleri yüklenirken hata oluştu');
        return;
      }

      // Son 5 mesajı al
      const { data: messages, error: messagesError } = await supabase
        .from('contact_messages')
        .select('id, name, email, subject, created_at, read, avatar_url, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesError) {
        console.error('Son mesajlar yüklenirken hata:', messagesError);
        showNotification('error', 'Son mesajlar yüklenirken hata oluştu');
      }

      if (posts) {
        const published = posts.filter(post => post.published_at).length;
        
        setStats({
          totalPosts: posts.length,
          publishedPosts: published,
          draftPosts: posts.length - published,
          totalMessages: totalMessages || 0,
          unreadMessages: unreadMessages || 0
        });

        // Son 5 postu al
        const sortedPosts = [...posts].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5);
        
        setRecentPosts(sortedPosts);
      }

      if (messages) {
        setRecentMessages(messages);
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      showNotification('error', 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa ilk yüklendiğinde gerekli storage bucket'larını oluştur
  useEffect(() => {
    const setupStorage = async () => {
      try {
        const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
        if (!adminSecret) {
          console.error('Admin secret bulunamadı');
          return;
        }

        const response = await fetch('/api/admin/storage-setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': adminSecret,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('Storage kurulumu yapılamadı:', data.error);
        }
      } catch (error) {
        console.error('Storage kurulum hatası:', error);
      }
    };

    setupStorage();
  }, []);

  const handleAddPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: 'Yeni Post',
          slug: 'yeni-post-' + Date.now(),
          content: 'Bu bir test postudur.',
          excerpt: 'Test excerpt',
          author_id: '1', // Örnek yazar ID
          published_at: null, // Taslak olarak oluştur
          cover_image: '',
          category: 'Genel',
          tags: ['test'],
          featured: false,
        })
        .select();
      
      if (error) {
        showNotification('error', 'Post eklenirken hata oluştu: ' + error.message);
        return;
      }
      
      showNotification('success', 'Post başarıyla eklendi!');
      // Verileri yenile
      fetchData();
      
    } catch (error) {
      showNotification('error', 'İşlem sırasında bir hata oluştu');
    }
  };

  const handleDeletePost = async (slug: string) => {
    if (window.confirm('Bu postu silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('slug', slug);
        
        if (error) {
          showNotification('error', 'Post silinirken hata oluştu: ' + error.message);
          return;
        }
        
        showNotification('success', 'Post başarıyla silindi!');
        // Verileri yenile
        fetchData();
        
      } catch (error) {
        showNotification('error', 'İşlem sırasında bir hata oluştu');
      }
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Tarih formatlayıcı
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Taslak';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık bölümü */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        
        {notification && (
          <div className={`p-3 rounded-lg flex items-center ${
            notification.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
            notification.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
            'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
          }`}>
            {notification.message}
          </div>
        )}
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border-l-4 border-l-indigo-500 border-t border-r border-b border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Yazı</p>
            <BarChart2 className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Tüm yazıların sayısı</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border-l-4 border-l-green-500 border-t border-r border-b border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Yayında</p>
            <ArrowUp className="h-5 w-5 text-green-500 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.publishedPosts}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Yayınlanmış yazılar</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border-l-4 border-l-yellow-500 border-t border-r border-b border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taslak</p>
            <ArrowDown className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.draftPosts}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Taslak halindeki yazılar</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border-l-4 border-l-blue-500 border-t border-r border-b border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mesajlar</p>
            <Mail className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalMessages}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Toplam iletişim mesajları</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border-l-4 border-l-red-500 border-t border-r border-b border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Okunmamış</p>
            <Mail className="h-5 w-5 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.unreadMessages}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Okunmamış mesajlar</p>
        </div>
      </div>

      {/* Son Yazılar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/70">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Son Yazılar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddPost}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800/30 transition-colors"
            >
              <FilePlus className="h-4 w-4" />
              <span>Yeni Yazı</span>
            </button>
            <Link
              href="/admin/posts"
              className="px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Tüm Yazılar
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Başlık</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Kategori</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Durum</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Tarih</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-5 text-center text-gray-500 dark:text-gray-400">
                    Henüz hiç yazı bulunmuyor.
                  </td>
                </tr>
              ) : (
                recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{post.title}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {post.published_at ? (
                        <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                          <CheckCircle className="h-4 w-4 mr-1.5" /> Yayında
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600 dark:text-yellow-400 font-medium">
                          <Clock className="h-4 w-4 mr-1.5" /> Taslak
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {formatDate(post.published_at || post.created_at)}
                    </td>
                    <td className="px-5 py-4 text-sm text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/posts/${post.slug}`}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post.slug)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          title="Sil"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Son Mesajlar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/70">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Son Mesajlar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshMessages}
              disabled={refreshingMessages}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800/30 disabled:opacity-50 transition-colors"
            >
              {refreshingMessages ? "Yenileniyor..." : "Yenile"}
            </button>
            <Link
              href="/admin/messages"
              className="px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Tüm Mesajlar
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Gönderen</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">E-posta</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Konu</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Tarih</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-5 text-center text-gray-500 dark:text-gray-400">
                    Henüz hiç mesaj bulunmuyor.
                  </td>
                </tr>
              ) : (
                recentMessages.map((message) => (
                  <tr key={message.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!message.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{message.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{message.email}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">{message.subject}</td>
                    <td className="px-5 py-4 text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {formatDate(message.created_at)}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {message.read ? (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          Okundu
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                          Yeni
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hızlı Linkler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/posts"
          className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white text-lg">İçerik Yönetimi</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Blog yazılarını düzenle</p>
          </div>
        </Link>
        
        <Link
          href="/admin/messages"
          className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white text-lg">Mesajlar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">İletişim mesajlarını görüntüle</p>
          </div>
        </Link>
        
        <Link
          href="/admin/settings"
          className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white text-lg">Site Ayarları</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Site ayarlarını yönet</p>
          </div>
        </Link>
      </div>
    </div>
  );
}