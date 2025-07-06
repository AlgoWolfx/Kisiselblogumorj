'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { AlertCircle, Upload } from 'lucide-react';
import Link from 'next/link';
import RichTextEditor from '@/components/RichTextEditor';

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [excerpt, setExcerpt] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [publishNow, setPublishNow] = useState<boolean>(false);

  // Kullanıcı bilgilerini al
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        // Kullanıcı oturum açmamışsa, giriş sayfasına yönlendir
        router.push('/admin/login');
        return;
      }
      setUser(currentUser);
    };

    fetchUser();
  }, [router]);

  // Başlıktan slug oluştur
  const generateSlug = useCallback((text: string) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }, []);

  // Başlık değiştiğinde otomatik slug oluştur
  useEffect(() => {
    if (title) {
      setSlug(generateSlug(title));
    }
  }, [title, generateSlug]);

  // Kapak görseli değiştiğinde önizleme URL'si oluştur
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverImage(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  // Formu gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.');
      return;
    }
    
    if (!title || !slug || !content) {
      setError('Lütfen başlık, URL ve içerik alanlarını doldurun.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let coverImageUrl = null;

      // Kapak görseli yükle
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(16).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('blog_covers')
          .upload(filePath, coverImage);
          
        if (uploadError) {
          throw new Error(`Kapak görseli yüklenirken hata oluştu: ${uploadError.message}`);
        }
        
        const { data: urlData } = supabase.storage
          .from('blog_covers')
          .getPublicUrl(filePath);
          
        coverImageUrl = urlData.publicUrl;
      }
      
      // Admin secret alınıyor
      const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
      if (!adminSecret) {
        throw new Error('Admin secret tanımlı değil. Lütfen .env.local dosyasını kontrol edin.');
      }
      
      // Yazıyı veritabanına ekle
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt: excerpt || title,
          author_id: user.id,
          published_at: publishNow ? new Date().toISOString() : null, // Yayınlanacaksa şimdiki tarih, değilse null
          cover_image: coverImageUrl,
          category,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Yazı eklenirken bir hata oluştu');
      }
      
      // Başarılı olduğunda yazılar sayfasına yönlendir
      router.push('/admin/posts');
      
    } catch (error: any) {
      console.error('Yazı eklenirken hata:', error);
      setError(error.message || 'Yazı eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yeni Yazı Ekle</h1>
        <Link 
          href="/admin/posts" 
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg"
        >
          Geri Dön
        </Link>
      </div>
      
      {error && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label htmlFor="title" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Başlık*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-700 rounded-md shadow-sm dark:bg-gray-800 dark:text-white"
                required
                placeholder="Yazı başlığını girin"
              />
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL*
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400 mr-1 bg-gray-100 dark:bg-gray-700 px-3 py-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">/blog/</span>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-r-md shadow-sm dark:bg-gray-800 dark:text-white"
                  required
                  placeholder="yazinin-url-adresi"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                URL adresi otomatik oluşturulur, değiştirebilirsiniz
              </p>
            </div>
            
            <div>
              <label htmlFor="excerpt" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Özet
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm dark:bg-gray-800 dark:text-white"
                placeholder="Yazının kısa bir özeti (boş bırakılırsa başlık kullanılır)"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm dark:bg-gray-800 dark:text-white"
                placeholder="Örn: Teknoloji, Yazılım, Genel vb."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kapak Görseli
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 h-60 flex flex-col items-center justify-center cursor-pointer relative">
              {coverImagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={coverImagePreview}
                    alt="Kapak görseli önizlemesi"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverImage(null);
                      setCoverImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <label htmlFor="coverImage" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <div className="text-center space-y-2">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      Kapak görseli seçmek için tıklayın
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">
                      JPG, PNG veya GIF • Maks 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    id="coverImage"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <label htmlFor="content" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            İçerik*
          </label>
          <div className="min-h-[400px]">
            {user?.id && (
              <RichTextEditor
                userId={user.id}
                initialContent={content}
                onChange={setContent}
                placeholder="Yazınızı buraya girin..."
              />
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="publishNow"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="publishNow" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Hemen yayınla
            </label>
          </div>
          
          <div className="flex-grow"></div>
          
          <div className="flex space-x-4">
            <Link
              href="/admin/posts"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
            >
              İptal
            </Link>
            <button
              type="submit"
              className="px-6 py-3 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 