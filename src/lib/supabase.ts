import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type BlogPost = {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: 'draft' | 'published';
  tags: string[];
  category: string;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
};

export type BlogPostInsert = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;

export type BlogPostUpdate = Partial<BlogPostInsert>;