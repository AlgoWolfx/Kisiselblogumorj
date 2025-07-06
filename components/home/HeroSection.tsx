'use client';

import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function Star({ delay = 0 }) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-white rounded-full"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: Math.random() * 2 + 1,
        repeat: Infinity,
        delay: delay,
      }}
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
    />
  );
}

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <section className="relative w-full bg-gradient-to-br from-[#0F172A] to-[#1E293B] py-20 mb-16 overflow-hidden">
      {/* Stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Star key={i} delay={i * 0.1} />
      ))}
      
      {/* Shooting stars */}
      <motion.div
        className="absolute w-[2px] h-[2px] bg-white"
        initial={{ top: "-5%", left: "95%", opacity: 0 }}
        animate={{
          top: ["0%", "100%"],
          left: ["95%", "5%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
        style={{
          boxShadow: "0 0 0 1px #ffffff10, 0 0 2px 1px #ffffff30, 0 0 30px 0px #ffffff50",
        }}
      />
      
      <div className="container px-4 mx-auto max-w-7xl relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-sans text-5xl md:text-6xl font-bold mb-6 text-white">
            Hoşgeldiniz ben <span className="text-[#60A5FA]">Yiğit</span>
          </h1>
          <p className="font-serif text-xl text-gray-300 mb-8 leading-relaxed">
            Bu, teknoloji, finans ve yazılım hakkında düşüncelerimi, 
            fikirlerimi ve deneyimlerimi paylaştığım kişisel bir blog.
          </p>
          
          {/* Ana Arama Alanı */}
          <motion.div 
            className="max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Blog yazılarında ara..."
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                />
                <button 
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Örnek: Next.js, React, veya herhangi bir konu...
              </div>
            </form>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/about"
              className="px-8 py-4 bg-[#3B82F6] text-white rounded-2xl font-medium hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg backdrop-blur-sm bg-opacity-80"
            >
              Hakkımda
            </Link>
            <Link
              href="/blog"
              className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-medium hover:bg-white/20 transition-colors shadow-md hover:shadow-lg backdrop-blur-sm flex items-center justify-center"
            >
              Son Yazılar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}