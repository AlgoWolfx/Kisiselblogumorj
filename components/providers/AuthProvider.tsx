'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser, signIn, signOut, signUp, getUserProfile } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextProps {
  user: (User & { profile?: any }) | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  logout: () => Promise<{ error: any | null }>;
  register: (email: string, password: string, fullName?: string) => Promise<{ data: any | null, error: any | null }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & { profile?: any }) | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserWithProfile = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    try {
      const { data: profile } = await getUserProfile(authUser.id);
      setUser({ ...authUser, profile });
    } catch (error) {
      console.error("Profil getirme hatası:", error);
      setUser(authUser);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetchUserWithProfile(session?.user || null);
      } catch (error) {
        console.error("Oturum kontrolü hatası:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth durum değişikliği:", event);
      await fetchUserWithProfile(session?.user || null);
      setLoading(false);
      
      if (event === 'SIGNED_IN') {
        console.log("Kullanıcı giriş yaptı:", session?.user.email);
      } else if (event === 'SIGNED_OUT') {
        console.log("Kullanıcı çıkış yaptı");
      }
      
      router.refresh();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    return { error };
  };

  const logout = async () => {
    const { error } = await signOut();
    return { error };
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await signUp(email, password, fullName);
    return { data, error };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 