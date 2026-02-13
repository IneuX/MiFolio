
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/moments
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const checkAdmin = searchParams.get('admin') === 'true';

  const supabase = await createClient();
  
  // 鉴权逻辑
  let showPrivate = false;
  
  if (checkAdmin) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = process.env.ADMIN_EMAIL;
      
      if (user && user.email === adminEmail) {
        showPrivate = true;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  }

  try {
    let query = supabase
      .from('moments')
      .select('*', { count: 'exact' })
      .order('isPinned', { ascending: false })
      .order('createdAt', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (!showPrivate) {
      query = query.eq('isPublic', true);
    }

    const { data: moments, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: moments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching moments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/moments
export async function POST(request: NextRequest) {
  try {
    // 鉴权
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!user || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, isPublic, isPinned } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const { data: moment, error } = await supabase
      .from('moments')
      .insert({
        content,
        isPublic: isPublic ?? true,
        isPinned: isPinned ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return NextResponse.json(moment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating moment:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      details: error
    }, { status: 500 });
  }
}
