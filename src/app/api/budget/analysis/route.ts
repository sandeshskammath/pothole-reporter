import { NextRequest, NextResponse } from 'next/server';
import { budgetDataService } from '@/services/budgetData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const wardDistrict = searchParams.get('wardDistrict');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const analysis = await budgetDataService.calculateCostAnalysis(city, wardDistrict || undefined);

    return NextResponse.json({
      success: true,
      data: analysis,
      city,
      wardDistrict: wardDistrict || 'All Wards'
    });

  } catch (error) {
    console.error('Budget analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate cost analysis' },
      { status: 500 }
    );
  }
}