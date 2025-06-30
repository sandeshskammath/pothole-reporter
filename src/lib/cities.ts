// City configuration for focused pothole reporting
export interface CityConfig {
  id: string;
  name: string;
  state: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  bounds: [[number, number], [number, number]]; // [[sw_lat, sw_lng], [ne_lat, ne_lng]]
  features: {
    wards?: boolean;
    districts?: boolean;
    budget_tracking?: boolean;
    performance_metrics?: boolean;
    weather_correlation?: boolean;
  };
  api_endpoints?: {
    data_portal?: string;
    representatives?: string;
  };
}

export const CITIES: Record<string, CityConfig> = {
  chicago: {
    id: 'chicago',
    name: 'Chicago',
    state: 'Illinois',
    center: [41.8781, -87.6298],
    zoom: 11,
    bounds: [
      [41.644, -87.940], // Southwest corner
      [42.023, -87.524]  // Northeast corner
    ],
    features: {
      wards: true,
      budget_tracking: true,
      performance_metrics: true,
      weather_correlation: true,
    },
    api_endpoints: {
      data_portal: 'https://data.cityofchicago.org/resource/',
      representatives: 'chicago-ward-boundaries'
    }
  },
  nyc: {
    id: 'nyc',
    name: 'New York City',
    state: 'New York',
    center: [40.7128, -74.0060],
    zoom: 11,
    bounds: [
      [40.477, -74.259], // Southwest corner (Staten Island)
      [40.917, -73.700]  // Northeast corner (Bronx)
    ],
    features: {
      districts: true,
      budget_tracking: true,
      performance_metrics: true,
      weather_correlation: true,
    },
    api_endpoints: {
      data_portal: 'https://data.cityofnewyork.us/resource/',
      representatives: 'nyc-council-districts'
    }
  }
};

export const DEFAULT_CITY = 'chicago';

export function getCityConfig(cityId: string): CityConfig {
  return CITIES[cityId] || CITIES[DEFAULT_CITY];
}

export function isLocationInCity(lat: number, lng: number, cityId: string): boolean {
  const city = getCityConfig(cityId);
  const [[swLat, swLng], [neLat, neLng]] = city.bounds;
  
  return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
}

export function detectCityFromLocation(lat: number, lng: number): string | null {
  for (const [cityId, city] of Object.entries(CITIES)) {
    if (isLocationInCity(lat, lng, cityId)) {
      return cityId;
    }
  }
  return null;
}

// Sample city-specific pothole data
export const CITY_SAMPLE_DATA = {
  chicago: [
    {
      id: 'chi-1',
      latitude: 41.8781,
      longitude: -87.6298,
      photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkNoaWNhZ28gUG90aG9sZTwvdGV4dD48L3N2Zz4=',
      notes: 'Large pothole on Michigan Avenue - high traffic area',
      status: 'reported' as const,
      confirmations: 3,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'chi-2',
      latitude: 41.8676,
      longitude: -87.6176,
      photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
      notes: 'Deep pothole near Grant Park - winter damage',
      status: 'in_progress' as const,
      confirmations: 7,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'chi-3',
      latitude: 41.8947,
      longitude: -87.6440,
      photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==',
      notes: 'Fixed pothole on North Side - excellent repair work!',
      status: 'fixed' as const,
      confirmations: 4,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
    }
  ],
  nyc: [
    {
      id: 'nyc-1',
      latitude: 40.7589,
      longitude: -73.9851,
      photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5ZQyBQb3Rob2xlPC90ZXh0Pjwvc3ZnPg==',
      notes: 'Pothole in Times Square area - tourist safety concern',
      status: 'reported' as const,
      confirmations: 8,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'nyc-2',
      latitude: 40.6892,
      longitude: -74.0445,
      photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==',
      notes: 'Brooklyn Bridge area pothole - under repair',
      status: 'in_progress' as const,
      confirmations: 5,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'nyc-3',
      latitude: 40.7505,
      longitude: -73.9934,
      photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==',
      notes: 'Fixed pothole in Midtown - quick response time!',
      status: 'fixed' as const,
      confirmations: 6,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
    }
  ]
};