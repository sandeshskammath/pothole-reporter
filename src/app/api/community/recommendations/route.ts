import { NextRequest, NextResponse } from 'next/server';
import { communityOrganizationsService } from '@/services/communityOrganizations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lng');
    const interests = searchParams.get('interests');
    const limit = searchParams.get('limit');

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude values' },
        { status: 400 }
      );
    }

    const userInterests = interests ? interests.split(',').map(i => i.trim()) : [];
    const maxResults = limit ? parseInt(limit) : 5;

    if (limit && (isNaN(maxResults) || maxResults < 1 || maxResults > 20)) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 20' },
        { status: 400 }
      );
    }

    const recommendations = await communityOrganizationsService.getRecommendedOrganizations(
      { latitude: lat, longitude: lng },
      userInterests,
      maxResults
    );

    return NextResponse.json({
      success: true,
      data: recommendations,
      userLocation: { latitude: lat, longitude: lng },
      interests: userInterests,
      limit: maxResults
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { error: 'Failed to get organization recommendations' },
      { status: 500 }
    );
  }
}