
import { createClient } from '@/lib/supabase-server';

export default async function MomentsList() {
  let moments = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('moments')
      .select('*')
      .eq('isPublic', true)
      .order('isPinned', { ascending: false })
      .order('createdAt', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }
    moments = data || [];
  } catch (error) {
    console.error('Error fetching moments:', error);
    // 如果数据库未连接，不显示任何内容或显示友好提示
    return null;
  }

  if (moments.length === 0) {
    return (
      <div className="text-center text-white/40 py-8">
        No moments yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {moments.map((moment) => (
        <div key={moment.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="text-white/80 whitespace-pre-wrap prose prose-invert max-w-none">
            {moment.content}
          </div>
          <div className="mt-4 text-sm text-white/40 flex items-center gap-2">
            {moment.isPinned && (
              <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-xs">Pinned</span>
            )}
            <span>{new Date(moment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
