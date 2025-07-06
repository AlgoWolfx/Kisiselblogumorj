'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, Save, Upload, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import type { Components } from 'react-markdown';
import Image from 'next/image';

// ReactMarkdown ve Image bileşenlerini dynamic olarak yükle
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <p className="text-gray-400">İçerik yükleniyor...</p>
});

// Image yükleme başarısız olursa
const fallbackImageUrl = '/images/profile.jpg';

const ImageLoader = () => (
  <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-full w-full rounded-full"></div>
);

interface AboutContent {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  image_url: string;
}

export default function AboutAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    setLoading(true);
    try {
      console.log('Hakkında içeriği yükleniyor...');
      const { data, error } = await supabase
        .from('about')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      console.log('Veri:', data, 'Hata:', error);

      if (error) {
        throw error;
      }

      if (data) {
        setAboutContent(data);
      } else {
        // Eğer veri yoksa, yeni bir kayıt oluştur
        console.log('Veri bulunamadı, yeni kayıt oluşturuluyor...');
        const { data: newData, error: insertError } = await supabase
          .from('about')
          .insert({
            title: 'Hakkımda',
            content: 'Buraya hakkınızda bilgileri ekleyin.',
            image_url: '/images/profile.jpg'
          })
          .select()
          .single();

        console.log('Yeni veri:', newData, 'Hata:', insertError);
        
        if (insertError) throw insertError;
        setAboutContent(newData);
      }
    } catch (error) {
      console.error('Hakkında içeriği yüklenirken hata oluştu:', error);
      showNotification('error', 'İçerik yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setUploading(true);

    try {
      console.log('Dosya yüklemeye hazırlanıyor...');
      
      // Dosyayı formData olarak hazırla
      const formData = new FormData();
      formData.append('file', file);
      
      // API route aracılığıyla dosyayı yükle
      const res = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Yükleme başarısız: ${error}`);
      }
      
      const data = await res.json();
      console.log('Yükleme yanıtı:', data);
      
      if (data.url) {
        // About içeriğini güncelle
        setAboutContent(prev => 
          prev ? { ...prev, image_url: data.url } : null
        );
        showNotification('success', 'Profil resmi yüklendi!');
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      showNotification('error', 'Resim yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
      // Input'u sıfırla
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!aboutContent) return;

    setSaving(true);
    try {
      console.log('Hakkında içeriği kaydediliyor...', aboutContent);
      
      const { data, error } = await supabase
        .from('about')
        .update({
          title: aboutContent.title,
          content: aboutContent.content,
          image_url: aboutContent.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', aboutContent.id)
        .select()
        .single();

      console.log('Kayıt sonucu:', data, 'Hata:', error);
      
      if (error) {
        throw error;
      }

      if (data) {
        setAboutContent(data);
        showNotification('success', 'Hakkında sayfası başarıyla güncellendi!');
      }
    } catch (error) {
      console.error('Hakkında sayfası kaydedilirken hata oluştu:', error);
      showNotification('error', 'Kaydetme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleImageReset = () => {
    if (aboutContent) {
      setAboutContent({ ...aboutContent, image_url: '/images/profile.jpg' });
      showNotification('success', 'Profil resmi varsayılana sıfırlandı');
    }
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hakkında Sayfası</h1>
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
        <div className="space-y-6">
          {/* Profil Resmi Bölümü */}
          <div>
            <label className="block text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-3">
              Profil Resmi
            </label>
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="relative w-48 h-48 overflow-hidden rounded-full shadow-xl bg-black border-2 border-indigo-200 dark:border-indigo-800">
                {aboutContent?.image_url && (
                  <Image
                    src={aboutContent.image_url}
                    alt="Profil Fotoğrafı"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 192px, 192px"
                    priority
                    unoptimized={aboutContent.image_url.startsWith('http')}
                    style={{ backgroundColor: 'transparent' }}
                    quality={100}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = fallbackImageUrl;
                    }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Resim Yükle</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleImageReset}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                >
                  <X className="h-5 w-5" />
                  <span>Varsayılana Sıfırla</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-2">
              Başlık
            </label>
            <input
              type="text"
              id="title"
              value={aboutContent?.title || ''}
              onChange={(e) => setAboutContent(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-2">
              İçerik
            </label>
            <textarea
              id="content"
              value={aboutContent?.content || ''}
              onChange={(e) => setAboutContent(prev => prev ? { ...prev, content: e.target.value } : null)}
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Markdown formatını destekler. Başlıklar için #, listeler için *, kalın metin için ** kullanabilirsiniz.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300">Önizleme</h2>
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-indigo-100 dark:border-indigo-900/30 shadow-md">
          <div className="prose dark:prose-invert max-w-none">
            <div className="flex flex-col items-center mb-10">
              {aboutContent?.image_url && (
                <div className="relative w-40 h-40 md:w-48 md:h-48 overflow-hidden rounded-full shadow-xl mb-6 bg-black border-2 border-indigo-200 dark:border-indigo-800">
                  <Image
                    src={aboutContent.image_url}
                    alt="Profil Fotoğrafı"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 160px, 192px"
                    priority
                    unoptimized={aboutContent.image_url.startsWith('http')}
                    style={{ backgroundColor: 'transparent' }}
                    quality={100}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = fallbackImageUrl;
                    }}
                  />
                </div>
              )}
              <div className="relative">
                <h1 style={{color: '#4F46E5'}} className="text-3xl md:text-4xl font-bold m-0 text-center px-8 pb-3">{aboutContent?.title}</h1>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-300 dark:from-indigo-700 dark:via-indigo-500 dark:to-indigo-700 rounded-full"></div>
              </div>
            </div>
            
            {aboutContent?.content && (
              <div className="text-indigo-900 dark:text-indigo-100 mt-6 px-2 md:px-4">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-6 mb-4 border-b border-indigo-200 dark:border-indigo-800 pb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-indigo-800 dark:text-indigo-200 mt-5 mb-3 border-b border-indigo-100 dark:border-indigo-900 pb-1" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-4 mb-2" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-base font-bold text-indigo-700 dark:text-indigo-300 mt-3 mb-2" {...props} />,
                    h5: ({node, ...props}) => <h5 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mt-3 mb-1" {...props} />,
                    h6: ({node, ...props}) => <h6 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-3 mb-1" {...props} />,
                    p: ({node, ...props}) => <p className="my-3 text-gray-900 dark:text-gray-100 leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-indigo-900 dark:text-indigo-100" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-indigo-800 dark:text-indigo-200" {...props} />,
                    a: ({node, ...props}) => <a className="text-indigo-700 dark:text-indigo-300 hover:underline font-medium" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 my-3 text-gray-900 dark:text-gray-100" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-3 text-gray-900 dark:text-gray-100" {...props} />,
                    li: ({node, ...props}) => <li className="my-1 text-gray-900 dark:text-gray-100" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 dark:border-indigo-600 pl-4 py-2 my-4 bg-indigo-50 dark:bg-indigo-900/20 italic text-indigo-900 dark:text-indigo-100" {...props} />,
                    img: ({node, src, alt, ...props}) => (
                      <div className="my-6">
                        <img src={src} alt={alt || ""} className="rounded-lg max-w-full h-auto mx-auto shadow-lg border-2 border-indigo-100 dark:border-indigo-900" {...props} />
                        {alt && <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2 text-center font-medium">{alt}</p>}
                      </div>
                    ),
                    code: ({node, ...props}) => <code className="bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 px-1.5 py-0.5 rounded font-mono text-sm" {...props} />,
                    pre: ({node, ...props}) => <pre className="bg-indigo-100 dark:bg-gray-800 overflow-x-auto p-4 rounded-md my-4 text-sm text-indigo-900 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-800 shadow-sm" {...props} />
                  } as Components}
                >
                  {aboutContent.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 