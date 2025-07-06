-- Contact messages tablosuna read alanı ekle
DO $$ 
BEGIN 
  -- read sütunu ekle (yoksa)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'read') THEN
    ALTER TABLE contact_messages ADD COLUMN read BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Read alanı olmayan mevcut mesajları okunmamış olarak işaretle
UPDATE contact_messages SET read = FALSE WHERE read IS NULL; 