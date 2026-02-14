import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('[test-env] Route accessed in non-development environment, returning 404');
    return new NextResponse(null, { status: 404 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    status: 'success',
    environment: {
      supabaseUrl: supabaseUrl ? 'Configured' : 'Not configured',
      supabaseAnonKey: supabaseAnonKey ? 'Configured' : 'Not configured',
    },
    message: 'Environment variables test (dev only, no sensitive keys)',
    timestamp: new Date().toISOString(),
  });
}