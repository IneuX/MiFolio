import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey) && process.env.NODE_ENV === 'development') {
  console.error('[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Set them in .env.local.');
}

export const supabase = createBrowserClient(supabaseUrl || '', supabaseAnonKey || '');

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