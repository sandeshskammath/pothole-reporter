import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { z } from 'zod';
// Use real database in production, mock for development
let dbModule: any;
const isProduction = process.env.NODE_ENV === 'production';
const hasDatabase = process.env.POSTGRES_URL;

if (isProduction && hasDatabase) {
  try {
    dbModule = require('@/lib/db');
    console.log('Using production database');
  } catch (error) {
    console.log('Fallback to mock database');
    dbModule = require('@/lib/mock-db');
  }
} else {
  console.log('Using mock database for development');
  dbModule = require('@/lib/mock-db');
}

const { createReport, getAllReports, findNearbyReports } = dbModule;

// Validation schema for creating reports
const createReportSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  notes: z.string().max(500).optional(),
});

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
    
    // Validate photo file
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }
    
    if (photo.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json(
        { success: false, error: 'Photo must be less than 5MB' },
        { status: 400 }
      );
    }
    
    // Validate coordinates
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