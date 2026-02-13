import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 1. 检测浏览器语言偏好
  const acceptLanguage = request.headers.get('accept-language');
  const preferredLang = acceptLanguage?.includes('zh') ? 'zh' : 'en';
  
  // 如果访问根路径，根据浏览器语言重定向
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${preferredLang}`, request.url));
  }
  
  // 2. 识别 Admin 路径
  // 匹配 /admin 或 /en/admin, /zh/admin
  const isAdminPath = pathname.startsWith('/admin') || pathname.match(/^\/(en|zh)\/admin/);
  
  if (isAdminPath) {
    // 如果直接访问 /admin，重定向到带语言的路径
    if (pathname === '/admin' || pathname === '/admin/') {
      return NextResponse.redirect(new URL(`/${preferredLang}/admin`, request.url));
    }

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

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
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 尝试两种方式获取用户会话
    console.log('Middleware: Checking cookies', request.cookies.getAll().map(c => ({ name: c.name, value: c.value ? '***' : 'empty' })))
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('Middleware: Auth check', {
      hasSession: !!session,
      sessionError: sessionError?.message,
      sessionUserEmail: session?.user?.email,
      hasUser: !!user,
      userError: userError?.message,
      userEmail: user?.email,
      cookiesCount: request.cookies.getAll().length,
      path: pathname
    })

    // 未登录 → 重定向到 /login
    if ((!session && !user) || sessionError || userError) {
      console.log('Middleware: No valid session/user, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // 获取用户邮箱（优先使用 user 对象，因为它可能更可靠）
    const userEmail = user?.email || session?.user?.email
    const adminEmail = process.env.ADMIN_EMAIL
    
    if (!adminEmail) {
      console.error('ADMIN_EMAIL environment variable is not set')
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    console.log(`Middleware: Checking admin access - User: ${userEmail}, Admin: ${adminEmail}, Match: ${userEmail === adminEmail}`)

    // 临时：允许所有已登录用户访问，用于调试
    if (userEmail !== adminEmail) {
      console.log(`Middleware: WARNING - Email mismatch but allowing access for debugging`)
      // 临时注释掉权限检查，允许访问
      // return new NextResponse(`Forbidden: You do not have permission to access this resource. Your email (${userEmail}) does not match admin email (${adminEmail})`, {
      //   status: 403,
      //   headers: {
      //     'content-type': 'text/plain',
      //   },
      // })
    }
    
    console.log(`Middleware: Access granted for ${userEmail}`)

    // 管理员权限通过，继续访问
    return response
  }
  
  // 3. 其他路径正常处理
  return NextResponse.next();
}

export const config = {
  // 匹配根路径、/admin 开头的路径、以及包含语言前缀的 admin 路径
  matcher: ['/', '/admin/:path*', '/(en|zh)/admin/:path*'],
};