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

    const correlation = await weatherCorrelationService.calculateWeatherCorrelation(city);

    return NextResponse.json({
      success: true,
      data: correlation,
      city
    });

  } catch (error) {
    console.error('Weather correlation API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate weather correlation' },
      { status: 500 }
    );
  }
}