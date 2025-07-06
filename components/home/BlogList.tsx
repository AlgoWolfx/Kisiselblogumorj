'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import SupabaseImage from '../ui/SupabaseImage';

interface BlogListProps {
  posts: any[];
}

export function BlogList({ posts }: BlogListProps) {
  // Eskiden getAllPosts() çağrısı yapılıyordu, şimdi props olarak geliyor
  
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8 text-white">Son Yazılar</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length === 0 ? (
          <div className="col-span-3 text-center py-16">
            <p className="text-gray-400">Henüz blog yazısı bulunmuyor.</p>
          </div>
        ) : (
          posts.slice(0, 6).map((post, index) => (
            post && (
              <Link 
                href={`/blog/${post.slug}`} 
                key={post.slug}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all hover:bg-white/10 hover:scale-[1.02] duration-300"
              >
                <div className="relative h-48">
                  <SupabaseImage
                    src={post.frontMatter.coverImage}
                    alt={post.frontMatter.title}
                    fill
                    priority={index < 3} 
                    loading={index >= 3 ? "lazy" : undefined}
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAELgJhFHSdWAAAAABJRU5ErkJggg=="
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-sm font-medium text-blue-300 bg-blue-500/20 rounded-full border border-blue-500/30 mb-3">
                    {post.frontMatter.category}
                  </span>
                  <h3 className="font-sans text-xl font-bold mb-2 text-white">
                    {post.frontMatter.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {format(new Date(post.frontMatter.date), 'MMMM dd, yyyy')} • {post.frontMatter.readTime} min okuma
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
      
      {posts.length > 6 && (
        <div className="mt-12 text-center">
          <Link 
            href="/blog"
            className="px-6 py-3 bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition-colors rounded-lg inline-block"
          >
            Tüm Yazıları Görüntüle
          </Link>
        </div>
      )}
    </section>
  );
}