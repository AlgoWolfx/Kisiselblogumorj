'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, Clock, Edit, Eye, FilePlus, Trash } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  excerpt: string;
  category: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, title, slug, published_at, created_at, updated_at, excerpt, category')
        .order('created_at', { ascending: false });

      if (filter === 'published') {
        query = query.not('published_at', 'is', null);
      } else if (filter === 'draft') {
        query = query.is('published_at', null);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Yazılar yüklenirken hata oluştu:', error);
      showNotification('error', 'Yazılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (slug: string, title: string) => {
    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
    if (!adminSecret) {
      showNotification('error', 'Admin secret tanımlı değil. Lütfen .env.local dosyasını kontrol edin.');
      return;
    }
    
    if (!window.confirm(`"${title}" başlıklı yazıyı silmek istediğinizden emin misiniz?`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ slug }),
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('success', 'Yazı başarıyla silindi!');
        // Verileri yenile
        fetchPosts();
      } else {
        showNotification('error', 'Yazı silinirken hata oluştu: ' + data.error);
      }
    } catch (error) {
      showNotification('error', 'İşlem sırasında bir hata oluştu');
    }
  };

  const handleTogglePublish = async (slug: string, currentStatus: boolean, title: string) => {
    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
    if (!adminSecret) {
      showNotification('error', 'Admin secret tanımlı değil. Lütfen .env.local dosyasını kontrol edin.');
      return;
    }
    
    const action = currentStatus ? 'taslağa çekmek' : 'yayınlamak';
    
    if (!window.confirm(`"${title}" başlıklı yazıyı ${action} istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/posts/publish', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ 
          slug,
          published_at: currentStatus ? null : new Date().toISOString()
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('success', `Yazı başarıyla ${currentStatus ? 'taslağa çekildi' : 'yayınlandı'}!`);
        // Verileri yenile
        fetchPosts();
      } else {
        showNotification('error', 'İşlem sırasında hata oluştu: ' + data.error);
      }
    } catch (error) {
      showNotification('error', 'İşlem sırasında bir hata oluştu');
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    // 5 saniye sonra bildirimi kaldır
    setTimeout(() => setNotification(null), 5000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yazılar</h1>
        <Link 
          href="/admin/posts/new" 
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
        >
          <FilePlus className="h-5 w-5" />
          <span>Yeni Yazı</span>
        </Link>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center ${
          notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
          notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
          'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> :
           notification.type === 'error' ? <AlertCircle className="h-5 w-5 mr-2" /> :
           <Clock className="h-5 w-5 mr-2" />}
          <p>{notification.message}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
          <span className="font-medium text-gray-700 dark:text-gray-300">Filtrele:</span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Tümü
            </button>
            <button 
              onClick={() => setFilter('published')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'published'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Yayında
            </button>
            <button 
              onClick={() => setFilter('draft')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'draft'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' 
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Taslak
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {filter === 'all' 
              ? 'Henüz yazı eklenmemiş.' 
              : filter === 'published' 
                ? 'Yayınlanmış yazı bulunamadı.' 
                : 'Taslak yazı bulunamadı.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Oluşturulma
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Son Güncelleme
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{post.excerpt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.published_at ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" /> Yayında
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          <Clock className="h-3 w-3 mr-1" /> Taslak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.category || 'Genel'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.updated_at ? formatDate(post.updated_at) : formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                      <a 
                        href={`/blog/${post.slug}`} 
                        target="_blank"
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 tooltip"
                        title="Görüntüle"
                      >
                        <Eye className="h-5 w-5" />
                      </a>
                      <a
                        href={`/admin/posts/edit/${post.slug}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 tooltip"
                        title="Düzenle"
                      >
                        <Edit className="h-5 w-5" />
                      </a>
                      <button
                        onClick={() => handleTogglePublish(post.slug, !!post.published_at, post.title)}
                        className={post.published_at 
                          ? "text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 tooltip" 
                          : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 tooltip"}
                        title={post.published_at ? "Taslağa Çevir" : "Yayınla"}
                      >
                        {post.published_at 
                          ? <Clock className="h-5 w-5" /> 
                          : <CheckCircle className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.slug, post.title)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 tooltip"
                        title="Sil"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 