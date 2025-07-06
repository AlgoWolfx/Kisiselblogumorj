'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CommentsProps {
  postSlug: string;
}

export function Comments({ postSlug }: CommentsProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { user } = useAuth();

  // Yorum eklendiğinde listeyi yenileme fonksiyonunu memoize et
  const handleCommentAdded = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    // Form gönderildikten sonra formu gizleme
    // setShowCommentForm(false); 
    // Formu gizlemek yerine açık bırakarak kullanıcıya başka yorum ekleme imkanı verelim
  }, []);

  return (
    <section className="mt-12 pt-8 border-t border-gray-800">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Yorumlar
          </h2>
          
          {user && !showCommentForm && (
            <button
              onClick={() => setShowCommentForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Yorum Yap
            </button>
          )}
          
          {!user && (
            <Button asChild variant="default">
              <Link href="/auth/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Giriş Yap ve Yorum Ekle
              </Link>
            </Button>
          )}
        </div>
        
        {showCommentForm && (
          <div className="space-y-3">
            <CommentForm 
              postSlug={postSlug} 
              onCommentAdded={handleCommentAdded} 
            />
            <div className="flex justify-end">
              <button 
                onClick={() => setShowCommentForm(false)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Formu Kapat
              </button>
            </div>
          </div>
        )}
        
        {/* Yorumları daima göster */}
        <CommentList postSlug={postSlug} refreshTrigger={refreshTrigger} />
      </div>
    </section>
  );
} 