import { NextRequest, NextResponse } from 'next/server';
import { communityOrganizationsService } from '@/services/communityOrganizations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const focusArea = searchParams.get('area');
    const city = searchParams.get('city');

    if (focusArea) {
      // Get organizations by specific focus area
      const organizations = await communityOrganizationsService.getOrganizationsByFocusArea(
        focusArea,
        city || undefined
      );

      return NextResponse.json({
        success: true,
        data: organizations,
        focusArea,
        city: city || 'All Cities'
      });
    } else {
      // Get list of all available focus areas
      const focusAreas = communityOrganizationsService.getFocusAreaOptions();
      const organizationTypes = communityOrganizationsService.getOrganizationTypes();

      return NextResponse.json({
        success: true,
        data: {
          focusAreas,
          organizationTypes
        }
      });
    }

  } catch (error) {
    console.error('Focus areas API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch focus area data' },
      { status: 500 }
    );
  }
}