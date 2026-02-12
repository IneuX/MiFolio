"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  lang?: string;
  dict?: { href: string; label: string }[];
}

export default function Navbar({ lang = 'en', dict }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // 如果没有传入 dict，使用默认的 NAV_LINKS (为了兼容根路径重定向前的渲染)
  // 但在 [lang] 页面中应该总是传入 dict
  const links = dict || [];

  return (
    <>
      <nav className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xs md:max-w-fit transition-all duration-300">
        <div className="relative flex items-center justify-between md:justify-center px-6 py-1 md:py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
          
          {/* Mobile Logo (visible only on mobile to keep desktop centered pill clean) */}
          <span className="md:hidden text-white font-bold tracking-tight">MENU</span>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => (
              <Link 
                key={link.label} 
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-black hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-lg whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white p-1 ml-auto"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-xl transition-all duration-300 md:hidden flex flex-col items-center justify-center space-y-8 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {links.map((link) => (
          <Link 
            key={link.label} 
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="text-3xl font-light text-white hover:text-white/60 transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <div className="pt-8">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}
