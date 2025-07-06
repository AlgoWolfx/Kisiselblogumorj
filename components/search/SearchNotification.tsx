'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

interface SearchNotificationProps {
  query: string;
  count: number;
}

export function SearchNotification({ query, count }: SearchNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 5 saniye sonra otomatik olarak kaybolsun
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gray-900 border border-blue-500/30 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between bg-blue-500/10 px-4 py-2 border-b border-blue-500/20">
          <div className="font-medium text-sm text-blue-300">Arama Sonuçları</div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white p-1 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-white mb-3">
            <strong>"{query}"</strong> için <strong>{count}</strong> sonuç bulundu
          </p>
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition-colors text-sm"
          >
            Sonuçları Görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
} 