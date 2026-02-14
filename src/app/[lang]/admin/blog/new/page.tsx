import { requireAdmin } from '@/lib/supabase-server';
import BlogEditor from '@/components/BlogEditor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { DICTIONARY } from '@/constants';

interface AdminNewBlogPageProps {
  params: { lang: string };
}

export default async function AdminNewBlogPage({ params }: AdminNewBlogPageProps) {
  await requireAdmin();
  const lang = params.lang === 'zh' ? 'zh' : 'en';
  const dict = DICTIONARY[lang].admin.editor;
  const commonDict = DICTIONARY[lang].admin.common;
  const blogDict = DICTIONARY[lang].blog; // 复用博客相关的字典
  
  // 合并字典
  const editorDict = {
    ...blogDict,
    ...dict
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 管理员顶部栏 */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/admin/blog`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowLeft size={16} />
                <span>{dict.backToBlog}</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/admin`}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                {commonDict.dashboard}
              </Link>
              <LogoutButton lang={lang} label={commonDict.logout} />
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{dict.createNew}</h2>
          <p className="text-white/60">
            {dict.writeThoughts}
          </p>
        </div>

        {/* 博客编辑器 */}
        <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden">
          <BlogEditor
            dict={editorDict}
            mode="create"
            lang={lang}
          />
        </div>
      </main>
    </div>
  );
}