import { NextRequest, NextResponse } from 'next/server';
import { representativeLookupService } from '@/services/representativeLookup';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const potholeReportId = searchParams.get('reportId');

    if (!potholeReportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const history = await representativeLookupService.getContactHistory(potholeReportId);

    return NextResponse.json({
      success: true,
      data: history,
      reportId: potholeReportId
    });

  } catch (error) {
    console.error('Contact history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact history' },
      { status: 500 }
    );
  }
}