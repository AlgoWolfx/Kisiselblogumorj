'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Menu, X, User, LogIn, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await logout();
      if (error) {
        toast.error('Çıkış yapılamadı', {
          description: error.message
        });
      } else {
        toast.success('Çıkış yapıldı', {
          description: 'Başarıyla çıkış yaptınız.'
        });
      }
    } catch (error) {
      toast.error('Bir hata oluştu', {
        description: 'Çıkış yapılırken bir hata oluştu.'
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-xl font-bold font-sans text-white hover:text-blue-400 transition-colors flex items-center gap-2"
          >
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/">Anasayfa</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/about">Hakkında</NavLink>
            <NavLink href="/contact">İletişim</NavLink>
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profile?.avatar_url} alt={user.email || ''} />
                          <AvatarFallback>{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Profil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>Çıkış Yap</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/auth/login" className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        <span>Giriş Yap</span>
                      </Link>
                    </Button>
                    <Button asChild variant="default" size="sm">
                      <Link href="/auth/register" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Kayıt Ol</span>
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2 md:hidden">
            <button 
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Menüyü aç</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-md border-b border-white/10">
            <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>Anasayfa</MobileNavLink>
            <MobileNavLink href="/blog" onClick={() => setIsMenuOpen(false)}>Blog</MobileNavLink>
            <MobileNavLink href="/about" onClick={() => setIsMenuOpen(false)}>Hakkında</MobileNavLink>
            <MobileNavLink href="/contact" onClick={() => setIsMenuOpen(false)}>İletişim</MobileNavLink>
            
            {/* Mobile Auth Links */}
            {!loading && (
              <>
                {user ? (
                  <>
                    <MobileNavLink href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Profil</span>
                      </div>
                    </MobileNavLink>
                    <div 
                      className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md cursor-pointer"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>Çıkış Yap</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <MobileNavLink href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        <span>Giriş Yap</span>
                      </div>
                    </MobileNavLink>
                    <MobileNavLink href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Kayıt Ol</span>
                      </div>
                    </MobileNavLink>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="font-sans text-gray-300 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ 
  href, 
  onClick, 
  children 
}: { 
  href: string; 
  onClick: () => void;
  children: React.ReactNode 
}) {
  return (
    <Link 
      href={href}
      className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}