'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCommentsByPostId, addComment } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CommentType {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getCommentsByPostId(postId);
        
        if (error) {
          console.error('Yorumlar yüklenirken hata:', error);
          toast.error('Yorumlar yüklenemedi');
        } else if (data) {
          setComments(data);
        }
      } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Lütfen yorum yapmak için giriş yapın');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Yorum boş olamaz');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await addComment(postId, user.id, newComment);
      
      if (error) {
        toast.error('Yorum eklenirken hata oluştu', {
          description: error.message
        });
      } else {
        // Yorumlar listesini güncelle
        const { data } = await getCommentsByPostId(postId);
        if (data) {
          setComments(data);
        }
        
        toast.success('Yorumunuz eklendi');
        setNewComment('');
      }
    } catch (error) {
      console.error('Yorum eklenirken hata:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: tr
      });
    } catch (error) {
      return 'geçersiz tarih';
    }
  };

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-2xl font-bold">Yorumlar</h2>
      
      {/* Yorum Formu */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            placeholder="Düşüncelerinizi paylaşın..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Gönderiliyor...' : 'Yorum Yap'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center">
          <p className="mb-2">Yorum yapmak için giriş yapmanız gerekiyor.</p>
          <Button asChild variant="default">
            <Link href="/auth/login">Giriş Yap</Link>
          </Button>
        </div>
      )}
      
      {/* Yorumlar Listesi */}
      <div className="space-y-6">
        {isLoading ? (
          <p className="text-center py-4">Yorumlar yükleniyor...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.user.avatar_url} alt={comment.user.username} />
                  <AvatarFallback>
                    {comment.user.full_name?.[0]?.toUpperCase() || 
                     comment.user.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{comment.user.full_name || comment.user.username}</div>
                    <time className="text-sm text-gray-500">{formatDate(comment.created_at)}</time>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-4 text-gray-500">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        )}
      </div>
    </div>
  );
} 