import { sql } from '@vercel/postgres';
import { PotholeReport, CreateReportData } from './types';

// Development mock data for when database is not available
const mockReports: PotholeReport[] = [
  {
    id: '1',
    latitude: 37.7749,
    longitude: -122.4194,
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkRlbW8gUG90aG9sZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+U2FuIEZyYW5jaXNjbzwvdGV4dD48L3N2Zz4=',
    notes: 'Large pothole affecting traffic flow',
    status: 'reported' as const,
    confirmations: 2,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    latitude: 37.7849,
    longitude: -122.4094,
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkRlbW8gUG90aG9sZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Tm9iIEhpbGw8L3RleHQ+PC9zdmc+',
    notes: 'Deep pothole near intersection',
    status: 'in_progress' as const,
    confirmations: 5,
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    latitude: 37.7649,
    longitude: -122.4294,
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkIFBvdGhvbGU8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk1pc3Npb24gRGlzdDwvdGV4dD48L3N2Zz4=',
    notes: 'Small pothole, minor issue',
    status: 'fixed' as const,
    confirmations: 3,
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  }
];

// Check if we're in a production environment with real database
function hasRealDatabase(): boolean {
  // Force real database on Vercel
  if (process.env.VERCEL) {
    return true;
  }
  
  // More permissive check - if we have a real database URL, use it
  return !!process.env.POSTGRES_NEW_URL && 
         !process.env.POSTGRES_NEW_URL.includes('localhost') &&
         (process.env.POSTGRES_NEW_URL.startsWith('postgres://') || process.env.POSTGRES_NEW_URL.startsWith('postgresql://'));
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
        status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'fixed')),
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
    // Convert string coordinates to numbers for proper map rendering
    const row = result.rows[0];
    return {
      ...row,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude)
    } as PotholeReport;
  }
  
  // Development fallback - create a mock report
  const newReport: PotholeReport = {
    id: `dev-${Date.now()}`,
    latitude,
    longitude,
    photo_url,
    notes: notes || undefined,
    status: 'reported',
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
    try {
      const result = await sql`
        SELECT * FROM pothole_reports 
        ORDER BY created_at DESC
      `;
      // Convert string coordinates to numbers and normalize status values
      return result.rows.map(row => ({
        ...row,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        // Normalize status values to match expected format
        status: normalizeStatus(row.status)
      })) as PotholeReport[];
    } catch (error) {
      console.error('Database query failed, using mock data:', error);
      // Fallback to mock data if database query fails
      return [...mockReports];
    }
  }
  
  // Development fallback
  return [...mockReports];
}

/**
 * Normalize status values between different formats
 */
function normalizeStatus(status: string): 'reported' | 'in_progress' | 'fixed' {
  switch (status) {
    case 'reported':
      return 'reported';
    case 'in_progress':
      return 'in_progress';
    case 'fixed':
      return 'fixed';
    case 'reported':
      return 'reported';
    case 'in_progress':
      return 'in_progress';
    default:
      return 'reported';
  }
}

/**
 * Get reports by status
 */
export async function getReportsByStatus(status: 'reported' | 'in_progress' | 'fixed'): Promise<PotholeReport[]> {
  const result = await sql`
    SELECT * FROM pothole_reports 
    WHERE status = ${status}
    ORDER BY created_at DESC
  `;
  
  // Convert string coordinates to numbers for proper map rendering
  return result.rows.map(row => ({
    ...row,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude)
  })) as PotholeReport[];
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
    try {
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
      // Convert string coordinates to numbers and normalize status values
      return result.rows.map(row => ({
        ...row,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        status: normalizeStatus(row.status)
      })) as PotholeReport[];
    } catch (error) {
      console.error('Database query failed for nearby reports, using mock data:', error);
      // Fallback to mock data if database query fails
      return mockReports.filter(report => {
        const distance = Math.sqrt(
          Math.pow(report.latitude - latitude, 2) + 
          Math.pow(report.longitude - longitude, 2)
        ) * 111000; // Rough conversion to meters
        return distance <= radiusMeters;
      });
    }
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
  status: 'reported' | 'in_progress' | 'fixed'
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
  
  // Convert string coordinates to numbers for proper map rendering
  const row = result.rows[0];
  return {
    ...row,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude)
  } as PotholeReport;
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
  
  // Convert string coordinates to numbers for proper map rendering
  const row = result.rows[0];
  return {
    ...row,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude)
  } as PotholeReport;
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
        COUNT(CASE WHEN status = 'reported' THEN 1 END) as new_reports,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as confirmed_reports,
        COUNT(CASE WHEN status = 'fixed' THEN 1 END) as fixed_reports,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM pothole_reports
    `;
    return result.rows[0];
  }
  
  // Development fallback
  return {
    total_reports: mockReports.length,
    new_reports: mockReports.filter(r => r.status === 'reported').length,
    confirmed_reports: mockReports.filter(r => r.status === 'in_progress').length,
    fixed_reports: mockReports.filter(r => r.status === 'fixed').length,
    active_days: 1
  };
}