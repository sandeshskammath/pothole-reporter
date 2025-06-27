// Mock database for development when Vercel Postgres is not available

export interface PotholeReport {
  id: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  notes?: string;
  status: 'reported' | 'in_progress' | 'fixed';
  created_at: string;
  updated_at: string;
}

export interface CreateReportData {
  latitude: number;
  longitude: number;
  photo_url: string;
  notes?: string;
}

// In-memory storage for development
let mockReports: PotholeReport[] = [
  {
    id: '1',
    latitude: 37.7749,
    longitude: -122.4194,
    photo_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    notes: 'Large pothole near the intersection',
    status: 'reported',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    latitude: 37.7849,
    longitude: -122.4094,
    photo_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    notes: 'Deep hole affecting bike lane',
    status: 'in_progress',
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    latitude: 37.7649,
    longitude: -122.4294,
    photo_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    notes: 'Fixed pothole - great job!',
    status: 'fixed',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-16T16:45:00Z',
  },
];

export async function getAllReports(): Promise<PotholeReport[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...mockReports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createReport(data: CreateReportData): Promise<PotholeReport> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const newReport: PotholeReport = {
    id: Date.now().toString(),
    ...data,
    status: 'reported',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  mockReports.push(newReport);
  return newReport;
}

export async function getReportsByStatus(status: 'reported' | 'in_progress' | 'fixed'): Promise<PotholeReport[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockReports.filter(report => report.status === status);
}

export async function findNearbyReports(
  latitude: number,
  longitude: number,
  radiusMeters: number = 20
): Promise<PotholeReport[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simple distance calculation (not precise, but good for development)
  return mockReports.filter(report => {
    const distance = Math.sqrt(
      Math.pow((report.latitude - latitude) * 111000, 2) +
      Math.pow((report.longitude - longitude) * 111000, 2)
    );
    return distance <= radiusMeters;
  });
}

export async function getReportStats() {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    total_reports: mockReports.length,
    new_reports: mockReports.filter(r => r.status === 'reported').length,
    confirmed_reports: mockReports.filter(r => r.status === 'in_progress').length,
    fixed_reports: mockReports.filter(r => r.status === 'fixed').length,
    active_days: 3,
  };
}