import { NextRequest, NextResponse } from 'next/server';
import { representativeLookupService } from '@/services/representativeLookup';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lng');

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

    const representatives = await representativeLookupService.findRepresentatives(lat, lng);

    return NextResponse.json({
      success: true,
      data: representatives,
      location: { latitude: lat, longitude: lng }
    });

  } catch (error) {
    console.error('Representatives API error:', error);
    return NextResponse.json(
      { error: 'Failed to find representatives' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      potholeReportId, 
      representative, 
      contactType, 
      userId, 
      messageTemplate 
    } = body;

    if (!potholeReportId || !representative || !contactType) {
      return NextResponse.json(
        { error: 'Missing required fields: potholeReportId, representative, contactType' },
        { status: 400 }
      );
    }

    await representativeLookupService.saveContactRecord(
      potholeReportId,
      representative,
      contactType,
      userId,
      messageTemplate
    );

    return NextResponse.json({
      success: true,
      message: 'Contact record saved successfully'
    });

  } catch (error) {
    console.error('Save contact record error:', error);
    return NextResponse.json(
      { error: 'Failed to save contact record' },
      { status: 500 }
    );
  }
}