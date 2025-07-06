export function PostContent({ content }: { content: string }) {
  return (
    <div className="prose prose-lg max-w-none font-serif mb-12">
      <div dangerouslySetInnerHTML={{ __html: content }} />
      
      {/* Example content styling */}
      <style jsx global>{`
        .prose {
          font-family: var(--font-merriweather);
          line-height: 1.8;
          color: #374151;
        }
        
        .prose h2, .prose h3, .prose h4 {
          font-family: var(--font-inter);
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          line-height: 1.3;
          color: #111827;
        }
        
        .prose h2 {
          font-size: 1.875rem;
        }
        
        .prose h3 {
          font-size: 1.5rem;
        }
        
        .prose p {
          margin-bottom: 1.5rem;
        }
        
        .prose blockquote {
          border-left: 4px solid #3B82F6;
          padding-left: 1rem;
          font-style: italic;
          color: #4B5563;
          margin: 1.5rem 0;
        }
        
        .prose pre {
          background-color: #1F2937;
          color: #E5E7EB;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: monospace;
          margin: 1.5rem 0;
        }
        
        .prose code {
          background-color: #E5E7EB;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        
        .prose img {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
}