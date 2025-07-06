import { searchPosts } from '@/lib/markdownUtils';
import { SearchResults } from '@/components/search/SearchResults';

interface SearchPageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  return {
    title: `"${query}" için arama sonuçları | Kişisel Blog`,
    description: `"${query}" için blog yazıları arama sonuçları`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const searchResults = query ? await searchPosts(query) : [];
  
  return <SearchResults initialResults={searchResults} initialQuery={query} />;
} 