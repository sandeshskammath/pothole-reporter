import { NextRequest, NextResponse } from 'next/server';
import { performanceTrackingService } from '@/services/performanceTracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const metric = searchParams.get('metric');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    if (!metric) {
      return NextResponse.json(
        { error: 'Metric parameter is required' },
        { status: 400 }
      );
    }

    const patterns = await performanceTrackingService.getSeasonalPatterns(city, metric);

    return NextResponse.json({
      success: true,
      data: patterns,
      city,
      metric
    });

  } catch (error) {
    console.error('Seasonal patterns API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasonal patterns' },
      { status: 500 }
    );
  }
}