import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  createAdminLoginLogsSQL,
  createTwoFactorCodesSQL,
  addTwoFactorToProfilesSQL,
  createAccountLockoutsSQL
} from './sql-functions';

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

// POST: SQL fonksiyonlarını ve tabloları oluştur
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }
  
  try {
    // Admin giriş logları fonksiyonunu oluştur
    const { error: loginLogsFuncError } = await supabase.rpc(
      'run_sql_query',
      { query: createAdminLoginLogsSQL }
    );
    
    if (loginLogsFuncError) {
      console.error('Admin giriş logları fonksiyonu oluşturulurken hata:', loginLogsFuncError);
    }
    
    // İki faktörlü doğrulama kodları fonksiyonunu oluştur
    const { error: twoFactorCodesFuncError } = await supabase.rpc(
      'run_sql_query',
      { query: createTwoFactorCodesSQL }
    );
    
    if (twoFactorCodesFuncError) {
      console.error('İki faktörlü doğrulama kodları fonksiyonu oluşturulurken hata:', twoFactorCodesFuncError);
    }
    
    // Profil tablosuna two_factor_enabled alanı ekleyen fonksiyonu oluştur
    const { error: addTwoFactorFuncError } = await supabase.rpc(
      'run_sql_query',
      { query: addTwoFactorToProfilesSQL }
    );
    
    if (addTwoFactorFuncError) {
      console.error('Profil tablosu güncelleme fonksiyonu oluşturulurken hata:', addTwoFactorFuncError);
    }
    
    // Oturum kilitleme tablosunu oluşturan fonksiyonu oluştur
    const { error: accountLockoutsFuncError } = await supabase.rpc(
      'run_sql_query',
      { query: createAccountLockoutsSQL }
    );
    
    if (accountLockoutsFuncError) {
      console.error('Oturum kilitleme tablosu fonksiyonu oluşturulurken hata:', accountLockoutsFuncError);
    }
    
    // Oluşturulan fonksiyonları çalıştır
    // 1. Admin giriş logları tablosunu oluştur
    const { error: loginLogsError } = await supabase.rpc('create_admin_login_logs_if_not_exists');
    
    if (loginLogsError) {
      console.error('Admin giriş logları tablosu oluşturulurken hata:', loginLogsError);
    }
    
    // 2. İki faktörlü doğrulama kodları tablosunu oluştur
    const { error: twoFactorCodesError } = await supabase.rpc('create_two_factor_codes_if_not_exists');
    
    if (twoFactorCodesError) {
      console.error('İki faktörlü doğrulama kodları tablosu oluşturulurken hata:', twoFactorCodesError);
    }
    
    // 3. Profil tablosuna two_factor_enabled alanı ekle
    const { error: alterProfilesError } = await supabase.rpc('add_two_factor_to_profiles_if_not_exists');
    
    if (alterProfilesError) {
      console.error('Profil tablosu güncellenirken hata:', alterProfilesError);
    }
    
    // 4. Oturum kilitleme tablosunu oluştur
    const { error: lockoutsError } = await supabase.rpc('create_account_lockouts_if_not_exists');
    
    if (lockoutsError) {
      console.error('Oturum kilitleme tablosu oluşturulurken hata:', lockoutsError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Güvenlik tabloları başarıyla oluşturuldu',
      errors: {
        loginLogsFuncError,
        twoFactorCodesFuncError,
        addTwoFactorFuncError,
        accountLockoutsFuncError,
        loginLogsError,
        twoFactorCodesError,
        alterProfilesError,
        lockoutsError
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: `Güvenlik tabloları oluşturulurken hata: ${error.message}`
    }, { status: 500 });
  }
} 