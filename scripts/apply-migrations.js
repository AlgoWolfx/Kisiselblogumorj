// Supabase migrasyonlarını uygulamak için script
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase bağlantısı
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rsopyxqqwytwplsqoxgk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzb3B5eHFxd3l0d3Bsc3FveGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzg0NTAsImV4cCI6MjA2MzI1NDQ1MH0.w2hlgz7l8Y_tICxPLTi1-KZaCAKB3mijk1SLfv9yyT0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Migrasyon dosyaları
const migrationsDir = path.join(__dirname, '..', 'migrations');

async function applyMigrations() {
  try {
    console.log('Migrasyonlar uygulanıyor...');
    
    // Dosyaları oku
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log('Bulduğumuz migrasyon dosyaları:', files);
    
    // Önce 003_create_comments_table.sql dosyasını özellikle işleyelim
    const commentsTableFile = files.find(file => file.includes('comments_table'));
    if (commentsTableFile) {
      await processMigrationFile(commentsTableFile);
    }
    
    // Diğer dosyaları işleyelim
    for (const file of files) {
      if (file !== commentsTableFile) {
        await processMigrationFile(file);
      }
    }
    
    console.log(`Toplam ${files.length} migrasyon dosyası işlendi.`);
    console.log("Bu sorguları Supabase Studio SQL Editörü'nde çalıştırdıktan sonra uygulamanızı yeniden başlatın.");
  } catch (error) {
    console.error('Migrasyon hatası:', error);
  }
}

async function processMigrationFile(file) {
  try {
    console.log(`${file} işleniyor...`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // SQL'i ekrana yazdır
    console.log('--------------------------------------------------');
    console.log('SQL SORGUSU:');
    console.log(sql);
    console.log('--------------------------------------------------');
    
    // Yorum tablosu sorgusu için özel kontrol
    if (file.includes('comments_table')) {
      console.log('COMMENTS TABLOSU GÜNCELLENİYOR:');
      console.log('Aşağıdaki hususlara dikkat edin:');
      console.log('1. post_id alanının TEXT tipinde olduğundan emin olun');
      console.log('2. Tablo varsa ALTER TABLE ile güncelleyin, CREATE TABLE IF NOT EXISTS kullanın');
      console.log('3. Row Level Security (RLS) ayarlarının doğru yapılandırıldığından emin olun');
    }
    
    console.log(`Bu SQL sorgusunu Supabase Studio SQL Editörü'nde çalıştırın.`);
    console.log('');
  } catch (error) {
    console.error(`${file} işlenirken hata:`, error);
  }
}

applyMigrations(); 