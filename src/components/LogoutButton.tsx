
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  lang: string;
  label?: string;
}

export default function LogoutButton({ lang, label = 'Sign out' }: LogoutButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push(`/${lang}/login`)
      router.refresh()
    } catch (error) {
      console.error('[LogoutButton] signOut failed:', error instanceof Error ? error.message : error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-white/10 transition-all"
    >
      <LogOut size={16} />
      <span>{label}</span>
    </button>
  )
}
