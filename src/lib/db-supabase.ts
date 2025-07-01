import { supabase } from './supabase';
import { PotholeReport, CreateReportData } from './types';

// Development mock data for fallback - using Chicago coordinates to match the focused cities
const mockReports: PotholeReport[] = [
  {
    id: '1',
    latitude: 41.8781,
    longitude: -87.6298,
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
    notes: 'Large pothole on Michigan Avenue - high traffic area',
    status: 'reported' as const,
    confirmations: 3,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    latitude: 41.8676,
    longitude: -87.6176,
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
    notes: 'Deep pothole near Grant Park - winter damage',
    status: 'in_progress' as const,
    confirmations: 7,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    latitude: 41.8947,
    longitude: -87.6440,
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==',
    notes: 'Fixed pothole on North Side - excellent repair work!',
    status: 'fixed' as const,
    confirmations: 4,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: '4',
    latitude: 40.7589,
    longitude: -73.9851,
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5ZQyBQb3Rob2xlPC90ZXh0Pjwvc3ZnPg==',
    notes: 'Pothole in Times Square area - tourist safety concern',
    status: 'reported' as const,
    confirmations: 8,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '5',
    latitude: 40.6892,
    longitude: -74.0445,
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
    notes: 'Brooklyn Bridge area pothole - under repair',
    status: 'in_progress' as const,
    confirmations: 5,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

// Check if we have Supabase configured
function hasSupabase(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Normalize status values between different formats
function normalizeStatus(status: string): 'reported' | 'in_progress' | 'fixed' {
  switch (status) {
    case 'reported':
      return 'reported';
    case 'in_progress':
      return 'in_progress';
    case 'fixed':
      return 'fixed';
    case 'reported':
      return 'reported'; // Map old 'new' to 'reported'
    case 'in_progress':
      return 'in_progress'; // Map old 'confirmed' to 'in_progress'
    default:
      return 'reported';
  }
}

// Convert Supabase row to PotholeReport format
function mapSupabaseRow(row: any): PotholeReport {
  return {
    id: row.id,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    photo_url: row.photo_url,
    notes: row.notes,
    status: normalizeStatus(row.status),
    confirmations: row.confirmations || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Create a new pothole report
 */
export async function createReport(data: CreateReportData): Promise<PotholeReport> {
  const { latitude, longitude, photo_url, notes } = data;
  
  if (hasSupabase()) {
    try {
      const { data: result, error } = await supabase
        .from('pothole_reports')
        .insert({
          latitude,
          longitude,
          photo_url,
          notes: notes || null,
          status: 'reported',
          confirmations: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      return mapSupabaseRow(result);
    } catch (error) {
      console.error('Failed to create report in Supabase, using mock data:', error);
      // Fall back to mock data
    }
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
  if (hasSupabase()) {
    try {
      const { data, error } = await supabase
        .from('pothole_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      return data.map(mapSupabaseRow);
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
 * Find nearby reports within a given radius (in meters)
 */
export async function findNearbyReports(
  latitude: number,
  longitude: number,
  radiusMeters: number = 20
): Promise<PotholeReport[]> {
  if (hasSupabase()) {
    try {
      // Use Supabase's PostGIS functions for efficient geo queries
      const { data, error } = await supabase.rpc('find_nearby_reports', {
        lat: latitude,
        lng: longitude,
        radius_meters: radiusMeters
      });

      if (error) {
        console.error('Supabase nearby query error:', error);
        throw error;
      }

      return data.map(mapSupabaseRow);
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
  if (hasSupabase()) {
    // Status is already in the correct format for Supabase
    const supabaseStatus = status;
    
    const { data, error } = await supabase
      .from('pothole_reports')
      .update({ 
        status: supabaseStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update report: ${error.message}`);
    }

    if (!data) {
      throw new Error('Report not found');
    }

    return mapSupabaseRow(data);
  }

  throw new Error('Database not available');
}

/**
 * Increment confirmation count for a report
 */
export async function confirmReport(id: string): Promise<PotholeReport> {
  if (hasSupabase()) {
    const { data, error } = await supabase.rpc('increment_confirmations', {
      report_id: id
    });

    if (error) {
      throw new Error(`Failed to confirm report: ${error.message}`);
    }

    if (!data) {
      throw new Error('Report not found');
    }

    return mapSupabaseRow(data);
  }

  throw new Error('Database not available');
}

/**
 * Get report statistics
 */
export async function getReportStats() {
  if (hasSupabase()) {
    try {
      const { data, error } = await supabase.rpc('get_report_stats');

      if (error) {
        console.error('Failed to get stats from Supabase:', error);
        throw error;
      }

      return {
        total_reports: data.total_reports || 0,
        new_reports: data.reported_reports || 0,
        confirmed_reports: data.in_progress_reports || 0,
        fixed_reports: data.fixed_reports || 0,
        active_days: data.active_days || 1
      };
    } catch (error) {
      console.error('Stats query failed, using mock data:', error);
    }
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