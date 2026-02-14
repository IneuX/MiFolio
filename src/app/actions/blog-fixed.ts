'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase-server';

/** 获取服务端 Supabase 客户端（带 cookie），不 fallback 到浏览器客户端以防权限错乱 */
async function getSupabase() {
  try {
    return await createClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[blog-fixed] getSupabase failed: server Supabase client unavailable', message, error instanceof Error ? error.stack : undefined);
    throw new Error('Server configuration error. Please try again later.');
  }
}

export async function createBlogPost(formData: FormData) {
  try {
    // 验证管理员权限
    await requireAdmin();
    
    const supabase = await getSupabase();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const tags = formData.get('tags') as string;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string;

    if (!title?.trim()) {
      return { success: false, error: 'Title is required' };
    }
    if (title.trim().length > TITLE_MAX_LENGTH) {
      console.warn('[blog-fixed] createBlogPost: title exceeds max length');
      return { success: false, error: `Title must be ${TITLE_MAX_LENGTH} characters or less` };
    }
    if (!content?.trim()) {
      return { success: false, error: 'Content is required' };
    }
    if (content.length > CONTENT_MAX_LENGTH) {
      console.warn('[blog-fixed] createBlogPost: content exceeds max length');
      return { success: false, error: 'Content is too long' };
    }

    // 生成 slug
    let slug = generateSlug(title);
    
    // 双重验证：确保slug不为空
    if (!slug || slug.trim() === '') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[blog-fixed] createBlogPost: generated slug empty, using fallback');
      }
      slug = `post-${Date.now()}`;
    }

    slug = await ensureUniqueSlug(supabase, slug);

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

    // 插入数据库
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogData])
      .select()
      .single();
    
    if (error) {
      console.error('[blog-fixed] createBlogPost Supabase error:', error.message);
      return { success: false, error: 'Failed to create post' };
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
    console.error('[blog-fixed] createBlogPost failed:', error instanceof Error ? error.message : error);
    return { success: false, error: 'An unexpected error occurred' };
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
    
    const trimmedTitle = title?.trim() || 'Untitled Draft';
    const trimmedContent = content?.trim() ?? '';
    if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      console.warn('[blog-fixed] saveBlogDraft: title exceeds max length');
      return { success: false, error: `Title must be ${TITLE_MAX_LENGTH} characters or less` };
    }
    if (trimmedContent.length > CONTENT_MAX_LENGTH) {
      console.warn('[blog-fixed] saveBlogDraft: content exceeds max length');
      return { success: false, error: 'Content is too long' };
    }

    let slug = title ? generateSlug(title) : `draft-${Date.now()}`;
    slug = await ensureUniqueSlug(supabase, slug);

    const blogData = {
      title: trimmedTitle,
      content: trimmedContent,
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
      console.error('[blog-fixed] saveBlogDraft Supabase error:', error.message);
      return { success: false, error: 'Failed to save draft' };
    }

    return {
      success: true,
      data,
      message: 'Draft saved successfully!'
    };
  } catch (error) {
    console.error('[blog-fixed] saveBlogDraft failed:', error instanceof Error ? error.message : error);
    return {
      success: false,
      error: 'An unexpected error occurred'
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
      console.error('[blog-fixed] getBlogPosts Supabase error:', error.message);
      return { success: false, error: 'Failed to fetch posts', data: [] };
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('[blog-fixed] getBlogPosts failed:', error instanceof Error ? error.message : error);
    return { success: false, error: 'Failed to fetch blog posts', data: [] };
  }
}

const SLUG_MAX_LENGTH = 512;
const TITLE_MAX_LENGTH = 500;
const CONTENT_MAX_LENGTH = 2_000_000; // 2MB chars
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidPostId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && UUID_REGEX.test(id.trim());
}

