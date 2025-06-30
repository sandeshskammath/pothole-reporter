import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Starting heatmap data population...');

    // Clear existing data first
    const { error: deleteError } = await supabaseAdmin
      .from('pothole_reports')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
      return NextResponse.json({ error: 'Failed to clear existing data', details: deleteError.message }, { status: 500 });
    }

    // Comprehensive heatmap data - organized by neighborhoods
    const heatmapData = [
      // CHICAGO - LOOP/DOWNTOWN CLUSTER (High density - business district)
      {
        latitude: 41.8781,
        longitude: -87.6298,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
        notes: 'Major pothole on Michigan Avenue - Ward 42 escalated to alderman',
        status: 'reported',
        confirmations: 12
      },
      {
        latitude: 41.8795,
        longitude: -87.6285,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Loop area pothole - CDOT emergency repair scheduled',
        status: 'in_progress',
        confirmations: 8
      },
      {
        latitude: 41.8765,
        longitude: -87.6310,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
        notes: 'Deep hole near Federal Building - high traffic impact',
        status: 'reported',
        confirmations: 15
      },
      {
        latitude: 41.8750,
        longitude: -87.6275,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Fixed! Grant Park area - excellent Ward 42 response time',
        status: 'fixed',
        confirmations: 6
      },
      {
        latitude: 41.8805,
        longitude: -87.6320,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
        notes: 'Millennium Park area - tourist district priority repair',
        status: 'reported',
        confirmations: 20
      },

      // CHICAGO - NORTH SIDE CLUSTER - Lincoln Park/Lakeview (Medium density)
      {
        latitude: 41.9245,
        longitude: -87.6369,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
        notes: 'Lincoln Park Zoo area - Ward 43 bike lane damage',
        status: 'reported',
        confirmations: 7
      },
      {
        latitude: 41.9265,
        longitude: -87.6385,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Lakeview pothole cluster - winter freeze-thaw damage',
        status: 'in_progress',
        confirmations: 9
      },
      {
        latitude: 41.9285,
        longitude: -87.6355,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
        notes: 'DePaul University area - student safety concern',
        status: 'reported',
        confirmations: 11
      },
      {
        latitude: 41.9225,
        longitude: -87.6340,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Fixed! Fullerton Parkway - Ward 43 quick response',
        status: 'fixed',
        confirmations: 5
      },

      // CHICAGO - WEST SIDE CLUSTER - Garfield Park (High density, lower income area)
      {
        latitude: 41.8864,
        longitude: -87.7172,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
        notes: 'Madison Street cluster - Ward 27 needs urgent attention',
        status: 'reported',
        confirmations: 18
      },
      {
        latitude: 41.8850,
        longitude: -87.7185,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
        notes: 'Chronic pothole problem - community organizing for budget allocation',
        status: 'reported',
        confirmations: 22
      },
      {
        latitude: 41.8878,
        longitude: -87.7160,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
        notes: 'West Side infrastructure - alderman promises action',
        status: 'in_progress',
        confirmations: 14
      },
      {
        latitude: 41.8895,
        longitude: -87.7145,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
        notes: 'Garfield Park Conservatory access road - tourist area priority',
        status: 'reported',
        confirmations: 16
      },

      // CHICAGO - SOUTH SIDE CLUSTER - Hyde Park/University area
      {
        latitude: 41.7886,
        longitude: -87.5987,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
        notes: 'UChicago campus area - Ward 5 working with university',
        status: 'in_progress',
        confirmations: 10
      },
      {
        latitude: 41.7920,
        longitude: -87.6015,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
        notes: 'Hyde Park Boulevard - Museum of Science access route',
        status: 'reported',
        confirmations: 13
      },
      {
        latitude: 41.7865,
        longitude: -87.6020,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Fixed! Woodlawn area - community advocacy successful',
        status: 'fixed',
        confirmations: 7
      },

      // NYC Data - Manhattan clusters
      // MIDTOWN CLUSTER (Very high density)
      {
        latitude: 40.7589,
        longitude: -73.9851,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5ZQyBQb3Rob2xlPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Times Square area - Council District 3 emergency repair needed',
        status: 'reported',
        confirmations: 25
      },
      {
        latitude: 40.7605,
        longitude: -73.9835,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Midtown pothole - DOT coordinating with MTA bus routes',
        status: 'in_progress',
        confirmations: 18
      },
      {
        latitude: 40.7570,
        longitude: -73.9865,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5ZQyBQb3Rob2xlPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Broadway theater district - tourist safety priority',
        status: 'reported',
        confirmations: 30
      },
      {
        latitude: 40.7620,
        longitude: -73.9820,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Fixed! Central Park South - rapid response from District 3',
        status: 'fixed',
        confirmations: 12
      },

      // BROOKLYN CLUSTER - Park Slope/Prospect Heights
      {
        latitude: 40.6708,
        longitude: -73.9778,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDElIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Park Slope bike lane damage - Community Board 6 escalated',
        status: 'in_progress',
        confirmations: 20
      },
      {
        latitude: 40.6725,
        longitude: -73.9765,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5ZQyBQb3Rob2xlPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Prospect Heights cluster - 311 requests flooding in',
        status: 'reported',
        confirmations: 17
      },
      {
        latitude: 40.6690,
        longitude: -73.9795,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5ZQyBQb3Rob2xlPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Brooklyn Museum area - cultural district priority',
        status: 'reported',
        confirmations: 14
      },
      {
        latitude: 40.6740,
        longitude: -73.9750,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Fixed! Flatbush Avenue - DOT completed permanent repair',
        status: 'fixed',
        confirmations: 9
      },

      // QUEENS CLUSTER - Flushing/Astoria
      {
        latitude: 40.7606,
        longitude: -73.8350,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5ZQyBQb3Rob2xlPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Flushing Meadows area - Community Board 7 multilingual advocacy',
        status: 'reported',
        confirmations: 19
      },
      {
        latitude: 40.7590,
        longitude: -73.8365,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Northern Boulevard bus route damage - MTA coordination',
        status: 'in_progress',
        confirmations: 11
      },
      {
        latitude: 40.7620,
        longitude: -73.8335,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5ZQyBQb3Rob2xlPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Queens Borough Hall area - council member intervention',
        status: 'reported',
        confirmations: 15
      },

      // SCATTERED REPORTS (Lower density areas for realistic distribution)
      {
        latitude: 41.8200,
        longitude: -87.6500,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
        notes: 'Chinatown area - Ward 25 community organizing',
        status: 'reported',
        confirmations: 8
      },
      {
        latitude: 41.9000,
        longitude: -87.6500,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDElIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Fixed! Wicker Park - creative district maintenance',
        status: 'fixed',
        confirmations: 4
      },
      {
        latitude: 40.8000,
        longitude: -73.9500,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5ZQyBQb3Rob2xlPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Upper West Side - Community Board 7 quality of life',
        status: 'reported',
        confirmations: 6
      },
      {
        latitude: 40.6500,
        longitude: -74.0000,
        photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
        notes: 'Brooklyn Heights promenade access - historic district priority',
        status: 'in_progress',
        confirmations: 12
      }
    ];

    console.log(`Inserting ${heatmapData.length} heatmap records...`);

    // Insert all heatmap data
    const { data: insertedReports, error: insertError } = await supabaseAdmin
      .from('pothole_reports')
      .insert(heatmapData)
      .select();

    if (insertError) {
      console.error('Error inserting heatmap data:', insertError);
      return NextResponse.json({ 
        error: 'Failed to insert heatmap data', 
        details: insertError.message 
      }, { status: 500 });
    }

    console.log(`Successfully inserted ${insertedReports?.length || 0} heatmap records`);

    // Get summary statistics
    const { data: stats } = await supabaseAdmin.rpc('get_report_stats');

    return NextResponse.json({
      success: true,
      message: 'Heatmap data populated successfully',
      records_inserted: insertedReports?.length || 0,
      statistics: stats,
      clusters: {
        chicago: {
          downtown_loop: 5,
          north_side: 4,
          west_side: 4,
          south_side: 3
        },
        nyc: {
          midtown_manhattan: 4,
          brooklyn: 4,
          queens: 3
        },
        scattered: 4
      }
    });

  } catch (error) {
    console.error('Database population failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database population failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}