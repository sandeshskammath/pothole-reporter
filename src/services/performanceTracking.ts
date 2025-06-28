import { sql } from '@vercel/postgres';

export interface PerformanceMetric {
  id?: number;
  city: string;
  wardDistrict: string;
  metricType: string;
  metricValue: number;
  targetValue?: number;
  metricDate: Date;
  comparisonPeriod: 'month' | 'quarter' | 'year';
  trend: 'improving' | 'declining' | 'stable';
  createdAt: Date;
}

export interface PerformanceReport {
  city: string;
  wardDistrict: string;
  period: string;
  metrics: {
    avgRepairTime: {
      actual: number;
      target: number;
      trend: string;
      status: 'on-track' | 'behind' | 'ahead';
    };
    completionRate: {
      actual: number;
      target: number;
      trend: string;
      status: 'on-track' | 'behind' | 'ahead';
    };
    costPerRepair: {
      actual: number;
      target: number;
      trend: string;
      status: 'on-track' | 'behind' | 'ahead';
    };
    citizenSatisfaction: {
      actual: number;
      target: number;
      trend: string;
      status: 'on-track' | 'behind' | 'ahead';
    };
  };
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  lastUpdated: Date;
}

export interface AccountabilityAlert {
  id?: string;
  city: string;
  wardDistrict: string;
  metricType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  targetMissedBy: number;
  daysOverdue: number;
  suggestedActions: string[];
  createdAt: Date;
}

export interface SeasonalPattern {
  city: string;
  metric: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  averageValue: number;
  expectedVariation: number;
  historicalTrend: 'improving' | 'declining' | 'stable';
}

class PerformanceTrackingService {
  private readonly chicagoApiBase = 'https://data.cityofchicago.org/resource';
  private readonly nycApiBase = 'https://data.cityofnewyork.us/resource';
  private readonly nycAppToken: string;

  constructor() {
    this.nycAppToken = process.env.NYC_OPEN_DATA_APP_TOKEN || '';
  }

  async fetchCityPerformanceData(city: string, startDate?: Date, endDate?: Date): Promise<PerformanceMetric[]> {
    const start = startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    const end = endDate || new Date();

    try {
      if (city.toLowerCase() === 'chicago') {
        return this.fetchChicagoPerformanceData(start, end);
      } else if (city.toLowerCase() === 'new york' || city.toLowerCase() === 'nyc') {
        return this.fetchNYCPerformanceData(start, end);
      } else {
        return this.generateMockPerformanceData(city, start, end);
      }
    } catch (error) {
      console.error(`Error fetching performance data for ${city}:`, error);
      return this.getStoredPerformanceData(city, start, end);
    }
  }

  private async fetchChicagoPerformanceData(startDate: Date, endDate: Date): Promise<PerformanceMetric[]> {
    try {
      // Chicago 311 Service Requests API
      const serviceRequestsUrl = `${this.chicagoApiBase}/v6vf-nfxy.json`;
      const startIso = startDate.toISOString().split('T')[0];
      const endIso = endDate.toISOString().split('T')[0];
      
      const query = `$where=created_date >= '${startIso}' AND created_date <= '${endIso}' AND sr_type = 'Pothole in Street'&$limit=5000`;
      const response = await fetch(`${serviceRequestsUrl}?${query}`);

      if (!response.ok) {
        throw new Error(`Chicago API error: ${response.status}`);
      }

      const data = await response.json();
      const metrics = this.calculateChicagoMetrics(data);
      
      // Store in database
      await this.storePerformanceMetrics(metrics);
      
      return metrics;
    } catch (error) {
      console.error('Error fetching Chicago performance data:', error);
      return this.getStoredPerformanceData('Chicago', startDate, endDate);
    }
  }

