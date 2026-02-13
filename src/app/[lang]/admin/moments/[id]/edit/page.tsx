
import { requireAdmin, createClient } from '@/lib/supabase-server';
import MomentForm from '@/components/MomentForm';
import { notFound } from 'next/navigation';

export default async function EditMomentPage({
  params,
}: {
  params: { lang: string; id: string };
}) {
  await requireAdmin();
  const lang = params.lang === 'zh' ? 'zh' : 'en';

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
    console.error('Error fetching moment:', error);
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
