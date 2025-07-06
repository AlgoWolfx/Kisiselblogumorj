import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Tablo bilgisini kontrol et
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_name', 'comments');

    if (tableError) {
      return NextResponse.json({ error: tableError.message }, { status: 500 });
    }

    return NextResponse.json({ tableInfo });
  } catch (error: any) {
    console.error('Debug API hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { sql } = data;

    if (!sql) {
      return NextResponse.json({ error: 'SQL sorgusu gerekli' }, { status: 400 });
    }

    // SQL sorgusu çalıştır
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('SQL çalıştırma hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 