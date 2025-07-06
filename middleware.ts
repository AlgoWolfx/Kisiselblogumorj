import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Supabase URL bilgisi
const supabaseUrl = 'https://rsopyxqqwytwplsqoxgk.supabase.co';

export async function middleware(request: NextRequest) {
  try {
    // Admin sayfası kontrolü
    const isAdminPage = request.nextUrl.pathname.startsWith('/admin') && 
                        !request.nextUrl.pathname.startsWith('/admin/login');
    
    // Yanıtı oluştur
    const res = NextResponse.next()
    
    // Supabase istemcisini oluştur
    const supabase = createMiddlewareClient({ 
      req: request, 
      res
    })
    
    // Oturumu yenile
    const { data: { session } } = await supabase.auth.getSession()
    
    // Admin sayfası için yetki kontrolü
    if (isAdminPage) {
      if (!session) {
        // Oturum yoksa login sayfasına yönlendir
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      
      // Admin rolü kontrolü
      const { data: userData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (!userData || userData.role !== 'admin') {
        // Admin yetkisi yoksa ana sayfaya yönlendir
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    
    return res
  } catch (error) {
    console.error("Middleware hatası:", error)
    return NextResponse.next()
  }
}

// Middleware'i uygula, ancak statik dosyaları dışarıda bırak
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 