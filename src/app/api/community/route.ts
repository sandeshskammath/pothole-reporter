import { NextRequest, NextResponse } from 'next/server';
import { communityOrganizationsService } from '@/services/communityOrganizations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const type = searchParams.get('type');
    const focusAreas = searchParams.get('focusAreas');
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lng');
    const radius = searchParams.get('radius');

    // Parse focus areas if provided
    const focusAreasList = focusAreas ? focusAreas.split(',').map(area => area.trim()) : undefined;

    // If coordinates are provided, find nearby organizations
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const searchRadius = radius ? parseFloat(radius) : 5;

      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json(
          { error: 'Invalid latitude or longitude values' },
          { status: 400 }
        );
      }

      if (radius && isNaN(searchRadius)) {
        return NextResponse.json(
          { error: 'Invalid radius value' },
          { status: 400 }
        );
      }

      const filters = {
        city: city || undefined,
        type: type || undefined,
        focusAreas: focusAreasList
      };

      const nearbyOrganizations = await communityOrganizationsService.findNearbyOrganizations(
        lat,
        lng,
        searchRadius,
        filters
      );

      return NextResponse.json({
        success: true,
        data: nearbyOrganizations,
        searchLocation: { latitude: lat, longitude: lng },
        radius: searchRadius,
        filters
      });
    }

    // Otherwise, search organizations by filters
    const filters = {
      city: city || undefined,
      type: type || undefined,
      focusAreas: focusAreasList
    };

    const organizations = await communityOrganizationsService.searchOrganizations(filters);

    return NextResponse.json({
      success: true,
      data: organizations,
      filters
    });

  } catch (error) {
    console.error('Community organizations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      city,
      address,
      contactEmail,
      contactPhone,
      website,
      focusAreas,
      meetingSchedule,
      latitude,
      longitude,
      description,
      socialMedia,
      isActive = true
    } = body;

    if (!name || !type || !city) {
      return NextResponse.json(
        { error: 'Name, type, and city are required fields' },
        { status: 400 }
      );
    }

    if (!['government', 'nonprofit', 'civic_tech', 'advocacy'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid organization type' },
        { status: 400 }
      );
    }

    const organizationData = {
      name,
      type,
      city,
      address,
      contactEmail,
      contactPhone,
      website,
      focusAreas: focusAreas || [],
      meetingSchedule,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      description,
      socialMedia: socialMedia || {},
      isActive
    };

    const id = await communityOrganizationsService.addOrganization(organizationData);

    return NextResponse.json({
      success: true,
      data: { id, ...organizationData },
      message: 'Organization added successfully'
    });

  } catch (error) {
    console.error('Add organization error:', error);
    return NextResponse.json(
      { error: 'Failed to add organization' },
      { status: 500 }
    );
  }
}