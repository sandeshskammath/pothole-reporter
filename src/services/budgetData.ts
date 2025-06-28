import { sql } from '@vercel/postgres';

export interface BudgetData {
  id?: number;
  city: string;
  wardDistrict: string;
  fiscalYear: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  category: string;
  dataSource: string;
  lastUpdated: Date;
  createdAt: Date;
}

export interface BudgetSummary {
  city: string;
  fiscalYear: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  categories: Array<{
    category: string;
    allocated: number;
    spent: number;
    remaining: number;
    percentSpent: number;
  }>;
  lastUpdated: Date;
}

export interface CostAnalysis {
  avgCostPerRepair: number;
  totalRepairs: number;
  costEfficiencyRating: string;
  comparison: {
    previousYear?: number;
    cityAverage?: number;
    trend: 'improving' | 'declining' | 'stable';
  };
}

class BudgetDataService {
  private readonly chicagoBaseUrl = 'https://data.cityofchicago.org/resource';
  private readonly nycBaseUrl = 'https://data.cityofnewyork.us/resource';
  private readonly nycAppToken: string;

  constructor() {
    this.nycAppToken = process.env.NYC_OPEN_DATA_APP_TOKEN || '';
  }

  async fetchBudgetData(city: string, fiscalYear?: number): Promise<BudgetData[]> {
    const currentYear = fiscalYear || new Date().getFullYear();
    
    try {
      if (city.toLowerCase() === 'chicago') {
        return this.fetchChicagoBudgetData(currentYear);
      } else if (city.toLowerCase() === 'new york' || city.toLowerCase() === 'nyc') {
        return this.fetchNYCBudgetData(currentYear);
      } else {
        return this.getMockBudgetData(city, currentYear);
      }
    } catch (error) {
      console.error(`Error fetching budget data for ${city}:`, error);
      return this.getMockBudgetData(city, currentYear);
    }
  }

  private async fetchChicagoBudgetData(fiscalYear: number): Promise<BudgetData[]> {
    try {
      // Chicago Budget API endpoints
      const budgetEndpoint = `${this.chicagoBaseUrl}/yxmj-gqqz.json`; // Budget ordinances
      const spendingEndpoint = `${this.chicagoBaseUrl}/vuhe-j6ar.json`; // City spending

      const [budgetResponse, spendingResponse] = await Promise.all([
        fetch(`${budgetEndpoint}?$where=year=${fiscalYear}&$limit=1000`),
        fetch(`${spendingEndpoint}?$where=year=${fiscalYear}&$limit=1000`)
      ]);

      let budgetData: BudgetData[] = [];

      if (budgetResponse.ok) {
        const budgetJson = await budgetResponse.json();
        budgetData = this.parseChicagoBudgetData(budgetJson, fiscalYear);
      }

      if (spendingResponse.ok) {
        const spendingJson = await spendingResponse.json();
        budgetData = this.mergeSpendingData(budgetData, spendingJson);
      }

      // Store in database
      await this.storeBudgetData(budgetData);
      
      return budgetData;
    } catch (error) {
      console.error('Error fetching Chicago budget data:', error);
      return this.getStoredBudgetData('Chicago', fiscalYear);
    }
  }

  private async fetchNYCBudgetData(fiscalYear: number): Promise<BudgetData[]> {
    try {
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (this.nycAppToken && this.nycAppToken !== 'YOUR_NYC_OPEN_DATA_TOKEN_HERE') {
        headers['X-App-Token'] = this.nycAppToken;
      }

      // NYC Budget API
      const budgetEndpoint = `${this.nycBaseUrl}/buex-bi6w.json`; // Budget data
      
      const response = await fetch(
        `${budgetEndpoint}?$where=fiscal_year=${fiscalYear}&$limit=1000`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        const budgetData = this.parseNYCBudgetData(data, fiscalYear);
        await this.storeBudgetData(budgetData);
        return budgetData;
      }

      return this.getStoredBudgetData('New York', fiscalYear);
    } catch (error) {
      console.error('Error fetching NYC budget data:', error);
      return this.getStoredBudgetData('New York', fiscalYear);
    }
  }

  private parseChicagoBudgetData(data: any[], fiscalYear: number): BudgetData[] {
    const budgetData: BudgetData[] = [];
    const infrastructureCategories = [
      'streets and sanitation',
      'transportation',
      'infrastructure',
      'public works',
      'pothole',
      'road maintenance'
    ];

    data.forEach(item => {
      const description = item.appropriation_description?.toLowerCase() || '';
      const fund = item.fund?.toLowerCase() || '';
      
      if (infrastructureCategories.some(cat => 
        description.includes(cat) || fund.includes(cat)
      )) {
        budgetData.push({
          city: 'Chicago',
          wardDistrict: item.ward || 'All Wards',
          fiscalYear,
          allocatedAmount: parseFloat(item.appropriation_authority) || 0,
          spentAmount: 0, // Will be merged from spending data
          remainingAmount: parseFloat(item.appropriation_authority) || 0,
          category: this.categorizeChicagoExpense(description),
          dataSource: 'Chicago Data Portal',
          lastUpdated: new Date(),
          createdAt: new Date()
        });
      }
    });

    return budgetData;
  }

