// Tablo oluşturma SQL fonksiyonları

// Admin giriş logları tablosunu oluşturan SQL fonksiyon
export const createAdminLoginLogsSQL = `
CREATE OR REPLACE FUNCTION create_admin_login_logs_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_login_logs') THEN
    CREATE TABLE public.admin_login_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT NOT NULL,
      success BOOLEAN NOT NULL DEFAULT false,
      ip_address TEXT,
      user_agent TEXT,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    
    -- İndeksler ekle
    CREATE INDEX admin_login_logs_email_idx ON public.admin_login_logs(email);
    CREATE INDEX admin_login_logs_timestamp_idx ON public.admin_login_logs(timestamp);
    CREATE INDEX admin_login_logs_success_idx ON public.admin_login_logs(success);
    
    -- RLS politikaları
    ALTER TABLE public.admin_login_logs ENABLE ROW LEVEL SECURITY;
    
    -- Sadece yöneticilerin görebileceği politika
    CREATE POLICY admin_login_logs_select_policy
      ON public.admin_login_logs
      FOR SELECT
      USING (
        auth.uid() IN (
          SELECT id FROM public.profiles 
          WHERE role = 'admin'
        )
      );
      
    -- Herkes kendi girişini ekleyebilir
    CREATE POLICY admin_login_logs_insert_policy
      ON public.admin_login_logs
      FOR INSERT
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;
`;

// İki faktörlü doğrulama kodları tablosunu oluşturan SQL fonksiyon
export const createTwoFactorCodesSQL = `
CREATE OR REPLACE FUNCTION create_two_factor_codes_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'two_factor_codes') THEN
    CREATE TABLE public.two_factor_codes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
      active BOOLEAN NOT NULL DEFAULT true
    );
    
    -- İndeksler ekle
    CREATE INDEX two_factor_codes_user_id_idx ON public.two_factor_codes(user_id);
    CREATE INDEX two_factor_codes_active_idx ON public.two_factor_codes(active);
    CREATE INDEX two_factor_codes_expires_at_idx ON public.two_factor_codes(expires_at);
    
    -- RLS politikaları
    ALTER TABLE public.two_factor_codes ENABLE ROW LEVEL SECURITY;
    
    -- Kullanıcılar kendi kodlarına erişebilir
    CREATE POLICY two_factor_codes_select_policy
      ON public.two_factor_codes
      FOR SELECT
      USING (auth.uid() = user_id);
      
    -- Yöneticiler tüm kodlara erişebilir
    CREATE POLICY two_factor_codes_select_admin_policy
      ON public.two_factor_codes
      FOR SELECT
      USING (
        auth.uid() IN (
          SELECT id FROM public.profiles 
          WHERE role = 'admin'
        )
      );
      
    -- Kullanıcılar kendi kodlarını güncelleyebilir
    CREATE POLICY two_factor_codes_update_policy
      ON public.two_factor_codes
      FOR UPDATE
      USING (auth.uid() = user_id);
      
    -- Herkes kod oluşturabilir
    CREATE POLICY two_factor_codes_insert_policy
      ON public.two_factor_codes
      FOR INSERT
      WITH CHECK (true);
      
    -- Süresi dolmuş kodları otomatik silen tetikleyici
    CREATE OR REPLACE FUNCTION cleanup_expired_two_factor_codes()
    RETURNS trigger AS $$
    BEGIN
      DELETE FROM public.two_factor_codes
      WHERE expires_at < now() OR (active = false AND created_at < (now() - interval '1 day'));
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS cleanup_expired_codes_trigger ON public.two_factor_codes;
    CREATE TRIGGER cleanup_expired_codes_trigger
      AFTER INSERT ON public.two_factor_codes
      EXECUTE PROCEDURE cleanup_expired_two_factor_codes();
  END IF;
END;
$$ LANGUAGE plpgsql;
`;

// Profil tablosuna two_factor_enabled alanı ekleyen SQL fonksiyon
export const addTwoFactorToProfilesSQL = `
CREATE OR REPLACE FUNCTION add_two_factor_to_profiles_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'two_factor_enabled'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
    
    COMMENT ON COLUMN public.profiles.two_factor_enabled IS 'İki faktörlü doğrulama etkin mi?';
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'two_factor_secret'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN two_factor_secret TEXT;
    
    COMMENT ON COLUMN public.profiles.two_factor_secret IS 'İki faktörlü doğrulama sırrı (şifrelenmiş)';
  END IF;
END;
$$ LANGUAGE plpgsql;
`;

// Oturum kilitleme tablosunu oluşturan SQL fonksiyon
export const createAccountLockoutsSQL = `
CREATE OR REPLACE FUNCTION create_account_lockouts_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'account_lockouts') THEN
    CREATE TABLE public.account_lockouts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT NOT NULL UNIQUE,
      failed_attempts INT NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ip_address TEXT
    );
    
    -- İndeksler ekle
    CREATE INDEX account_lockouts_email_idx ON public.account_lockouts(email);
    CREATE INDEX account_lockouts_locked_until_idx ON public.account_lockouts(locked_until);
    
    -- RLS politikaları
    ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;
    
    -- Sadece yöneticilerin görebileceği politika
    CREATE POLICY account_lockouts_select_policy
      ON public.account_lockouts
      FOR SELECT
      USING (
        auth.uid() IN (
          SELECT id FROM public.profiles 
          WHERE role = 'admin'
        )
      );
      
    -- Herkes yeni kayıt ekleyebilir
    CREATE POLICY account_lockouts_insert_policy
      ON public.account_lockouts
      FOR INSERT
      WITH CHECK (true);
      
    -- Herkes güncelleme yapabilir (API kontrolü sağlanmalı)
    CREATE POLICY account_lockouts_update_policy
      ON public.account_lockouts
      FOR UPDATE
      USING (true);
      
    -- Süresi dolmuş kilitleri otomatik silen tetikleyici
    CREATE OR REPLACE FUNCTION cleanup_expired_lockouts()
    RETURNS trigger AS $$
    BEGIN
      UPDATE public.account_lockouts
      SET failed_attempts = 0, locked_until = NULL
      WHERE locked_until < now();
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS cleanup_expired_lockouts_trigger ON public.account_lockouts;
    CREATE TRIGGER cleanup_expired_lockouts_trigger
      AFTER INSERT OR UPDATE ON public.account_lockouts
      EXECUTE PROCEDURE cleanup_expired_lockouts();
  END IF;
END;
$$ LANGUAGE plpgsql;
`;

// Güvenlik tabloları oluşturma işlemini çalıştıran fonksiyon
export async function createSecurityTables(supabase: any) {
  try {
    // Admin giriş logları tablosunu oluştur
    await supabase.rpc('create_admin_login_logs_if_not_exists');
    
    // İki faktörlü doğrulama kodları tablosunu oluştur
    await supabase.rpc('create_two_factor_codes_if_not_exists');
    
    // Profil tablosuna two_factor_enabled alanı ekle
    await supabase.rpc('add_two_factor_to_profiles_if_not_exists');
    
    // Oturum kilitleme tablosunu oluştur
    await supabase.rpc('create_account_lockouts_if_not_exists');
    
    return { success: true };
  } catch (error) {
    console.error('Güvenlik tabloları oluşturulurken hata:', error);
    return { success: false, error };
  }
} 