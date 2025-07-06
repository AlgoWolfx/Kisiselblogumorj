'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserProfile, updateUserProfile, supabase } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  email_notifications: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getUserProfile(user.id);
        
        if (error) {
          toast.error('Profil bilgileri alınamadı', {
            description: error.message
          });
          return;
        }
        
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setEmailNotifications(data.email_notifications || false);
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        toast.error('Bir hata oluştu', {
          description: 'Profil bilgileri yüklenirken hata oluştu.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Dosya önizlemesini göster
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile);
      
    if (error) {
      toast.error('Avatar yüklenemedi', {
        description: error.message
      });
      return null;
    }
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      let newAvatarUrl = avatarUrl;
      
      // Eğer yeni bir avatar dosyası varsa, yükle
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar();
      }
      
      const updates = {
        full_name: fullName,
        email_notifications: emailNotifications,
        ...(newAvatarUrl && { avatar_url: newAvatarUrl }),
        updated_at: new Date()
      };
      
      const { error } = await updateUserProfile(user.id, updates);
      
      if (error) {
        toast.error('Profil güncellenemedi', {
          description: error.message
        });
      } else {
        // Başarılı kayıt durumunu göster
        setSaveSuccess(true);
        
        // 2 saniye sonra sıfırla
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
        
        toast.success('Değişiklikler kaydedildi', {
          description: 'Profil bilgileriniz başarıyla güncellendi.',
          duration: 4000,
          action: {
            label: 'Tamam',
            onClick: () => toast.dismiss()
          }
        });
        
        // Profil state'ini güncelle
        setProfile({
          ...profile!,
          full_name: fullName,
          email_notifications: emailNotifications,
          avatar_url: newAvatarUrl || profile?.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      toast.error('Bir hata oluştu', {
        description: 'Profil bilgileriniz güncellenirken hata oluştu.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-16">
        <div className="text-center">
          <p>Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Profil Bilgilerim</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kişisel bilgilerinizi ve tercihlerinizi güncelleyin.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback>
                {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="mt-2"
              >
                Profil Fotoğrafı Değiştir
              </Button>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500">
                E-posta adresiniz değiştirilemez.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full-name">Ad Soyad</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adınız ve soyadınız"
              />
              <p className="text-xs text-gray-500">
                Ad soyad bilgilerinizi güncelleyebilirsiniz.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
              <Label htmlFor="notifications">Yeni blog yazıları için e-posta bildirimi al</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              variant={saveSuccess ? "success" : "default"}
              className={saveSuccess ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isSaving ? 'Kaydediliyor...' : (
                saveSuccess ? (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Kaydedildi!
                  </span>
                ) : 'Değişiklikleri Kaydet'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 