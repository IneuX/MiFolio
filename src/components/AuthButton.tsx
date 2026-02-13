
'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthButton({ lang }: { lang: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      router.refresh() // 刷新 Server Components (如 Layout)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 ml-2 border-l border-white/10 pl-2">
        <Link 
          href={`/${lang}/admin`}
          className="p-2 rounded-full text-white/80 hover:text-black hover:bg-white transition-all duration-300"
          title={user.email || 'Admin Dashboard'}
        >
          <UserIcon size={18} />
        </Link>
        <button
          onClick={handleLogout}
          className="p-2 rounded-full text-white/80 hover:text-red-500 hover:bg-white transition-all duration-300"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    )
  }

  return (
    <Link
      href={`/${lang}/login`}
      className="ml-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-black hover:bg-white transition-all duration-300 flex items-center gap-2 border border-white/10"
    >
      <LogIn size={16} />
      <span className="hidden sm:inline">Sign in</span>
    </Link>
  )
}
