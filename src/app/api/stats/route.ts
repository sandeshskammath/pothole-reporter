import { NextResponse } from 'next/server';
import { getAllReports } from '@/lib/db';

export async function GET() {
  try {
    const reports = await getAllReports();
    
    // Calculate comprehensive stats using correct database status values
    const newReports = reports.filter((r: any) => r.status === 'reported');
    const confirmedReports = reports.filter((r: any) => r.status === 'in_progress');
    const fixedReports = reports.filter((r: any) => r.status === 'fixed');
    
    const stats = {
      totalReports: reports.length,
      reportedCount: newReports.length, // "New" reports are newly reported
      inProgressCount: confirmedReports.length, // "Confirmed" reports are in progress
      fixedCount: fixedReports.length,
      activeDays: new Set(reports.map((r: any) => r.created_at.split('T')[0])).size,
      avgReportsPerDay: reports.length > 0 ? Math.round(reports.length / Math.max(1, new Set(reports.map((r: any) => r.created_at.split('T')[0])).size)) : 0,
      lastReportTime: reports.length > 0 ? reports[0].created_at : null,
      // Mock data for metrics that would be managed by agencies
      communityMembers: Math.max(47 + reports.length * 3, 47), // Growing mock community
      impactScore: Math.min(95, 12 + reports.length * 4 + fixedReports.length * 8), // Mock impact calculation
    };

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}