'use client';

import Image from 'next/image';
import { Github, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';

// ReactMarkdown'i dynamic olarak yükle ve SSR'yi devre dışı bırak
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <p className="text-gray-400">İçerik yükleniyor...</p>
});

// Image bileşenini dynamic olarak import edelim
const DynamicImage = dynamic(() => import('next/image'), { ssr: false });

interface AboutContent {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  image_url: string;
}

interface Settings {
  social_links: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
  };
}

export function ProfileSection() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function fetchAboutContent() {
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
          setError('İçerik yüklenirken bir hata oluştu');
          console.error('Hakkında içeriği yüklenirken hata oluştu:', error);
          return;
        }

        if (data) {
          setAboutContent(data);
        }
      } catch (error) {
        setError('İçerik yüklenirken bir hata oluştu');
        console.error('Hakkında içeriği yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('social_links')
          .single();
        
        if (!error && data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Ayarlar yüklenirken hata oluştu:', error);
      }
    }

    fetchAboutContent();
    fetchSettings();
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !aboutContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-2 text-lg font-medium">{error || 'Hakkında içeriği yüklenemedi'}</p>
          <p className="mt-1 text-sm">Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center lg:items-start">
      <div className="relative w-48 h-48 overflow-hidden rounded-full shadow-lg mb-8 ring-2 ring-white/20 hover:ring-blue-500/50 transition-all duration-300">
        {aboutContent.image_url && !imageError ? (
          <DynamicImage
            src={aboutContent.image_url}
            alt={`${aboutContent.title} Profil Fotoğrafı`}
            fill
            className="object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
            <span className="text-2xl">?</span>
          </div>
        )}
      </div>
      
      <h2 className="font-sans text-2xl font-bold mb-4 text-white">
        {aboutContent.title}
      </h2>
      
      <div className="font-serif prose prose-invert max-w-none mb-8">
        {aboutContent && aboutContent.content && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {aboutContent.content}
          </ReactMarkdown>
        )}
      </div>
      
      <div className="flex flex-col space-y-4 items-center w-full mb-8">
        <h3 className="text-lg font-medium">İletişim Bilgileri</h3>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">E-posta:</span>
          <a href="mailto:dryigitx.x@gmail.com" className="text-blue-400 hover:text-blue-300">
            dryigitx.x@gmail.com
          </a>
        </div>
        <Link 
          href="/contact" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
        >
          İletişim Formu
        </Link>
      </div>
      
      <div className="flex space-x-4">
        {settings?.social_links?.twitter && (
          <SocialLink 
            href={settings.social_links.twitter}
            icon={<Twitter className="h-5 w-5" />} 
            label="Twitter"
          />
        )}
        
        {settings?.social_links?.github && (
          <SocialLink 
            href={settings.social_links.github}
            icon={<Github className="h-5 w-5" />} 
            label="GitHub"
          />
        )}
        
        {settings?.social_links?.linkedin && (
          <SocialLink 
            href={settings.social_links.linkedin}
            icon={<Linkedin className="h-5 w-5" />} 
            label="LinkedIn"
          />
        )}
        
        {settings?.social_links?.facebook && (
          <SocialLink 
            href={settings.social_links.facebook}
            icon={<Facebook className="h-5 w-5" />} 
            label="Facebook"
          />
        )}
        
        {settings?.social_links?.instagram && (
          <SocialLink 
            href={settings.social_links.instagram}
            icon={<Instagram className="h-5 w-5" />} 
            label="Instagram"
          />
        )}
      </div>
    </div>
  );
}

function SocialLink({ 
  href, 
  icon, 
  label 
}: { 
  href: string; 
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/20 rounded-full text-gray-300 hover:bg-blue-500/20 hover:text-white hover:border-blue-500/30 transition-all hover:scale-110 duration-300"
      aria-label={label}
    >
      {icon}
    </a>
  );
}