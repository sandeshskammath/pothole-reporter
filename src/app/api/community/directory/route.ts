import { NextRequest, NextResponse } from 'next/server';
import { communityOrganizationsService } from '@/services/communityOrganizations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    const directory = await communityOrganizationsService.getOrganizationDirectory(city || undefined);

    return NextResponse.json({
      success: true,
      data: directory,
      city: city || 'All Cities'
    });

  } catch (error) {
    console.error('Organization directory API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization directory' },
      { status: 500 }
    );
  }
}