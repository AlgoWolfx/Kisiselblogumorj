'use client';

import Link from 'next/link';
import { Mail, Star, Twitter, Facebook, Instagram, Github, Linkedin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Ayarlar için tip tanımı
interface Settings {
  social_links: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
  };
  site_title?: string;
}

export function Footer() {
  const [email, setEmail] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);

  // Ayarları yükle
  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase
        .from('settings')
        .select('social_links, site_title')
        .single();
      
      if (!error && data) {
        setSettings(data);
      }
    }
    
    loadSettings();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
  };

  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="container px-4 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-sans text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <Star className="h-5 w-5" />
              {settings?.site_title || 'Yiğit Osman Bayrak'}
            </h3>
            <p className="font-serif text-gray-400 mb-4">
              Teknoloji, finans ve yazılım dünyasında bir keşif yolculuğu.
            </p>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Yiğit Osman Bayrak. Tüm hakları saklıdır.
            </p>
          </div>
          
          <div>
            <h3 className="font-sans text-lg font-bold mb-4 text-white">Navigasyon</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Anasayfa
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  Hakkımda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-sans text-lg font-bold mb-4 text-white">Bülten</h3>
            <p className="font-serif text-gray-400 mb-4">
              Güncellemelerden haberdar olmak için abone olun.
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                required
                className="flex-grow px-4 py-2 bg-white/5 border border-white/10 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Mail className="h-5 w-5" />
              </button>
            </form>
            
            {/* Sosyal Medya Bağlantıları */}
            <div className="flex space-x-4 mt-6">
              {settings?.social_links?.twitter && (
                <SocialLink 
                  href={settings.social_links.twitter}
                  icon={<Twitter className="h-5 w-5" />} 
                  label="Twitter"
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
            </div>
          </div>
        </div>
      </div>
    </footer>
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