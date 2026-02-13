
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Moment {
  id?: string;
  content: string;
  isPublic: boolean;
  isPinned: boolean;
}

interface MomentFormProps {
  initialData?: Moment;
  lang: string;
}

export default function MomentForm({ initialData, lang }: MomentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialData?.content || '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [isPinned, setIsPinned] = useState(initialData?.isPinned ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Content is required');
      return;
    }

    setIsSaving(true);
    try {
      const url = initialData?.id
        ? `/api/moments/${initialData.id}`
        : '/api/moments';
      const method = initialData?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          isPublic,
          isPinned,
        }),
      });

      if (res.ok) {
        router.push(`/${lang}/admin/moments`);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save moment');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving moment');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <Link
          href={`/${lang}/admin/moments`}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            Content (Markdown supported)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 bg-black/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
            placeholder="What's on your mind?"
          />
        </div>

        <div className="flex gap-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isPublic ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/50'}`}>
              {isPublic && <div className="w-3 h-3 bg-black rounded-sm" />}
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="hidden"
            />
            <span className="text-white/80 group-hover:text-white">Public</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isPinned ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/50'}`}>
              {isPinned && <div className="w-3 h-3 bg-black rounded-sm" />}
            </div>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="hidden"
            />
            <span className="text-white/80 group-hover:text-white">Pinned</span>
          </label>
        </div>
      </div>
    </form>
  );
}
