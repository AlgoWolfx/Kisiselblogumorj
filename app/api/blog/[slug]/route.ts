import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug parametresi gerekli' }, { status: 400 });
    }

    // Supabase'den belirli bir blog yazısını al
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
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      console.error('Blog yazısı alınırken hata:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Blog yazısı bulunamadı' }, { status: 404 });
    }

    // Veriyi frontend'in beklediği formata dönüştür
    // Kategorileri düzenle
    const categories = data.categories?.map((c: { category: { id: number; name: string; slug: string } }) => c.category) || [];
    const mainCategory = categories.length > 0 ? categories[0] : null;
    
    // Etiketleri düzenle
    const tags = data.tags?.map((t: { tag: { id: number; name: string; slug: string } }) => t.tag.name) || [];
    
    const formattedPost = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      author: data.author?.full_name || data.author?.username || 'Anonim',
      author_id: data.author_id,
      date: data.published_at || data.created_at,
      readTime: data.read_time || 5,
      coverImage: data.cover_image,
      category: mainCategory?.name || 'Genel',
      categorySlug: mainCategory?.slug || 'genel',
      tags,
      // MDX işleme için gerekli
      frontMatter: {
        title: data.title,
        excerpt: data.excerpt,
        coverImage: data.cover_image,
        date: data.published_at || data.created_at,
        author: data.author?.full_name || data.author?.username || 'Anonim',
        readTime: data.read_time || 5,
        category: mainCategory?.name || 'Genel',
        tags
      }
    };

    return NextResponse.json({ post: formattedPost });
  } catch (error: any) {
    console.error('Blog yazısı API hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 