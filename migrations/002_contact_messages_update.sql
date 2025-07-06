-- Eğer tablo yoksa oluştur
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL
);

-- Gerekli sütunları kontrol et ve ekle
DO $$ 
BEGIN 
  -- subject sütunu ekle (yoksa)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'subject') THEN
    ALTER TABLE contact_messages ADD COLUMN subject TEXT;
  END IF;
  
  -- user_id sütunu ekle (yoksa)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'user_id') THEN
    ALTER TABLE contact_messages ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$; 