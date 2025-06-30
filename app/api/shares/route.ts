import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { generateStoragePath } from '@/lib/share-utils';
import { shareCreationLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await shareCreationLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many shares created. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          }
        }
      );
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageData, title, description } = body;

    // Validate inputs
    if (!imageData || typeof imageData !== 'string') {
      return NextResponse.json({ error: 'Valid image data is required' }, { status: 400 });
    }

    if (title && (typeof title !== 'string' || title.length > 100)) {
      return NextResponse.json({ error: 'Title must be a string with max 100 characters' }, { status: 400 });
    }

    if (description && (typeof description !== 'string' || description.length > 500)) {
      return NextResponse.json({ error: 'Description must be a string with max 500 characters' }, { status: 400 });
    }

    // Validate image data format
    if (!imageData.startsWith('data:image/png;base64,')) {
      return NextResponse.json({ error: 'Invalid image format. PNG required.' }, { status: 400 });
    }

    // Check if user already has an active share
    const { data: existingShare, error: checkError } = await supabase
      .from('shared_maps')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Failed to check existing share:', checkError);
      return NextResponse.json({ error: 'Failed to check existing share' }, { status: 500 });
    }

    if (existingShare) {
      return NextResponse.json({ 
        error: 'You already have an active shared map. Please remove it first to create a new one.' 
      }, { status: 409 });
    }

    // Generate unique share code using database function
    const { data: shareCodeData, error: shareCodeError } = await supabase
      .rpc('generate_share_code');

    if (shareCodeError || !shareCodeData) {
      console.error('Failed to generate share code:', shareCodeError);
      return NextResponse.json({ error: 'Failed to generate share code' }, { status: 500 });
    }

    const shareCode = shareCodeData as string;
    const storagePath = generateStoragePath(user.id, shareCode);

    // Convert base64 to blob
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('shared-maps')
      .upload(storagePath, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Failed to upload image:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('shared-maps')
      .getPublicUrl(storagePath);

    // Create database record
    const { data: shareData, error: shareError } = await supabase
      .from('shared_maps')
      .insert({
        user_id: user.id,
        share_code: shareCode,
        image_url: urlData.publicUrl,
        title: title || 'My Travel Map',
        description: description || null
      })
      .select()
      .single();

    if (shareError) {
      console.error('Failed to create share record:', shareError);
      
      // Clean up uploaded image if database insert fails
      try {
        const { error: cleanupError } = await supabase.storage.from('shared-maps').remove([storagePath]);
        if (cleanupError) {
          console.error('Failed to cleanup storage after database error:', cleanupError);
        }
      } catch (cleanupError) {
        console.error('Exception during storage cleanup:', cleanupError);
      }

      // Handle specific constraint violations
      if (shareError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ 
          error: 'Share code collision detected. Please try again.' 
        }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to create share record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      shareCode,
      shareUrl: `${request.nextUrl.origin}/share/${shareCode}`,
      imageUrl: urlData.publicUrl,
      share: shareData
    });

  } catch (error) {
    console.error('Share creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's active shared map (should be only one)
    const { data: share, error: shareError } = await supabase
      .from('shared_maps')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (shareError && shareError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Failed to fetch share:', shareError);
      return NextResponse.json({ error: 'Failed to fetch share' }, { status: 500 });
    }

    return NextResponse.json({ share: share || null });

  } catch (error) {
    console.error('Share fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's active share
    const { data: shareData, error: fetchError } = await supabase
      .from('shared_maps')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Failed to fetch share:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch share' }, { status: 500 });
    }

    if (!shareData) {
      return NextResponse.json({ error: 'No active share found' }, { status: 404 });
    }

    // Delete from storage
    const storagePath = generateStoragePath(user.id, shareData.share_code);
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
      .eq('user_id', user.id)
      .eq('is_active', true);

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