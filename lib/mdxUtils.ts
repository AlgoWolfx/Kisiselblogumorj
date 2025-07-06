'use server';

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { cache } from 'react';

// Bu dosya sadece sunucu tarafında çalışacak
// 'use server' direktifi Next.js 13+ için sunucu bileşenlerini işaretler

const contentDirectory = path.join(process.cwd(), 'content');
const blogDirectory = path.join(contentDirectory, 'blog');

// Markdown dosyalarının içeriklerini ve meta verilerini okur
export async function getMarkdownFile(filePath: string) {
  try {
    const source = await fs.promises.readFile(filePath, 'utf8');
    const { data, content } = matter(source);
    
    return {
      frontMatter: data,
      slug: path.basename(filePath).replace(/\.md$/, ''),
      content,
    };
  } catch (error) {
    console.error(`Error reading Markdown file ${filePath}:`, error);
    return null;
  }
}

// Tüm blog yazılarını getirir - React Cache ile önbelleğe alma
export const getAllPosts = cache(async () => {
  try {
    const files = await getFiles(blogDirectory);
    const postsPromises = files.map((file) => getMarkdownFile(file));
    const postsResults = await Promise.all(postsPromises);
    
    return postsResults
      .filter(Boolean) // null değerleri filtreleme
      .sort((a, b) => {
        if (!a || !b) return 0;
        const dateA = new Date(a.frontMatter.date);
        const dateB = new Date(b.frontMatter.date);
        return dateB.getTime() - dateA.getTime(); // Azalan sıralama (en yeni ilk)
      });
  } catch (error) {
    console.error("Error getting all posts:", error);
    return [];
  }
});

// Belirli bir klasördeki tüm Markdown dosyalarını bulur
async function getFiles(dir: string): Promise<string[]> {
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  try {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const filesPromises = dirents.map(async (dirent) => {
      const res = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        return getFiles(res);
      }
      
      return dirent.name.endsWith('.md') ? [res] : [];
    });
    
    const nestedFiles = await Promise.all(filesPromises);
    return nestedFiles.flat();
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

// Öne çıkan gönderileri getirir
export const getFeaturedPosts = cache(async () => {
  const posts = await getAllPosts();
  return posts.filter(post => post && post.frontMatter.featured);
});

// Slug'a göre belirli bir blog yazısını getirir
export const getPostBySlug = cache(async (slug: string) => {
  const posts = await getAllPosts();
  return posts.find(post => post && post.slug === slug);
});

// Kategoriye göre blog yazılarını filtreler
export const getPostsByCategory = cache(async (category: string) => {
  const posts = await getAllPosts();
  return posts.filter(post => post && post.frontMatter.category === category);
});

// Etikete göre blog yazılarını filtreler
export const getPostsByTag = cache(async (tag: string) => {
  const posts = await getAllPosts();
  return posts.filter(post => post && post.frontMatter.tags?.includes(tag));
});

// Tüm kategorileri getirir
export const getAllCategories = cache(async () => {
  const posts = await getAllPosts();
  const categories = new Set<string>();
  
  posts.forEach(post => {
    if (post && post.frontMatter.category) {
      categories.add(post.frontMatter.category);
    }
  });
  
  return Array.from(categories);
});

// Tüm etiketleri getirir
export const getAllTags = cache(async () => {
  const posts = await getAllPosts();
  const tags = new Set<string>();
  
  posts.forEach(post => {
    if (post && post.frontMatter.tags) {
      post.frontMatter.tags.forEach((tag: string) => tags.add(tag));
    }
  });
  
  return Array.from(tags);
});

// Arama fonksiyonu - blog yazılarında arama yapar
export async function searchPosts(query: string) {
  if (!query || query.trim() === '') {
    return [];
  }

  const posts = await getAllPosts();
  const searchTerm = query.toLowerCase().trim();
  
  return posts.filter(post => {
    if (!post) return false;
    
    // Başlık, özet, içerik, kategori ve etiketlerde arama yap
    const { title, excerpt, category, tags = [] } = post.frontMatter;
    const { content, slug } = post;
    
    // Tüm alanları bir araya getir ve küçük harfe çevir
    const searchableContent = [
      title,
      excerpt,
      content,
      category,
      tags.join(' '),
      slug
    ].join(' ').toLowerCase();
    
    // Arama terimini içerip içermediğini kontrol et
    return searchableContent.includes(searchTerm);
  });
}

// İlgili yazıları getir
export const getRelatedPosts = cache(async (slug: string, limit: number = 3) => {
  const currentPost = await getPostBySlug(slug);
  if (!currentPost) return [];

  const allPosts = await getAllPosts();
  const filteredPosts = allPosts.filter(post => post && post.slug !== slug);
  
  // İlgililik puanı hesapla
  const scoredPosts = filteredPosts.map(post => {
    if (!post) return { post: null, score: 0 };
    
    let score = 0;
    
    // Aynı kategori +3 puan
    if (post.frontMatter.category === currentPost.frontMatter.category) {
      score += 3;
    }
    
    // Ortak etiketler başına +1 puan
    const currentTags = currentPost.frontMatter.tags || [];
    const postTags = post.frontMatter.tags || [];
    
    const commonTags = currentTags.filter(tag => postTags.includes(tag));
    score += commonTags.length;
    
    return {
      post,
      score
    };
  });
  
  // Puanları sırala ve sadece puanı 0'dan büyük olanları filtrele
  const relatedPosts = scoredPosts
    .filter(item => item.post && item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
  
  // Yeterli sayıda ilgili yazı yoksa son eklenen yazıları tamamla
  if (relatedPosts.length < limit) {
    const recentPosts = filteredPosts
      .filter(post => post && !relatedPosts.find(p => p && p.slug === post.slug))
      .sort((a, b) => {
        if (!a || !b) return 0;
        const dateA = new Date(a.frontMatter.date);
        const dateB = new Date(b.frontMatter.date);
        return dateB.getTime() - dateA.getTime(); // En son eklenenler önce
      })
      .slice(0, limit - relatedPosts.length);
    
    return [...relatedPosts, ...recentPosts];
  }
  
  return relatedPosts;
}); 