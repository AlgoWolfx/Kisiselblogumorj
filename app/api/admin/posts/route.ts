import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Sadece sunucu tarafında erişilebilen service_role anahtarı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Basit admin kontrolü (örn. header ile)
function isAdmin(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  return adminSecret && adminSecret === process.env.NEXT_PUBLIC_ADMIN_SECRET;
}

// POST: Yeni post ekle
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  
  const body = await req.json();
  const { 
    title, 
    slug, 
    content, 
    excerpt, 
    author_id, 
    published_at, 
    cover_image, 
    category 
  } = body;
  
  if (!title || !slug || !content) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
  }
  
  try {
    // Slug kontrolü - zaten var mı?
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('slug', slug)
      .single();
      
    if (existingPost) {
      return NextResponse.json({ error: 'Bu URL zaten kullanımda' }, { status: 409 });
    }
    
    // Yeni yazıyı ekle
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([
        { 
          title, 
          slug, 
          content, 
          excerpt: excerpt || title, 
          author_id: author_id || null, 
          published_at, 
          cover_image,
          published: published_at !== null
        }
      ])
      .select();
      
    if (error) {
      console.error('Blog post eklenirken hata:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Eğer kategori belirtildiyse, önce kategori yoksa oluştur, sonra ilişkilendir
    if (category && data && data.length > 0) {
      const postId = data[0].id;
      
      try {
        // Önce kategoriyi bul veya oluştur
        const categorySlug = category.toLowerCase().trim()
          .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, '')
          .replace(/\s+/g, '-');
        
        // Kategoriyi bul
        let { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .single();
          
        // Kategori yoksa oluştur
        if (categoryError && categoryError.code === 'PGRST116') {
          const { data: newCategory, error: newCategoryError } = await supabase
            .from('categories')
            .insert([
              { 
                name: category,
                slug: categorySlug
              }
            ])
            .select();
            
          if (newCategoryError) {
            console.error('Kategori oluşturulurken hata:', newCategoryError);
          } else {
            categoryData = newCategory?.[0];
          }
        }
        
        // Kategori varsa bağlantıyı kur
        if (categoryData && categoryData.id) {
          const { error: linkError } = await supabase
            .from('post_categories')
            .insert([
              { 
                post_id: postId,
                category_id: categoryData.id
              }
            ]);
            
          if (linkError) {
            console.error('Kategori ilişkisi kurulurken hata:', linkError);
          }
        }
      } catch (categoryErr) {
        console.error('Kategori işlemleri sırasında hata:', categoryErr);
      }
    }
    
    return NextResponse.json({ success: true, post: data?.[0] });
  } catch (error: any) {
    console.error('Blog yazısı eklenirken genel hata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Post sil
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  
  const { slug } = await req.json();
  
  if (!slug) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
  }
  
  try {
    // Önce yazıyı bul (ilgili görselleri silmek için)
    const { data: post, error: findError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
      
    if (findError && findError.code !== 'PGRST116') {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }
    
    if (post) {
      // Önce yazı-kategori ilişkilerini sil
      const { error: categoryLinkError } = await supabase
        .from('post_categories')
        .delete()
        .eq('post_id', post.id);
        
      if (categoryLinkError) {
        console.error('Kategori ilişkileri silinirken hata:', categoryLinkError);
      }
      
      // Önce yazı-etiket ilişkilerini sil
      const { error: tagLinkError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', post.id);
        
      if (tagLinkError) {
        console.error('Etiket ilişkileri silinirken hata:', tagLinkError);
      }
    }
    
    // Yazıyı sil
    const { error: deleteError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('slug', slug);
      
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 