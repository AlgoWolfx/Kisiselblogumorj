'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

// Form şeması - giriş yapmış kullanıcılar için isim ve email opsiyonel
const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: 'İsim en az 2 karakter olmalıdır.'
  }).max(50, {
    message: 'İsim en fazla 50 karakter olmalıdır.'
  }).optional(),
  email: z.string().email({
    message: 'Geçerli bir e-posta adresi giriniz.'
  }).optional(),
  subject: z.string().min(5, {
    message: 'Konu en az 5 karakter olmalıdır.'
  }).max(100, {
    message: 'Konu en fazla 100 karakter olmalıdır.'
  }),
  message: z.string().min(10, {
    message: 'Mesaj en az 10 karakter olmalıdır.'
  }).max(1000, {
    message: 'Mesaj en fazla 1000 karakter olmalıdır.'
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { user } = useAuth();

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset,
    setValue
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  // Kullanıcı giriş yapmışsa form alanlarını doldur
  useEffect(() => {
    if (user) {
      setValue('name', user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('İletişim formu gönderim hatası:', result);
        setSubmitError(result.message || 'Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } else {
        setSubmitSuccess(true);
        reset();
      }
    } catch (error) {
      console.error('İletişim formu hatası:', error);
      setSubmitError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 shadow-xl">
      {submitSuccess ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Mesajınız Alındı</h3>
          <p className="text-gray-400 mb-6">En kısa sürede sizinle iletişime geçeceğiz. Teşekkür ederiz!</p>
          <button 
            onClick={() => {
              setSubmitSuccess(false);
              // Kullanıcı giriş yapmışsa bilgilerini tekrar doldur
              if (user) {
                setValue('name', user.user_metadata?.full_name || user.email?.split('@')[0] || '');
                setValue('email', user.email || '');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yeni Mesaj Gönder
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">İletişim Formu</h2>
          
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg">
              {submitError}
            </div>
          )}
          
          <div className="space-y-4">
            {/* İsim ve e-posta alanlarını sadece giriş yapmamış kullanıcılara göster */}
            {!user && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    İsim <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`w-full px-4 py-2 bg-black/30 border ${errors.name ? 'border-red-500' : 'border-white/10'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-colors`}
                    placeholder="Adınız ve soyadınız"
                    {...register('name')}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`w-full px-4 py-2 bg-black/30 border ${errors.email ? 'border-red-500' : 'border-white/10'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-colors`}
                    placeholder="E-posta adresiniz"
                    {...register('email')}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">
                Konu <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                type="text"
                className={`w-full px-4 py-2 bg-black/30 border ${errors.subject ? 'border-red-500' : 'border-white/10'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-colors`}
                placeholder="Mesajınızın konusu"
                {...register('subject')}
                disabled={isSubmitting}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Mesaj <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                className={`w-full px-4 py-2 bg-black/30 border ${errors.message ? 'border-red-500' : 'border-white/10'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-colors`}
                placeholder="Mesajınızı buraya yazın..."
                {...register('message')}
                disabled={isSubmitting}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Mesajı Gönder
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 