import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Import database functions with development fallback
import { createReport, getAllReports, findNearbyReports } from '@/lib/db-supabase';

// Enhanced validation schema with strict security measures
const createReportSchema = z.object({
  latitude: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .finite('Latitude must be a finite number'),
  longitude: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .finite('Longitude must be a finite number'),
  notes: z.string()
    .max(200, 'Notes must be 200 characters or less') // Reduced from 500
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      // Sanitize input to prevent XSS and injection attacks
      return DOMPurify.sanitize(val.trim(), { 
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: [] // No attributes allowed
      });
    }),
});

// File validation constants
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_FILE_SIZE = 1024; // 1KB minimum

// Validate image file security
function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 5MB.' };
  }
  
  if (file.size < MIN_FILE_SIZE) {
    return { valid: false, error: 'File too small. Minimum size is 1KB.' };
  }
  
  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' };
  }
  
  // Check file extension matches MIME type
  const extension = file.name.toLowerCase().split('.').pop();
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  
  if (!extension || !validExtensions.includes(extension)) {
    return { valid: false, error: 'Invalid file extension.' };
  }
  
  // Ensure MIME type matches extension
  const mimeExtensionMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp']
  };
  
  const allowedExtensions = mimeExtensionMap[file.type];
  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'File type does not match extension.' };
  }
  
  return { valid: true };
}

// GET /api/reports - Fetch all pothole reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    
    let reports;
    
    // If lat/lng provided, find nearby reports
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusMeters = radius ? parseInt(radius) : 20;
      
      reports = await findNearbyReports(latitude, longitude, radiusMeters);
    } else {
      // Otherwise get all reports
      reports = await getAllReports();
    }
    
    return NextResponse.json({
      success: true,
      reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create a new pothole report
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const notes = formData.get('notes') as string;
    
    // Validate required fields
    if (!photo || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'Photo, latitude, and longitude are required' },
        { status: 400 }
      );
    }
    
    // Enhanced file validation with security checks
    const fileValidation = validateImageFile(photo);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { success: false, error: fileValidation.error },
        { status: 400 }
      );
    }
    
    // Enhanced data validation with sanitization
    const data = createReportSchema.parse({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      notes: notes || undefined,
    });
    
    // Check for nearby reports (within 20m) to prevent duplicates
    const nearbyReports = await findNearbyReports(data.latitude, data.longitude, 20);
    if (nearbyReports.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'A pothole has already been reported within 20 meters of this location',
        nearbyReports: nearbyReports.map((report: any) => ({
          id: report.id,
          distance: report.distance_meters || 'nearby',
          created_at: report.created_at
        }))
      }, { status: 409 });
    }
    
    // Upload photo to Vercel Blob (or convert to data URL for development)
    let photoUrl: string;
    
    try {
      const timestamp = Date.now();
      const fileExtension = photo.name.split('.').pop() || 'jpg';
      const fileName = `potholes/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      
      const blob = await put(fileName, photo, {
        access: 'public',
      });
      
      photoUrl = blob.url;
      console.log('Photo uploaded to Vercel Blob successfully');
    } catch (error) {
      console.log('Blob upload failed, converting to data URL for development');
      // Convert the uploaded file to a data URL for development
      const buffer = await photo.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      photoUrl = `data:${photo.type};base64,${base64}`;
    }
    
    // Create report in database
    const report = await createReport({
      latitude: data.latitude,
      longitude: data.longitude,
      photo_url: photoUrl,
      notes: data.notes,
    });
    
    return NextResponse.json({
      success: true,
      report,
      message: 'Pothole report created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating report:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data provided', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}