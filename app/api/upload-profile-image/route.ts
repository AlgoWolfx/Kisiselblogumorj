import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// .env.local dosyasındaki değişkenleri kullan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role ile Supabase client oluştur (admin yetkilerine sahip)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Formdata'yı parse et
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }
    
    // Dosyayı buffer'a dönüştür
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Benzersiz dosya adı oluştur
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = fileName;
    
    console.log(`Dosya yükleniyor: ${filePath}, Boyut: ${buffer.length} bytes`);
    
    // Profile-images bucket'ı yoksa oluştur
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'profile-images');
    
    if (!bucketExists) {
      const { data, error } = await supabaseAdmin.storage.createBucket('profile-images', {
        public: true
      });
      
      if (error) {
        console.error('Bucket oluşturma hatası:', error);
        return NextResponse.json(
          { error: `Bucket oluşturulamadı: ${error.message}` },
          { status: 500 }
        );
      }
    }
    
    // Dosyayı Supabase Storage'a yükle (admin yetkisiyle)
    const { data, error } = await supabaseAdmin.storage
      .from('profile-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Dosya yükleme hatası:', error);
      return NextResponse.json(
        { error: `Dosya yüklenemedi: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Public URL'i al
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('profile-images')
      .getPublicUrl(filePath);
    
    return NextResponse.json({ 
      url: publicUrlData.publicUrl,
      success: true 
    });
    
  } catch (error) {
    console.error('Resim yükleme işleminde hata:', error);
    return NextResponse.json(
      { error: 'Resim yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 