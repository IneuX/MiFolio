"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { deleteBlogPost } from '@/app/actions/blog-fixed';
import { useRouter } from 'next/navigation';

interface BlogPost {
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
}

interface AdminBlogListProps {
  posts: BlogPost[];
  dict: any;
  lang: string;
}

export default function AdminBlogList({ posts, dict, lang }: AdminBlogListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (postId: string) => {
    setIsDeleting(postId);
    try {
      const result = await deleteBlogPost(postId);
      if (result.success) {
        // 刷新页面以显示最新列表
        router.refresh();
      } else {
        alert(result.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(null);
      setShowDeleteConfirm(null);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return lang === 'zh'
      ? date.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  };

  // 计算阅读时间
  const calculateReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  return (
    <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold">{dict?.allPosts || "All Posts"}</h3>
      </div>
      
      {posts.length > 0 ? (
        <div className="divide-y divide-white/10">
          {posts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* 标题和状态 */}
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold truncate">
                      {post.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.status === 'published' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {post.status === 'published' ? (dict?.published || 'Published') : (dict?.draft || 'Draft')}
                    </span>
                    {post.visibility === 'private' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        {dict?.private || 'Private'}
                      </span>
                    )}
                  </div>

                  {/* 元信息 */}
                  <div className="flex items-center gap-4 text-sm text-white/40 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(post.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {calculateReadTime(post.content)} min read
                    </span>
                    {post.category && (
                      <span className="px-2 py-1 rounded bg-white/10 text-white/60">
                        {post.category}
                      </span>
                    )}
                  </div>

                  {/* 标签 */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs font-medium bg-white/5 text-white/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 ml-4">
                  {post.slug && post.slug.trim() !== '' ? (
                    <Link
                      href={`/${lang}/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      title={dict?.view || "View"}
                    >
                      <Eye size={16} />
                    </Link>
                  ) : (
                    <div 
                      className="p-2 rounded-lg text-white/30 cursor-not-allowed"
                      title={dict?.noSlug || "No valid slug available"}
                    >
                      <Eye size={16} />
                    </div>
                  )}
                  {post.slug && post.slug.trim() !== '' ? (
                    <Link
                      href={`/${lang}/admin/blog/${post.slug}/edit`}
                      className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      title={dict?.edit || "Edit"}
                    >
                      <Edit size={16} />
                    </Link>
                  ) : (
                    <div 
                      className="p-2 rounded-lg text-white/30 cursor-not-allowed"
                      title={dict?.noSlug || "No valid slug available"}
                    >
                      <Edit size={16} />
                    </div>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(post.id)}
                    className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title={dict?.delete || "Delete"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* 删除确认对话框 */}
              {showDeleteConfirm === post.id && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-3 text-red-400">
                    <AlertTriangle size={20} />
                    <span className="text-sm font-medium">
                      {dict?.deleteWarning || "Are you sure you want to delete this post? This action cannot be undone."}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {dict?.cancel || "Cancel"}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={isDeleting === post.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {isDeleting === post.id ? (dict?.deleting || "Deleting...") : (dict?.confirm || "Confirm")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="text-white/40 mb-4">
            <Calendar size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-white/60 mb-2">
            {dict?.noPosts || "No blog posts yet"}
          </h3>
          <p className="text-white/40 mb-6">
            {dict?.createFirst || "Start by creating your first blog post"}
          </p>
          <Link
            href={`/${lang}/admin/blog/new`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors"
          >
            <Edit size={16} />
            <span>{dict?.newPost || "New Post"}</span>
          </Link>
        </div>
      )}
    </div>
  );
}