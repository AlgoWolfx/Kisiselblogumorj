'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface SupabaseImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

export default function SupabaseImage({
  src,
  fallbackSrc = '/images/placeholder.jpg',
  alt,
  ...props
}: SupabaseImageProps) {
  const [error, setError] = useState(false);
  
  // Supabase URL'ini kontrol et
  const isSupabaseUrl = typeof src === 'string' && src.includes('supabase.co');
  
  if (isSupabaseUrl) {
    return (
      <div className={`relative ${props.className || ''}`} style={props.style}>
        {/* Loader için gri arka plan */}
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"
          style={{ zIndex: 0 }} 
        />
        
        {/* Resim içeriği */}
        <img
          src={error ? fallbackSrc : src}
          alt={alt as string}
          onError={() => setError(true)}
          className={`w-full h-full object-cover ${props.className || ''}`}
          style={{ 
            ...props.style,
            zIndex: 1, 
            objectFit: 'cover',
            position: 'relative'
          }}
        />
      </div>
    );
  }
  
  // Supabase URL değilse normal Next.js Image kullan
  return <Image src={src} alt={alt as string} {...props} />;
} 