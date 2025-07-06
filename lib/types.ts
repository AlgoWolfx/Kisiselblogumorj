export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: number;
  coverImage: string;
  category: string;
  tags: string[];
}