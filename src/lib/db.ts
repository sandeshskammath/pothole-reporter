import { sql } from '@vercel/postgres';
import { PotholeReport, CreateReportData } from './types';

// Development mock data for when database is not available
const mockReports: PotholeReport[] = [
  {
    id: '1',
    latitude: 37.7749,
    longitude: -122.4194,
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TYW1wbGUgUG90aG9sZTwvdGV4dD48L3N2Zz4=',
    notes: 'Large pothole on Main Street',
    status: 'new' as const,
    confirmations: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Check if we're in a production environment with real database
function hasRealDatabase(): boolean {
  return process.env.NODE_ENV === 'production' || 
         (!!process.env.POSTGRES_URL && !process.env.POSTGRES_URL.includes('localhost'));
}

// Database utility functions for the Community Pothole Reporter

/**
 * Initialize the database by creating tables and functions
 * This should be called once during deployment
 */
export async function initializeDatabase() {
  try {
    // Read the schema file content would go here
    // For now, we'll define the schema inline for the MVP
    
    await sql`
      CREATE TABLE IF NOT EXISTS pothole_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        photo_url TEXT NOT NULL,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'fixed')),
        confirmations INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_pothole_reports_location ON pothole_reports (latitude, longitude)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pothole_reports_created_at ON pothole_reports (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pothole_reports_status ON pothole_reports (status)`;

    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Database initialization failed:', error);
    return { success: false, error };
  }
}

/**
 * Create a new pothole report
 */
export async function createReport(data: CreateReportData): Promise<PotholeReport> {
  const { latitude, longitude, photo_url, notes } = data;
  
  // In production, always use real database
  if (hasRealDatabase()) {
    const result = await sql`
      INSERT INTO pothole_reports (latitude, longitude, photo_url, notes)
      VALUES (${latitude}, ${longitude}, ${photo_url}, ${notes || null})
      RETURNING *
    `;
    return result.rows[0] as PotholeReport;
  }
  
  // Development fallback - create a mock report
  const newReport: PotholeReport = {
    id: `dev-${Date.now()}`,
    latitude,
    longitude,
    photo_url,
    notes: notes || undefined,
    status: 'new',
    confirmations: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  mockReports.unshift(newReport);
  return newReport;
}

/**
 * Get all pothole reports
 */
export async function getAllReports(): Promise<PotholeReport[]> {
  // In production, always use real database
  if (hasRealDatabase()) {
    const result = await sql`
      SELECT * FROM pothole_reports 
      ORDER BY created_at DESC
    `;
    return result.rows as PotholeReport[];
  }
  
  // Development fallback
  return [...mockReports];
}

/**
 * Get reports by status
 */
export async function getReportsByStatus(status: 'new' | 'confirmed' | 'fixed'): Promise<PotholeReport[]> {
  const result = await sql`
    SELECT * FROM pothole_reports 
    WHERE status = ${status}
    ORDER BY created_at DESC
  `;
  
  return result.rows as PotholeReport[];
}

/**
 * Find nearby reports within a given radius (in meters)
 */
export async function findNearbyReports(
  latitude: number,
  longitude: number,
  radiusMeters: number = 20
): Promise<PotholeReport[]> {
  // In production, always use real database
  if (hasRealDatabase()) {
    const result = await sql`
      SELECT *,
             (6371000 * acos(
               cos(radians(${latitude})) * 
               cos(radians(latitude)) * 
               cos(radians(longitude) - radians(${longitude})) + 
               sin(radians(${latitude})) * 
               sin(radians(latitude))
             )) as distance_meters
      FROM pothole_reports
      WHERE (6371000 * acos(
        cos(radians(${latitude})) * 
        cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${longitude})) + 
        sin(radians(${latitude})) * 
        sin(radians(latitude))
      )) <= ${radiusMeters}
      ORDER BY distance_meters
    `;
    return result.rows as PotholeReport[];
  }
  
  // Development fallback - simple distance calculation
  return mockReports.filter(report => {
    const distance = Math.sqrt(
      Math.pow(report.latitude - latitude, 2) + 
      Math.pow(report.longitude - longitude, 2)
    ) * 111000; // Rough conversion to meters
    return distance <= radiusMeters;
  });
}

/**
 * Update report status
 */
export async function updateReportStatus(
  id: string,
  status: 'new' | 'confirmed' | 'fixed'
): Promise<PotholeReport> {
  const result = await sql`
    UPDATE pothole_reports 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  
  if (result.rows.length === 0) {
    throw new Error('Report not found');
  }
  
  return result.rows[0] as PotholeReport;
}

/**
 * Increment confirmation count for a report
 */
export async function confirmReport(id: string): Promise<PotholeReport> {
  const result = await sql`
    UPDATE pothole_reports 
    SET confirmations = confirmations + 1, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  
  if (result.rows.length === 0) {
    throw new Error('Report not found');
  }
  
  return result.rows[0] as PotholeReport;
}

/**
 * Get report statistics
 */
export async function getReportStats() {
  // In production, always use real database
  if (hasRealDatabase()) {
    const result = await sql`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_reports,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_reports,
        COUNT(CASE WHEN status = 'fixed' THEN 1 END) as fixed_reports,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM pothole_reports
    `;
    return result.rows[0];
  }
  
  // Development fallback
  return {
    total_reports: mockReports.length,
    new_reports: mockReports.filter(r => r.status === 'new').length,
    confirmed_reports: mockReports.filter(r => r.status === 'confirmed').length,
    fixed_reports: mockReports.filter(r => r.status === 'fixed').length,
    active_days: 1
  };
}