import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/auth';

// Supabase istemcisini oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role key ile admin yetkisiyle bağlanıyoruz (RLS bypass)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Dynamic export - bu route'un statik değil dinamik olduğunu belirtir
export const dynamic = 'force-dynamic';

// Form doğrulama şeması - giriş yapmış kullanıcılar için isim ve email opsiyonel
const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: 'İsim en az 2 karakter olmalıdır.'
  }).max(50, {
    message: 'İsim en fazla 50 karakter olmalıdır.'
  }).optional(),
  email: z.string().email({
    message: 'Geçerli bir e-posta adresi giriniz.'
  }).optional(),
  subject: z.string().min(5, {
    message: 'Konu en az 5 karakter olmalıdır.'
  }).max(100, {
    message: 'Konu en fazla 100 karakter olmalıdır.'
  }),
  message: z.string().min(10, {
    message: 'Mesaj en az 10 karakter olmalıdır.'
  }).max(1000, {
    message: 'Mesaj en fazla 1000 karakter olmalıdır.'
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Giriş yapmış kullanıcının bilgilerini al
    const authUser = await getAuthUser();

    // Form verilerini al
    let data;
    try {
      data = await request.json();
    } catch (error) {
      console.error('JSON ayrıştırma hatası:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Geçersiz form verisi.' 
        }, 
        { status: 400 }
      );
    }

    // Verileri doğrula
    try {
      const validatedData = contactFormSchema.parse(data);
      
      console.log('Form verileri:', validatedData);
      
      // Mesaj verilerini hazırla
      const messageData = {
        name: authUser?.name || validatedData.name,
        email: authUser?.email || validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        read: false,
        user_id: authUser?.id || null
      };

      // Giriş yapmamış kullanıcılar için isim ve email zorunlu
      if (!authUser && (!messageData.name || !messageData.email)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'İsim ve e-posta adresi zorunludur.' 
          }, 
          { status: 400 }
        );
      }
      
      // Service role key kullanarak mesajı kaydet
      const { error } = await supabase
        .from('contact_messages')
        .insert(messageData);
      
      if (error) {
        console.error('Supabase insert hatası:', error);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Mesajınız kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
          },
          { status: 500 }
        );
      }
      
      // Başarılı yanıt
      return NextResponse.json(
        { 
          success: true, 
          message: 'Mesajınız başarıyla alındı. Teşekkürler!' 
        },
        { status: 200 }
      );
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors = validationError.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return NextResponse.json(
          { 
            success: false, 
            message: `Form doğrulama hatası: ${errors}` 
          }, 
          { status: 400 }
        );
      }
      
      throw validationError;
    }
  } catch (error) {
    // Beklenmeyen hatalar
    console.error('İletişim formu hatası:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
      },
      { status: 500 }
    );
  }
} 