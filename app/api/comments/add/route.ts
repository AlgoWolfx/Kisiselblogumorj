import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// Yorum eklemek için API endpoint
export async function POST(request: NextRequest) {
  try {
    // İstek verilerini al
    const body = await request.json();
    const { postSlug, content } = body;
    
    // Parametreleri kontrol et
    if (!postSlug || !content) {
      return NextResponse.json(
        { error: 'Geçersiz parametreler' },
        { status: 400 }
      );
    }

    // Çerezleri al ve içeriğini kontrol et (debug için)
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    console.log("API'de mevcut çerezler:", allCookies.map(c => c.name));

    // Supabase istemcisini oluştur
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore
    });
    
    // Kullanıcı oturumunu kontrol et
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Oturum hatası kontrolü
    if (sessionError) {
      console.error("Oturum kontrolü hatası:", sessionError);
      return NextResponse.json(
        { 
          error: 'Oturum doğrulama hatası',
          details: sessionError.message,
          friendlyMessage: 'Oturumunuz doğrulanamadı. Lütfen tekrar giriş yapın.'
        },
        { status: 401 }
      );
    }
    
    // Oturum yoksa bilgi mesajı gönder
    if (!session || !session.user) {
      console.error("API: Aktif oturum bulunamadı");
      return NextResponse.json(
        { 
          error: 'Yorum yapmak için giriş yapmalısınız',
          friendlyMessage: 'Yorum yapabilmek için lütfen giriş yapın veya hesap oluşturun.'
        },
        { status: 401 }
      );
    }
    
    console.log("API: Aktif oturum bulundu, kullanıcı:", session.user.email);
    const userId = session.user.id;
    
    // Blog post ID'sini bul
    const { data: postData, error: postError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', postSlug)
      .single();
    
    if (postError || !postData) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı' },
        { status: 404 }
      );
    }
    
    const postId = postData.id;
    
    // Yorumu ekle
    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content
      })
      .select();
    
    if (commentError) {
      return NextResponse.json(
        { 
          error: 'Yorum eklenirken bir hata oluştu', 
          details: commentError.message,
          friendlyMessage: 'Yorumunuz eklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.'
        },
        { status: 500 }
      );
    }
    
    // Yorumu döndür
    const safeComment = {
      id: commentData[0].id,
      content: commentData[0].content,
      created_at: commentData[0].created_at,
    };
    
    console.log("Yorum başarıyla eklendi:", commentData[0].id);
    
    return NextResponse.json({ 
      success: true, 
      comment: safeComment
    });
    
  } catch (error) {
    console.error("API hatası:", error);
    return NextResponse.json(
      { 
        error: 'Sunucu hatası', 
        friendlyMessage: 'Bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.'
      },
      { status: 500 }
    );
  }
} 