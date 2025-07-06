import { format } from 'date-fns';
import { Clock, Calendar, User } from 'lucide-react';
import SupabaseImage from '../ui/SupabaseImage';

interface PostHeaderProps {
  title: string;
  coverImage: string;
  date: string;
  author: string;
  readTime: number;
  category?: string;
}

export function PostHeader({ 
  title, 
  coverImage, 
  date, 
  author, 
  readTime,
  category 
}: PostHeaderProps) {
  return (
    <header className="mb-12">
      {category && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-sm font-medium text-blue-300 bg-blue-500/20 rounded-full border border-blue-500/30">
            {category}
          </span>
        </div>
      )}
      
      <h1 className="font-sans text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
        {title}
      </h1>
      
      <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-400 mb-8 gap-4">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          <span className="font-sans">{author}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{format(new Date(date), 'MMMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>{readTime} min read</span>
        </div>
      </div>
      
      <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-8">
        <SupabaseImage
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          className="object-cover"
          priority
        />
      </div>
    </header>
  );
}