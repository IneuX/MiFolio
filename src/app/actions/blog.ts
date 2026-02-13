'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase-server';

export async function createBlogPost(formData: FormData) {
  try {
    // 验证管理员权限
    await requireAdmin();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const password = formData.get('password') as string;
    const tags = formData.get('tags') as string;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string;
    
    // 保留密码验证作为额外安全层（可选）
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && password !== adminPassword) {
      return {
        success: false,
        error: 'Invalid password'
      };
    }
    
    // 生成 slug
    const slug = generateSlug(title);
    
    // 准备数据
    const blogData = {
      title,
      content,
      slug,
      status: 'published' as const,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || '',
      visibility: visibility as 'public' | 'private',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 插入数据库
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating blog post:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // 重新验证博客页面
    revalidatePath('/blog');
    revalidatePath('/[lang]/blog', 'page');
    
    return {
      success: true,
      data,
      message: 'Blog post published successfully!'
    };
    
  } catch (error) {
    console.error('Error in createBlogPost:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function saveBlogDraft(formData: FormData) {
  try {
    // 验证管理员权限
    await requireAdmin();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const tags = formData.get('tags') as string;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string;
    
    // 生成 slug（如果有标题）
    const slug = title ? generateSlug(title) : `draft-${Date.now()}`;
    
    // 准备数据
    const blogData = {
      title: title || 'Untitled Draft',
      content,
      slug,
      status: 'draft' as const,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || '',
      visibility: visibility as 'public' | 'private',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 插入数据库
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogData])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      data,
      message: 'Draft saved successfully!'
    };
    
  } catch (error) {
    console.error('Error in saveBlogDraft:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function getBlogPosts(status?: 'draft' | 'published') {
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getBlogPostBySlug:', error);
    return null;
  }
}

// 辅助函数：生成 URL 友好的 slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-')     // 将空格替换为连字符
    .replace(/--+/g, '-')     // 移除连续的连字符
    .trim()
    .slice(0, 100);           // 限制长度
}