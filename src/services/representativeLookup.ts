import { sql } from '@vercel/postgres';

export interface Representative {
  name: string;
  office: string;
  level: 'federal' | 'state' | 'local';
  party?: string;
  phones?: string[];
  emails?: string[];
  urls?: string[];
  photoUrl?: string;
  address?: string;
  channels?: Array<{
    type: string;
    id: string;
  }>;
}

export interface ContactMethod {
  type: 'email' | 'phone' | 'mail' | 'social';
  value: string;
  label: string;
}

export interface RepresentativeWithContacts extends Representative {
  contactMethods: ContactMethod[];
  messageTemplate: string;
}

export interface ChicagoWardInfo {
  wardNumber: string;
  aldermanName: string;
  aldermanEmail?: string;
  aldermanPhone?: string;
  officeAddress?: string;
}

export interface NYCDistrictInfo {
  councilDistrict: string;
  councilMemberName: string;
  councilMemberEmail?: string;
  councilMemberPhone?: string;
  officeAddress?: string;
}

class RepresentativeLookupService {
  private readonly googleCivicApiKey: string;
  private readonly baseUrl = 'https://www.googleapis.com/civicinfo/v2';

  constructor() {
    this.googleCivicApiKey = process.env.GOOGLE_CIVIC_API_KEY || '';
    if (!this.googleCivicApiKey || this.googleCivicApiKey === 'YOUR_GOOGLE_CIVIC_API_KEY_HERE') {
      console.warn('Google Civic API key not configured. Representative lookup will use fallback data.');
    }
  }

  async findRepresentatives(latitude: number, longitude: number): Promise<RepresentativeWithContacts[]> {
    try {
      // Try Google Civic API first
      if (this.googleCivicApiKey && this.googleCivicApiKey !== 'YOUR_GOOGLE_CIVIC_API_KEY_HERE') {
        const civicReps = await this.fetchFromGoogleCivic(latitude, longitude);
        if (civicReps.length > 0) {
          return civicReps;
        }
      }

      // Fallback to city-specific lookups
      const cityReps = await this.fallbackCityLookup(latitude, longitude);
      return cityReps;
    } catch (error) {
      console.error('Error finding representatives:', error);
      return this.getEmergencyContacts(latitude, longitude);
    }
  }

