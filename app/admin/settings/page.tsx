'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, Save } from 'lucide-react';

interface BlogSettings {
  id: string;
  site_title: string;
  site_description: string;
  site_keywords: string;
  site_author: string;
  posts_per_page: number;
  allow_comments: boolean;
  social_links: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
  };
  updated_at: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Eğer veri yoksa, varsayılan ayarları oluştur
        setSettings({
          id: 'default',
          site_title: 'Kişisel Blog',
          site_description: 'Kişisel blog sayfama hoş geldiniz',
          site_keywords: 'blog, kişisel, yazılar',
          site_author: 'Blog Yazarı',
          posts_per_page: 10,
          allow_comments: true,
          social_links: {
            twitter: '',
            facebook: '',
            instagram: '',
            github: '',
            linkedin: ''
          },
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata oluştu:', error);
      showNotification('error', 'Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setSettings(data);
        showNotification('success', 'Ayarlar başarıyla güncellendi!');
      }
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata oluştu:', error);
      showNotification('error', 'Kaydetme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    // 5 saniye sonra bildirimi kaldır
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSocialLinkChange = (platform: keyof BlogSettings['social_links'], value: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      social_links: {
        ...settings.social_links,
        [platform]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Site Ayarları</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Kaydet</span>
            </>
          )}
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center ${
          notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
          'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> :
           <AlertCircle className="h-5 w-5 mr-2" />}
          <p>{notification.message}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Genel Ayarlar</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="site_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Başlığı
              </label>
              <input
                type="text"
                id="site_title"
                value={settings?.site_title || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, site_title: e.target.value } : null)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="site_author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Yazarı
              </label>
              <input
                type="text"
                id="site_author"
                value={settings?.site_author || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, site_author: e.target.value } : null)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="site_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Açıklaması
              </label>
              <textarea
                id="site_description"
                value={settings?.site_description || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, site_description: e.target.value } : null)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="site_keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Anahtar Kelimeler (virgülle ayırın)
              </label>
              <input
                type="text"
                id="site_keywords"
                value={settings?.site_keywords || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, site_keywords: e.target.value } : null)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="posts_per_page" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sayfa Başına Yazı Sayısı
              </label>
              <input
                type="number"
                id="posts_per_page"
                min="1"
                max="100"
                value={settings?.posts_per_page || 10}
                onChange={(e) => setSettings(prev => prev ? { ...prev, posts_per_page: parseInt(e.target.value) || 10 } : null)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allow_comments"
                checked={settings?.allow_comments || false}
                onChange={(e) => setSettings(prev => prev ? { ...prev, allow_comments: e.target.checked } : null)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="allow_comments" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Yorumlara İzin Ver
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Sosyal Medya Bağlantıları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Twitter
            </label>
            <input
              type="url"
              id="twitter"
              placeholder="https://twitter.com/kullanici"
              value={settings?.social_links.twitter || ''}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Facebook
            </label>
            <input
              type="url"
              id="facebook"
              placeholder="https://facebook.com/kullanici"
              value={settings?.social_links.facebook || ''}
              onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instagram
            </label>
            <input
              type="url"
              id="instagram"
              placeholder="https://instagram.com/kullanici"
              value={settings?.social_links.instagram || ''}
              onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              placeholder="https://linkedin.com/in/kullanici"
              value={settings?.social_links.linkedin || ''}
              onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GitHub
            </label>
            <input
              type="url"
              id="github"
              placeholder="https://github.com/kullanici"
              value={settings?.social_links.github || ''}
              onChange={(e) => handleSocialLinkChange('github', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 