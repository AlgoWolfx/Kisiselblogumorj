import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Sadece sunucu tarafında erişilebilen service_role anahtarı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Basit admin kontrolü
function isAdmin(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  return adminSecret && adminSecret === process.env.NEXT_PUBLIC_ADMIN_SECRET;
}

// POST: Storage bucket'larını oluştur
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  
  try {
    // blog_images bucket'ını oluştur
    const { data: blogImagesData, error: blogImagesError } = await supabase.storage.createBucket(
      'blog_images',
      {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      }
    );
    
    if (blogImagesError && blogImagesError.message !== 'Bucket already exists') {
      return NextResponse.json({
        error: `blog_images bucket oluşturulurken hata: ${blogImagesError.message}`
      }, { status: 500 });
    }

    // blog_covers bucket'ını oluştur
    const { data: blogCoversData, error: blogCoversError } = await supabase.storage.createBucket(
      'blog_covers',
      {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      }
    );
    
    if (blogCoversError && blogCoversError.message !== 'Bucket already exists') {
      return NextResponse.json({
        error: `blog_covers bucket oluşturulurken hata: ${blogCoversError.message}`
      }, { status: 500 });
    }

    // Dosya yükleme izinlerini ayarla
    const { error: blogImagesUpdateError } = await supabase.storage.from('blog_images')
      .setPublic(true);
    
    if (blogImagesUpdateError) {
      return NextResponse.json({
        error: `blog_images için izinler ayarlanırken hata: ${blogImagesUpdateError.message}`
      }, { status: 500 });
    }

    const { error: blogCoversUpdateError } = await supabase.storage.from('blog_covers')
      .setPublic(true);
    
    if (blogCoversUpdateError) {
      return NextResponse.json({
        error: `blog_covers için izinler ayarlanırken hata: ${blogCoversUpdateError.message}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Storage bucket\'ları başarıyla oluşturuldu'
    });
  } catch (error: any) {
    return NextResponse.json({
      error: `Storage bucket'ları oluşturulurken hata: ${error.message}`
    }, { status: 500 });
  }
} 