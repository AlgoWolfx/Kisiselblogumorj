'use client';

import { Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

export function PostFooter({ tags }: { tags: string[] }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 pt-8">
      <div className="flex flex-wrap gap-3 mb-8">
        {tags && tags.map((tag, index) => (
          <span 
            key={index}
            className="inline-block px-4 py-2 text-sm font-medium text-[#3B82F6] bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>
      
      <div>
        <h3 className="font-sans text-lg font-bold mb-4 text-gray-900 dark:text-white">Share this post</h3>
        <div className="flex flex-wrap gap-3">
          <SocialButton 
            icon={<Twitter className="h-5 w-5" />} 
            label="Twitter"
            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')}
          />
          <SocialButton 
            icon={<Facebook className="h-5 w-5" />} 
            label="Facebook"
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
          />
          <SocialButton 
            icon={<Linkedin className="h-5 w-5" />} 
            label="LinkedIn"
            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
          />
          <SocialButton 
            icon={<LinkIcon className="h-5 w-5" />} 
            label={copied ? "Copied!" : "Copy link"}
            onClick={copyToClipboard}
          />
        </div>
      </div>
    </footer>
  );
}

function SocialButton({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      aria-label={label}
    >
      {icon}
      <span className="font-sans text-sm">{label}</span>
    </button>
  );
}