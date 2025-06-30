import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Only allow database initialization in production
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { error: 'Database initialization only available in production' },
        { status: 403 }
      );
    }

    // Check if database connection exists
    if (!process.env.POSTGRES_NEW_URL) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    // Create the pothole_reports table
    await sql`
      CREATE TABLE IF NOT EXISTS pothole_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        photo_url TEXT NOT NULL,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'fixed')),
        confirmations INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_pothole_reports_location ON pothole_reports (latitude, longitude)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pothole_reports_created_at ON pothole_reports (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pothole_reports_status ON pothole_reports (status)`;

    // Create updated_at trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    // Create trigger for updated_at
    await sql`
      DROP TRIGGER IF EXISTS update_pothole_reports_updated_at ON pothole_reports;
      CREATE TRIGGER update_pothole_reports_updated_at
        BEFORE UPDATE ON pothole_reports
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    // Insert some sample data for demonstration using small data URIs
    await sql`
      INSERT INTO pothole_reports (latitude, longitude, photo_url, notes, status)
      VALUES 
        (37.7749, -122.4194, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkRlbW8gUG90aG9sZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+U2FuIEZyYW5jaXNjbzwvdGV4dD48L3N2Zz4=', 'Demo pothole near downtown', 'reported'),
        (37.7849, -122.4094, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkRlbW8gUG90aG9sZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Tm9iIEhpbGw8L3RleHQ+PC9zdmc+', 'Road damage on main street', 'in_progress'),
        (37.7649, -122.4294, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkIFBvdGhvbGU8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk1pc3Npb24gRGlzdDwvdGV4dD48L3N2Zz4=', 'Fixed pothole - great job!', 'fixed')
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('Database initialized successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      tables: ['pothole_reports'],
      indexes: ['idx_pothole_reports_location', 'idx_pothole_reports_created_at', 'idx_pothole_reports_status'],
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