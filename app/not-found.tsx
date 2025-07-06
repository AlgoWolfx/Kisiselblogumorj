'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center px-4 mx-auto text-center min-h-[60vh] max-w-3xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-7xl font-bold text-white mb-4">404</h1>
        <div className="h-1 w-20 bg-blue-500 mx-auto mb-6 rounded-full"></div>
        <h2 className="text-3xl font-bold text-white mb-2">Sayfa Bulunamadı</h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir. Ana sayfaya dönebilir veya başka bir içerik arayabilirsiniz.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Ana Sayfaya Dön
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri Dön
          </button>
        </div>
      </motion.div>
    </div>
  );
}