  private async fetchFromGoogleCivic(latitude: number, longitude: number): Promise<RepresentativeWithContacts[]> {
    const address = `${latitude},${longitude}`;
    const url = `${this.baseUrl}/representatives?address=${encodeURIComponent(address)}&key=${this.googleCivicApiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Civic API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseGoogleCivicResponse(data);
  }

  private parseGoogleCivicResponse(data: any): RepresentativeWithContacts[] {
    const representatives: RepresentativeWithContacts[] = [];
    
    if (!data.offices || !data.officials) {
      return representatives;
    }

    for (const office of data.offices) {
      if (office.officialIndices) {
        for (const index of office.officialIndices) {
          const official = data.officials[index];
          if (official) {
            const rep = this.createRepresentativeFromOfficial(official, office);
            representatives.push(rep);
          }
        }
      }
    }

    return representatives.filter(rep => 
      rep.level === 'local' || 
      (rep.level === 'state' && rep.office.toLowerCase().includes('legislat')) ||
      (rep.level === 'federal' && (rep.office.toLowerCase().includes('house') || rep.office.toLowerCase().includes('senate')))
    );
  }

  private createRepresentativeFromOfficial(official: any, office: any): RepresentativeWithContacts {
    const level = this.determineLevel(office.name);
    
    const representative: Representative = {
      name: official.name,
      office: office.name,
      level,
      party: official.party,
      phones: official.phones,
      emails: official.emails,
      urls: official.urls,
      photoUrl: official.photoUrl,
      address: official.address?.[0]?.line1
    };

    const contactMethods = this.generateContactMethods(representative);
    const messageTemplate = this.generateMessageTemplate(representative);

    return {
      ...representative,
      contactMethods,
      messageTemplate
    };
  }

  private determineLevel(officeName: string): 'federal' | 'state' | 'local' {
    const name = officeName.toLowerCase();
    
    if (name.includes('president') || name.includes('senate') || name.includes('house of representatives')) {
      return 'federal';
    }
    
    if (name.includes('governor') || name.includes('state') || name.includes('assembly') || name.includes('legislature')) {
      return 'state';
    }
    
    return 'local';
  }

  private generateContactMethods(rep: Representative): ContactMethod[] {
    const methods: ContactMethod[] = [];

    // Email contacts
    if (rep.emails) {
      rep.emails.forEach((email, index) => {
        methods.push({
          type: 'email',
          value: email,
          label: index === 0 ? 'Primary Email' : `Email ${index + 1}`
        });
      });
    }

    // Phone contacts
    if (rep.phones) {
      rep.phones.forEach((phone, index) => {
        methods.push({
          type: 'phone',
          value: phone,
          label: index === 0 ? 'Office Phone' : `Phone ${index + 1}`
        });
      });
    }

    // Mail contact
    if (rep.address) {
      methods.push({
        type: 'mail',
        value: rep.address,
        label: 'Mailing Address'
      });
    }

    // Social media (if available)
    if (rep.channels) {
      rep.channels.forEach(channel => {
        if (channel.type === 'Twitter' || channel.type === 'Facebook') {
          methods.push({
            type: 'social',
            value: channel.id,
            label: channel.type
          });
        }
      });
    }

    return methods;
  }

  private generateMessageTemplate(rep: Representative): string {
    const title = this.getTitle(rep.name, rep.office);
    
    return `Dear ${title},

I am writing to bring to your attention a pothole issue in our community that requires immediate attention. This infrastructure problem poses a safety risk to residents and visitors in your district.

Location Details:
[Location will be automatically filled]

Issue Description:
[Issue details will be automatically filled]

As a constituent, I respectfully request that you:
1. Prioritize this repair in the city's maintenance schedule
2. Provide a timeline for resolution
3. Consider increased funding for preventive road maintenance

This issue affects the daily lives of your constituents and reflects on our community's infrastructure standards. Your prompt attention to this matter would be greatly appreciated.

Thank you for your service and consideration.

Sincerely,
[Your name will be automatically filled]
[Your address will be automatically filled]`;
  }

  private getTitle(name: string, office: string): string {
    const officeLower = office.toLowerCase();
    
    if (officeLower.includes('mayor')) return `Mayor ${name.split(' ').pop()}`;
    if (officeLower.includes('governor')) return `Governor ${name.split(' ').pop()}`;
    if (officeLower.includes('senator')) return `Senator ${name.split(' ').pop()}`;
    if (officeLower.includes('representative') || officeLower.includes('congressman') || officeLower.includes('congresswoman')) {
      return `Representative ${name.split(' ').pop()}`;
    }
    if (officeLower.includes('alderman') || officeLower.includes('alderwoman')) {
      return `Alderman ${name.split(' ').pop()}`;
    }
    if (officeLower.includes('council')) return `Council Member ${name.split(' ').pop()}`;
    
    return `${name}`;
  }

  private async fallbackCityLookup(latitude: number, longitude: number): Promise<RepresentativeWithContacts[]> {
    // Determine city from coordinates
    const city = await this.getCityFromCoordinates(latitude, longitude);
    
    if (city === 'Chicago') {
      return this.getChicagoRepresentatives(latitude, longitude);
    } else if (city === 'New York') {
      return this.getNYCRepresentatives(latitude, longitude);
    }
    
    return this.getGenericRepresentatives(city);
  }

  private async getCityFromCoordinates(latitude: number, longitude: number): Promise<string> {
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

  private async getChicagoRepresentatives(latitude: number, longitude: number): Promise<RepresentativeWithContacts[]> {
    const wardInfo = await this.getChicagoWard(latitude, longitude);
    const reps: RepresentativeWithContacts[] = [];

    // Add alderman
    if (wardInfo) {
      reps.push({
        name: wardInfo.aldermanName,
        office: `Alderman, Ward ${wardInfo.wardNumber}`,
        level: 'local',
        contactMethods: [
          ...(wardInfo.aldermanEmail ? [{
            type: 'email' as const,
            value: wardInfo.aldermanEmail,
            label: 'Official Email'
          }] : []),
          ...(wardInfo.aldermanPhone ? [{
            type: 'phone' as const,
            value: wardInfo.aldermanPhone,
            label: 'Office Phone'
          }] : []),
          ...(wardInfo.officeAddress ? [{
            type: 'mail' as const,
            value: wardInfo.officeAddress,
            label: 'Office Address'
          }] : [])
        ],
        messageTemplate: this.generateMessageTemplate({
          name: wardInfo.aldermanName,
          office: `Alderman, Ward ${wardInfo.wardNumber}`,
          level: 'local'
        })
      });
    }

    // Add Mayor
    reps.push({
      name: 'Brandon Johnson',
      office: 'Mayor of Chicago',
      level: 'local',
      contactMethods: [
        { type: 'phone', value: '312-744-3300', label: 'Mayor\'s Office' },
        { type: 'email', value: 'mayor@cityofchicago.org', label: 'Official Email' },
        { type: 'mail', value: 'Office of the Mayor, City Hall, 121 N. LaSalle St., Room 507, Chicago, IL 60602', label: 'City Hall' }
      ],
      messageTemplate: this.generateMessageTemplate({
        name: 'Brandon Johnson',
        office: 'Mayor of Chicago',
        level: 'local'
      })
    });

    // Add 311 as backup
    reps.push({
      name: 'Chicago 311',
      office: 'City Services Request Line',
      level: 'local',
      contactMethods: [
        { type: 'phone', value: '311', label: '311 Service Line' },
        { type: 'email', value: '311@cityofchicago.org', label: '311 Email' }
      ],
      messageTemplate: 'Please report this pothole through the 311 system for tracking and resolution.'
    });

    return reps;
  }

  private async getChicagoWard(latitude: number, longitude: number): Promise<ChicagoWardInfo | null> {
    try {
      // This would normally call Chicago's ward lookup API
      // For now, return sample data based on coordinates
      const wardNumber = Math.floor(Math.random() * 50) + 1;
      return {
        wardNumber: wardNumber.toString(),
        aldermanName: `Ward ${wardNumber} Alderman`,
        aldermanEmail: `ward${wardNumber}@cityofchicago.org`,
        aldermanPhone: '312-744-3000'
      };
    } catch (error) {
      console.error('Error fetching Chicago ward info:', error);
      return null;
    }
  }

  private async getNYCRepresentatives(latitude: number, longitude: number): Promise<RepresentativeWithContacts[]> {
    const reps: RepresentativeWithContacts[] = [];

    // Add Mayor
    reps.push({
      name: 'Eric Adams',
      office: 'Mayor of New York City',
      level: 'local',
      contactMethods: [
        { type: 'phone', value: '212-639-9675', label: 'Mayor\'s Office' },
        { type: 'mail', value: 'Office of the Mayor, City Hall, New York, NY 10007', label: 'City Hall' }
      ],
      messageTemplate: this.generateMessageTemplate({
        name: 'Eric Adams',
        office: 'Mayor of New York City',
        level: 'local'
      })
    });

    // Add 311 as backup
    reps.push({
      name: 'NYC 311',
      office: 'City Services Request Line',
      level: 'local',
      contactMethods: [
        { type: 'phone', value: '311', label: '311 Service Line' }
      ],
      messageTemplate: 'Please report this pothole through the 311 system for tracking and resolution.'
    });

    return reps;
  }

  private getGenericRepresentatives(city: string): RepresentativeWithContacts[] {
    return [{
      name: 'Local Representative',
      office: `${city} City Council`,
      level: 'local',
      contactMethods: [
        { type: 'phone', value: '311', label: 'City Services' }
      ],
      messageTemplate: 'Please contact your local city services to report this infrastructure issue.'
    }];
  }

  private getEmergencyContacts(latitude: number, longitude: number): RepresentativeWithContacts[] {
    return [{
      name: 'Local City Services',
      office: 'City Services Emergency Contact',
      level: 'local',
      contactMethods: [
        { type: 'phone', value: '311', label: 'City Services Line' }
      ],
      messageTemplate: 'Please report this infrastructure emergency through your city\'s service request system.'
    }];
  }

  async saveContactRecord(
    potholeReportId: string,
    representative: RepresentativeWithContacts,
    contactType: string,
    userId?: number,
    messageTemplate?: string
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO representative_contacts (
          pothole_report_id,
          representative_name,
          representative_office,
          representative_level,
          contact_type,
          user_id,
          message_template_used
        ) VALUES (
          ${potholeReportId},
          ${representative.name},
          ${representative.office},
          ${representative.level},
          ${contactType},
          ${userId || null},
          ${messageTemplate || representative.messageTemplate}
        )
      `;
    } catch (error) {
      console.error('Error saving contact record:', error);
      throw error;
    }
  }

  async getContactHistory(potholeReportId: string): Promise<any[]> {
    try {
      const result = await sql`
        SELECT * FROM representative_contacts
        WHERE pothole_report_id = ${potholeReportId}
        ORDER BY contact_date DESC
      `;
      return result.rows;
    } catch (error) {
      console.error('Error fetching contact history:', error);
      return [];
    }
  }
}

export const representativeLookupService = new RepresentativeLookupService();
export default representativeLookupService;