function safeDecodeSlug(slug: string): { ok: true; value: string } | { ok: false } {
  if (!slug || typeof slug !== 'string') return { ok: false };
  const trimmed = slug.trim();
  if (trimmed.length === 0 || trimmed.length > SLUG_MAX_LENGTH) return { ok: false };
  try {
    const decoded = decodeURIComponent(trimmed);
    if (decoded.length > SLUG_MAX_LENGTH) return { ok: false };
    return { ok: true, value: decoded };
  } catch {
    return { ok: false };
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const decoded = safeDecodeSlug(slug);
    if (!decoded.ok) {
      console.warn('[blog-fixed] getBlogPostBySlug: invalid or malformed slug', { slugLength: slug?.length });
      return { success: false, error: 'Post not found', data: null };
    }
    const decodedSlug = decoded.value;

    const supabase = await getSupabase();

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
      if (process.env.NODE_ENV === 'development') {
        console.warn('[blog-fixed] getBlogPostBySlug auth check failed or not admin:', authError instanceof Error ? authError.message : authError);
      }
    }

    // 3. 如果都未找到，返回错误
    return {
      success: false,
      error: 'Post not found',
      data: null
    };
    
  } catch (error) {
    console.error('[blog-fixed] getBlogPostBySlug failed:', error instanceof Error ? error.message : error);
    return {
      success: false,
      error: 'Failed to fetch blog post',
      data: null
    };
  }
}

export async function updateBlogPost(postId: string, formData: FormData) {
  try {
    await requireAdmin();

    if (!isValidPostId(postId)) {
      console.warn('[blog-fixed] updateBlogPost: invalid postId format');
      return { success: false, error: 'Invalid post' };
    }

    const supabase = await getSupabase();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const tags = formData.get('tags') as string;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string;
    const status = formData.get('status') as string;
    
    if (!title?.trim()) {
      return { success: false, error: 'Title is required' };
    }
    if (title.trim().length > TITLE_MAX_LENGTH) {
      console.warn('[blog-fixed] updateBlogPost: title exceeds max length');
      return { success: false, error: `Title must be ${TITLE_MAX_LENGTH} characters or less` };
    }
    if (!content?.trim()) {
      return { success: false, error: 'Content is required' };
    }
    if (content.length > CONTENT_MAX_LENGTH) {
      console.warn('[blog-fixed] updateBlogPost: content exceeds max length');
      return { success: false, error: 'Content is too long' };
    }

    // 生成新的 slug（如果标题改变）
    let slug = generateSlug(title);
    
    // 确保 slug 唯一 (排除当前文章 ID)
    slug = await ensureUniqueSlug(supabase, slug, postId);
    
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
      console.error('[blog-fixed] updateBlogPost Supabase error:', error.message);
      return { success: false, error: 'Failed to update post' };
    }
    
    // 重新验证博客页面
    revalidatePath('/blog');
    revalidatePath('/[lang]/blog', 'page');
    
    return {
      success: true,
      data,
      message: 'Blog post updated successfully!'
    };
    
  } catch (error) {
    console.error('[blog-fixed] updateBlogPost failed:', error instanceof Error ? error.message : error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteBlogPost(postId: string) {
  try {
    await requireAdmin();

    if (!isValidPostId(postId)) {
      console.warn('[blog-fixed] deleteBlogPost: invalid postId format');
      return { success: false, error: 'Invalid post' };
    }

    const supabase = await getSupabase();

    // 删除数据库记录
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);
    
    if (error) {
      console.error('[blog-fixed] deleteBlogPost Supabase error:', error.message);
      return { success: false, error: 'Failed to delete post' };
    }
    
    // 重新验证博客页面
    revalidatePath('/blog');
    revalidatePath('/[lang]/blog', 'page');
    
    return {
      success: true,
      message: 'Blog post deleted successfully!'
    };
    
  } catch (error) {
    console.error('[blog-fixed] deleteBlogPost failed:', error instanceof Error ? error.message : error);
    return { success: false, error: 'An unexpected error occurred' };
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

const MAX_SLUG_UNIQUE_ITERATIONS = 1000;

// 辅助函数：确保 slug 唯一
async function ensureUniqueSlug(supabase: any, baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (counter <= MAX_SLUG_UNIQUE_ITERATIONS) {
    let query = supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('[blog-fixed] ensureUniqueSlug query error:', error.message);
      return slug;
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  console.error('[blog-fixed] ensureUniqueSlug exceeded max iterations', { baseSlug, max: MAX_SLUG_UNIQUE_ITERATIONS });
  return `${baseSlug}-${Date.now()}`;
}