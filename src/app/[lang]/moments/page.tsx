import { redirect } from 'next/navigation';
import { getCurrentUser, createClient } from '@/lib/supabase-server';
import Footer from '@/components/Footer';
import { DICTIONARY } from '@/constants';
import Link from 'next/link';
import { ArrowLeft, Pin } from 'lucide-react';

export default async function MomentsPage({
  params,
}: {
  params: { lang: string };
}) {
  const user = await getCurrentUser();
  const lang = params.lang === 'zh' ? 'zh' : 'en';
  if (!user) {
    redirect(`/${lang}/login`);
  }
  const dict = DICTIONARY[lang];
  const title = lang === 'zh' ? '朋友圈' : 'Moments';
  const backLabel = lang === 'zh' ? '返回首页' : 'Back to Home';
  const emptyLabel = lang === 'zh' ? '暂无内容' : 'No moments yet.';

  let moments: { id: string; content: string; createdAt: string; isPinned?: boolean }[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('moments')
      .select('id, content, createdAt, isPinned')
      .eq('isPublic', true)
      .order('isPinned', { ascending: false })
      .order('createdAt', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[moments] page fetch error:', error.message);
    } else {
      moments = data || [];
    }
  } catch (err) {
    console.error('[moments] page fetch failed:', err instanceof Error ? err.message : err);
  }

  return (
    <main className="min-h-screen bg-black selection:bg-white/20">
      <div className="pt-28 pb-20 px-4 md:px-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href={lang === 'zh' ? '/zh' : '/en'}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-10">{title}</h1>

        {moments.length === 0 ? (
          <p className="text-white/40 py-12 text-center">{emptyLabel}</p>
        ) : (
          <ul className="space-y-6">
            {moments.map((moment) => (
              <li
                key={moment.id}
                className="bg-white/5 rounded-xl p-5 md:p-6 border border-white/10"
              >
                <div className="text-white/90 whitespace-pre-wrap prose prose-invert max-w-none text-sm md:text-base">
                  {moment.content}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs md:text-sm text-white/40">
                  {moment.isPinned && (
                    <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                      <Pin size={12} />
                      {lang === 'zh' ? '置顶' : 'Pinned'}
                    </span>
                  )}
                  <time dateTime={moment.createdAt}>
                    {new Date(moment.createdAt).toLocaleDateString(
                      lang === 'zh' ? 'zh-CN' : 'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer dict={dict.footer} />
    </main>
  );
}
