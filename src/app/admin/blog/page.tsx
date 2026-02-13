import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase-server';
import { LogOut, Plus, Edit, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { getBlogPosts } from '@/app/actions/blog-fixed';
import { supabase } from '@/lib/supabase';

export default async function AdminBlogPage() {
  // 检查管理员权限
  const user = await requireAdmin();
  
  // 获取所有博客文章（包括草稿和已发布）
  const result = await getBlogPosts('all');
  const allPosts = result.success ? result.data || [] : [];

  const handleLogout = async () => {
    'use server';
    await supabase.auth.signOut();
    redirect('/login');
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
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
    <div className="min-h-screen bg-black text-white">
      {/* 管理员顶部栏 */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-white/60 mt-1">
                Welcome, {user.email} • You have admin privileges
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                Dashboard
              </Link>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* 页面标题和操作区 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Blog Management</h2>
            <p className="text-white/60">
              Manage all your blog posts, drafts, and publications
            </p>
          </div>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors"
          >
            <Plus size={16} />
            <span>New Post</span>
          </Link>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-white mb-2">{allPosts.length}</div>
            <div className="text-sm text-white/60">Total Posts</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {allPosts.filter(post => post.status === 'published').length}
            </div>
            <div className="text-sm text-white/60">Published</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {allPosts.filter(post => post.status === 'draft').length}
            </div>
            <div className="text-sm text-white/60">Drafts</div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold">All Posts</h3>
          </div>
          
          {allPosts.length > 0 ? (
            <div className="divide-y divide-white/10">
              {allPosts.map((post) => (
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
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                        {post.visibility === 'private' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                            Private
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
                      <Link
                        href={`/en/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-white/40 mb-4">
                <Calendar size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-white/60 mb-2">
                No blog posts yet
              </h3>
              <p className="text-white/40 mb-6">
                Start by creating your first blog post
              </p>
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors"
              >
                <Plus size={16} />
                <span>Create First Post</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}