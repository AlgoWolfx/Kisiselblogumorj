import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Supabase'den yayınlanmış blog yazılarını al
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:profiles(username, full_name, avatar_url),
        categories:post_categories(
          category:categories(id, name, slug)
        ),
        tags:post_tags(
          tag:tags(id, name, slug)
        )
      `)
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Blog yazıları alınırken hata:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Veriyi frontend'in beklediği formata dönüştür
    const formattedPosts = data.map(post => {
      // Kategorileri düzenle
      const categories = post.categories?.map((c: { category: { id: number; name: string; slug: string } }) => c.category) || [];
      const mainCategory = categories.length > 0 ? categories[0] : null;
      
      // Etiketleri düzenle
      const tags = post.tags?.map((t: { tag: { id: number; name: string; slug: string } }) => t.tag.name) || [];
      
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author?.full_name || post.author?.username || 'Anonim',
        date: post.published_at || post.created_at,
        readTime: post.read_time || 5,
        coverImage: post.cover_image,
        category: mainCategory?.name || 'Genel',
        categorySlug: mainCategory?.slug || 'genel',
        tags,
        // MDX işleme için gerekli
        frontMatter: {
          title: post.title,
          excerpt: post.excerpt,
          coverImage: post.cover_image,
          date: post.published_at || post.created_at,
          author: post.author?.full_name || post.author?.username || 'Anonim',
          readTime: post.read_time || 5,
          category: mainCategory?.name || 'Genel',
          tags
        }
      };
    });

    return NextResponse.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error('Blog API hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 