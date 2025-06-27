import { NextResponse } from 'next/server';
import { getReportStats } from '@/lib/db';

// GET /api/reports/stats - Get report statistics
export async function GET() {
  try {
    const stats = await getReportStats();
    
    return NextResponse.json({
      success: true,
      stats: {
        totalReports: parseInt(stats.total_reports) || 0,
        newReports: parseInt(stats.new_reports) || 0,
        confirmedReports: parseInt(stats.confirmed_reports) || 0,
        fixedReports: parseInt(stats.fixed_reports) || 0,
        activeDays: parseInt(stats.active_days) || 0,
        // Calculate some derived stats
        communityMembers: Math.floor((parseInt(stats.total_reports) || 0) * 0.7), // Estimate
        activeAreas: Math.ceil((parseInt(stats.total_reports) || 0) / 5), // Rough estimate
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}