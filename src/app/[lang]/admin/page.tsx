import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase-server';
import { LogOut, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { DICTIONARY } from '@/constants';

interface AdminPageProps {
  params: { lang: string };
}

export default async function AdminPage({ params }: AdminPageProps) {
  // 检查管理员权限（如果未通过会抛出错误）
  const user = await requireAdmin();
  const lang = params.lang === 'zh' ? 'zh' : 'en';
  const dict = DICTIONARY[lang].admin.dashboard;
  const commonDict = DICTIONARY[lang].admin.common;
  
  // 管理员权限通过，显示页面

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
              <h1 className="text-2xl font-bold">{dict.title}</h1>
              <p className="text-sm text-white/60 mt-1">
                {commonDict.welcome}, {user.email} • {commonDict.adminPrivileges}
              </p>
            </div>
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
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4">{dict.title}</h2>
          <p className="text-white/60 max-w-3xl">
            {dict.subtitle}
          </p>
        </div>

        {/* 管理功能导航 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href={`/${lang}/admin/blog`} className="group">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-400 text-sm font-medium">{dict.blogManagement}</div>
                <ArrowRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold mb-2">{dict.blogManagement}</h3>
              <p className="text-white/60 text-sm">
                {dict.blogDescription}
              </p>
            </div>
          </Link>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-purple-400 text-sm font-medium mb-2">{dict.portfolioManagement}</div>
            <h4 className="text-lg font-bold mb-2">{dict.comingSoon}</h4>
            <p className="text-white/60 text-sm">
              {dict.portfolioDescription}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-green-400 text-sm font-medium mb-2">{dict.userSettings}</div>
            <h4 className="text-lg font-bold mb-2">{dict.comingSoon}</h4>
            <p className="text-white/60 text-sm">
              {dict.userSettingsDescription}
            </p>
          </div>
        </div>

        {/* 管理功能概览 - 这里可以保留英文或者也做国际化，目前先保留原样或简化 */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-6">Admin Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-green-400 text-sm font-medium mb-2">Secure Access</div>
              <h4 className="text-lg font-bold mb-2">Protected by Email</h4>
              <p className="text-white/60 text-sm">
                Only your email ({process.env.ADMIN_EMAIL}) can access this admin panel.
                All API calls are protected by middleware.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-blue-400 text-sm font-medium mb-2">Real-time Editor</div>
              <h4 className="text-lg font-bold mb-2">Markdown Support</h4>
              <p className="text-white/60 text-sm">
                Write in markdown with live preview. Auto-save drafts and keyboard shortcuts (Ctrl+S, Ctrl+P).
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-purple-400 text-sm font-medium mb-2">Direct Publishing</div>
              <h4 className="text-lg font-bold mb-2">Instant Deployment</h4>
              <p className="text-white/60 text-sm">
                Published posts appear immediately on your blog. Control visibility, tags, and categories.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}