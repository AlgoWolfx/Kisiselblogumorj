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

// Dinamik route
export const dynamic = 'force-dynamic';

// POST: Güvenlik tablolarını kur
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }
  
  try {
    // 1. Admin giriş logları tablosunu oluştur
    const { error: loginLogsError } = await supabase.rpc('create_admin_login_logs_if_not_exists');
    
    if (loginLogsError && !loginLogsError.message.includes('already exists')) {
      return NextResponse.json({
        error: `Admin giriş logları tablosu oluşturulurken hata: ${loginLogsError.message}`
      }, { status: 500 });
    }
    
    // 2. İki faktörlü doğrulama kodları tablosunu oluştur
    const { error: twoFactorCodesError } = await supabase.rpc('create_two_factor_codes_if_not_exists');
    
    if (twoFactorCodesError && !twoFactorCodesError.message.includes('already exists')) {
      return NextResponse.json({
        error: `İki faktörlü doğrulama kodları tablosu oluşturulurken hata: ${twoFactorCodesError.message}`
      }, { status: 500 });
    }
    
    // 3. Profil tablosuna two_factor_enabled alanı ekle
    const { error: alterProfilesError } = await supabase.rpc('add_two_factor_to_profiles_if_not_exists');
    
    if (alterProfilesError && !alterProfilesError.message.includes('already exists')) {
      return NextResponse.json({
        error: `Profil tablosu güncellenirken hata: ${alterProfilesError.message}`
      }, { status: 500 });
    }
    
    // 4. Oturum kilitleme tablosunu oluştur
    const { error: lockoutsError } = await supabase.rpc('create_account_lockouts_if_not_exists');
    
    if (lockoutsError && !lockoutsError.message.includes('already exists')) {
      return NextResponse.json({
        error: `Oturum kilitleme tablosu oluşturulurken hata: ${lockoutsError.message}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Güvenlik tabloları başarıyla oluşturuldu'
    });
  } catch (error: any) {
    return NextResponse.json({
      error: `Güvenlik tabloları oluşturulurken hata: ${error.message}`
    }, { status: 500 });
  }
} 