  private async fetchNYCPerformanceData(startDate: Date, endDate: Date): Promise<PerformanceMetric[]> {
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (this.nycAppToken && this.nycAppToken !== 'YOUR_NYC_OPEN_DATA_TOKEN_HERE') {
        headers['X-App-Token'] = this.nycAppToken;
      }

      // NYC 311 Service Requests API
      const serviceRequestsUrl = `${this.nycApiBase}/erm2-nwe9.json`;
      const startIso = startDate.toISOString().split('T')[0];
      const endIso = endDate.toISOString().split('T')[0];
      
      const query = `$where=created_date >= '${startIso}' AND created_date <= '${endIso}' AND complaint_type = 'Street Condition'&$limit=5000`;
      const response = await fetch(`${serviceRequestsUrl}?${query}`, { headers });

      if (!response.ok) {
        throw new Error(`NYC API error: ${response.status}`);
      }

      const data = await response.json();
      const metrics = this.calculateNYCMetrics(data);
      
      await this.storePerformanceMetrics(metrics);
      
      return metrics;
    } catch (error) {
      console.error('Error fetching NYC performance data:', error);
      return this.getStoredPerformanceData('New York', startDate, endDate);
    }
  }

  private calculateChicagoMetrics(data: any[]): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];
    const now = new Date();

    // Group by ward for detailed analysis
    const wardGroups = this.groupByWard(data, 'ward');
    
    for (const [ward, requests] of wardGroups.entries()) {
      const completedRequests = requests.filter(r => r.status === 'Completed');
      const totalRequests = requests.length;
      
      // Calculate average repair time
      const repairTimes = completedRequests
        .filter(r => r.created_date && r.closed_date)
        .map(r => {
          const created = new Date(r.created_date);
          const closed = new Date(r.closed_date);
          return (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
        });

      const avgRepairTime = repairTimes.length > 0 
        ? repairTimes.reduce((sum, time) => sum + time, 0) / repairTimes.length 
        : 0;

      // Completion rate
      const completionRate = totalRequests > 0 ? (completedRequests.length / totalRequests) * 100 : 0;

      // Add metrics
      metrics.push({
        city: 'Chicago',
        wardDistrict: ward || 'Unknown Ward',
        metricType: 'avg_repair_time_days',
        metricValue: avgRepairTime,
        targetValue: 7.0, // 7 day target
        metricDate: now,
        comparisonPeriod: 'month',
        trend: this.calculateTrend(avgRepairTime, 7.0),
        createdAt: now
      });

      metrics.push({
        city: 'Chicago',
        wardDistrict: ward || 'Unknown Ward',
        metricType: 'completion_rate_percent',
        metricValue: completionRate,
        targetValue: 95.0, // 95% target
        metricDate: now,
        comparisonPeriod: 'month',
        trend: this.calculateTrend(completionRate, 95.0),
        createdAt: now
      });
    }

    // Add city-wide metrics
    const allCompleted = data.filter(r => r.status === 'Completed');
    const cityWideRepairTimes = allCompleted
      .filter(r => r.created_date && r.closed_date)
      .map(r => {
        const created = new Date(r.created_date);
        const closed = new Date(r.closed_date);
        return (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      });

    const cityAvgRepairTime = cityWideRepairTimes.length > 0 
      ? cityWideRepairTimes.reduce((sum, time) => sum + time, 0) / cityWideRepairTimes.length 
      : 0;

    const cityCompletionRate = data.length > 0 ? (allCompleted.length / data.length) * 100 : 0;

    metrics.push({
      city: 'Chicago',
      wardDistrict: 'All Wards',
      metricType: 'avg_repair_time_days',
      metricValue: cityAvgRepairTime,
      targetValue: 7.0,
      metricDate: now,
      comparisonPeriod: 'month',
      trend: this.calculateTrend(cityAvgRepairTime, 7.0),
      createdAt: now
    });

    metrics.push({
      city: 'Chicago',
      wardDistrict: 'All Wards',
      metricType: 'completion_rate_percent',
      metricValue: cityCompletionRate,
      targetValue: 95.0,
      metricDate: now,
      comparisonPeriod: 'month',
      trend: this.calculateTrend(cityCompletionRate, 95.0),
      createdAt: now
    });

    return metrics;
  }

  private calculateNYCMetrics(data: any[]): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];
    const now = new Date();

    // Group by borough
    const boroughGroups = this.groupByWard(data, 'borough');
    
    for (const [borough, requests] of boroughGroups.entries()) {
      const closedRequests = requests.filter(r => r.status === 'Closed');
      const totalRequests = requests.length;
      
      const repairTimes = closedRequests
        .filter(r => r.created_date && r.closed_date)
        .map(r => {
          const created = new Date(r.created_date);
          const closed = new Date(r.closed_date);
          return (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        });

      const avgRepairTime = repairTimes.length > 0 
        ? repairTimes.reduce((sum, time) => sum + time, 0) / repairTimes.length 
        : 0;

      const completionRate = totalRequests > 0 ? (closedRequests.length / totalRequests) * 100 : 0;

      metrics.push({
        city: 'New York',
        wardDistrict: borough || 'Unknown Borough',
        metricType: 'avg_repair_time_days',
        metricValue: avgRepairTime,
        targetValue: 10.0, // 10 day target for NYC
        metricDate: now,
        comparisonPeriod: 'month',
        trend: this.calculateTrend(avgRepairTime, 10.0),
        createdAt: now
      });

      metrics.push({
        city: 'New York',
        wardDistrict: borough || 'Unknown Borough',
        metricType: 'completion_rate_percent',
        metricValue: completionRate,
        targetValue: 90.0, // 90% target
        metricDate: now,
        comparisonPeriod: 'month',
        trend: this.calculateTrend(completionRate, 90.0),
        createdAt: now
      });
    }

    return metrics;
  }

  private groupByWard(data: any[], wardField: string): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    
    data.forEach(item => {
      const ward = item[wardField] || 'Unknown';
      if (!groups.has(ward)) {
        groups.set(ward, []);
      }
      groups.get(ward)!.push(item);
    });
    
    return groups;
  }

  private calculateTrend(actual: number, target: number): 'improving' | 'declining' | 'stable' {
    const variance = Math.abs(actual - target) / target;
    
    if (variance <= 0.05) return 'stable'; // Within 5% of target
    if (actual < target) return 'improving'; // Better than target
    return 'declining'; // Worse than target
  }

  private generateMockPerformanceData(city: string, startDate: Date, endDate: Date): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];
    const now = new Date();

    // Generate realistic mock data
    const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'All Wards'];
    
    wards.forEach(ward => {
      metrics.push({
        city,
        wardDistrict: ward,
        metricType: 'avg_repair_time_days',
        metricValue: 8.5 + Math.random() * 4, // 8.5-12.5 days
        targetValue: 7.0,
        metricDate: now,
        comparisonPeriod: 'month',
        trend: Math.random() > 0.5 ? 'improving' : 'stable',
        createdAt: now
      });

      metrics.push({
        city,
        wardDistrict: ward,
        metricType: 'completion_rate_percent',
        metricValue: 85 + Math.random() * 10, // 85-95%
        targetValue: 95.0,
        metricDate: now,
        comparisonPeriod: 'month',
        trend: Math.random() > 0.3 ? 'improving' : 'stable',
        createdAt: now
      });
    });

    return metrics;
  }

  private async storePerformanceMetrics(metrics: PerformanceMetric[]): Promise<void> {
    try {
      for (const metric of metrics) {
        try {
          await sql`
            INSERT INTO performance_metrics (
              city, ward_district, metric_type, metric_value,
              target_value, metric_date, comparison_period, trend
            ) VALUES (
              ${metric.city}, ${metric.wardDistrict}, ${metric.metricType},
              ${metric.metricValue}, ${metric.targetValue || null},
              ${metric.metricDate.toISOString().split('T')[0]},
              ${metric.comparisonPeriod}, ${metric.trend}
            )
          `;
        } catch (error) {
          // If duplicate, update existing record
          await sql`
            UPDATE performance_metrics SET
              metric_value = ${metric.metricValue},
              target_value = ${metric.targetValue || null},
              trend = ${metric.trend}
            WHERE city = ${metric.city}
            AND ward_district = ${metric.wardDistrict}
            AND metric_type = ${metric.metricType}
            AND metric_date = ${metric.metricDate.toISOString().split('T')[0]}
          `;
        }
      }
    } catch (error) {
      console.error('Error storing performance metrics:', error);
    }
  }

  private async getStoredPerformanceData(city: string, startDate: Date, endDate: Date): Promise<PerformanceMetric[]> {
    try {
      const result = await sql`
        SELECT * FROM performance_metrics
        WHERE city = ${city}
        AND metric_date >= ${startDate.toISOString().split('T')[0]}
        AND metric_date <= ${endDate.toISOString().split('T')[0]}
        ORDER BY metric_date DESC, ward_district, metric_type
      `;

      return result.rows.map(row => ({
        id: row.id,
        city: row.city,
        wardDistrict: row.ward_district,
        metricType: row.metric_type,
        metricValue: parseFloat(row.metric_value),
        targetValue: row.target_value ? parseFloat(row.target_value) : undefined,
        metricDate: new Date(row.metric_date),
        comparisonPeriod: row.comparison_period as 'month' | 'quarter' | 'year',
        trend: row.trend as 'improving' | 'declining' | 'stable',
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error fetching stored performance data:', error);
      return [];
    }
  }

  async generatePerformanceReport(city: string, wardDistrict?: string, period?: string): Promise<PerformanceReport> {
    const ward = wardDistrict || 'All Wards';
    const reportPeriod = period || 'month';
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const metrics = await this.fetchCityPerformanceData(city, startDate, endDate);
      const wardMetrics = metrics.filter(m => m.wardDistrict === ward);

      const avgRepairTimeMetric = wardMetrics.find(m => m.metricType === 'avg_repair_time_days');
      const completionRateMetric = wardMetrics.find(m => m.metricType === 'completion_rate_percent');

      const report: PerformanceReport = {
        city,
        wardDistrict: ward,
        period: reportPeriod,
        metrics: {
          avgRepairTime: {
            actual: avgRepairTimeMetric?.metricValue || 0,
            target: avgRepairTimeMetric?.targetValue || 7,
            trend: avgRepairTimeMetric?.trend || 'stable',
            status: this.getStatus(avgRepairTimeMetric?.metricValue || 0, avgRepairTimeMetric?.targetValue || 7, true)
          },
          completionRate: {
            actual: completionRateMetric?.metricValue || 0,
            target: completionRateMetric?.targetValue || 95,
            trend: completionRateMetric?.trend || 'stable',
            status: this.getStatus(completionRateMetric?.metricValue || 0, completionRateMetric?.targetValue || 95, false)
          },
          costPerRepair: {
            actual: 165, // Mock data
            target: 150,
            trend: 'stable',
            status: 'behind'
          },
          citizenSatisfaction: {
            actual: 78, // Mock data
            target: 85,
            trend: 'improving',
            status: 'behind'
          }
        },
        overallScore: 0,
        grade: 'C',
        lastUpdated: new Date()
      };

      // Calculate overall score
      const scores = [
        this.getMetricScore(report.metrics.avgRepairTime),
        this.getMetricScore(report.metrics.completionRate),
        this.getMetricScore(report.metrics.costPerRepair),
        this.getMetricScore(report.metrics.citizenSatisfaction)
      ];

      report.overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      report.grade = this.calculateGrade(report.overallScore);

      return report;
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  private getStatus(actual: number, target: number, lowerIsBetter: boolean): 'on-track' | 'behind' | 'ahead' {
    const variance = Math.abs(actual - target) / target;
    
    if (variance <= 0.05) return 'on-track';
    
    if (lowerIsBetter) {
      return actual < target ? 'ahead' : 'behind';
    } else {
      return actual > target ? 'ahead' : 'behind';
    }
  }

  private getMetricScore(metric: any): number {
    const variance = Math.abs(metric.actual - metric.target) / metric.target;
    if (variance <= 0.05) return 100; // On target
    if (variance <= 0.1) return 85;   // Close to target
    if (variance <= 0.2) return 70;   // Moderate miss
    if (variance <= 0.3) return 55;   // Significant miss
    return 40; // Major miss
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  async generateAccountabilityAlerts(city: string): Promise<AccountabilityAlert[]> {
    const alerts: AccountabilityAlert[] = [];
    
    try {
      const metrics = await this.fetchCityPerformanceData(city);
      
      metrics.forEach(metric => {
        if (metric.targetValue && metric.metricValue > metric.targetValue * 1.2) {
          const daysOverdue = Math.ceil((metric.metricValue - metric.targetValue) * 7);
          
          alerts.push({
            city: metric.city,
            wardDistrict: metric.wardDistrict,
            metricType: metric.metricType,
            severity: this.calculateAlertSeverity(metric.metricValue, metric.targetValue),
            message: this.generateAlertMessage(metric),
            targetMissedBy: ((metric.metricValue - metric.targetValue) / metric.targetValue) * 100,
            daysOverdue,
            suggestedActions: this.getSuggestedActions(metric.metricType),
            createdAt: new Date()
          });
        }
      });

      return alerts;
    } catch (error) {
      console.error('Error generating accountability alerts:', error);
      return [];
    }
  }

  private calculateAlertSeverity(actual: number, target: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = actual / target;
    
    if (ratio >= 2.0) return 'critical';
    if (ratio >= 1.5) return 'high';
    if (ratio >= 1.2) return 'medium';
    return 'low';
  }

  private generateAlertMessage(metric: PerformanceMetric): string {
    const metricName = metric.metricType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${metricName} in ${metric.wardDistrict} is ${metric.metricValue.toFixed(1)} (target: ${metric.targetValue?.toFixed(1)}). Immediate attention required.`;
  }

  private getSuggestedActions(metricType: string): string[] {
    const actions: { [key: string]: string[] } = {
      'avg_repair_time_days': [
        'Increase crew allocation to affected areas',
        'Review and optimize dispatch procedures',
        'Consider emergency contractor support',
        'Implement priority queue for high-traffic areas'
      ],
      'completion_rate_percent': [
        'Audit incomplete service requests',
        'Provide additional training to field crews',
        'Review resource allocation policies',
        'Implement quality assurance checkpoints'
      ],
      'cost_per_repair_dollars': [
        'Review contractor pricing agreements',
        'Optimize material procurement processes',
        'Implement bulk purchasing strategies',
        'Evaluate crew efficiency metrics'
      ]
    };

    return actions[metricType] || ['Review performance and implement corrective measures'];
  }

  async getSeasonalPatterns(city: string, metric: string): Promise<SeasonalPattern[]> {
    // This would typically analyze historical data across multiple years
    // For now, return mock seasonal patterns
    const patterns: SeasonalPattern[] = [
      {
        city,
        metric,
        season: 'spring',
        averageValue: metric.includes('repair_time') ? 12.5 : 88.2,
        expectedVariation: 2.1,
        historicalTrend: 'declining'
      },
      {
        city,
        metric,
        season: 'summer',
        averageValue: metric.includes('repair_time') ? 7.8 : 94.1,
        expectedVariation: 1.5,
        historicalTrend: 'improving'
      },
      {
        city,
        metric,
        season: 'fall',
        averageValue: metric.includes('repair_time') ? 9.2 : 91.7,
        expectedVariation: 1.8,
        historicalTrend: 'stable'
      },
      {
        city,
        metric,
        season: 'winter',
        averageValue: metric.includes('repair_time') ? 15.3 : 82.4,
        expectedVariation: 3.2,
        historicalTrend: 'declining'
      }
    ];

    return patterns;
  }
}

export const performanceTrackingService = new PerformanceTrackingService();
export default performanceTrackingService;