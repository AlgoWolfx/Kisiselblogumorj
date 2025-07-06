import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Supabase istemcisi oluştur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Dinamik route
export const dynamic = 'force-dynamic';

// Admin e-posta adresi (Ortam değişkenlerinden alınır)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
// Bildirim e-postaları için SMTP yapılandırması
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.example.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || 'user@example.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@example.com';

// E-posta transport objesi oluştur
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// POST: Giriş bildirimini e-posta olarak gönder
export async function POST(req: NextRequest) {
  try {
    // Request body'den verileri al
    const body = await req.json();
    const { userEmail, ip, userAgent, timestamp } = body;
    
    if (!userEmail || !ip || !userAgent || !timestamp) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }
    
    // E-posta gönderimi için HTML içeriği oluştur
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">Admin Paneli Giriş Bildirimi</h2>
        
        <p style="font-size: 16px; color: #333;">Yönetici panelinize yeni bir giriş yapıldı.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold; width: 120px;">Kullanıcı:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Tarih/Saat:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${new Date(timestamp).toLocaleString('tr-TR')}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">IP Adresi:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${ip}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Tarayıcı:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${userAgent}</td>
          </tr>
        </table>
        
        <p style="margin-top: 20px; font-size: 14px; color: #666;">Bu giriş işlemini siz gerçekleştirmediyseniz, lütfen acilen şifrenizi değiştirin ve güvenlik önlemlerini gözden geçirin.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; text-align: center;">
          Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
        </div>
      </div>
    `;
    
    // E-posta gönderme işlemi
    const mailOptions = {
      from: `"Admin Güvenlik" <${EMAIL_FROM}>`,
      to: ADMIN_EMAIL,
      subject: `Yönetici Paneli Giriş Bildirimi - ${new Date(timestamp).toLocaleString('tr-TR')}`,
      html: htmlContent,
    };
    
    try {
      // E-posta gönderimi
      await transporter.sendMail(mailOptions);
      
      // Başarılı yanıt
      return NextResponse.json({ success: true });
    } catch (emailError) {
      console.error('E-posta gönderilirken hata:', emailError);
      
      // E-posta gönderimi başarısız olsa bile, bildirim kaydını veritabanına ekle
      const { error: logError } = await supabase
        .from('admin_notifications')
        .insert([
          {
            type: 'login',
            email: userEmail,
            details: JSON.stringify({ ip, userAgent, timestamp }),
            is_email_sent: false
          }
        ]);
        
      if (logError) {
        console.error('Bildirim kaydedilirken hata:', logError);
      }
      
      // E-posta gönderilemedi ancak bildirim kaydedildi
      return NextResponse.json({ 
        success: false, 
        message: 'E-posta gönderilemedi ancak bildirim kaydedildi',
      });
    }
    
  } catch (error: any) {
    console.error('Giriş bildirimi işlenirken hata:', error);
    return NextResponse.json({ 
      error: `İşlem sırasında hata oluştu: ${error.message}` 
    }, { status: 500 });
  }
} 