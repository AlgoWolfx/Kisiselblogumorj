'use client';

import React from 'react';

interface HighlightMatchProps {
  text: string;
  query: string;
  className?: string;
}

export function HighlightMatch({ text, query, className = '' }: HighlightMatchProps) {
  if (!query.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  // Arama terimini metinde bulmak için regex oluştur (case-insensitive)
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  // Metni parçalara ayır ve eşleşmeleri vurgula
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => (
        // Eğer metin arama terimine eşleşiyorsa vurgula
        regex.test(part) ? (
          <mark key={i} className="bg-blue-500/20 text-blue-200 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      ))}
    </span>
  );
} 