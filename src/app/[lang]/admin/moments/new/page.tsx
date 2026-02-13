
import { requireAdmin } from '@/lib/supabase-server';
import MomentForm from '@/components/MomentForm';

export default async function NewMomentPage({
  params,
}: {
  params: { lang: string };
}) {
  await requireAdmin();
  const lang = params.lang === 'zh' ? 'zh' : 'en';

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">New Moment</h1>
        <MomentForm lang={lang} />
      </div>
    </div>
  );
}
