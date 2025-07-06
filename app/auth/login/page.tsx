'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowVerificationAlert(false);
    
    try {
      const { error } = await login(email, password);
      
      if (error) {
        // E-posta onay hatası için özel mesaj göster
        if (error.message?.includes('Email not confirmed') || 
            error.message?.includes('email that is not verified')) {
          setShowVerificationAlert(true);
          toast.error('E-posta onayı gerekli', {
            description: 'Lütfen e-posta adresinize gönderilen onay bağlantısını tıklayın.'
          });
        } else {
          toast.error('Giriş yapılamadı', {
            description: error.message || 'Lütfen e-posta ve şifrenizi kontrol edin.'
          });
        }
      } else {
        toast.success('Giriş başarılı', {
          description: 'Ana sayfaya yönlendiriliyorsunuz.'
        });
        router.push('/');
        router.refresh();
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
          <h1 className="text-3xl font-bold">Giriş Yap</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Hesabınıza giriş yaparak blog içeriklerine yorum yapabilirsiniz.
          </p>
        </div>
        
        {showVerificationAlert && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Hesabınız henüz onaylanmamış. Lütfen e-posta adresinize gönderilen onay bağlantısını tıklayın.
              <br />
              <Button 
                variant="link" 
                className="p-0 h-auto mt-2 text-sm" 
                onClick={() => {
                  setShowVerificationAlert(false);
                  toast.info('Bilgi', {
                    description: 'Onay e-postası gelen kutunuzu ve spam klasörünü kontrol edin.'
                  });
                }}
              >
                Anladım
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Şifre</Label>
              <Link 
                href="/auth/reset-password" 
                className="text-sm text-primary hover:underline"
              >
                Şifremi unuttum
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          Hesabınız yok mu?{' '}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
} 