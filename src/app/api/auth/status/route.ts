import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (sessionError) {
      console.error('[auth/status] getSession failed:', sessionError.message);
    }
    if (userError) {
      console.error('[auth/status] getUser failed:', userError.message);
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const matchesAdmin = Boolean(adminEmail && user?.email === adminEmail);

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
      sessionError: sessionError?.message ?? null,
      userError: userError?.message ?? null,
      isAdmin: matchesAdmin,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[auth/status] Unexpected error:', message, error instanceof Error ? error.stack : undefined);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}