import { sql } from '@vercel/postgres';

export interface WeatherEvent {
  id?: number;
  city: string;
  eventDate: Date;
  tempHigh?: number;
  tempLow?: number;
  precipitation?: number;
  freezeThawCycle: boolean;
  freezeThawCount: number;
  potholeReportsNext14Days: number;
  correlationCalculated: boolean;
  createdAt: Date;
}

export interface WeatherCorrelation {
  city: string;
  correlationStrength: number; // 0-1 scale
  freezeThawImpact: number; // Average increase in reports after freeze-thaw
  precipitationImpact: number; // Correlation with precipitation
  temperatureThreshold: number; // Temp at which freeze-thaw becomes significant
  seasonalPatterns: {
    spring: number; // Average reports per day
    summer: number;
    fall: number;
    winter: number;
  };
  lastAnalyzed: Date;
}

export interface PotholePrediction {
  id?: string;
  locationLat: number;
  locationLng: number;
  address: string;
  probabilityScore: number; // 0-100
  predictedTimeframe: string;
  riskFactors: {
    recentFreezeThaw: boolean;
    highPrecipitation: boolean;
    historicalHotspot: boolean;
    roadAge: number;
    trafficVolume: 'low' | 'medium' | 'high';
  };
  preventiveActions: string[];
  modelVersion: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface WeatherAlert {
  id?: string;
  city: string;
  alertType: 'freeze_thaw_warning' | 'heavy_precipitation' | 'temperature_fluctuation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  expectedPotholeIncrease: number; // Percentage increase expected
  affectedAreas: string[];
  validUntil: Date;
  recommendedActions: string[];
  createdAt: Date;
}

export interface FreezeThawCycle {
  date: Date;
  city: string;
  morningTemp: number;
  afternoonTemp: number;
  crossedFreezing: boolean;
  precipitationLast24h: number;
  riskLevel: 'low' | 'medium' | 'high';
}

class WeatherCorrelationService {
  private readonly openWeatherApiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly historyUrl = 'https://history.openweathermap.org/data/2.5/history/city';

  constructor() {
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY || '';
  }

  async fetchWeatherData(city: string, startDate?: Date, endDate?: Date): Promise<WeatherEvent[]> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate || new Date();

    try {
      if (this.openWeatherApiKey && this.openWeatherApiKey !== 'YOUR_OPENWEATHER_API_KEY_HERE') {
        return this.fetchFromOpenWeatherAPI(city, start, end);
      } else {
        console.warn('OpenWeather API key not configured. Using mock weather data.');
        return this.generateMockWeatherData(city, start, end);
      }
    } catch (error) {
      console.error(`Error fetching weather data for ${city}:`, error);
      return this.getStoredWeatherData(city, start, end);
    }
  }

