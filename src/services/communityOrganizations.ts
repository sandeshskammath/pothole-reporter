import { sql } from '@vercel/postgres';

export interface CommunityOrganization {
  id?: number;
  name: string;
  type: 'government' | 'nonprofit' | 'civic_tech' | 'advocacy';
  city: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  focusAreas: string[];
  meetingSchedule?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunitySearchFilters {
  city?: string;
  type?: string;
  focusAreas?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number; // miles
  isActive?: boolean;
}

export interface NearbyOrganization extends CommunityOrganization {
  distance?: number; // in miles
  relevanceScore?: number;
}

export interface OrganizationDirectory {
  organizations: CommunityOrganization[];
  totalCount: number;
  filterCounts: {
    government: number;
    nonprofit: number;
    civic_tech: number;
    advocacy: number;
  };
  focusAreaCounts: {
    [key: string]: number;
  };
}

class CommunityOrganizationsService {
  private readonly focusAreas = [
    'infrastructure',
    'civic_engagement',
    'social_services',
    'emergency_assistance',
    'job_training',
    'digital_equity',
    'civic_tech',
    'open_data',
    'community_development',
    'environmental',
    'transportation',
    'housing',
    'public_safety',
    'education',
    'healthcare'
  ];

  async findNearbyOrganizations(
    latitude: number, 
    longitude: number, 
    radius: number = 5,
    filters?: CommunitySearchFilters
  ): Promise<NearbyOrganization[]> {
    try {
      // Build the query with distance calculation
      let query = `
        SELECT *,
        (3959 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance
        FROM community_organizations
        WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND is_active = true
        AND (3959 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) <= $3
      `;

      const params: any[] = [latitude, longitude, radius];
      let paramIndex = 4;

      // Apply filters
      if (filters?.city) {
        query += ` AND LOWER(city) = LOWER($${paramIndex})`;
        params.push(filters.city);
        paramIndex++;
      }

      if (filters?.type) {
        query += ` AND type = $${paramIndex}`;
        params.push(filters.type);
        paramIndex++;
      }

      if (filters?.focusAreas && filters.focusAreas.length > 0) {
        query += ` AND focus_areas && $${paramIndex}::text[]`;
        params.push(`{${filters.focusAreas.map(area => `"${area}"`).join(',')}}`);
        paramIndex++;
      }

      query += ` ORDER BY distance ASC LIMIT 20`;

      const result = await sql.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        city: row.city,
        address: row.address,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        website: row.website,
        focusAreas: row.focus_areas || [],
        meetingSchedule: row.meeting_schedule,
        latitude: row.latitude ? parseFloat(row.latitude) : undefined,
        longitude: row.longitude ? parseFloat(row.longitude) : undefined,
        description: row.description,
        socialMedia: row.social_media || {},
        isActive: row.is_active,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        distance: row.distance ? parseFloat(row.distance) : undefined,
        relevanceScore: this.calculateRelevanceScore(row, filters)
      }));

    } catch (error) {
      console.error('Error finding nearby organizations:', error);
      return this.getFallbackOrganizations(latitude, longitude);
    }
  }

  async searchOrganizations(filters: CommunitySearchFilters): Promise<CommunityOrganization[]> {
    try {
      let query = `
        SELECT * FROM community_organizations
        WHERE is_active = true
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (filters.city) {
        query += ` AND LOWER(city) = LOWER($${paramIndex})`;
        params.push(filters.city);
        paramIndex++;
      }

      if (filters.type) {
        query += ` AND type = $${paramIndex}`;
        params.push(filters.type);
        paramIndex++;
      }

      if (filters.focusAreas && filters.focusAreas.length > 0) {
        query += ` AND focus_areas && $${paramIndex}::text[]`;
        params.push(`{${filters.focusAreas.map(area => `"${area}"`).join(',')}}`);
        paramIndex++;
      }

      query += ` ORDER BY name ASC`;

      const result = await sql.query(query, params);

      return result.rows.map(row => this.mapRowToOrganization(row));

    } catch (error) {
      console.error('Error searching organizations:', error);
      return [];
    }
  }

  async getOrganizationDirectory(city?: string): Promise<OrganizationDirectory> {
    try {
      let query = `SELECT * FROM community_organizations WHERE is_active = true`;
      const params: any[] = [];

      if (city) {
        query += ` AND LOWER(city) = LOWER($1)`;
        params.push(city);
      }

      query += ` ORDER BY type, name`;

      const result = await sql.query(query, params);
      const organizations = result.rows.map(row => this.mapRowToOrganization(row));

      // Calculate filter counts
      const filterCounts = {
        government: organizations.filter(org => org.type === 'government').length,
        nonprofit: organizations.filter(org => org.type === 'nonprofit').length,
        civic_tech: organizations.filter(org => org.type === 'civic_tech').length,
        advocacy: organizations.filter(org => org.type === 'advocacy').length
      };

      // Calculate focus area counts
      const focusAreaCounts: { [key: string]: number } = {};
      organizations.forEach(org => {
        org.focusAreas.forEach(area => {
          focusAreaCounts[area] = (focusAreaCounts[area] || 0) + 1;
        });
      });

      return {
        organizations,
        totalCount: organizations.length,
        filterCounts,
        focusAreaCounts
      };

    } catch (error) {
      console.error('Error getting organization directory:', error);
      return this.getFallbackDirectory(city);
    }
  }

  async addOrganization(organization: Omit<CommunityOrganization, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      const focusAreasArray = `{${organization.focusAreas.map(area => `"${area}"`).join(',')}}`;
      
      const result = await sql`
        INSERT INTO community_organizations (
          name, type, city, address, contact_email, contact_phone, website,
          focus_areas, meeting_schedule, latitude, longitude, description,
          social_media, is_active
        ) VALUES (
          ${organization.name}, ${organization.type}, ${organization.city},
          ${organization.address || null}, ${organization.contactEmail || null},
          ${organization.contactPhone || null}, ${organization.website || null},
          ${focusAreasArray}::text[], ${organization.meetingSchedule || null},
          ${organization.latitude || null}, ${organization.longitude || null},
          ${organization.description || null}, ${JSON.stringify(organization.socialMedia || {})},
          ${organization.isActive}
        )
        RETURNING id
      `;

      return result.rows[0].id;
    } catch (error) {
      console.error('Error adding organization:', error);
      throw error;
    }
  }

  async updateOrganization(id: number, updates: Partial<CommunityOrganization>): Promise<boolean> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'createdAt') {
          const dbField = this.mapFieldToColumn(key);
          if (dbField) {
            updateFields.push(`${dbField} = $${paramIndex}`);
            params.push(key === 'socialMedia' ? JSON.stringify(value) : value);
            paramIndex++;
          }
        }
      });

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push(`updated_at = NOW()`);
      params.push(id);

      const query = `
        UPDATE community_organizations 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await sql.query(query, params);
      return (result.rowCount || 0) > 0;

    } catch (error) {
      console.error('Error updating organization:', error);
      return false;
    }
  }

  async getOrganizationById(id: number): Promise<CommunityOrganization | null> {
    try {
      const result = await sql`
        SELECT * FROM community_organizations WHERE id = ${id}
      `;

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToOrganization(result.rows[0]);

    } catch (error) {
      console.error('Error getting organization by ID:', error);
      return null;
    }
  }

  async getOrganizationsByFocusArea(focusArea: string, city?: string): Promise<CommunityOrganization[]> {
    try {
      let query = `
        SELECT * FROM community_organizations
        WHERE $1 = ANY(focus_areas) AND is_active = true
      `;
      const params: any[] = [focusArea];

      if (city) {
        query += ` AND LOWER(city) = LOWER($2)`;
        params.push(city);
      }

      query += ` ORDER BY name`;

      const result = await sql.query(query, params);
      return result.rows.map(row => this.mapRowToOrganization(row));

    } catch (error) {
      console.error('Error getting organizations by focus area:', error);
      return [];
    }
  }

  async getRecommendedOrganizations(
    userLocation: { latitude: number; longitude: number },
    userInterests: string[] = [],
    limit: number = 5
  ): Promise<NearbyOrganization[]> {
    try {
      const nearby = await this.findNearbyOrganizations(
        userLocation.latitude,
        userLocation.longitude,
        10, // 10 mile radius
        { focusAreas: userInterests.length > 0 ? userInterests : undefined }
      );

      // Sort by relevance score and distance
      return nearby
        .sort((a, b) => {
          const scoreA = (a.relevanceScore || 0) - (a.distance || 0) * 0.1;
          const scoreB = (b.relevanceScore || 0) - (b.distance || 0) * 0.1;
          return scoreB - scoreA;
        })
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting recommended organizations:', error);
      return [];
    }
  }

  private calculateRelevanceScore(row: any, filters?: CommunitySearchFilters): number {
    let score = 50; // Base score

    // Boost score for specific types
    if (filters?.type && row.type === filters.type) {
      score += 20;
    }

    // Boost score for matching focus areas
    if (filters?.focusAreas && filters.focusAreas.length > 0) {
      const orgFocusAreas = row.focus_areas || [];
      const matchingAreas = filters.focusAreas.filter(area => 
        orgFocusAreas.includes(area)
      );
      score += matchingAreas.length * 15;
    }

    // Boost score for organizations with more information
    if (row.description) score += 5;
    if (row.website) score += 5;
    if (row.contact_email) score += 5;
    if (row.meeting_schedule) score += 5;

    // Boost score for civic engagement and infrastructure organizations
    const orgFocusAreas = row.focus_areas || [];
    if (orgFocusAreas.includes('civic_engagement')) score += 10;
    if (orgFocusAreas.includes('infrastructure')) score += 15;

    return Math.min(score, 100);
  }

  private mapRowToOrganization(row: any): CommunityOrganization {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      city: row.city,
      address: row.address,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      website: row.website,
      focusAreas: row.focus_areas || [],
      meetingSchedule: row.meeting_schedule,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      description: row.description,
      socialMedia: row.social_media || {},
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapFieldToColumn(field: string): string | null {
    const fieldMap: { [key: string]: string } = {
      'name': 'name',
      'type': 'type',
      'city': 'city',
      'address': 'address',
      'contactEmail': 'contact_email',
      'contactPhone': 'contact_phone',
      'website': 'website',
      'focusAreas': 'focus_areas',
      'meetingSchedule': 'meeting_schedule',
      'latitude': 'latitude',
      'longitude': 'longitude',
      'description': 'description',
      'socialMedia': 'social_media',
      'isActive': 'is_active'
    };

    return fieldMap[field] || null;
  }

  private getFallbackOrganizations(latitude: number, longitude: number): NearbyOrganization[] {
    // Determine city from coordinates for fallback data
    const city = this.getCityFromCoordinates(latitude, longitude);
    
    if (city === 'Chicago') {
      return this.getChicagoFallbackOrganizations();
    } else if (city === 'New York') {
      return this.getNYCFallbackOrganizations();
    }

    return this.getGenericFallbackOrganizations(city);
  }

  private getCityFromCoordinates(latitude: number, longitude: number): string {
    // Chicago boundaries (approximate)
    if (latitude >= 41.6 && latitude <= 42.1 && longitude >= -87.9 && longitude <= -87.5) {
      return 'Chicago';
    }
    
    // NYC boundaries (approximate)
    if (latitude >= 40.4 && latitude <= 40.9 && longitude >= -74.3 && longitude <= -73.7) {
      return 'New York';
    }
    
    return 'Unknown';
  }

  private getChicagoFallbackOrganizations(): NearbyOrganization[] {
    return [
      {
        id: 1,
        name: 'Chi Hack Night',
        type: 'civic_tech',
        city: 'Chicago',
        address: '222 W Merchandise Mart Plaza, Chicago, IL 60654',
        website: 'https://chihacknight.org',
        focusAreas: ['civic_tech', 'open_data', 'civic_engagement'],
        meetingSchedule: 'Tuesdays, 6 PM',
        latitude: 41.8885,
        longitude: -87.6354,
        description: 'Weekly civic tech meetup for building technology to improve civic life',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        distance: 2.1,
        relevanceScore: 85
      },
      {
        id: 2,
        name: 'Englewood Community Service Center',
        type: 'government',
        city: 'Chicago',
        address: '1140 W. 79th Street, Chicago, IL 60621',
        contactPhone: '311',
        focusAreas: ['social_services', 'emergency_assistance'],
        meetingSchedule: 'Monday-Friday, 9 AM - 5 PM',
        latitude: 41.7505,
        longitude: -87.6563,
        description: 'DFSS center providing resources and warming/cooling center',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        distance: 3.7,
        relevanceScore: 70
      }
    ];
  }

  private getNYCFallbackOrganizations(): NearbyOrganization[] {
    return [
      {
        id: 3,
        name: 'NYC Civic Tech',
        type: 'civic_tech',
        city: 'New York',
        website: 'https://nyc.gov/civic-tech',
        focusAreas: ['civic_tech', 'digital_equity', 'open_data'],
        description: 'Building technology solutions for NYC government and citizens',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        distance: 1.5,
        relevanceScore: 80
      }
    ];
  }

  private getGenericFallbackOrganizations(city: string): NearbyOrganization[] {
    return [
      {
        id: 999,
        name: `${city} Community Center`,
        type: 'government',
        city: city,
        contactPhone: '311',
        focusAreas: ['social_services', 'community_development'],
        description: 'Local community services and resources',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        distance: 2.0,
        relevanceScore: 60
      }
    ];
  }

  private getFallbackDirectory(city?: string): OrganizationDirectory {
    const organizations = city === 'Chicago' 
      ? this.getChicagoFallbackOrganizations()
      : city === 'New York' 
        ? this.getNYCFallbackOrganizations()
        : this.getGenericFallbackOrganizations(city || 'Unknown');

    return {
      organizations,
      totalCount: organizations.length,
      filterCounts: {
        government: organizations.filter(org => org.type === 'government').length,
        nonprofit: organizations.filter(org => org.type === 'nonprofit').length,
        civic_tech: organizations.filter(org => org.type === 'civic_tech').length,
        advocacy: organizations.filter(org => org.type === 'advocacy').length
      },
      focusAreaCounts: {
        'civic_tech': 2,
        'civic_engagement': 1,
        'social_services': 1
      }
    };
  }

  getFocusAreaOptions(): string[] {
    return this.focusAreas;
  }

  getOrganizationTypes(): string[] {
    return ['government', 'nonprofit', 'civic_tech', 'advocacy'];
  }
}

export const communityOrganizationsService = new CommunityOrganizationsService();
export default communityOrganizationsService;