import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.trim() === '' || key.trim() === '') {
    console.error('[supabase-server] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty. Set them in .env.local.')
    throw new Error('Supabase environment variables are not configured')
  }
  return { url, key }
}

export const createClient = async () => {
  const { url, key } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized: Please log in to access this resource')
  }
  
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    throw new Error('Admin email not configured')
  }
  
  if (user.email !== adminEmail) {
    throw new Error('Forbidden: You do not have permission to access this resource')
  }
  
  return user
}