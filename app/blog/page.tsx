import { getAllPosts } from '@/lib/markdownUtils';
import { BlogContent } from '@/components/blog/BlogContent';

// Supabase API'den blog yazılarını al
async function getSupabasePosts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blog`, { 
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error("Supabase posts alma hatası:", error);
    return [];
  }
}

export default async function BlogPage() {
  // Her iki kaynaktan da blog yazılarını al
  const markdownPosts = await getAllPosts();
  const supabasePosts = await getSupabasePosts();
  
  // Supabase ve Markdown yazılarını birleştir, fakat slug duplication olmamalı
  const allPostsMap = new Map();
  
  // Önce Supabase yazılarını ekle
  supabasePosts.forEach(post => {
    allPostsMap.set(post.slug, post);
  });
  
  // Sonra Markdown yazılarını ekle (aynı slug varsa Supabase olanı koru)
  markdownPosts.filter(post => post).forEach(post => {
    if (!allPostsMap.has(post.slug)) {
      allPostsMap.set(post.slug, post);
    }
  });
  
  // Map'i tekrar array'e dönüştür
  const allPosts = Array.from(allPostsMap.values());
  
  // Son işleme tarihi sıralaması
  allPosts.sort((a, b) => {
    const dateA = new Date(a.frontMatter?.date || a.date || 0);
    const dateB = new Date(b.frontMatter?.date || b.date || 0);
    return dateB.getTime() - dateA.getTime();
  });
  
  return <BlogContent initialPosts={allPosts} />;
}