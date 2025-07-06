import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Yorumları ID'ye göre getir
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json(
      { error: 'Slug parametresi gereklidir' },
      { status: 400 }
    );
  }
  
  try {
    // Önce blog post ID'sini bul
    const { data: postData, error: postError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (postError || !postData) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Yorumları çek
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id, 
        content, 
        created_at, 
        user_id,
        post_id
      `)
      .eq('post_id', postData.id)
      .order('created_at', { ascending: false });
    
    if (commentsError) {
      return NextResponse.json(
        { error: 'Yorumlar alınırken bir hata oluştu' },
        { status: 500 }
      );
    }
    
    // Kullanıcı bilgilerini toplu olarak alalım
    const userIds = comments.map(comment => comment.user_id);
    
    // Benzersiz kullanıcı ID'lerini alalım
    const uniqueUserIds = Array.from(new Set(userIds));
    
    // Kullanıcı bilgilerini çekelim
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', uniqueUserIds);
    
    if (usersError) {
      return NextResponse.json(
        { error: 'Kullanıcı bilgileri alınırken bir hata oluştu' },
        { status: 500 }
      );
    }
    
    // Kullanıcı ID'sine göre bir arama tablosu oluşturalım
    const usersMap = users.reduce((acc: any, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
    
    // Yorumları kullanıcı bilgileriyle birleştirelim
    const commentsWithUsers = comments.map(comment => ({
      ...comment,
      user: usersMap[comment.user_id] || {
        username: 'İsimsiz',
        full_name: 'Kullanıcı',
        avatar_url: null
      }
    }));
    
    // API yanıtını önbelleğe almayı aktif edelim
    return NextResponse.json({ comments: commentsWithUsers }, {
      headers: {
        'Cache-Control': 'max-age=60, stale-while-revalidate=600'
      }
    });
    
  } catch (error) {
    console.error('Yorumlar alınırken hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 