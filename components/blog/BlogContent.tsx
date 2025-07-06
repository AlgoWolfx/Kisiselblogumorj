'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface BlogContentProps {
  initialPosts: any[];
}

export function BlogContent({ initialPosts }: BlogContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <h1 className="text-4xl font-bold mb-6 text-center font-sans text-white">Blog</h1>
      
      {/* Arama alanı */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialPosts.length === 0 ? (
          <div className="col-span-3 text-center py-16">
            <p className="text-gray-400">Henüz blog yazısı bulunmuyor.</p>
          </div>
        ) : (
          initialPosts.map((post) => (
            post && (
              <Link 
                href={`/blog/${post.slug}`} 
                key={post.slug}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all hover:bg-white/10 hover:scale-[1.02] duration-300"
              >
                <div className="relative h-48">
                  <Image
                    src={post.frontMatter.coverImage}
                    alt={post.frontMatter.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-sm font-medium text-blue-300 bg-blue-500/20 rounded-full border border-blue-500/30 mb-3">
                    {post.frontMatter.category}
                  </span>
                  <h2 className="font-sans text-xl font-bold mb-2 text-white">
                    {post.frontMatter.title}
                  </h2>
                  <p className="text-sm text-gray-400 mb-3">
                    {format(new Date(post.frontMatter.date), 'MMMM dd, yyyy')} • {post.frontMatter.readTime} min read
                  </p>
                  <p className="font-serif text-gray-300 mb-4 line-clamp-3">
                    {post.frontMatter.excerpt}
                  </p>
                </div>
              </Link>
            )
          ))
        )}
      </div>
    </div>
  );
} 