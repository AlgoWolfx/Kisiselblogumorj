import { PostHeader } from '@/components/blog/PostHeader';
import { PostFooter } from '@/components/blog/PostFooter';
import { Comments } from '@/components/comments/Comments';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { getPostBySlug, getAllPosts, getRelatedPosts } from '@/lib/markdownUtils';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';

// Supabase API'den blog yazısını al - önbelleğe almayı optimize ettik
async function getSupabasePost(slug: string) {
  try {
    // Supabase API ile sorguyu yaparken revalidate süresini belirtelim
    // Bu, aynı sorgunun 60 saniye boyunca tekrar yapılmasını önler
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blog/${slug}`, { 
      next: { revalidate: 60 } // 60 saniyelik önbelleğe alma
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.post;
  } catch (error) {
    console.error("Supabase post alma hatası:", error);
    return null;
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  
  return posts
    .filter(post => post) // null değerleri filtrele
    .map((post) => ({
      slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // İlk olarak Supabase'den kontrol et
  const supabasePost = await getSupabasePost(params.slug);
  
  if (supabasePost) {
    return {
      title: supabasePost.title,
      description: supabasePost.excerpt,
    };
  }
  
  // Bulunamazsa Markdown'tan kontrol et
  const markdownPost = await getPostBySlug(params.slug);
  
  if (!markdownPost) {
    return {
      title: 'Post Not Found',
      description: 'The post you are looking for does not exist.',
    };
  }
  
  return {
    title: markdownPost.frontMatter.title,
    description: markdownPost.frontMatter.excerpt,
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  // İlk olarak Supabase'den kontrol et
  const supabasePost = await getSupabasePost(params.slug);
  
  // Eğer Supabase'de varsa onu kullan
  if (supabasePost) {
    const relatedPosts = await getRelatedPosts(params.slug, 3);
    
    return (
      <article className="container max-w-4xl px-4 mx-auto my-12">
        <PostHeader 
          title={supabasePost.title}
          coverImage={supabasePost.coverImage}
          date={supabasePost.date}
          author={supabasePost.author}
          readTime={supabasePost.readTime}
          category={supabasePost.category}
        />
        
        <div 
          className="prose prose-lg dark:prose-invert prose-blue max-w-none font-serif my-10" 
          dangerouslySetInnerHTML={{ __html: supabasePost.content }}
        />
        
        <PostFooter tags={supabasePost.tags || []} />
        
        {/* İlgili yazılar bölümü */}
        <RelatedPosts posts={relatedPosts} />
        
        {/* Yorum bölümü - sabit bir key kullanarak gereksiz yenilenmeleri önleyelim */}
        <section key={`comments-section-${params.slug}`}>
          <Comments postSlug={params.slug} />
        </section>
      </article>
    );
  }
  
  // Supabase'de yoksa, Markdown'tan al
  const markdownPost = await getPostBySlug(params.slug);
  
  if (!markdownPost) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(params.slug, 3);

  return (
    <article className="container max-w-4xl px-4 mx-auto my-12">
      <PostHeader 
        title={markdownPost.frontMatter.title}
        coverImage={markdownPost.frontMatter.coverImage}
        date={markdownPost.frontMatter.date}
        author={markdownPost.frontMatter.author}
        readTime={markdownPost.frontMatter.readTime}
        category={markdownPost.frontMatter.category}
      />
      <div className="prose prose-lg dark:prose-invert prose-blue max-w-none font-serif my-10">
        <MarkdownRenderer content={markdownPost.content} />
      </div>
      <PostFooter tags={markdownPost.frontMatter.tags} />
      
      {/* İlgili yazılar bölümü */}
      <RelatedPosts posts={relatedPosts} />
      
      {/* Yorum bölümü - sabit bir key kullanarak gereksiz yenilenmeleri önleyelim */}
      <section key={`comments-section-${params.slug}`}>
        <Comments postSlug={params.slug} />
      </section>
    </article>
  );
}