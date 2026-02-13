
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // 刷新 Session 并获取用户
  const { data: { user } } = await supabase.auth.getUser()

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

    // 未登录 → 重定向到 /login
    if (!user) {
      const lang = pathname.split('/')[1] || preferredLang
      const validLang = ['en', 'zh'].includes(lang) ? lang : preferredLang
      const loginUrl = new URL(`/${validLang}/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }

    // 检查管理员权限
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && user.email !== adminEmail) {
      // 无权限，重定向到首页
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
    '/admin/:path*',
    '/(en|zh)/admin/:path*',
    '/(en|zh)/login',
    '/login'
  ],
}
