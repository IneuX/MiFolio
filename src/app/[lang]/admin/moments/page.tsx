
import { requireAdmin, createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, Edit, Pin, Lock, ArrowLeft } from 'lucide-react';
import MomentDeleteButton from '@/components/MomentDeleteButton';

export default async function AdminMomentsPage({
  params,
  searchParams,
}: {
  params: { lang: string };
  searchParams: { page?: string };
}) {
  await requireAdmin();
  const lang = params.lang === 'zh' ? 'zh' : 'en';

  const page = parseInt(searchParams.page || '1');
  const limit = 10;

  let moments = [];
  let total = 0;

  try {
    const supabase = await createClient();
    
    // 获取数据
    const { data, count, error } = await supabase
      .from('moments')
      .select('*', { count: 'exact' })
      .order('isPinned', { ascending: false })
      .order('createdAt', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw error;
    }

    moments = data || [];
    total = count || 0;
  } catch (error) {
    console.error('Error fetching moments:', error);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-black text-white">
       {/* 顶部导航 */}
       <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/admin`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowLeft size={16} />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Moments Management</h1>
          <Link
            href={`/${lang}/admin/moments/new`}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus size={20} />
            New Moment
          </Link>
        </div>

        {moments.length === 0 ? (
           <div className="text-center py-20 text-white/40">
             <p>No moments found. Create your first moment!</p>
           </div>
        ) : (
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden">
            {moments.map((moment) => (
              <div key={moment.id} className="p-6 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {moment.isPinned && <Pin size={16} className="text-yellow-500" />}
                      {!moment.isPublic && <Lock size={16} className="text-red-500" />}
                      <span className="text-sm text-white/40">
                        {new Date(moment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="prose prose-invert max-w-none line-clamp-3 text-white/80">
                      {moment.content}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${lang}/admin/moments/${moment.id}/edit`}
                      className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Edit size={18} />
                    </Link>
                    <MomentDeleteButton id={moment.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/${lang}/admin/moments?page=${p}`}
                className={`px-4 py-2 rounded-lg ${
                  p === page ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
