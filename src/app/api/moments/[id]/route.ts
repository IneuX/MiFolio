import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidMomentId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && UUID_REGEX.test(id.trim());
}

// PUT /api/moments/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidMomentId(params.id)) {
      console.warn('[api/moments] PUT invalid id format', { id: params.id?.slice(0, 50) });
      return NextResponse.json({ error: 'Invalid moment id' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!user || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      console.error('[api/moments] PUT invalid JSON body');
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const { content, isPublic, isPinned } = body as { content?: unknown; isPublic?: unknown; isPinned?: unknown };
    if (content !== undefined && typeof content !== 'string') {
      return NextResponse.json({ error: 'content must be a string' }, { status: 400 });
    }
    const isPublicVal = isPublic === undefined ? undefined : Boolean(isPublic);
    const isPinnedVal = isPinned === undefined ? undefined : Boolean(isPinned);

    const updatePayload: { content?: string; isPublic?: boolean; isPinned?: boolean } = {};
    if (content !== undefined) updatePayload.content = content;
    if (isPublicVal !== undefined) updatePayload.isPublic = isPublicVal;
    if (isPinnedVal !== undefined) updatePayload.isPinned = isPinnedVal;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'At least one of content, isPublic, isPinned is required' }, { status: 400 });
    }

    const { data: moment, error } = await supabase
      .from('moments')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('[api/moments] PUT Supabase update error:', error.message);
      throw error;
    }

    return NextResponse.json(moment);
  } catch (error: unknown) {
    console.error('[api/moments] PUT failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/moments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidMomentId(params.id)) {
      console.warn('[api/moments] DELETE invalid id format', { id: params.id?.slice(0, 50) });
      return NextResponse.json({ error: 'Invalid moment id' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!user || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('moments')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[api/moments] DELETE failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
