"use client";

import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthButton from "./AuthButton";
import { ArrowUpRight } from "lucide-react";

export default function TopActions() {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");
  const lang = isZh ? 'zh' : 'en';

  const contactText = isZh ? "联系我" : "Contact Me";

  return (
    <div className="hidden md:flex fixed top-8 right-8 z-50 items-center gap-4">
      <a 
        href="#contact"
        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-gray-200 transition-colors shadow-lg hover:scale-105 transform duration-200"
      >
        <span>{contactText}</span>
        <ArrowUpRight size={16} />
      </a>
      
      <LanguageSwitcher />
      
      <AuthButton lang={lang} />
    </div>
  );
}
