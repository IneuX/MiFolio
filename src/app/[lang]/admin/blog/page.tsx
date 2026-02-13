import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase-server';
import { LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { getBlogPosts } from '@/app/actions/blog-fixed';
import { supabase } from '@/lib/supabase';
import { DICTIONARY } from '@/constants';
import AdminBlogList from '@/components/AdminBlogList';

interface AdminBlogPageProps {
  params: { lang: string };
}

export default async function AdminBlogPage({ params }: AdminBlogPageProps) {
  // 检查管理员权限
  const user = await requireAdmin();
  const lang = params.lang === 'zh' ? 'zh' : 'en';
  const dict = DICTIONARY[lang].admin.blog;
  const commonDict = DICTIONARY[lang].admin.common;
  const dashboardDict = DICTIONARY[lang].admin.dashboard;
  
  // 获取所有博客文章（包括草稿和已发布）
  const result = await getBlogPosts('all');
  const allPosts = result.success ? result.data || [] : [];

  const handleLogout = async () => {
    'use server';
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 管理员顶部栏 */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{dashboardDict.title}</h1>
              <p className="text-sm text-white/60 mt-1">
                {commonDict.welcome}, {user.email} • {commonDict.adminPrivileges}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/admin`}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                {commonDict.dashboard}
              </Link>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  <LogOut size={16} />
                  <span>{commonDict.logout}</span>
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
            <h2 className="text-3xl font-bold mb-2">{dict.title}</h2>
            <p className="text-white/60">
              {dict.subtitle}
            </p>
          </div>
          <Link
            href={`/${lang}/admin/blog/new`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors"
          >
            <Plus size={16} />
            <span>{dict.newPost}</span>
          </Link>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-white mb-2">{allPosts.length}</div>
            <div className="text-sm text-white/60">{dict.totalPosts}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {allPosts.filter(post => post.status === 'published').length}
            </div>
            <div className="text-sm text-white/60">{dict.published}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {allPosts.filter(post => post.status === 'draft').length}
            </div>
            <div className="text-sm text-white/60">{dict.drafts}</div>
          </div>
        </div>

        {/* 文章列表 - 使用客户端组件 */}
        <AdminBlogList posts={allPosts} dict={dict} lang={lang} />
      </main>
    </div>
  );
}