  private async fetchFromOpenWeatherAPI(city: string, startDate: Date, endDate: Date): Promise<WeatherEvent[]> {
    const weatherEvents: WeatherEvent[] = [];
    const cityCoords = this.getCityCoordinates(city);

    if (!cityCoords) {
      throw new Error(`Unknown city: ${city}`);
    }

    try {
      // Fetch current weather for recent data
      const currentUrl = `${this.baseUrl}/weather?lat=${cityCoords.lat}&lon=${cityCoords.lon}&appid=${this.openWeatherApiKey}&units=imperial`;
      const currentResponse = await fetch(currentUrl);

      if (!currentResponse.ok) {
        throw new Error(`OpenWeather API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();

      // Fetch 5-day forecast for future predictions
      const forecastUrl = `${this.baseUrl}/forecast?lat=${cityCoords.lat}&lon=${cityCoords.lon}&appid=${this.openWeatherApiKey}&units=imperial`;
      const forecastResponse = await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        throw new Error(`OpenWeather forecast API error: ${forecastResponse.status}`);
      }

      const forecastData = await forecastResponse.json();

      // Process current weather
      const currentEvent = this.processCurrentWeather(currentData, city);
      if (currentEvent) {
        weatherEvents.push(currentEvent);
      }

      // Process forecast data
      const forecastEvents = this.processForecastData(forecastData, city);
      weatherEvents.push(...forecastEvents);

      // Store in database
      await this.storeWeatherEvents(weatherEvents);

      return weatherEvents;

    } catch (error) {
      console.error('Error fetching from OpenWeather API:', error);
      return this.generateMockWeatherData(city, startDate, endDate);
    }
  }

  private processCurrentWeather(data: any, city: string): WeatherEvent | null {
    try {
      const tempHigh = data.main.temp_max;
      const tempLow = data.main.temp_min;
      const precipitation = (data.rain?.['1h'] || 0) + (data.snow?.['1h'] || 0);

      const freezeThawCycle = this.detectFreezeThawCycle(tempHigh, tempLow);
      
      return {
        city,
        eventDate: new Date(),
        tempHigh,
        tempLow,
        precipitation,
        freezeThawCycle: freezeThawCycle.detected,
        freezeThawCount: freezeThawCycle.count,
        potholeReportsNext14Days: 0, // Will be calculated later
        correlationCalculated: false,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error processing current weather:', error);
      return null;
    }
  }

  private processForecastData(data: any, city: string): WeatherEvent[] {
    const events: WeatherEvent[] = [];

    try {
      data.list.forEach((item: any) => {
        const eventDate = new Date(item.dt * 1000);
        const tempHigh = item.main.temp_max;
        const tempLow = item.main.temp_min;
        const precipitation = (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0);

        const freezeThawCycle = this.detectFreezeThawCycle(tempHigh, tempLow);

        events.push({
          city,
          eventDate,
          tempHigh,
          tempLow,
          precipitation,
          freezeThawCycle: freezeThawCycle.detected,
          freezeThawCount: freezeThawCycle.count,
          potholeReportsNext14Days: 0,
          correlationCalculated: false,
          createdAt: new Date()
        });
      });
    } catch (error) {
      console.error('Error processing forecast data:', error);
    }

    return events;
  }

  private detectFreezeThawCycle(tempHigh: number, tempLow: number): { detected: boolean; count: number } {
    const freezing = 32; // Fahrenheit
    
    // Check if temperature crosses freezing point
    const crossesFreezing = tempLow < freezing && tempHigh > freezing;
    
    // Count significant temperature swings around freezing
    let count = 0;
    if (crossesFreezing) {
      count = Math.floor((tempHigh - tempLow) / 10); // Rough estimate
      count = Math.max(1, Math.min(count, 3)); // Cap between 1-3
    }

    return {
      detected: crossesFreezing,
      count
    };
  }

  private generateMockWeatherData(city: string, startDate: Date, endDate: Date): WeatherEvent[] {
    const events: WeatherEvent[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Simulate seasonal temperature patterns
      const month = currentDate.getMonth();
      let baseTempHigh: number;
      let baseTempLow: number;

      if (month >= 11 || month <= 2) { // Winter
        baseTempHigh = 35 + Math.random() * 20; // 35-55°F
        baseTempLow = 15 + Math.random() * 20; // 15-35°F
      } else if (month >= 3 && month <= 5) { // Spring
        baseTempHigh = 55 + Math.random() * 25; // 55-80°F
        baseTempLow = 35 + Math.random() * 25; // 35-60°F
      } else if (month >= 6 && month <= 8) { // Summer
        baseTempHigh = 75 + Math.random() * 20; // 75-95°F
        baseTempLow = 55 + Math.random() * 20; // 55-75°F
      } else { // Fall
        baseTempHigh = 50 + Math.random() * 30; // 50-80°F
        baseTempLow = 30 + Math.random() * 30; // 30-60°F
      }

      const precipitation = Math.random() < 0.3 ? Math.random() * 2 : 0; // 30% chance of rain
      const freezeThawCycle = this.detectFreezeThawCycle(baseTempHigh, baseTempLow);

      events.push({
        city,
        eventDate: new Date(currentDate),
        tempHigh: baseTempHigh,
        tempLow: baseTempLow,
        precipitation,
        freezeThawCycle: freezeThawCycle.detected,
        freezeThawCount: freezeThawCycle.count,
        potholeReportsNext14Days: 0,
        correlationCalculated: false,
        createdAt: new Date()
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  }

  private async storeWeatherEvents(events: WeatherEvent[]): Promise<void> {
    try {
      for (const event of events) {
        try {
          await sql`
            INSERT INTO weather_events (
              city, event_date, temp_high, temp_low, precipitation,
              freeze_thaw_cycle, freeze_thaw_count, pothole_reports_next_14_days,
              correlation_calculated
            ) VALUES (
              ${event.city}, ${event.eventDate.toISOString().split('T')[0]},
              ${event.tempHigh}, ${event.tempLow}, ${event.precipitation},
              ${event.freezeThawCycle}, ${event.freezeThawCount},
              ${event.potholeReportsNext14Days}, ${event.correlationCalculated}
            )
          `;
        } catch (error) {
          // If duplicate, update existing record
          await sql`
            UPDATE weather_events SET
              temp_high = ${event.tempHigh},
              temp_low = ${event.tempLow},
              precipitation = ${event.precipitation},
              freeze_thaw_cycle = ${event.freezeThawCycle},
              freeze_thaw_count = ${event.freezeThawCount}
            WHERE city = ${event.city} 
            AND event_date = ${event.eventDate.toISOString().split('T')[0]}
          `;
        }
      }
    } catch (error) {
      console.error('Error storing weather events:', error);
    }
  }

  private async getStoredWeatherData(city: string, startDate: Date, endDate: Date): Promise<WeatherEvent[]> {
    try {
      const result = await sql`
        SELECT * FROM weather_events
        WHERE city = ${city}
        AND event_date >= ${startDate.toISOString().split('T')[0]}
        AND event_date <= ${endDate.toISOString().split('T')[0]}
        ORDER BY event_date DESC
      `;

      return result.rows.map(row => ({
        id: row.id,
        city: row.city,
        eventDate: new Date(row.event_date),
        tempHigh: row.temp_high ? parseFloat(row.temp_high) : undefined,
        tempLow: row.temp_low ? parseFloat(row.temp_low) : undefined,
        precipitation: row.precipitation ? parseFloat(row.precipitation) : undefined,
        freezeThawCycle: row.freeze_thaw_cycle,
        freezeThawCount: row.freeze_thaw_count,
        potholeReportsNext14Days: row.pothole_reports_next_14_days,
        correlationCalculated: row.correlation_calculated,
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error fetching stored weather data:', error);
      return [];
    }
  }

  async calculateWeatherCorrelation(city: string): Promise<WeatherCorrelation> {
    try {
      // Get weather data for analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1); // 1 year of data

      const weatherEvents = await this.getStoredWeatherData(city, startDate, endDate);
      
      // Get pothole report data for correlation
      const potholeData = await this.getPotholeReportData(city, startDate, endDate);

      // Calculate correlations
      const freezeThawCorrelation = this.calculateFreezeThawCorrelation(weatherEvents, potholeData);
      const precipitationCorrelation = this.calculatePrecipitationCorrelation(weatherEvents, potholeData);
      const seasonalPatterns = this.calculateSeasonalPatterns(potholeData);

      const correlation: WeatherCorrelation = {
        city,
        correlationStrength: (freezeThawCorrelation.strength + precipitationCorrelation.strength) / 2,
        freezeThawImpact: freezeThawCorrelation.impact,
        precipitationImpact: precipitationCorrelation.impact,
        temperatureThreshold: 32, // Freezing point
        seasonalPatterns,
        lastAnalyzed: new Date()
      };

      return correlation;

    } catch (error) {
      console.error('Error calculating weather correlation:', error);
      return this.getDefaultCorrelation(city);
    }
  }

  private async getPotholeReportData(city: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const result = await sql`
        SELECT DATE(created_at) as report_date, COUNT(*) as report_count
        FROM pothole_reports
        WHERE LOWER(city) = LOWER(${city})
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
        GROUP BY DATE(created_at)
        ORDER BY report_date
      `;

      return result.rows;
    } catch (error) {
      console.error('Error fetching pothole report data:', error);
      return [];
    }
  }

  private calculateFreezeThawCorrelation(weatherEvents: WeatherEvent[], potholeData: any[]): { strength: number; impact: number } {
    let totalCorrelationDays = 0;
    let positiveCorrelationDays = 0;
    let totalImpact = 0;
    let impactDays = 0;

    weatherEvents.forEach(weather => {
      if (weather.freezeThawCycle) {
        const weatherDate = weather.eventDate.toISOString().split('T')[0];
        
        // Look for pothole reports in the next 7 days
        const futureReports = potholeData.filter(report => {
          const reportDate = new Date(report.report_date);
          const weatherEventDate = new Date(weatherDate);
          const daysDiff = (reportDate.getTime() - weatherEventDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff >= 0 && daysDiff <= 7;
        });

        if (futureReports.length > 0) {
          positiveCorrelationDays++;
          const totalReports = futureReports.reduce((sum, report) => sum + parseInt(report.report_count), 0);
          totalImpact += totalReports;
          impactDays++;
        }
        totalCorrelationDays++;
      }
    });

    const strength = totalCorrelationDays > 0 ? positiveCorrelationDays / totalCorrelationDays : 0;
    const impact = impactDays > 0 ? totalImpact / impactDays : 0;

    return { strength, impact };
  }

  private calculatePrecipitationCorrelation(weatherEvents: WeatherEvent[], potholeData: any[]): { strength: number; impact: number } {
    // Similar calculation for precipitation
    let correlationSum = 0;
    let validDays = 0;
    let totalImpact = 0;

    weatherEvents.forEach(weather => {
      if (weather.precipitation && weather.precipitation > 0.5) { // Significant precipitation
        const weatherDate = weather.eventDate.toISOString().split('T')[0];
        const matchingReport = potholeData.find(report => report.report_date === weatherDate);
        
        if (matchingReport) {
          const reportCount = parseInt(matchingReport.report_count);
          correlationSum += reportCount * weather.precipitation;
          totalImpact += reportCount;
          validDays++;
        }
      }
    });

    const strength = validDays > 0 ? Math.min(correlationSum / (validDays * 10), 1) : 0; // Normalize
    const impact = validDays > 0 ? totalImpact / validDays : 0;

    return { strength, impact };
  }

  private calculateSeasonalPatterns(potholeData: any[]): { spring: number; summer: number; fall: number; winter: number } {
    const patterns = { spring: 0, summer: 0, fall: 0, winter: 0 };
    const counts = { spring: 0, summer: 0, fall: 0, winter: 0 };

    potholeData.forEach(report => {
      const month = new Date(report.report_date).getMonth();
      const reportCount = parseInt(report.report_count);

      if (month >= 2 && month <= 4) { // Spring
        patterns.spring += reportCount;
        counts.spring++;
      } else if (month >= 5 && month <= 7) { // Summer
        patterns.summer += reportCount;
        counts.summer++;
      } else if (month >= 8 && month <= 10) { // Fall
        patterns.fall += reportCount;
        counts.fall++;
      } else { // Winter
        patterns.winter += reportCount;
        counts.winter++;
      }
    });

    return {
      spring: counts.spring > 0 ? patterns.spring / counts.spring : 0,
      summer: counts.summer > 0 ? patterns.summer / counts.summer : 0,
      fall: counts.fall > 0 ? patterns.fall / counts.fall : 0,
      winter: counts.winter > 0 ? patterns.winter / counts.winter : 0
    };
  }

  async generatePotholePredictions(city: string, limit: number = 10): Promise<PotholePrediction[]> {
    try {
      // Get recent weather patterns
      const weatherEvents = await this.fetchWeatherData(city);
      const correlation = await this.calculateWeatherCorrelation(city);

      // Get historical hotspots
      const hotspots = await this.getHistoricalHotspots(city, limit);

      const predictions: PotholePrediction[] = hotspots.map(hotspot => {
        const riskScore = this.calculateRiskScore(hotspot, weatherEvents, correlation);
        
        return {
          locationLat: hotspot.latitude,
          locationLng: hotspot.longitude,
          address: hotspot.address || `${hotspot.latitude}, ${hotspot.longitude}`,
          probabilityScore: Math.min(Math.max(riskScore, 10), 95), // 10-95% range
          predictedTimeframe: this.getPredictionTimeframe(riskScore),
          riskFactors: {
            recentFreezeThaw: weatherEvents.some(w => w.freezeThawCycle && 
              (new Date().getTime() - w.eventDate.getTime()) < (7 * 24 * 60 * 60 * 1000)),
            highPrecipitation: weatherEvents.some(w => (w.precipitation || 0) > 1.0),
            historicalHotspot: hotspot.report_count > 3,
            roadAge: Math.floor(Math.random() * 20) + 5, // Mock data
            trafficVolume: this.estimateTrafficVolume(hotspot.latitude, hotspot.longitude)
          },
          preventiveActions: this.getPreventiveActions(riskScore),
          modelVersion: 'v1.0',
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          createdAt: new Date()
        };
      });

      // Store predictions
      await this.storePredictions(predictions);

      return predictions;

    } catch (error) {
      console.error('Error generating pothole predictions:', error);
      return [];
    }
  }

  private async getHistoricalHotspots(city: string, limit: number): Promise<any[]> {
    try {
      const result = await sql`
        SELECT latitude, longitude, address, COUNT(*) as report_count
        FROM pothole_reports
        WHERE LOWER(city) = LOWER(${city})
        AND created_at >= NOW() - INTERVAL '1 year'
        GROUP BY latitude, longitude, address
        HAVING COUNT(*) >= 2
        ORDER BY COUNT(*) DESC
        LIMIT ${limit}
      `;

      return result.rows;
    } catch (error) {
      console.error('Error fetching historical hotspots:', error);
      return [];
    }
  }

  private calculateRiskScore(hotspot: any, weatherEvents: WeatherEvent[], correlation: WeatherCorrelation): number {
    let score = 30; // Base score

    // Historical frequency factor
    score += Math.min(hotspot.report_count * 10, 30);

    // Recent freeze-thaw events
    const recentFreezeThaw = weatherEvents.filter(w => 
      w.freezeThawCycle && (new Date().getTime() - w.eventDate.getTime()) < (14 * 24 * 60 * 60 * 1000)
    ).length;
    score += recentFreezeThaw * 15;

    // Precipitation factor
    const recentPrecipitation = weatherEvents.filter(w => 
      (w.precipitation || 0) > 0.5 && (new Date().getTime() - w.eventDate.getTime()) < (7 * 24 * 60 * 60 * 1000)
    ).length;
    score += recentPrecipitation * 8;

    // Correlation strength factor
    score += correlation.correlationStrength * 20;

    return score;
  }

  private getPredictionTimeframe(riskScore: number): string {
    if (riskScore >= 80) return 'Next 1-2 weeks';
    if (riskScore >= 60) return 'Next 2-4 weeks';
    if (riskScore >= 40) return 'Next 1-2 months';
    return 'Next 2-3 months';
  }

  private estimateTrafficVolume(lat: number, lng: number): 'low' | 'medium' | 'high' {
    // Mock traffic estimation based on location
    const random = Math.random();
    if (random < 0.3) return 'low';
    if (random < 0.7) return 'medium';
    return 'high';
  }

  private getPreventiveActions(riskScore: number): string[] {
    const actions = ['Regular pavement inspection'];
    
    if (riskScore >= 70) {
      actions.push('Emergency pothole repair materials ready');
      actions.push('Increase inspection frequency to weekly');
    }
    if (riskScore >= 50) {
      actions.push('Apply preventive sealant');
      actions.push('Monitor after weather events');
    }
    if (riskScore >= 30) {
      actions.push('Schedule routine maintenance');
    }

    return actions;
  }

  private async storePredictions(predictions: PotholePrediction[]): Promise<void> {
    try {
      for (const prediction of predictions) {
        await sql`
          INSERT INTO pothole_predictions (
            location_lat, location_lng, address, probability_score,
            predicted_timeframe, risk_factors, preventive_actions,
            model_version, is_active, expires_at
          ) VALUES (
            ${prediction.locationLat}, ${prediction.locationLng}, ${prediction.address},
            ${prediction.probabilityScore}, ${prediction.predictedTimeframe},
            ${JSON.stringify(prediction.riskFactors)}, ${JSON.stringify(prediction.preventiveActions)},
            ${prediction.modelVersion}, ${prediction.isActive}, ${prediction.expiresAt.toISOString()}
          )
          ON CONFLICT (location_lat, location_lng) 
          DO UPDATE SET
            probability_score = EXCLUDED.probability_score,
            predicted_timeframe = EXCLUDED.predicted_timeframe,
            risk_factors = EXCLUDED.risk_factors,
            preventive_actions = EXCLUDED.preventive_actions,
            expires_at = EXCLUDED.expires_at
        `;
      }
    } catch (error) {
      console.error('Error storing predictions:', error);
    }
  }

  async generateWeatherAlerts(city: string): Promise<WeatherAlert[]> {
    const alerts: WeatherAlert[] = [];

    try {
      const weatherEvents = await this.fetchWeatherData(city);
      const correlation = await this.calculateWeatherCorrelation(city);

      // Check for upcoming freeze-thaw cycles
      const upcomingFreezeThaw = weatherEvents.filter(w => 
        w.freezeThawCycle && w.eventDate > new Date()
      );

      if (upcomingFreezeThaw.length > 0) {
        alerts.push({
          city,
          alertType: 'freeze_thaw_warning',
          severity: upcomingFreezeThaw.length > 2 ? 'high' : 'medium',
          message: `${upcomingFreezeThaw.length} freeze-thaw cycle(s) expected in the next 5 days. Increased pothole formation likely.`,
          expectedPotholeIncrease: correlation.freezeThawImpact * upcomingFreezeThaw.length * 100,
          affectedAreas: ['City-wide'],
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          recommendedActions: [
            'Prepare emergency repair crews',
            'Stock additional pothole repair materials',
            'Increase citizen reporting awareness campaigns'
          ],
          createdAt: new Date()
        });
      }

      // Check for heavy precipitation
      const heavyPrecipitation = weatherEvents.filter(w => 
        (w.precipitation || 0) > 1.5 && w.eventDate > new Date()
      );

      if (heavyPrecipitation.length > 0) {
        alerts.push({
          city,
          alertType: 'heavy_precipitation',
          severity: heavyPrecipitation.some(w => (w.precipitation || 0) > 3) ? 'high' : 'medium',
          message: `Heavy precipitation expected. Monitor for accelerated road deterioration.`,
          expectedPotholeIncrease: correlation.precipitationImpact * 50,
          affectedAreas: ['City-wide'],
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          recommendedActions: [
            'Inspect drainage systems',
            'Monitor low-lying areas',
            'Prepare rapid response teams'
          ],
          createdAt: new Date()
        });
      }

      return alerts;

    } catch (error) {
      console.error('Error generating weather alerts:', error);
      return [];
    }
  }

  private getCityCoordinates(city: string): { lat: number; lon: number } | null {
    const cityCoords: { [key: string]: { lat: number; lon: number } } = {
      'chicago': { lat: 41.8781, lon: -87.6298 },
      'new york': { lat: 40.7589, lon: -73.9851 },
      'nyc': { lat: 40.7589, lon: -73.9851 }
    };

    return cityCoords[city.toLowerCase()] || null;
  }

  private getDefaultCorrelation(city: string): WeatherCorrelation {
    return {
      city,
      correlationStrength: 0.65,
      freezeThawImpact: 12.5,
      precipitationImpact: 8.2,
      temperatureThreshold: 32,
      seasonalPatterns: {
        spring: 15.2,
        summer: 6.1,
        fall: 9.8,
        winter: 18.7
      },
      lastAnalyzed: new Date()
    };
  }

  async getFreezeThawCycles(city: string, days: number = 7): Promise<FreezeThawCycle[]> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const weatherEvents = await this.fetchWeatherData(city, startDate, endDate);
      
      return weatherEvents
        .filter(event => event.freezeThawCycle)
        .map(event => ({
          date: event.eventDate,
          city: event.city,
          morningTemp: event.tempLow || 0,
          afternoonTemp: event.tempHigh || 0,
          crossedFreezing: event.freezeThawCycle,
          precipitationLast24h: event.precipitation || 0,
          riskLevel: this.calculateFreezeThawRisk(event)
        }));

    } catch (error) {
      console.error('Error getting freeze-thaw cycles:', error);
      return [];
    }
  }

  private calculateFreezeThawRisk(event: WeatherEvent): 'low' | 'medium' | 'high' {
    const tempSwing = (event.tempHigh || 0) - (event.tempLow || 0);
    const precipitation = event.precipitation || 0;

    if (tempSwing > 30 && precipitation > 0.5) return 'high';
    if (tempSwing > 20 || precipitation > 1.0) return 'medium';
    return 'low';
  }
}

export const weatherCorrelationService = new WeatherCorrelationService();
export default weatherCorrelationService;