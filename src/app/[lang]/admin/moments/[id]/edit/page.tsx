import { requireAdmin, createClient } from '@/lib/supabase-server';
import MomentForm from '@/components/MomentForm';
import { notFound } from 'next/navigation';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidMomentId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && UUID_REGEX.test(id.trim());
}

export default async function EditMomentPage({
  params,
}: {
  params: { lang: string; id: string };
}) {
  await requireAdmin();
  const lang = params.lang === 'zh' ? 'zh' : 'en';

  if (!isValidMomentId(params.id)) {
    console.warn('[admin/moments/edit] Invalid moment id format', { id: params.id?.slice(0, 50) });
    notFound();
  }

  let moment = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('moments')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }
    moment = data;
  } catch (error) {
    console.error('[admin/moments/edit] Fetch moment failed:', error instanceof Error ? error.message : error);
  }

  if (!moment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Moment</h1>
        <MomentForm initialData={moment} lang={lang} />
      </div>
    </div>
  );
}
