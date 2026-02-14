
'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function AuthButton({ lang }: { lang: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (supabaseRef.current === null) {
    supabaseRef.current = createClient()
  }
  const supabase = supabaseRef.current

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
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push(`/${lang}`)
      router.refresh()
    } catch (error) {
      console.error('[AuthButton] signOut failed:', error instanceof Error ? error.message : error)
    }
  }

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 ml-2 border-l border-white/10 pl-4">
        <Link 
          href={`/${lang}/admin`}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 group"
          title="Go to Admin Dashboard"
        >
          <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-white/20">
            <UserIcon size={14} />
          </div>
          <span className="text-xs font-medium max-w-[100px] truncate hidden sm:block">
            {user.email}
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-full text-white/60 hover:text-red-400 hover:bg-white/10 transition-all duration-300"
          title="Sign out"
        >
          <LogOut size={16} />
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
