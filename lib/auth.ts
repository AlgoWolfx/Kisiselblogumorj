import { cookies } from 'next/headers';
import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';

// Sabitleri doğrudan tanımlıyoruz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server Component'ler için supabase client
export function createServerComponentAuth() {
  const cookieStore = cookies();
  
  return createServerComponentClient<Database>({
    cookies: () => cookieStore
  });
}

// API Route Handler'ları için supabase client
export function createServiceClient() {
  const cookieStore = cookies();
  
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore
  });
}

// İstemci tarafı supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Kullanıcı bilgilerini getiren fonksiyon
export async function getAuthUser() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonim',
  };
} 