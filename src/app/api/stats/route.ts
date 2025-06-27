import { NextResponse } from 'next/server';

// Use real database in production, mock for development
let dbModule: any;
const isProduction = process.env.NODE_ENV === 'production';
const hasDatabase = process.env.POSTGRES_URL;

if (isProduction && hasDatabase) {
  try {
    dbModule = require('@/lib/db');
    console.log('Using production database for stats');
  } catch (error) {
    console.log('Fallback to mock database for stats');
    dbModule = require('@/lib/mock-db');
  }
} else {
  console.log('Using mock database for development stats');
  dbModule = require('@/lib/mock-db');
}

const { getReportStats, getAllReports } = dbModule;

export async function GET() {
  try {
    const reports = await getAllReports();
    
    // Calculate comprehensive stats
    const stats = {
      totalReports: reports.length,
      reportedCount: reports.filter((r: any) => r.status === 'reported').length,
      inProgressCount: reports.filter((r: any) => r.status === 'in_progress').length,
      fixedCount: reports.filter((r: any) => r.status === 'fixed').length,
      activeDays: new Set(reports.map((r: any) => r.created_at.split('T')[0])).size,
      avgReportsPerDay: reports.length > 0 ? Math.round(reports.length / Math.max(1, new Set(reports.map((r: any) => r.created_at.split('T')[0])).size)) : 0,
      lastReportTime: reports.length > 0 ? reports[0].created_at : null,
      communityMembers: Math.max(reports.length, 12), // Mock community size
      impactScore: Math.min(100, reports.length * 8 + reports.filter((r: any) => r.status === 'fixed').length * 25),
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