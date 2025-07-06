'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedPosts } from '@/components/home/FeaturedPosts';
import { BlogList } from '@/components/home/BlogList';

interface HomeContentProps {
  featuredPosts: any[];
  allPosts: any[];
}

export function HomeContent({ featuredPosts, allPosts }: HomeContentProps) {
  return (
    <div className="flex flex-col items-center">
      <HeroSection />
      <div className="container px-4 mx-auto max-w-7xl">
        <FeaturedPosts posts={featuredPosts} />
        <BlogList posts={allPosts} />
      </div>
    </div>
  );
} 