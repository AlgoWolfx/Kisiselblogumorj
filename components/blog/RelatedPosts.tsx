import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import SupabaseImage from '../ui/SupabaseImage';

interface RelatedPostsProps {
  posts: any[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-800">
      <h2 className="text-2xl font-bold mb-6">İlgili Yazılar</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          post && (
            <Link 
              href={`/blog/${post.slug}`} 
              key={post.slug}
              className="group block"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                <SupabaseImage
                  src={post.frontMatter.coverImage}
                  alt={post.frontMatter.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                  <span className="inline-block px-2 py-1 text-xs bg-blue-600/80 text-white rounded-md">
                    {post.frontMatter.category}
                  </span>
                </div>
              </div>
              
              <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-400 transition-colors">
                {post.frontMatter.title}
              </h3>
              
              <div className="text-sm text-gray-400 mt-1">
                {format(new Date(post.frontMatter.date), 'd MMMM yyyy', { locale: tr })} 
                • {post.frontMatter.readTime} dk okuma
              </div>
            </Link>
          )
        ))}
      </div>
    </section>
  );
} 