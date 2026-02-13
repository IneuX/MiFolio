
'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MomentDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this moment?')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/moments/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete moment');
      }
    } catch (error) {
      console.error(error);
      alert('Error deleting moment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 rounded-lg text-white/60 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-50"
    >
      <Trash2 size={18} />
    </button>
  );
}
