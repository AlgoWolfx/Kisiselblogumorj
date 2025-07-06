'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Eye, Mail, Trash, X } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
  avatar_url: string | null;
  profiles?: {
    avatar_url: string | null;
  };
}

// Admin secret değerini alın
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET;

// Yeni implementasyon
const getAdminSecret = () => {
  // Next.js public runtime config'den al
  return process.env.NEXT_PUBLIC_ADMIN_SECRET || '';
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Sayfa yüklendiğinde mesajları getir
  useEffect(() => {
    fetchMessages();
  }, [filter]);
  
  // Manuel yenileme butonu için işlev
  const handleRefresh = () => {
    fetchMessages();
    showNotification('info', 'Mesajlar yenilendi');
  };

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // API endpoint'e istek at
      const response = await fetch(`/api/admin/messages${filter !== 'all' ? `?filter=${filter}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': getAdminSecret()
        }
      });

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setMessages(data || []);
      
      // Seçili mesaj varsa, onu da güncelle
      if (selectedMessage) {
        const updatedMessage = data.find((msg: ContactMessage) => msg.id === selectedMessage.id);
        if (updatedMessage) {
          setSelectedMessage(updatedMessage);
        }
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata oluştu:', error);
      if (showLoading) {
        showNotification('error', error instanceof Error ? error.message : 'Mesajlar yüklenirken hata oluştu');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Tek bir mesajı getir
  const fetchSingleMessage = async (id: string) => {
    setMessageLoading(true);
    try {
      const response = await fetch(`/api/admin/messages/single?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': getAdminSecret()
        }
      });

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data) {
        // Mevcut mesajlar listesinde güncelle
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === data.id ? data : msg
          )
        );
        // Seçili mesajı güncelle
        setSelectedMessage(data);
      }
    } catch (error) {
      console.error('Mesaj detayı alınırken hata oluştu:', error);
      showNotification('error', error instanceof Error ? error.message : 'Mesaj detayı alınamadı');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    try {
      // API endpoint'e istek at
      const response = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': getAdminSecret()
        },
        body: JSON.stringify({
          id,
          read: !isRead
        })
      });

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status} ${response.statusText}`);
      }

      // Güncellenmiş mesajları getir
      fetchMessages();
      
      // Eğer seçili mesajsa, onu da güncelle
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({
          ...selectedMessage,
          read: !isRead
        });
      }

      showNotification('success', `Mesaj ${!isRead ? 'okundu' : 'okunmadı'} olarak işaretlendi`);
    } catch (error) {
      console.error('Mesajı işaretlerken hata oluştu:', error);
      showNotification('error', error instanceof Error ? error.message : 'İşlem sırasında bir hata oluştu');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      // API endpoint'e istek at
      const response = await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': getAdminSecret()
        }
      });

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status} ${response.statusText}`);
      }

      // Mesaj silindiyse ve seçili mesajsa, seçimi kaldır
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }

      // Güncellenmiş mesajları getir
      fetchMessages();
      showNotification('success', 'Mesaj başarıyla silindi');
    } catch (error) {
      console.error('Mesaj silinirken hata oluştu:', error);
      showNotification('error', error instanceof Error ? error.message : 'İşlem sırasında bir hata oluştu');
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    // 5 saniye sonra bildirimi kaldır
    setTimeout(() => setNotification(null), 5000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    
    // Eğer mesaj okunmadıysa, okundu olarak işaretle ve mesaj detayını taze olarak getir
    if (!message.read) {
      handleMarkAsRead(message.id, false);
    } else {
      // Mesajı güncel olarak getir
      fetchSingleMessage(message.id);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">İletişim Mesajları</h1>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center ${
          notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
          notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
          'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> :
           notification.type === 'error' ? <AlertCircle className="h-5 w-5 mr-2" /> :
           <Mail className="h-5 w-5 mr-2" />}
          <p>{notification.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
              <span className="font-medium text-gray-700 dark:text-gray-300">Filtrele:</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === 'all' 
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Tümü
                </button>
                <button 
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === 'unread'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Okunmamış
                </button>
                <button 
                  onClick={() => setFilter('read')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === 'read'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Okunmuş
                </button>
              </div>
              
              <div className="ml-auto">
                <button 
                  onClick={handleRefresh}
                  title="Mesajları yenile"
                  className="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Yenile
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                {filter === 'all' 
                  ? 'Henüz mesaj yok.' 
                  : filter === 'unread' 
                    ? 'Okunmamış mesaj yok.' 
                    : 'Okunmuş mesaj yok.'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer ${
                      selectedMessage?.id === message.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    } ${!message.read ? 'font-medium' : ''}`}
                    onClick={() => handleViewMessage(message)}
                  >
                    <div className="flex items-start gap-3">
                      {message.avatar_url ? (
                        <img 
                          src={message.avatar_url} 
                          alt={`${message.name} avatar`}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            // Avatar yüklenemezse Mail ikonunu göster
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : message.profiles?.avatar_url ? (
                        <img 
                          src={message.profiles.avatar_url} 
                          alt={`${message.name} avatar`}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            // Avatar yüklenemezse Mail ikonunu göster
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className={`rounded-full p-2 ${
                          !message.read 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          <Mail className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium text-gray-900 dark:text-white truncate ${!message.read ? 'font-semibold' : ''}`}>
                            {message.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{message.email}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate">{message.subject}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedMessage ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {selectedMessage.avatar_url ? (
                    <img 
                      src={selectedMessage.avatar_url} 
                      alt={`${selectedMessage.name} avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : selectedMessage.profiles?.avatar_url ? (
                    <img 
                      src={selectedMessage.profiles.avatar_url} 
                      alt={`${selectedMessage.name} avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mesaj Detayları</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMarkAsRead(selectedMessage.id, selectedMessage.read)}
                    className={`p-2 rounded-md ${
                      selectedMessage.read 
                        ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20' 
                        : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                    }`}
                    title={selectedMessage.read ? 'Okunmadı olarak işaretle' : 'Okundu olarak işaretle'}
                  >
                    {selectedMessage.read ? <Eye className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    title="Mesajı sil"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    title="Kapat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gönderen</p>
                    <p className="text-base text-gray-900 dark:text-white">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">E-posta</p>
                    <p className="text-base text-gray-900 dark:text-white">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tarih</p>
                    <p className="text-base text-gray-900 dark:text-white">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</p>
                    <p className={`text-base ${selectedMessage.read ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {selectedMessage.read ? 'Okundu' : 'Okunmadı'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Konu</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedMessage.subject}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mesaj</p>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    E-posta ile Yanıtla
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center h-full min-h-[300px]">
              <Mail className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Detayları görüntülemek için bir mesaj seçin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 