'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import SupabaseImage from '../ui/SupabaseImage';

interface FeaturedPostsProps {
  posts: any[];
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  // Eskiden getFeaturedPosts() çağrısı yapılıyordu, şimdi props olarak geliyor
  
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Öne Çıkan Yazılar</h2>
        <Link href="/blog" className="text-blue-400 hover:text-blue-300 text-sm">
          Tümünü Gör &rarr;
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <p className="text-gray-400">Öne çıkan yazı bulunmuyor.</p>
          </div>
        ) : (
          posts.slice(0, 2).map((post) => (
            post && (
              <Link 
                href={`/blog/${post.slug}`} 
                key={post.slug}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all hover:bg-white/10 hover:scale-[1.03] duration-300"
              >
                <div className="relative h-60">
                  <SupabaseImage
                    src={post.frontMatter.coverImage}
                    alt={post.frontMatter.title}
                    fill
                    priority
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAELgJhFHSdWAAAAABJRU5ErkJggg=="
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className="inline-block px-3 py-1 text-sm font-medium text-blue-300 bg-blue-500/20 rounded-full border border-blue-500/30 mb-3">
                      {post.frontMatter.category}
                    </span>
                    <h3 className="font-sans text-2xl font-bold mb-2 text-white">
                      {post.frontMatter.title}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {format(new Date(post.frontMatter.date), 'MMMM dd, yyyy')} • {post.frontMatter.readTime} min okuma
                    </p>
                  </div>
                </div>
              </Link>
            )
          ))
        )}
      </div>
    </section>
  );
}