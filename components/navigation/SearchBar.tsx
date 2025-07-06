'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Arama çubuğu açıldığında input'a odaklan
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // ESC tuşuna basıldığında arama çubuğunu kapat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Arama formunu gönderme
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Masaüstü için arama butonu */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
        aria-label="Aramayı aç"
      >
        <Search className="h-4 w-4" />
        <span>Ara</span>
      </button>

      {/* Mobil arama butonu */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Aramayı aç"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Arama overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-0 top-0 p-4 z-50 animate-in fade-in slide-in-from-top duration-300">
            <div className="container mx-auto max-w-3xl">
              <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden">
                <form onSubmit={handleSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Blog yazılarında ara..."
                    className="w-full bg-transparent py-4 px-12 text-white placeholder:text-gray-400 focus:outline-none text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Aramayı kapat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </form>
                <div className="p-4 text-xs text-gray-500 border-t border-gray-800 bg-gray-950/50">
                  <p>İpucu: Başlık, içerik, etiket veya kategorilerde arama yapabilirsiniz. Örneğin: "Next.js" veya "React"</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 