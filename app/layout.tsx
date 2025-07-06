import './globals.css';
import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from 'sonner';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const merriweather = Merriweather({ 
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  display: 'swap',
});

// Loglama filtreleme - başlangıçta çalıştırılacak
const disableLogs = `
// Console output filtreleri
(function() {
  // Orijinal konsol fonksiyonlarını yedekle
  const originalConsole = {
    log: console.log,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  // GoTrueClient veya Supabase ile ilgili logları filtrele
  console.log = function(...args) {
    if (args.length > 0 && typeof args[0] === 'string' && 
        (args[0].includes('GoTrueClient') || args[0].includes('supabase'))) {
      return; // Bu logu engelle
    }
    originalConsole.log.apply(console, args);
  };
  
  console.debug = function(...args) {
    if (args.length > 0 && typeof args[0] === 'string' && 
        (args[0].includes('GoTrueClient') || args[0].includes('supabase'))) {
      return; // Bu logu engelle
    }
    originalConsole.debug.apply(console, args);
  };

  // Bilinen client pattern'leri filtrele
  const blockedPatterns = [
    'GoTrueClient',
    '#_autoRefreshTokenTick',
    '#_acquireLock',
    '#_useSession',
    '#__loadSession',
    '#getSession',
    'supabase.auth',
    '.auth.',
    'access_token',
    'refresh_token',
    'session from storage',
    'Bearer',
    'token_type',
    'expires_in',
    'expires_at',
    'onAuthStateChange'
  ];
  
  // Console'un tüm fonksiyonlarını monkey-patch et
  const methods = ['log', 'debug', 'info', 'warn', 'error'];
  methods.forEach(method => {
    console[method] = function(...args) {
      if (args.length > 0 && typeof args[0] === 'string') {
        // Bloklanan pattern'leri kontrol et
        for (const pattern of blockedPatterns) {
          if (args[0].includes(pattern)) {
            return; // Bu logu engelle
          }
        }
      }
      originalConsole[method].apply(console, args);
    };
  });
})();
`;

export const metadata: Metadata = {
  title: 'Yiğit Osman Bayrak | Kişisel Blog',
  description: 'Teknoloji, yazılım ve finans alanında düşünceler ve deneyimler',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Loglama filtresi */}
        <script dangerouslySetInnerHTML={{ __html: disableLogs }} />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <Toaster theme="dark" position="top-right" richColors />
            <div className="fixed inset-0 -z-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="star"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}