  private parseNYCBudgetData(data: any[], fiscalYear: number): BudgetData[] {
    const budgetData: BudgetData[] = [];
    
    data.forEach(item => {
      const agency = item.agency_name?.toLowerCase() || '';
      const unit = item.unit_of_appropriation?.toLowerCase() || '';
      
      if (agency.includes('transportation') || 
          unit.includes('highway') || 
          unit.includes('street') ||
          unit.includes('infrastructure')) {
        budgetData.push({
          city: 'New York',
          wardDistrict: item.borough || 'All Boroughs',
          fiscalYear,
          allocatedAmount: parseFloat(item.adopted_budget) || 0,
          spentAmount: parseFloat(item.current_budget) || 0,
          remainingAmount: (parseFloat(item.adopted_budget) || 0) - (parseFloat(item.current_budget) || 0),
          category: this.categorizeNYCExpense(unit),
          dataSource: 'NYC Open Data',
          lastUpdated: new Date(),
          createdAt: new Date()
        });
      }
    });

    return budgetData;
  }

  private categorizeChicagoExpense(description: string): string {
    if (description.includes('pothole')) return 'pothole_repair';
    if (description.includes('street') || description.includes('road')) return 'road_maintenance';
    if (description.includes('bridge')) return 'bridge_maintenance';
    if (description.includes('sidewalk')) return 'sidewalk_maintenance';
    return 'infrastructure_general';
  }

  private categorizeNYCExpense(unit: string): string {
    if (unit.includes('highway maintenance')) return 'road_maintenance';
    if (unit.includes('street repair')) return 'pothole_repair';
    if (unit.includes('bridge')) return 'bridge_maintenance';
    if (unit.includes('sidewalk')) return 'sidewalk_maintenance';
    return 'infrastructure_general';
  }

  private mergeSpendingData(budgetData: BudgetData[], spendingData: any[]): BudgetData[] {
    // Create a map for quick lookups
    const spendingMap = new Map();
    
    spendingData.forEach(item => {
      const key = `${item.department}_${item.category}`;
      const amount = parseFloat(item.amount) || 0;
      spendingMap.set(key, (spendingMap.get(key) || 0) + amount);
    });

    // Update budget data with spending information
    return budgetData.map(budget => {
      const key = `${budget.category}_${budget.wardDistrict}`;
      const spentAmount = spendingMap.get(key) || 0;
      
      return {
        ...budget,
        spentAmount,
        remainingAmount: budget.allocatedAmount - spentAmount
      };
    });
  }

  private getMockBudgetData(city: string, fiscalYear: number): BudgetData[] {
    return [
      {
        city,
        wardDistrict: 'All Districts',
        fiscalYear,
        allocatedAmount: 5000000,
        spentAmount: 2800000,
        remainingAmount: 2200000,
        category: 'road_maintenance',
        dataSource: 'Mock Data',
        lastUpdated: new Date(),
        createdAt: new Date()
      },
      {
        city,
        wardDistrict: 'All Districts',
        fiscalYear,
        allocatedAmount: 1500000,
        spentAmount: 850000,
        remainingAmount: 650000,
        category: 'pothole_repair',
        dataSource: 'Mock Data',
        lastUpdated: new Date(),
        createdAt: new Date()
      }
    ];
  }

  private async storeBudgetData(budgetData: BudgetData[]): Promise<void> {
    try {
      for (const data of budgetData) {
        try {
          await sql`
            INSERT INTO budget_data (
              city, ward_district, fiscal_year, allocated_amount, 
              spent_amount, category, data_source, last_updated
            ) VALUES (
              ${data.city}, ${data.wardDistrict}, ${data.fiscalYear},
              ${data.allocatedAmount}, ${data.spentAmount}, ${data.category},
              ${data.dataSource}, ${data.lastUpdated.toISOString()}
            )
          `;
        } catch (error) {
          // If duplicate, update existing record
          await sql`
            UPDATE budget_data SET
              allocated_amount = ${data.allocatedAmount},
              spent_amount = ${data.spentAmount},
              last_updated = ${data.lastUpdated.toISOString()}
            WHERE city = ${data.city} 
            AND ward_district = ${data.wardDistrict}
            AND fiscal_year = ${data.fiscalYear}
            AND category = ${data.category}
          `;
        }
      }
    } catch (error) {
      console.error('Error storing budget data:', error);
    }
  }

