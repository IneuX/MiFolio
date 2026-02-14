import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth 回调：用 code 换 session 并重定向。
 * 注意：当前使用 @/lib/supabase/server 的同步 createClient()；若升级到 Next 15，
 * cookies() 在 Route Handler 中可能为异步，需改用 await cookies() 或 @/lib/supabase-server 的 createClient。
 */

/** 仅允许相对路径作为重定向目标，防止开放重定向 */
function getSafeRedirectNext(next: string | null): string {
  const fallback = '/'
  if (!next || typeof next !== 'string') return fallback
  const trimmed = next.trim()
  if (trimmed === '') return fallback
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    console.error('[auth/callback] Rejected unsafe redirect "next": not a relative path', { next: trimmed.slice(0, 100) })
    return fallback
  }
  if (trimmed.includes('\\')) {
    console.error('[auth/callback] Rejected unsafe redirect "next": contains backslash', { next: trimmed.slice(0, 100) })
    return fallback
  }
  if (trimmed.length > 512) {
    console.error('[auth/callback] Rejected unsafe redirect "next": path too long', { length: trimmed.length })
    return fallback
  }
  return trimmed
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextRaw = searchParams.get('next')
  const next = getSafeRedirectNext(nextRaw)

  if (code) {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      console.error('[auth/callback] exchangeCodeForSession failed:', error.message)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[auth/callback] Unexpected error during session exchange:', message, err instanceof Error ? err.stack : undefined)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
