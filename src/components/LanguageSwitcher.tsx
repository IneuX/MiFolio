"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取当前语言
  const currentLang = pathname.startsWith("/zh") ? "zh" : "en";
  
  // 语言选项
  const languages = [
    { code: "en", label: "English", short: "EN" },
    { code: "zh", label: "中文简体", short: "简中" }
  ];

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = (langCode: string) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    let newPath = "";
    if (langCode === "zh") {
      // 切换到中文
      newPath = pathname === "/" ? "/zh" : `/zh${pathname}`;
    } else {
      // 切换到英文
      newPath = pathname.replace(/^\/zh/, "") || "/";
    }

    router.push(newPath);
    setIsOpen(false);
  };

  const currentLangObj = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/80 transition-all border rounded-full bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:text-white"
      >
        <span>{currentLangObj.short}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* 下拉菜单 */}
      <div 
        className={`absolute top-full right-0 mt-2 w-32 py-1 rounded-xl bg-[#0A0A0A] border border-white/10 shadow-xl backdrop-blur-xl transition-all duration-200 origin-top-right z-50 ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm text-left text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>{lang.label}</span>
            {currentLang === lang.code && <Check size={14} className="text-white" />}
          </button>
        ))}
      </div>
    </div>
  );
}
