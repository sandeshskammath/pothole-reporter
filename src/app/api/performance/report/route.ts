import { NextRequest, NextResponse } from 'next/server';
import { performanceTrackingService } from '@/services/performanceTracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const wardDistrict = searchParams.get('wardDistrict');
    const period = searchParams.get('period');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const report = await performanceTrackingService.generatePerformanceReport(
      city, 
      wardDistrict || undefined, 
      period || undefined
    );

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Performance report API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate performance report' },
      { status: 500 }
    );
  }
}