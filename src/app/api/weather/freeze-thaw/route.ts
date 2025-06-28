import { NextRequest, NextResponse } from 'next/server';
import { weatherCorrelationService } from '@/services/weatherCorrelation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const days = searchParams.get('days');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const forecastDays = days ? parseInt(days) : 7;

    if (days && (isNaN(forecastDays) || forecastDays < 1 || forecastDays > 14)) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 14' },
        { status: 400 }
      );
    }

    const freezeThawCycles = await weatherCorrelationService.getFreezeThawCycles(city, forecastDays);

    return NextResponse.json({
      success: true,
      data: freezeThawCycles,
      city,
      forecastDays,
      cycleCount: freezeThawCycles.length,
      riskLevels: {
        high: freezeThawCycles.filter(cycle => cycle.riskLevel === 'high').length,
        medium: freezeThawCycles.filter(cycle => cycle.riskLevel === 'medium').length,
        low: freezeThawCycles.filter(cycle => cycle.riskLevel === 'low').length
      }
    });

  } catch (error) {
    console.error('Freeze-thaw cycles API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freeze-thaw cycles' },
      { status: 500 }
    );
  }
}