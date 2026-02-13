import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    return NextResponse.json({
      success: true,
      session: session ? {
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        user: {
          id: session.user.id,
          email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at,
          created_at: session.user.created_at,
        }
      } : null,
      user: user ? {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
      } : null,
      hasSession: !!session,
      hasUser: !!user,
      sessionError: error?.message,
      userError: userError?.message,
      adminEmail: process.env.ADMIN_EMAIL,
      matchesAdmin: user?.email === process.env.ADMIN_EMAIL,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}