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

    const budgetData = await budgetDataService.fetchBudgetData(city, year);

    return NextResponse.json({
      success: true,
      data: budgetData,
      city,
      fiscalYear: year || new Date().getFullYear()
    });

  } catch (error) {
    console.error('Budget API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, fiscalYear } = body;

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      );
    }

    const success = await budgetDataService.refreshBudgetData(city, fiscalYear);

    return NextResponse.json({
      success,
      message: success ? 'Budget data refreshed successfully' : 'Failed to refresh budget data'
    });

  } catch (error) {
    console.error('Budget refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh budget data' },
      { status: 500 }
    );
  }
}