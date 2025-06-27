// Type definitions for the Community Pothole Reporter

export interface PotholeReport {
  id: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  notes?: string;
  status: 'new' | 'confirmed' | 'fixed';
  confirmations: number;
  created_at: string;
  updated_at: string;
  distance_meters?: number; // Optional field for nearby queries
}

export interface CreateReportData {
  latitude: number;
  longitude: number;
  photo_url: string;
  notes?: string;
}

export interface ReportFormData {
  photo: File;
  notes?: string;
}