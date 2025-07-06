'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import SupabaseImage from '../ui/SupabaseImage';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className="prose prose-lg dark:prose-invert prose-blue max-w-none font-serif"
      remarkPlugins={[remarkGfm]}
      components={{
        // Bağlantıları Next.js Link bileşenine dönüştür
        a: ({ href, children, ...props }) => {
          if (href && href.startsWith('/')) {
            return (
              <Link href={href} {...props}>
                {children}
              </Link>
            );
          }

          if (href && href.startsWith('#')) {
            return <a href={href} {...props}>{children}</a>;
          }

          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          );
        },

        // Görüntüleri optimize et
        img: ({ src, alt, ...props }) => {
          if (!src) return null;
          
          return (
            <div className="my-6 relative h-64 md:h-96">
              <SupabaseImage
                src={src}
                alt={alt || ''}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 75vw"
                {...props}
              />
            </div>
          );
        },

        // Başlıklar için ID'ler ekle (anchor links için)
        h2: ({ children, ...props }) => {
          const id = typeof children === 'string' 
            ? children.toLowerCase().replace(/\s+/g, '-')
            : '';
            
          return (
            <h2 id={id} className="scroll-mt-24" {...props}>
              {children}
            </h2>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
} 