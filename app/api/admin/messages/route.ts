import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase URL ve key kontrolü
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase yapılandırması eksik:', {
    url: !!supabaseUrl,
    serviceKey: !!supabaseServiceKey
  });
  throw new Error('Supabase yapılandırması eksik');
}

// Sadece sunucu tarafında erişilebilen service_role anahtarı
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

// Yeni implementasyon
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase yapılandırması eksik. Lütfen .env dosyasını kontrol edin.');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
};

// Basit admin kontrolü (örn. header ile)
function isAdmin(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  const expectedSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;

  if (!expectedSecret) {
    console.error('NEXT_PUBLIC_ADMIN_SECRET tanımlanmamış');
    return false;
  }

  const isValid = adminSecret && adminSecret === expectedSecret;
  if (!isValid) {
    console.error('Admin doğrulama başarısız:', {
      hasAdminSecret: !!adminSecret,
      secretMatch: adminSecret === expectedSecret
    });
  }
  return isValid;
}

// Dynamic export - bu route'un statik değil dinamik olduğunu belirtir
export const dynamic = 'force-dynamic';

// Hata yönetimi için yardımcı fonksiyon
const handleError = (error: any, operation: string) => {
  let message = 'Bilinmeyen bir hata oluştu';
  let status = 500;

  if (error instanceof Error) {
    message = error.message;
  }

  // Supabase hatalarını kontrol et
  if (error?.code === 'PGRST301') {
    message = 'Veritabanı bağlantı hatası';
    status = 503;
  }

  console.error(`[${operation}] Hata:`, {
    message,
    error,
    stack: error instanceof Error ? error.stack : undefined
  });

  return NextResponse.json(
    { error: message },
    { status }
  );
};

// GET: Tüm mesajları getir
export async function GET(req: NextRequest) {
  console.log('GET isteği alındı');
  
  // Admin kontrolü yap
  if (!isAdmin(req)) {
    console.error('Yetkisiz erişim denemesi');
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    
    // URL'den parametreleri al
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');
    const id = searchParams.get('id');
    
    console.log('Parametreler:', { filter, id });

    // Eğer ID varsa, tek bir mesajı getir
    if (id) {
      // Tekli mesaj sorgusu
      const { data, error } = await supabase
        .from('contact_messages')
        .select(`
          id,
          name,
          email,
          subject,
          message,
          created_at,
          read,
          avatar_url,
          user_id,
          profiles(avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase sorgu hatası:', error);
        return handleError(error, 'GET_SINGLE_MESSAGE');
      }

      return NextResponse.json(data || {});
    }

    // Tüm mesajlar için sorgu
    let query = supabase
      .from('contact_messages')
      .select(`
        id,
        name,
        email,
        subject,
        message,
        created_at,
        read,
        avatar_url,
        user_id,
        profiles(avatar_url)
      `);

    // Filtreleme işlemi
    if (filter === 'read') {
      query = query.eq('read', true);
    } else if (filter === 'unread') {
      query = query.eq('read', false);
    }

    // Sonuçları tarihe göre sırala
    query = query.order('created_at', { ascending: false });

    console.log('Supabase sorgusu yapılıyor...');
    
    // Sorguyu çalıştır
    const { data, error } = await query;

    if (error) {
      console.error('Supabase sorgu hatası:', error);
      return handleError(error, 'GET_MESSAGES');
    }

    console.log(`${data?.length || 0} mesaj başarıyla getirildi`);
    return NextResponse.json(data || []);
  } catch (error) {
    return handleError(error, 'GET_MESSAGES');
  }
}

// PUT: Mesaj güncelle (okundu/okunmadı)
export async function PUT(req: NextRequest) {
  console.log('PUT isteği alındı');
  
  // Admin kontrolü yap
  if (!isAdmin(req)) {
    console.error('Yetkisiz erişim denemesi');
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { id, read } = body;

    console.log('Güncelleme isteği:', { id, read });

    if (!id) {
      return NextResponse.json(
        { error: "Mesaj ID gereklidir" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .update({ read: read })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase güncelleme hatası:', error);
      return handleError(error, 'UPDATE_MESSAGE');
    }

    console.log('Mesaj başarıyla güncellendi:', data?.[0]?.id);
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    return handleError(error, 'UPDATE_MESSAGE');
  }
}

// DELETE: Mesaj sil
export async function DELETE(req: NextRequest) {
  console.log('DELETE isteği alındı');
  
  // Admin kontrolü yap
  if (!isAdmin(req)) {
    console.error('Yetkisiz erişim denemesi');
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    console.log('Silinecek mesaj ID:', id);

    if (!id) {
      return NextResponse.json(
        { error: "Mesaj ID gereklidir" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase silme hatası:', error);
      return handleError(error, 'DELETE_MESSAGE');
    }

    console.log('Mesaj başarıyla silindi:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, 'DELETE_MESSAGE');
  }
} 