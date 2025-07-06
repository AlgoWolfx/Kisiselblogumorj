export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          featured_image: string | null
          user_id: string
          published: boolean
          published_at: string | null
          views_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          featured_image?: string | null
          user_id: string
          published?: boolean
          published_at?: string | null
          views_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          featured_image?: string | null
          user_id?: string
          published?: boolean
          published_at?: string | null
          views_count?: number
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          post_id: string
          user_id: string
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          post_id: string
          user_id: string
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          post_id?: string
          user_id?: string
          content?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          bio: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 