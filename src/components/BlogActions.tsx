'use client';

import { Share2, Bookmark, Check } from 'lucide-react';
import { useState } from 'react';

interface BlogActionsProps {
  slug: string;
  title: string;
  lang: 'en' | 'zh';
}

export default function BlogActions({ slug, title, lang }: BlogActionsProps) {
  const [shareClicked, setShareClicked] = useState(false);
  const [saveClicked, setSaveClicked] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareClicked(true);
      setTimeout(() => setShareClicked(false), 2000);
    }
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`bookmark_${slug}`, JSON.stringify({
        title,
        url: window.location.href,
        savedAt: new Date().toISOString()
      }));
      setSaveClicked(true);
      setTimeout(() => setSaveClicked(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          shareClicked
            ? 'text-green-400 bg-green-400/10'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
        onClick={handleShare}
      >
        {shareClicked ? <Check size={16} /> : <Share2 size={16} />}
        <span>{shareClicked
          ? (lang === "zh" ? "已复制" : "Copied!")
          : (lang === "zh" ? "分享" : "Share")
        }</span>
      </button>
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          saveClicked
            ? 'text-green-400 bg-green-400/10'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
        onClick={handleSave}
      >
        {saveClicked ? <Check size={16} /> : <Bookmark size={16} />}
        <span>{saveClicked
          ? (lang === "zh" ? "已保存" : "Saved!")
          : (lang === "zh" ? "保存" : "Save")
        }</span>
      </button>
    </div>
  );
}