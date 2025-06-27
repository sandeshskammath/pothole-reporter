import { sql } from '@vercel/postgres';
import { PotholeReport, CreateReportData } from './types';

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
  
  const result = await sql`
    INSERT INTO pothole_reports (latitude, longitude, photo_url, notes)
    VALUES (${latitude}, ${longitude}, ${photo_url}, ${notes || null})
    RETURNING *
  `;
  
  return result.rows[0] as PotholeReport;
}

/**
 * Get all pothole reports
 */
export async function getAllReports(): Promise<PotholeReport[]> {
  const result = await sql`
    SELECT * FROM pothole_reports 
    ORDER BY created_at DESC
  `;
  
  return result.rows as PotholeReport[];
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