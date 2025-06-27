import { NextRequest, NextResponse } from 'next/server';
import { confirmReport } from '@/lib/db';

// POST /api/reports/[id]/confirm - Confirm a pothole report
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      );
    }
    
    const updatedReport = await confirmReport(id);
    
    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: 'Report confirmed successfully'
    });
  } catch (error) {
    console.error('Error confirming report:', error);
    
    if (error instanceof Error && error.message === 'Report not found') {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to confirm report' },
      { status: 500 }
    );
  }
}