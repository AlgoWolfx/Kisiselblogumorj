import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

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

// Dinamik route
export const dynamic = 'force-dynamic';

// POST: 2FA kurulumu için secret oluştur
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    // Kullanıcı bilgisini al
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 400 });
    }
    
    // Kullanıcının admin olup olmadığını kontrol et
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Admin yetkisine sahip değilsiniz' }, { status: 403 });
    }
    
    // 32 byte rastgele bir secret oluştur
    const secretBuffer = crypto.randomBytes(20);
    // Base32 formatına dönüştür (2FA standartı)
    const secret = secretBuffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    // QR kod için OTP Auth URL oluştur
    const issuer = encodeURIComponent('Blog Admin');
    const account = encodeURIComponent(user.email || 'admin');
    const otpAuthUrl = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
    
    return NextResponse.json({
      secret,
      otpAuthUrl
    });
    
  } catch (error: any) {
    console.error('2FA kurulumu sırasında hata:', error);
    return NextResponse.json({ 
      error: error.message || 'İki faktörlü kimlik doğrulama kurulumu başarısız' 
    }, { status: 500 });
  }
} 