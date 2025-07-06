'use client';

import { useState, useEffect } from 'react';
import { getCommentsTable, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sqlResult, setSqlResult] = useState<string | null>(null);

  const checkCommentsTable = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getCommentsTable();
      setTableInfo(data);
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const runMigrationManually = async () => {
    setLoading(true);
    setError(null);
    try {
      // SQL sorgusunu doğrudan çalıştır
      const { data, error } = await supabase.from('_postgres_queries').rpc('sql_query', {
        query: `
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
        `
      });
      
      setSqlResult('Migration başarıyla uygulandı');
      if (error) {
        setError(error.message);
        setSqlResult(null);
      } else {
        checkCommentsTable();
      }
    } catch (err: any) {
      setError(err.message || 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Debug Sayfası</h1>
      
      <div className="flex gap-4 mb-8">
        <Button onClick={checkCommentsTable} disabled={loading}>
          {loading ? 'Kontrol Ediliyor...' : 'Comments Tablosunu Kontrol Et'}
        </Button>
        
        <Button onClick={runMigrationManually} disabled={loading} variant="destructive">
          {loading ? 'Uygulanıyor...' : 'Migration\'ı Yeniden Uygula'}
        </Button>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Hata:</p>
          <p>{error}</p>
        </div>
      )}

      {sqlResult && (
        <div className="p-4 mb-6 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>{sqlResult}</p>
        </div>
      )}
      
      {tableInfo && (
        <div className="p-4 bg-gray-100 border border-gray-300 rounded">
          <h2 className="text-xl font-bold mb-4">Tablo Bilgisi</h2>
          <pre className="whitespace-pre-wrap bg-white p-4 rounded border border-gray-200 overflow-auto">
            {JSON.stringify(tableInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 