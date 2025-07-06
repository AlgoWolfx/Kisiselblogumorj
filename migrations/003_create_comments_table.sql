-- UUID eklentisini etkinleştir (eğer henüz değilse)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Yorumlar tablosu kontrol et ve oluştur
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'comments'
  ) THEN
    -- Tablo yoksa oluştur
    CREATE TABLE comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      post_id TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      content TEXT NOT NULL
    );
    
    -- RLS Ayarları
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    
    -- Tüm kullanıcıların okuma yetkisi
    CREATE POLICY "Herkes yorumları okuyabilir" ON comments
      FOR SELECT USING (true);
    
    -- Sadece giriş yapmış kullanıcılar yorum yazabilir
    CREATE POLICY "Giriş yapmış kullanıcılar yorum yazabilir" ON comments
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Sadece yorum sahibi yorumunu silebilir
    CREATE POLICY "Kullanıcılar kendi yorumlarını silebilir" ON comments
      FOR DELETE USING (auth.uid() = user_id);
  ELSE
    -- Tablo varsa, yapısını kontrol et ve gerekirse güncelle
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'comments' AND column_name = 'post_id' AND data_type = 'text'
    ) THEN
      -- post_id tipini TEXT olarak güncelle
      ALTER TABLE comments ALTER COLUMN post_id TYPE TEXT;
    END IF;
  END IF;
END
$$;

-- Güncelleme zamanı için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Profil fotoğrafı için avatar_url sütununu profiles tablosuna ekleyin (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$; 