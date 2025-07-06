import { getFeaturedPosts, getAllPosts } from '@/lib/markdownUtils';
import { HomeContent } from '@/components/home/HomeContent';

// Sunucu tarafında yeniden doğrulama için revalidate değeri ekle
export const revalidate = 3600; // 1 saat

export default async function Home() {
  const featuredPosts = await getFeaturedPosts();
  const allPosts = await getAllPosts();
  
  return <HomeContent featuredPosts={featuredPosts} allPosts={allPosts} />;
}