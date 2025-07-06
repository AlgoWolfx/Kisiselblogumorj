'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Trash2, AlertCircle } from 'lucide-react';
import { deleteComment } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  user_id: string;
}

interface CommentListProps {
  postSlug: string;
  refreshTrigger: number;
}

export function CommentList({ postSlug, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const { user } = useAuth();

  // Yorumları API endpoint'ten çekme fonksiyonu
  const fetchComments = useCallback(async () => {
    if (!postSlug) return;
    
    setLoading(true);
    
    try {
      // API endpoint'ten yorumları al
      const response = await fetch(`/api/comments?slug=${encodeURIComponent(postSlug)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Yorumlar yüklenemedi');
      }
      
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      setComments([]);
      toast.error('Yorumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [postSlug]);
  
  // Yorumları çek - sadece postSlug veya refreshTrigger değiştiğinde
  useEffect(() => {
    fetchComments();
  }, [fetchComments, refreshTrigger]);

  // Yorum silme işlevi
  const handleDeleteComment = async (commentId: string) => {
    // Silme dialog'unu göster ve silinecek yorumu ayarla
    setCommentToDelete(commentId);
    setShowDeleteDialog(true);
  };

  // Silme işlemini gerçekleştir
  const confirmDelete = async () => {
    if (!commentToDelete) return;
    
    setIsDeleting(true);
    setShowDeleteDialog(false);
    
    try {
      // Silme işlemi için benzersiz bir ID kullanarak toast mesajlarını yönetiyoruz
      toast.loading('Yorum siliniyor...', { id: 'delete-comment' });
      
      // API endpoint üzerinden silme işlemi yap
      const response = await fetch(`/api/comments/delete?id=${commentToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.dismiss('delete-comment');
        toast.error(errorData.error || 'Yorum silinirken bir hata oluştu');
        return;
      }
      
      // Yorumları yeniden yüklemek yerine, mevcut listeyi güncelleyelim
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentToDelete));
      
      toast.dismiss('delete-comment');
      toast.success('Yorum başarıyla silindi');
    } catch (error) {
      toast.dismiss('delete-comment');
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setIsDeleting(false);
      setCommentToDelete(null);
    }
  };

  // Avatar fallback için kullanıcı adından baş harfleri al
  const getInitials = (name: string) => {
    if (!name) return '??';
    
    const parts = name.split(' ');
    if (parts.length === 1) return name.substring(0, 2).toUpperCase();
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded w-1/4 mx-auto mb-3"></div>
          <div className="h-10 bg-white/5 rounded mb-4"></div>
          <div className="h-10 bg-white/5 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  // Yorumlar boş ise
  if (!comments || comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-400">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Sadece yorum sayısını göster, debug bilgisi gösterme */}
        <div className="text-xs text-gray-500 mb-4">
          {comments.length} yorum
        </div>
      
        {comments.map(comment => (
          <article 
            key={comment.id} 
            className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 relative"
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 border border-white/10">
                <AvatarImage 
                  src={comment.user?.avatar_url || ''} 
                  alt={comment.user?.full_name || comment.user?.username || 'Kullanıcı'} 
                />
                <AvatarFallback className="bg-blue-500/20 text-blue-300">
                  {comment.user?.username 
                    ? getInitials(comment.user.username) 
                    : (comment.user?.full_name 
                      ? getInitials(comment.user.full_name) 
                      : '??')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-semibold">
                    {comment.user?.full_name || comment.user?.username || 'İsimsiz Kullanıcı'}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {format(new Date(comment.created_at), 'PPP', { locale: tr })}
                  </span>
                </div>
                <p className="text-sm text-gray-300 break-words">{comment.content}</p>
              </div>
              
              {user && user.id === comment.user_id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-400 p-1 transition-colors"
                  aria-label="Yorumu sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Özel Silme Dialog'u */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-semibold">Yorumu Sil</h3>
            </div>
            
            <p className="text-gray-300 mb-2">Bu yorumu silmek istediğinize emin misiniz?</p>
            <p className="text-gray-500 text-sm mb-6">Bu işlem geri alınamaz.</p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 