  private async getStoredBudgetData(city: string, fiscalYear: number): Promise<BudgetData[]> {
    try {
      const result = await sql`
        SELECT * FROM budget_data
        WHERE city = ${city} AND fiscal_year = ${fiscalYear}
        ORDER BY category, ward_district
      `;
      
      return result.rows.map(row => ({
        id: row.id,
        city: row.city,
        wardDistrict: row.ward_district,
        fiscalYear: row.fiscal_year,
        allocatedAmount: parseFloat(row.allocated_amount),
        spentAmount: parseFloat(row.spent_amount),
        remainingAmount: parseFloat(row.remaining_amount),
        category: row.category,
        dataSource: row.data_source,
        lastUpdated: new Date(row.last_updated),
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error fetching stored budget data:', error);
      return [];
    }
  }

  async getBudgetSummary(city: string, fiscalYear?: number): Promise<BudgetSummary> {
    const year = fiscalYear || new Date().getFullYear();
    const budgetData = await this.fetchBudgetData(city, year);

    const totalAllocated = budgetData.reduce((sum, item) => sum + item.allocatedAmount, 0);
    const totalSpent = budgetData.reduce((sum, item) => sum + item.spentAmount, 0);
    const totalRemaining = totalAllocated - totalSpent;

    // Group by category
    const categoryMap = new Map();
    budgetData.forEach(item => {
      const existing = categoryMap.get(item.category) || {
        category: item.category,
        allocated: 0,
        spent: 0,
        remaining: 0,
        percentSpent: 0
      };
      
      existing.allocated += item.allocatedAmount;
      existing.spent += item.spentAmount;
      existing.remaining += item.remainingAmount;
      existing.percentSpent = existing.allocated > 0 ? (existing.spent / existing.allocated) * 100 : 0;
      
      categoryMap.set(item.category, existing);
    });

    return {
      city,
      fiscalYear: year,
      totalAllocated,
      totalSpent,
      totalRemaining,
      categories: Array.from(categoryMap.values()),
      lastUpdated: new Date()
    };
  }

  async calculateCostAnalysis(city: string, wardDistrict?: string): Promise<CostAnalysis> {
    try {
      // Get repair cost data from budget and reports
      const costQuery = wardDistrict 
        ? sql`
            SELECT AVG(spent_amount / NULLIF(report_count, 0)) as avg_cost,
                   SUM(report_count) as total_repairs
            FROM budget_data bd
            LEFT JOIN (
              SELECT COUNT(*) as report_count
              FROM pothole_reports pr
              WHERE pr.city = ${city} 
              AND (${wardDistrict} = 'All Wards' OR pr.ward = ${wardDistrict})
              AND pr.status = 'resolved'
            ) rc ON true
            WHERE bd.city = ${city}
            AND bd.category = 'pothole_repair'
            AND (${wardDistrict} = 'All Wards' OR bd.ward_district = ${wardDistrict})
          `
        : sql`
            SELECT AVG(spent_amount / NULLIF(report_count, 0)) as avg_cost,
                   SUM(report_count) as total_repairs
            FROM budget_data bd
            LEFT JOIN (
              SELECT COUNT(*) as report_count
              FROM pothole_reports pr
              WHERE pr.city = ${city}
              AND pr.status = 'resolved'
            ) rc ON true
            WHERE bd.city = ${city}
            AND bd.category = 'pothole_repair'
          `;

      const result = await costQuery;
      const avgCost = parseFloat(result.rows[0]?.avg_cost) || 165.00;
      const totalRepairs = parseInt(result.rows[0]?.total_repairs) || 0;

      // Determine efficiency rating
      let costEfficiencyRating = 'Average';
      if (avgCost < 120) costEfficiencyRating = 'Excellent';
      else if (avgCost < 150) costEfficiencyRating = 'Good';
      else if (avgCost > 200) costEfficiencyRating = 'Poor';

      return {
        avgCostPerRepair: avgCost,
        totalRepairs,
        costEfficiencyRating,
        comparison: {
          previousYear: avgCost * 0.95, // Mock comparison
          cityAverage: 165.00,
          trend: avgCost < 160 ? 'improving' : avgCost > 180 ? 'declining' : 'stable'
        }
      };
    } catch (error) {
      console.error('Error calculating cost analysis:', error);
      return {
        avgCostPerRepair: 165.00,
        totalRepairs: 0,
        costEfficiencyRating: 'Unknown',
        comparison: {
          trend: 'stable'
        }
      };
    }
  }

  async refreshBudgetData(city: string, fiscalYear?: number): Promise<boolean> {
    try {
      const data = await this.fetchBudgetData(city, fiscalYear);
      return data.length > 0;
    } catch (error) {
      console.error('Error refreshing budget data:', error);
      return false;
    }
  }
}

export const budgetDataService = new BudgetDataService();
export default budgetDataService;