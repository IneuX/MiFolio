import { NextResponse } from 'next/server';

// 测试环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

export async function GET() {
  return NextResponse.json({
    status: 'success',
    environment: {
      supabaseUrl: supabaseUrl ? 'Configured' : 'Not configured',
      supabaseAnonKey: supabaseAnonKey ? 'Configured' : 'Not configured',
      adminPassword: adminPassword ? 'Configured' : 'Not configured',
      supabaseUrlLength: supabaseUrl?.length || 0,
      supabaseKeyLength: supabaseAnonKey?.length || 0,
      adminPasswordLength: adminPassword?.length || 0
    },
    message: 'Environment variables test',
    timestamp: new Date().toISOString()
  });
}