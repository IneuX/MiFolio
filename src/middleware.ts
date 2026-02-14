import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === '' || supabaseKey.trim() === '') {
    console.error('[middleware] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty. Supabase auth will be skipped.')
  }

  let user: { email?: string } | null = null
  try {
    const supabase = createServerClient(
      supabaseUrl || '',
      supabaseKey || '',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    const { data: { user: u } } = await supabase.auth.getUser()
    user = u
  } catch (err) {
    console.error('[middleware] Supabase client or getUser failed:', err instanceof Error ? err.message : err)
  }

  // 刷新 Session 并获取用户（已在上方 try 中获取）

  const pathname = request.nextUrl.pathname
  
  // 1. 国际化重定向 (根路径)
  const acceptLanguage = request.headers.get('accept-language')
  const preferredLang = acceptLanguage?.includes('zh') ? 'zh' : 'en'
  
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${preferredLang}`, request.url))
  }

  // 2. 识别路径类型
  const isAdminPath = pathname.startsWith('/admin') || pathname.match(/^\/(en|zh)\/admin/)
  const isLoginPath = pathname.match(/^\/(en|zh)\/login/) || pathname === '/login'
  const isMomentsPath = pathname.match(/^\/(en|zh)\/moments\/?$/)
  const isMomentsRoot = pathname === '/moments' || pathname === '/moments/'

  // 根路径 /moments 重定向到带语言前缀
  if (isMomentsRoot) {
    return NextResponse.redirect(new URL(`/${preferredLang}/moments`, request.url))
  }

  // Moments 列表页：未登录则重定向到登录页（服务端权限校验在页面内再次执行）
  if (isMomentsPath && !user) {
    const lang = pathname.split('/')[1] || preferredLang
    const validLang = ['en', 'zh'].includes(lang) ? lang : preferredLang
    const loginUrl = new URL(`/${validLang}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 如果已登录用户访问登录页，重定向到 Admin
  if (isLoginPath && user) {
    const lang = pathname.split('/')[1] || preferredLang
    const validLang = ['en', 'zh'].includes(lang) ? lang : preferredLang
    return NextResponse.redirect(new URL(`/${validLang}/admin`, request.url))
  }
  
  if (isAdminPath) {
    // 规范化 Admin 路径 (添加语言前缀)
    if (pathname === '/admin' || pathname === '/admin/') {
      return NextResponse.redirect(new URL(`/${preferredLang}/admin`, request.url))
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || adminEmail.trim() === '') {
      console.error('[middleware] ADMIN_EMAIL is not configured; denying all admin access')
      const lang = pathname.split('/')[1] || preferredLang
      const validLang = ['en', 'zh'].includes(lang) ? lang : preferredLang
      return NextResponse.redirect(new URL(`/${validLang}`, request.url))
    }

    // 未登录 → 重定向到 /login
    if (!user) {
      const lang = pathname.split('/')[1] || preferredLang
      const validLang = ['en', 'zh'].includes(lang) ? lang : preferredLang
      const loginUrl = new URL(`/${validLang}/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (user.email !== adminEmail) {
      const lang = pathname.split('/')[1] || preferredLang
      const validLang = ['en', 'zh'].includes(lang) ? lang : preferredLang
      return NextResponse.redirect(new URL(`/${validLang}`, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/moments',
    '/moments/',
    '/(en|zh)/moments',
    '/admin/:path*',
    '/(en|zh)/admin/:path*',
    '/(en|zh)/login',
    '/login'
  ],
}
