import { NextRequest, NextResponse } from 'next/server';
import { weatherCorrelationService } from '@/services/weatherCorrelation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const alerts = await weatherCorrelationService.generateWeatherAlerts(city);

    return NextResponse.json({
      success: true,
      data: alerts,
      city,
      alertCount: alerts.length,
      severityBreakdown: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      }
    });

  } catch (error) {
    console.error('Weather alerts API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate weather alerts' },
      { status: 500 }
    );
  }
}