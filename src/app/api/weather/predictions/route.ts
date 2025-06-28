import { NextRequest, NextResponse } from 'next/server';
import { weatherCorrelationService } from '@/services/weatherCorrelation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const limit = searchParams.get('limit');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const maxResults = limit ? parseInt(limit) : 10;

    if (limit && (isNaN(maxResults) || maxResults < 1 || maxResults > 50)) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      );
    }

    const predictions = await weatherCorrelationService.generatePotholePredictions(city, maxResults);

    return NextResponse.json({
      success: true,
      data: predictions,
      city,
      totalPredictions: predictions.length,
      modelVersion: 'v1.0'
    });

  } catch (error) {
    console.error('Weather predictions API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pothole predictions' },
      { status: 500 }
    );
  }
}