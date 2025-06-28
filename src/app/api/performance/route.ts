import { NextRequest, NextResponse } from 'next/server';
import { performanceTrackingService } from '@/services/performanceTracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (startDate && isNaN(start!.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start date format' },
        { status: 400 }
      );
    }

    if (endDate && isNaN(end!.getTime())) {
      return NextResponse.json(
        { error: 'Invalid end date format' },
        { status: 400 }
      );
    }

    const performanceData = await performanceTrackingService.fetchCityPerformanceData(city, start, end);

    return NextResponse.json({
      success: true,
      data: performanceData,
      city,
      period: {
        start: start?.toISOString() || null,
        end: end?.toISOString() || null
      }
    });

  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}