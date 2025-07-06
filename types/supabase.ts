import { Database as DatabaseTypes } from './database.types';

// Database tipini daha kolay kullanmak için export edelim
export type Database = DatabaseTypes;

// Kullanışlı diğer tip tanımlamalarını da ekleyelim
export type Tables = DatabaseTypes['public']['Tables'];
export type BlogPost = Tables['blog_posts']['Row'];
export type Comment = Tables['comments']['Row'];
export type Profile = Tables['profiles']['Row']; 