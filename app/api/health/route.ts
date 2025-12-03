import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Simple database query to keep Supabase active
    // Just count active shares (lightweight query)
    const { count, error } = await supabase
      .from('shared_maps')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) {
      console.error('Health check DB query failed:', error);
      return NextResponse.json(
        { status: 'error', message: 'Database query failed', error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      activeShares: count,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  }
}
