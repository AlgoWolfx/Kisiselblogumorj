import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

// Yorum silmek için API endpoint
export async function DELETE(request: NextRequest) {
  try {
    console.log("Yorum silme isteği başladı");
    
    const searchParams = request.nextUrl.searchParams;
    const commentId = searchParams.get('id');
    console.log("Silinecek yorum ID:", commentId);
    
    if (!commentId) {
      console.log("Yorum ID bulunamadı");
      return NextResponse.json(
        { error: 'Yorum ID gereklidir' },
        { status: 400 }
      );
    }
    
    console.log("Kullanıcı kimliği doğrulanıyor...");
    
    // Route handler için Supabase istemcisi oluştur
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Oturum bilgisini al
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Oturum yanıtı alındı:", JSON.stringify(session || {}));
    
    if (!session) {
      console.log("Oturum bulunamadı");
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    // Yorum sahibinin kimliğini kontrol et
    console.log("Yorum bilgileri alınıyor...");
    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();
    
    console.log("Yorum bilgileri yanıtı:", JSON.stringify({ data: commentData, error: commentError }));
    
    if (commentError || !commentData) {
      console.log("Yorum bulunamadı:", commentError);
      return NextResponse.json(
        { error: 'Yorum bulunamadı' },
        { status: 404 }
      );
    }
    
    const userId = session.user.id;
    const commentUserId = commentData.user_id;
    
    // Kullanıcının kendi yorumunu sildiğinden emin ol
    console.log("Yetki kontrolü...", { userId, commentUserId });
    if (commentUserId !== userId) {
      console.log("Yetki hatası: Kullanıcı kendi yorumunu silmiyor");
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    
    // Yorumu sil
    console.log("Yorum siliniyor...");
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    console.log("Silme yanıtı:", JSON.stringify({ error: deleteError }));
    
    if (deleteError) {
      console.error('Yorum silme hatası:', deleteError);
      return NextResponse.json(
        { error: 'Yorum silinirken bir hata oluştu', details: deleteError },
        { status: 500 }
      );
    }
    
    console.log("Yorum başarıyla silindi");
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Yorum silinirken beklenmeyen hata:', error);
    
    // Hata detaylarını döndür
    let errorMessage = 'Sunucu hatası';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
} 