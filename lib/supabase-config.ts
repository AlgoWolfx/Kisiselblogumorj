// Supabase küresel yapılandırma
import { SupabaseClientOptions } from '@supabase/supabase-js';

// Supabase istemci seçenekleri - tüm client/server istemcileri için kullanılabilir
export const supabaseConfig: SupabaseClientOptions<any> = {
  auth: {
    persistSession: false, // Oturum kalıcılığını aç
    autoRefreshToken: false, // Token yenilemeyi aç
    storageKey: 'supabase.auth.token',
    detectSessionInUrl: true, // URL'deki oturum bilgisini algıla
    debug: false, // Hata ayıklamayı kapat
    flowType: 'pkce' // PKCE akışını kullan (daha güvenli)
  },
  global: {
    // Global ayarlar
    headers: {
      'X-Client-Info': 'supabase-js-browser/2.38.0'
    },
    fetch: (...args) => fetch(...args)
  }
  // logger özelliği bu sürümde desteklenmiyor
}; 