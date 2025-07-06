'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase, updateUserProfile } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor', {
        description: 'Lütfen şifre alanlarını kontrol edin.'
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await register(email, password, fullName);
      
      if (error) {
        toast.error('Kayıt yapılamadı', {
          description: error.message || 'Lütfen bilgilerinizi kontrol edin.'
        });
      } else {
        // Kullanıcı başarıyla kaydedildi, profil veritabanı tetikleyici ile otomatik oluşturulur
        toast.success('Kayıt başarılı', {
          description: 'Lütfen e-posta adresinize gönderilen onay bağlantısına tıklayın. Onay işleminden sonra hesabınıza giriş yapabilirsiniz.'
        });
        router.push('/auth/login');
      }
    } catch (error) {
      toast.error('Bir hata oluştu', {
        description: 'Lütfen daha sonra tekrar deneyin.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-16">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Kayıt Ol</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Hemen kayıt olun ve blog içerikleri hakkında yorumlarınızı paylaşın.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Adınız ve soyadınız"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500">
              Şifreniz en az 6 karakter uzunluğunda olmalıdır.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          Zaten hesabınız var mı?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
} 