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

// GET: Tek bir mesajı getir
export async function GET(req: NextRequest) {
  console.log('GET isteği alındı - Tek Mesaj');
  
  // Admin kontrolü yap
  if (!isAdmin(req)) {
    console.error('Yetkisiz erişim denemesi');
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    
    // URL'den ID parametresini al
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    console.log('Mesaj ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: "Mesaj ID parametresi gerekli" }, { status: 400 });
    }

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

    console.log('Mesaj başarıyla getirildi:', data?.id);
    return NextResponse.json(data || {});
  } catch (error) {
    return handleError(error, 'GET_SINGLE_MESSAGE');
  }
} 