import { NextRequest, NextResponse } from 'next/server';
import { budgetDataService } from '@/services/budgetData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const fiscalYear = searchParams.get('fiscalYear');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const year = fiscalYear ? parseInt(fiscalYear) : undefined;
    if (fiscalYear && isNaN(year!)) {
      return NextResponse.json(
        { error: 'Invalid fiscal year' },
        { status: 400 }
      );
    }

    const summary = await budgetDataService.getBudgetSummary(city, year);

    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Budget summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget summary' },
      { status: 500 }
    );
  }
}