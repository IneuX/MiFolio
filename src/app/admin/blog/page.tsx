import { requireAdmin } from '@/lib/supabase-server';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { getBlogPosts } from '@/app/actions/blog-fixed';
import { DICTIONARY } from '@/constants';
import AdminBlogList from '@/components/AdminBlogList';

/** /admin/blog 无 lang 参数，使用 en 与 [lang] 页保持同一套列表与操作 */
const LANG = 'en';

export default async function AdminBlogPage() {
  const user = await requireAdmin();
  const result = await getBlogPosts('all');
  const allPosts = result.success ? result.data || [] : [];
  const dict = DICTIONARY[LANG].admin.blog;
  const dashboardDict = DICTIONARY[LANG].admin.dashboard;
  const commonDict = DICTIONARY[LANG].admin.common;

  return (
    <div className="min-h-screen bg-black text-white">
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
                href={`/${LANG}/admin`}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                {commonDict.dashboard}
              </Link>
              <LogoutButton lang={LANG} label={commonDict.logout} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{dict.title}</h2>
            <p className="text-white/60">{dict.subtitle}</p>
          </div>
          <Link
            href={`/${LANG}/admin/blog/new`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors"
          >
            <Plus size={16} />
            <span>{dict.newPost}</span>
          </Link>
        </div>

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

        <AdminBlogList posts={allPosts} dict={dict} lang={LANG} />
      </main>
    </div>
  );
}
