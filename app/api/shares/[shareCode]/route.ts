import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { validateShareCode, generateStoragePath } from '@/lib/share-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;

    // Validate share code format
    if (!validateShareCode(shareCode)) {
      return NextResponse.json({ error: 'Invalid share code format' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get shared map data (no auth required for viewing)
    const { data: shareData, error: shareError } = await supabase
      .from('shared_maps')
      .select('*')
      .eq('share_code', shareCode)
      .eq('is_active', true)
      .single();

    if (shareError || !shareData) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // Increment view count
    const { error: viewError } = await supabase
      .rpc('increment_share_view_count', { share_code_param: shareCode });

    if (viewError) {
      console.warn('Failed to increment view count:', viewError);
      // Don't fail the request if view count update fails
    }

    return NextResponse.json({
      share: shareData,
      success: true
    });

  } catch (error) {
    console.error('Share fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;

    // Validate share code format
    if (!validateShareCode(shareCode)) {
      return NextResponse.json({ error: 'Invalid share code format' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the share to verify ownership and get storage path
    const { data: shareData, error: fetchError } = await supabase
      .from('shared_maps')
      .select('*')
      .eq('share_code', shareCode)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !shareData) {
      return NextResponse.json({ error: 'Share not found or access denied' }, { status: 404 });
    }

    // Delete from storage
    const storagePath = generateStoragePath(user.id, shareCode);
    const { error: storageError } = await supabase.storage
      .from('shared-maps')
      .remove([storagePath]);

    if (storageError) {
      console.warn('Failed to delete image from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('shared_maps')
      .delete()
      .eq('share_code', shareCode)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Failed to delete share record:', deleteError);
      return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Share deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;

    // Validate share code format
    if (!validateShareCode(shareCode)) {
      return NextResponse.json({ error: 'Invalid share code format' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await _request.json();
    const { title, description, is_active } = body;

    // Update the share
    const { data: shareData, error: updateError } = await supabase
      .from('shared_maps')
      .update({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(is_active !== undefined && { is_active })
      })
      .eq('share_code', shareCode)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError || !shareData) {
      console.error('Failed to update share:', updateError);
      return NextResponse.json({ error: 'Failed to update share' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      share: shareData
    });

  } catch (error) {
    console.error('Share update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}