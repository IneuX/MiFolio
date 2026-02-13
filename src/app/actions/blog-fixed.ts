'use server';

import { supabase as publicSupabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase-server';

// Helper to get the appropriate Supabase client
async function getSupabase() {
  try {
    return await createClient();
  } catch (error) {
    // Fallback to public client if cookies() is not available (e.g. during static generation)
    return publicSupabase;
  }
}

export async function createBlogPost(formData: FormData) {
  try {
    // 验证管理员权限
    await requireAdmin();
    
    const supabase = await getSupabase();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const password = formData.get('password') as string;
    const tags = formData.get('tags') as string;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string;
    
    console.log('Creating blog post with title:', title);
    console.log('Password provided:', !!password);
    
    // 保留密码验证作为额外安全层（可选）
    const adminPassword = process.env.ADMIN_PASSWORD;
    console.log('Admin password configured:', !!adminPassword);
    
    if (adminPassword && password !== adminPassword) {
      console.error('Invalid password');
      return {
        success: false,
        error: 'Invalid password'
      };
    }
    
    // 验证必填字段
    if (!title?.trim()) {
      return {
        success: false,
        error: 'Title is required'
      };
    }

    if (!content?.trim()) {
      return {
        success: false,
        error: 'Content is required'
      };
    }
    
    // 生成 slug
    let slug = generateSlug(title);
    
    // 双重验证：确保slug不为空
    if (!slug || slug.trim() === '') {
      console.warn('Generated slug is empty, using fallback');
      slug = `post-${Date.now()}`;
    }
    
    console.log('Generated slug:', slug);
    
    // 准备数据
    const blogData = {
      title: title.trim(),
      content: content.trim(),
      slug,
      status: 'published' as const,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      category: category?.trim() || '',
      visibility: (visibility as 'public' | 'private') || 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Blog data prepared:', { ...blogData, content: '[...]' });
    
    // 检查 Supabase 连接
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Not configured');
    
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
        error: `Database error: ${error.message}`
      };
    }
    
    console.log('Blog post created successfully:', data?.id);
    
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
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function saveBlogDraft(formData: FormData) {
  try {
    // 验证管理员权限
    await requireAdmin();
    
    const supabase = await getSupabase();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const tags = formData.get('tags') as string;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string;
    
    // 生成 slug（如果有标题）
    const slug = title ? generateSlug(title) : `draft-${Date.now()}`;
    
    // 准备数据
    const blogData = {
      title: title?.trim() || 'Untitled Draft',
      content: content?.trim() || '',
      slug,
      status: 'draft' as const,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      category: category?.trim() || '',
      visibility: (visibility as 'public' | 'private') || 'private',
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
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function getBlogPosts(status?: 'draft' | 'published' | 'all') {
  try {
    const supabase = await getSupabase();
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching blog posts:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch blog posts',
      data: []
    };
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const supabase = await getSupabase();
    
    // 确保 slug 被正确解码（处理中文 URL 编码问题）
    const decodedSlug = decodeURIComponent(slug);
    console.log(`Fetching blog post. Original slug: "${slug}", Decoded slug: "${decodedSlug}"`);
    
    // 1. 尝试获取公开文章（适用于所有人）
    const { data: publicPost } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', decodedSlug)
      .eq('status', 'published')
      .eq('visibility', 'public')
      .single();
    
    if (publicPost) {
      return {
        success: true,
        data: publicPost
      };
    }
    
    // 2. 如果未找到公开文章，尝试以管理员身份获取（需要验证权限）
    try {
      // 检查当前用户是否为管理员
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = process.env.ADMIN_EMAIL;
      
      if (user && user.email === adminEmail) {
        // 使用 createClient 创建一个新的 supabase 实例来绕过 RLS（如果需要）
        // 或者因为我们是管理员，RLS 策略可能已经允许我们访问
        // 注意：这里的 supabase 实例已经是根据上下文创建的（可能是 server client）
        
        const { data: adminPost, error: adminError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', decodedSlug)
          .single();
          
        if (adminPost) {
          return {
            success: true,
            data: adminPost
          };
        }
      }
    } catch (authError) {
      // 忽略认证错误，继续返回未找到
      console.log('Auth check failed or not admin:', authError);
    }

    // 3. 如果都未找到，返回错误
    return {
      success: false,
      error: 'Post not found',
      data: null
    };
    
  } catch (error) {
    console.error('Error in getBlogPostBySlug:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch blog post',
      data: null
    };
  }
}

export async function updateBlogPost(postId: string, formData: FormData) {
  try {
    // 验证管理员权限
    await requireAdmin();
    
    const supabase = await getSupabase();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const tags = formData.get('tags') as string;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string;
    const status = formData.get('status') as string;
    
    // 验证必填字段
    if (!title?.trim()) {
      return {
        success: false,
        error: 'Title is required'
      };
    }

    if (!content?.trim()) {
      return {
        success: false,
        error: 'Content is required'
      };
    }
    
    // 生成新的 slug（如果标题改变）
    const slug = generateSlug(title);
    
    // 准备更新数据
    const updateData = {
      title: title.trim(),
      content: content.trim(),
      slug,
      status: (status as 'draft' | 'published') || 'published',
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      category: category?.trim() || '',
      visibility: (visibility as 'public' | 'private') || 'public',
      updated_at: new Date().toISOString()
    };
    
    // 更新数据库
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating blog post:', error);
      return {
        success: false,
        error: `Database error: ${error.message}`
      };
    }
    
    console.log('Blog post updated successfully:', data?.id);
    
    // 重新验证博客页面
    revalidatePath('/blog');
    revalidatePath('/[lang]/blog', 'page');
    
    return {
      success: true,
      data,
      message: 'Blog post updated successfully!'
    };
    
  } catch (error) {
    console.error('Error in updateBlogPost:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function deleteBlogPost(postId: string) {
  try {
    // 验证管理员权限
    await requireAdmin();
    
    const supabase = await getSupabase();
    
    // 删除数据库记录
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);
    
    if (error) {
      console.error('Error deleting blog post:', error);
      return {
        success: false,
        error: `Database error: ${error.message}`
      };
    }
    
    console.log('Blog post deleted successfully:', postId);
    
    // 重新验证博客页面
    revalidatePath('/blog');
    revalidatePath('/[lang]/blog', 'page');
    
    return {
      success: true,
      message: 'Blog post deleted successfully!'
    };
    
  } catch (error) {
    console.error('Error in deleteBlogPost:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

// 辅助函数：生成 URL 友好的 slug
function generateSlug(title: string): string {
  // 尝试保留中文、字母、数字
  let slug = title
    .toLowerCase()
    .trim()
    // 替换空格为连字符
    .replace(/\s+/g, '-')
    // 移除非 URL 安全字符（保留中文、字母、数字、连字符）
    // \u4e00-\u9fa5 匹配中文
    .replace(/[^\w\-\u4e00-\u9fa5]/g, '')
    // 移除连续的连字符
    .replace(/--+/g, '-');
  
  // 如果生成的 slug 为空（例如全是特殊符号），使用时间戳
  if (!slug) {
    slug = `post-${Date.now()}`;
  }
  
  return slug.slice(0, 100);
}