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

// TOTP doğrulama için 30 saniyelik geçerlilik aralığı
const TOTP_WINDOW = 1; // ±1 adım (30 saniye önce ve sonra)

// TOTP değerini hesapla
function generateTOTP(secret: string, timeStep = 30, digits = 6): string {
  // Şu anki Unix zamanını al ve zaman adımına böl
  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / timeStep);
  
  // HMAC-SHA1 algoritması kullanarak bir hash oluştur
  const counterBuffer = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = counter & 0xff;
    counter >>>= 8;
  }
  
  // Base64 secret'i Buffer'a dönüştür
  const decodedSecret = secret
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const secretBuffer = Buffer.from(decodedSecret + '==='.slice((decodedSecret.length % 4) || 4), 'base64');
  
  // HMAC-SHA1 hash oluştur
  const hmac = crypto.createHmac('sha1', secretBuffer);
  hmac.update(counterBuffer);
  const hash = hmac.digest();
  
  // Offset hesapla
  const offset = hash[hash.length - 1] & 0xf;
  
  // Kod değerini oluştur
  let code = ((hash[offset] & 0x7f) << 24) |
             ((hash[offset + 1] & 0xff) << 16) |
             ((hash[offset + 2] & 0xff) << 8) |
             (hash[offset + 3] & 0xff);
  
  // İstenen basamak sayısına göre modunu al
  code = code % Math.pow(10, digits);
  
  // Basamak sayısını ayarla
  return code.toString().padStart(digits, '0');
}

// TOTP doğrulama
function verifyTOTP(token: string, secret: string): boolean {
  // Şu anki TOTP değerini hesapla
  const currentCode = generateTOTP(secret);
  
  // Doğrudan eşleşme kontrolü
  if (token === currentCode) {
    return true;
  }
  
  // ±1 zaman aralığı için kontrol
  for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
    if (i === 0) continue; // Şu anki değeri zaten kontrol ettik
    
    const now = Math.floor(Date.now() / 1000);
    const step = 30;
    const counter = Math.floor(now / step) + i;
    
    // Counter için TOTP değerini hesapla
    const counterBuffer = Buffer.alloc(8);
    for (let j = 7; j >= 0; j--) {
      counterBuffer[j] = counter & 0xff;
      counter >>>= 8;
    }
    
    // Base64 secret'i Buffer'a dönüştür
    const decodedSecret = secret
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const secretBuffer = Buffer.from(decodedSecret + '==='.slice((decodedSecret.length % 4) || 4), 'base64');
    
    // HMAC-SHA1 hash oluştur
    const hmac = crypto.createHmac('sha1', secretBuffer);
    hmac.update(counterBuffer);
    const hash = hmac.digest();
    
    // Offset hesapla
    const offset = hash[hash.length - 1] & 0xf;
    
    // Kod değerini oluştur
    let code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);
    
    // 6 basamak için modunu al
    code = code % 1000000;
    
    // 6 basamaklı koda dönüştür
    const windowCode = code.toString().padStart(6, '0');
    
    if (token === windowCode) {
      return true;
    }
  }
  
  return false;
}

// Secret'i şifrele (güvenli depolama için)
function encryptSecret(secret: string): string {
  // Gerçek uygulamada, daha güvenli bir şifreleme yöntemi kullanılmalıdır
  // Bu örnek basit bir şekilde göstermek içindir
  const encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey.padEnd(32, '0')), iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// POST: 2FA kodu doğrulama
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, secret, token } = body;
    
    if (!userId || !secret || !token) {
      return NextResponse.json({ error: 'Gerekli parametreler eksik' }, { status: 400 });
    }
    
    // Token'ın 6 haneli sayı olup olmadığını kontrol et
    if (!/^\d{6}$/.test(token)) {
      return NextResponse.json({ error: 'Geçersiz token formatı' }, { status: 400 });
    }
    
    // Kullanıcı kontrolü
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Kullanıcı doğrulanamadı' }, { status: 403 });
    }
    
    // TOTP doğrulama
    const isValid = verifyTOTP(token, secret);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Geçersiz doğrulama kodu' }, { status: 400 });
    }
    
    // Secret'i şifrele (güvenli depolama için)
    const encryptedSecret = encryptSecret(secret);
    
    // Doğrulama kodu ve sırrı kaydet
    const { error: insertError } = await supabase
      .from('two_factor_codes')
      .insert([
        {
          user_id: userId,
          code: token,
          active: false, // Kullanıldı olarak işaretle
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 dakika
        }
      ]);
      
    if (insertError) {
      console.error('Doğrulama kodu kaydedilirken hata:', insertError);
    }
    
    return NextResponse.json({
      success: true,
      encryptedSecret
    });
    
  } catch (error: any) {
    console.error('2FA doğrulama sırasında hata:', error);
    return NextResponse.json({ 
      error: error.message || 'İki faktörlü kimlik doğrulama başarısız' 
    }, { status: 500 });
  }
} 