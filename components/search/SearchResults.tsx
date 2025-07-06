'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ArrowLeft, Search } from 'lucide-react';
import { HighlightMatch } from '@/components/search/HighlightMatch';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResultsProps {
  initialResults: any[];
  initialQuery: string;
}

export function SearchResults({ initialResults, initialQuery }: SearchResultsProps) {
  const [searchResults, setSearchResults] = useState(initialResults);
  const [query, setQuery] = useState(initialQuery);
  const [newSearchQuery, setNewSearchQuery] = useState(initialQuery);
  const router = useRouter();

  // Sayfa yüklendiğinde veya sorgu değiştiğinde, input'u güncelle
  useEffect(() => {
    setNewSearchQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(newSearchQuery.trim())}`);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="mb-12">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tüm yazılara dön
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
          {query ? `"${query}" için arama sonuçları` : 'Arama'}
        </h1>

        {/* Yeni arama alanı */}
        <div className="max-w-2xl mb-12">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <input
                type="text"
                value={newSearchQuery}
                onChange={(e) => setNewSearchQuery(e.target.value)}
                placeholder="Blog yazılarında ara..."
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-5 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {query && searchResults.length === 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center max-w-2xl mx-auto">
          <h2 className="text-xl font-medium text-white mb-3">Sonuç bulunamadı</h2>
          <p className="text-gray-400 mb-6">
            "{query}" için hiçbir sonuç bulunamadı. Lütfen farklı anahtar kelimelerle tekrar deneyin.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/blog"
              className="px-5 py-2.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition-colors rounded-lg"
            >
              Tüm yazıları görüntüle
            </Link>
          </div>
        </div>
      )}
      
      {query && searchResults.length > 0 && (
        <div className="mb-6 text-sm text-gray-400 bg-gray-900/30 border border-gray-800 rounded-lg p-4 flex justify-between items-center">
          <p><strong>{searchResults.length}</strong> sonuç bulundu</p>
          <div className="flex items-center gap-2">
            <span>Sırala:</span>
            <select className="bg-gray-800 text-gray-300 rounded px-2 py-1 text-sm border border-gray-700">
              <option value="relevance">İlgili</option>
              <option value="date-desc">Yeni eklenenler</option>
              <option value="date-asc">Eski eklenenler</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-8">
        {searchResults.map((post) => (
          post && (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className="flex flex-col md:flex-row bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all hover:bg-white/10 hover:scale-[1.01] duration-300"
            >
              <div className="relative w-full md:w-1/3 h-48 md:h-auto">
                <Image
                  src={post.frontMatter.coverImage}
                  alt={post.frontMatter.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 w-full md:w-2/3">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-block px-3 py-1 text-sm font-medium text-blue-300 bg-blue-500/20 rounded-full border border-blue-500/30">
                    <HighlightMatch text={post.frontMatter.category} query={query} />
                  </span>
                </div>
                <h2 className="font-sans text-2xl font-bold mb-2 text-white">
                  <HighlightMatch text={post.frontMatter.title} query={query} />
                </h2>
                <p className="text-sm text-gray-400 mb-3">
                  {format(new Date(post.frontMatter.date), 'MMMM dd, yyyy')} • {post.frontMatter.readTime} min okuma
                </p>
                <p className="font-serif text-gray-300 mb-4">
                  <HighlightMatch text={post.frontMatter.excerpt} query={query} />
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.frontMatter.tags && post.frontMatter.tags.map((tag: string, index: number) => (
                    <span 
                      key={index}
                      className="text-xs text-gray-400 bg-gray-800/50 rounded-full px-3 py-1"
                    >
                      #<HighlightMatch text={tag} query={query} />
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          )
        ))}
      </div>
    </div>
  );
} 