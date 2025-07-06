'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, Clock, Shield, User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface LoginLog {
  id: string;
  email: string;
  success: boolean;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

interface AccountLockout {
  id: string;
  email: string;
  failed_attempts: number;
  locked_until: string | null;
  last_attempt_at: string;
  ip_address: string;
}

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [accountLockouts, setAccountLockouts] = useState<AccountLockout[]>([]);
  const [user, setUser] = useState<any>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserAndSettings = async () => {
      setLoading(true);
      try {
        // Mevcut kullanıcıyı al
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Kullanıcı bulunamadı.');
        }
        
        setUser(user);
        
        // Giriş loglarını al
        await fetchLoginLogs();
        
        // Hesap kilitlemelerini al
        await fetchAccountLockouts();
        
      } catch (error) {
        console.error('Kullanıcı ve ayarlar yüklenirken hata:', error);
        showNotification('error', 'Ayarlar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndSettings();
  }, []);
  
  const fetchLoginLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_login_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
        
      if (error) {
        throw error;
      }
      
      setLoginLogs(data || []);
    } catch (error) {
      console.error('Giriş logları yüklenirken hata:', error);
      showNotification('error', 'Giriş logları yüklenirken bir hata oluştu');
    }
  };
  
  const fetchAccountLockouts = async () => {
    try {
      const { data, error } = await supabase
        .from('account_lockouts')
        .select('*')
        .order('last_attempt_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setAccountLockouts(data || []);
    } catch (error) {
      console.error('Hesap kilitlemeleri yüklenirken hata:', error);
      showNotification('error', 'Hesap kilitlemeleri yüklenirken bir hata oluştu');
    }
  };

  const unlockAccount = async (email: string) => {
    if (!window.confirm(`"${email}" hesabının kilidini kaldırmak istediğinizden emin misiniz?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('account_lockouts')
        .update({
          failed_attempts: 0,
          locked_until: null
        })
        .eq('email', email);
        
      if (error) {
        throw error;
      }
      
      // Hesap kilitlemelerini yeniden yükle
      await fetchAccountLockouts();
      
      toast.success(`${email} hesabının kilidi başarıyla kaldırıldı`);
      
    } catch (error) {
      console.error('Hesap kilidi kaldırılırken hata:', error);
      toast.error('Hesap kilidi kaldırılamadı');
    }
  };
  
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Güvenlik Ayarları</h1>
        <button
          onClick={() => {
            fetchLoginLogs();
            fetchAccountLockouts();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Yenile</span>
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center ${
          notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
          notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
          'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> :
           notification.type === 'error' ? <AlertCircle className="h-5 w-5 mr-2" /> :
           <Clock className="h-5 w-5 mr-2" />}
          <p>{notification.message}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
          <Shield className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Giriş Güvenliği
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                E-posta Bildirimleri
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Admin paneline her başarılı girişte, kayıtlı admin e-posta adresinize bildirim gönderilir.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            Hesap Kilitlemeleri
          </h2>
          
          {accountLockouts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Henüz hesap kilitleme kaydı bulunmuyor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      E-posta
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Başarısız Giriş
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {accountLockouts.map((lockout) => (
                    <tr key={lockout.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {lockout.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {lockout.failed_attempts}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {lockout.locked_until && new Date(lockout.locked_until) > new Date() ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Kilitli ({formatDate(lockout.locked_until)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {lockout.locked_until && new Date(lockout.locked_until) > new Date() && (
                          <button
                            onClick={() => unlockAccount(lockout.email)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Kilidi Kaldır
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            Son Giriş Denemeleri
          </h2>
          
          {loginLogs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Henüz giriş denemesi kaydı bulunmuyor.</p>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      E-posta
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      IP Adresi
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loginLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {log.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {log.ip_address}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {log.success ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Başarılı
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Başarısız
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 