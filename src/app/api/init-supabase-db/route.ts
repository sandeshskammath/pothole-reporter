import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Only allow database initialization in production
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { error: 'Database initialization only available in production' },
        { status: 403 }
      );
    }

    // Check if Supabase connection exists
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase connection not configured' },
        { status: 500 }
      );
    }

    // Test connection by trying to query the table
    const { error: connectionError } = await supabaseAdmin
      .from('pothole_reports')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.log('Table does not exist yet, will be created via SQL editor');
      // Note: Table should be created via SQL editor first
      return NextResponse.json(
        { 
          error: 'Please create the database table first using the SQL editor in Supabase dashboard',
          details: 'Run the SQL script from the migration guide'
        },
        { status: 500 }
      );
    }

    // Insert sample data
    const { error: insertError } = await supabaseAdmin
      .from('pothole_reports')
      .upsert([
        {
          latitude: 37.774900,
          longitude: -122.419400,
          photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkRlbW8gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
          notes: 'Demo pothole near downtown',
          status: 'reported',
          confirmations: 2
        },
        {
          latitude: 37.784900,
          longitude: -122.409400,
          photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
          notes: 'Road damage on main street',
          status: 'in_progress',
          confirmations: 5
        },
        {
          latitude: 37.764900,
          longitude: -122.429400,
          photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==',
          notes: 'Fixed pothole - great job!',
          status: 'fixed',
          confirmations: 3
        }
      ], { 
        onConflict: 'id',
        ignoreDuplicates: true
      });

    if (insertError) {
      console.error('Failed to insert sample data:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert sample data', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('Supabase database initialized successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Supabase database initialized successfully',
      provider: 'Supabase',
      sample_data: 'Added 3 demo reports'
    });

  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}