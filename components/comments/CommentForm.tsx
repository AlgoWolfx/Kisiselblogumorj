'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

const commentFormSchema = z.object({
  comment: z.string().min(5, {
    message: 'Yorum en az 5 karakter olmalıdır.'
  }).max(500, {
    message: 'Yorum en fazla 500 karakter olmalıdır.'
  }),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

interface CommentFormProps {
  postSlug: string;
  onCommentAdded: () => void;
}

export function CommentForm({ postSlug, onCommentAdded }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | React.ReactNode>('');
  const { user, loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kullanıcı yüklendikten sonra oturum durumunu kontrol et
    if (!loading) {
      setIsLoggedIn(!!user);
      console.log("Yorum formu - Kullanıcı durumu:", user ? "Giriş yapılmış" : "Giriş yapılmamış");
      if (user) {
        console.log("Yorum formu - Kullanıcı:", user.email);
      }
    }
  }, [user, loading]);

  const { 
    register, 
    handleSubmit,
    reset, 
    formState: { errors } 
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      comment: ''
    }
  });

  async function onSubmit(data: CommentFormValues) {
    console.log("Yorum gönderiliyor - Kullanıcı durumu:", isLoggedIn);
    
    if (!isLoggedIn || !user) {
      toast.error('Yorum yapmak için giriş yapmalısınız');
      setSubmitError(
        <div>
          Yorum yapabilmek için <a href="/auth/login" className="underline font-medium text-blue-400">giriş yapmanız</a> gerekiyor.
        </div>
      );
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');

    try {
      toast.loading('Yorumunuz gönderiliyor...', { id: 'comment-submit' });
      
      // API endpoint üzerinden yorum ekle
      const response = await fetch('/api/comments/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postSlug,
          content: data.comment
        }),
        credentials: 'include' // Cookie'leri dahil et
      });
      
      console.log("API yanıtı - Status:", response.status);
      const responseData = await response.json();
      
      if (!response.ok) {
        toast.dismiss('comment-submit');
        
        // 401 hatası alırsak, kullanıcıya giriş yapmasını önerelim
        if (response.status === 401) {
          toast.error('Yorum yapmak için giriş yapmalısınız');
          setSubmitError(
            <div>
              Yorum yapabilmek için <a href="/auth/login" className="underline font-medium text-blue-400">giriş yapmanız</a> gerekiyor.
            </div>
          );
        } else {
          // Diğer hatalar için
          toast.error(responseData.friendlyMessage || 'Yorum eklenirken bir sorun oluştu');
          setSubmitError(responseData.friendlyMessage || 'Yorum eklenirken bir sorun oluştu, lütfen daha sonra tekrar deneyin.');
        }
      } else {
        toast.dismiss('comment-submit');
        reset(); // Formu temizle
        
        // Form başarılı bir şekilde gönderildikten sonra callback'i çağır
        if (typeof onCommentAdded === 'function') {
          onCommentAdded();
        }
        
        toast.success('Yorumunuz başarıyla eklendi');
      }
      
    } catch (error: any) {
      toast.dismiss('comment-submit');
      console.error("Yorum gönderme hatası:", error);
      toast.error('Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <h3 className="text-xl font-bold mb-4">Yorum Yap</h3>
      
      {isLoggedIn ? (
        <div className="mb-4 text-sm text-green-500">
          Oturum açtınız, yorum yapabilirsiniz.
        </div>
      ) : (
        <div className="mb-4 text-sm text-amber-500">
          Yorum yapabilmek için <a href="/auth/login" className="underline font-medium text-blue-400">giriş yapmanız</a> gerekiyor.
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {submitError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm">
            {submitError}
          </div>
        )}
        
        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-1">
            Yorum <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            rows={4}
            className={`w-full px-3 py-2 bg-black/20 border ${errors.comment ? 'border-red-500' : 'border-white/10'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md outline-none transition-colors`}
            placeholder="Yorumunuzu buraya yazın..."
            {...register('comment')}
            disabled={isSubmitting || !isLoggedIn}
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-500">{errors.comment.message}</p>
          )}
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting || !isLoggedIn}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Yorum Gönder
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 