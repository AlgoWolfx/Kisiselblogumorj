import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
// import { supabaseConfig } from './supabase-config'; // Bu satır bir önceki adımda kaldırılmıştı veya kaldırılmalı.

// .env.local dosyasındaki değişkenleri kullan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase istemcisi oluştur
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      persistSession: true, // Oturum kalıcılığını aktif et
      autoRefreshToken: true, // Token yenilemeyi aktif et
      detectSessionInUrl: true, // URL'deki oturum bilgisini algıla
      flowType: 'pkce', // Daha güvenli PKCE akışını kullan
      storage: {
        getItem: (key) => {
          if (typeof document === 'undefined') return null;
          const cookieRow = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${key}=`));
          
          if (!cookieRow) return null;
          
          const value = cookieRow.split('=')[1];
          return value ? decodeURIComponent(value) : null;
        },
        setItem: (key, value) => {
          if (typeof document === 'undefined') return;
          // 30 günlük çerez süresini kullan
          const maxAge = 30 * 24 * 60 * 60;
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
        },
        removeItem: (key) => {
          if (typeof document === 'undefined') return;
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure`;
        },
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-browser/2.38.0'
      },
    },
  }
);

// Auth ile ilgili yardımcı fonksiyonlar
export const signUp = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  console.log("Giriş yapılıyor, e-posta:", email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error("Giriş hatası:", error);
  } else {
    console.log("Giriş başarılı, kullanıcı:", data.user?.email);
  }
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error("Kullanıcı getirme hatası:", error);
    return null;
  }
  
  if (user) {
    console.log("Mevcut kullanıcı bulundu:", user.email);
  } else {
    console.log("Oturum açmış kullanıcı bulunamadı");
  }
  
  return user;
};

// Profil ile ilgili yardımcı fonksiyonlar
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { data, error };
};

// Blog ile ilgili yardımcı fonksiyonlar
export const getPublishedPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url),
      post_categories(category_id)
    `)
    .eq('published', true)
    .order('published_at', { ascending: false });
  return { data, error };
};

export const getPostBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url),
      post_categories(
        categories(id, name, slug)
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();
  return { data, error };
};

// Yorum ile ilgili yardımcı fonksiyonlar
export const getCommentsByPostId = async (postIdOrSlug: string) => {
  try {
    // Önce slug kullanarak blog post ID'sini bul (her durumda)
    const { data: postData } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', postIdOrSlug)
      .single();
    
    if (postData?.id) {
      // Bulunan post ID ile yorumları çek
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(username, full_name, avatar_url)
        `)
        .eq('post_id', postData.id)
        .order('created_at', { ascending: false });
      
      return { data, error };
    } else {
      // Son bir deneme, belki postIdOrSlug doğrudan bir UUID'dir
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postIdOrSlug)) {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            user:profiles(username, full_name, avatar_url)
          `)
          .eq('post_id', postIdOrSlug)
          .order('created_at', { ascending: false });
        
        return { data, error };
      }
      
      return { data: [], error: null };
    }
  } catch (err) {
    return { data: null, error: err };
  }
};

// Yorum ekle fonksiyonu - Post ID'sini doğrudan kullanabilir veya slug'dan ID'ye dönüştürebilir
export const addComment = async (postIdOrSlug: string, userId: string, content: string) => {
  try {
    // Önce verilen parametre bir UUID mi kontrolü yap
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postIdOrSlug);
    
    // UUID ise doğrudan kullan
    if (isUuid) {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postIdOrSlug,
          user_id: userId,
          content,
        })
        .select();
      return { data, error };
    }
    
    // UUID değilse, slug'dan ID'yi bul
    const { data: postData, error: postError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', postIdOrSlug)
      .single();
    
    if (postError) {
      return { data: null, error: postError };
    }
    
    if (!postData?.id) {
      return { 
        data: null, 
        error: { message: `"${postIdOrSlug}" için blog yazısı bulunamadı.` } 
      };
    }
    
    // Yorumu ekle
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postData.id,
        user_id: userId,
        content,
      })
      .select();
    
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

// Veritabanındaki tüm yorumları getir (debug için)
export const getAllComments = async () => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(username, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });
    
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

// Yorum silme fonksiyonu
export const deleteComment = async (commentId: string) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .match({ id: commentId });
    
    return { data: { success: true }, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

// Tablo yapısını kontrol et (debug için)
export const getCommentsTable = async () => {
  try {
    // Direkt SQL çalıştırarak tablo yapısını kontrol edelim
    const { data, error } = await supabase.from('information_schema.columns')
      .select('*')
      .eq('table_name', 'comments');
    
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

// İletişim formu
export const submitContactForm = async (
  name: string,
  email: string,
  subject: string,
  message: string,
  avatar_url?: string | null
) => {
  try {
    // Kullanıcının profil bilgilerini kontrol et
    const { data: { user } } = await supabase.auth.getUser();
    
    // Eğer kullanıcı giriş yapmışsa ve profili varsa
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      
      // Profildeki avatar_url'i kullan veya parametre olarak gelen değeri kullan
      avatar_url = avatar_url || profile?.avatar_url;
    }

    // Mesajı ekle
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        subject,
        message,
        avatar_url,
        user_id: user?.id, // Eğer kullanıcı giriş yapmışsa user_id'yi ekle
      })
      .select();

    if (error) {
      console.error('İletişim mesajı gönderme hatası:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      // Kullanıcıya daha anlaşılır hata mesajları göster
      if (error.code === '42501') { // Yetkilendirme hatası
        return {
          data: null,
          error: {
            message: 'Bu işlemi gerçekleştirmek için yetkiniz yok.',
            code: 'PERMISSION_DENIED'
          }
        };
      } else if (error.code === '23502') { // Not null violation
        return {
          data: null,
          error: {
            message: 'Lütfen tüm gerekli alanları doldurun.',
            code: 'MISSING_FIELDS'
          }
        };
      } else {
        return {
          data: null,
          error: {
            message: 'Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
            code: 'UNKNOWN_ERROR'
          }
        };
      }
    }

    return { 
      data, 
      error: null 
    };
  } catch (err) {
    console.error('İletişim formu gönderim hatası:', err);
    return {
      data: null,
      error: {
        message: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        code: 'UNEXPECTED_ERROR',
        details: err
      }
    };
  }
};

// Görsel yükleme fonksiyonu
export const uploadImage = async (userId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(16).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Dosyayı storage'a yükle
    const { data, error } = await supabase.storage
      .from('blog_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // Yüklenen dosyanın public URL'ini al
    const { data: urlData } = supabase.storage
      .from('blog_images')
      .getPublicUrl(filePath);
    
    return { data: urlData, error: null };
  } catch (error) {
    console.error('Görsel yükleme hatası:', error);
    return { data: null, error };
  }
}; 
