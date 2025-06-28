'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, TrendingUp, TrendingDown, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface BudgetSummary {
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

interface CostAnalysis {
  avgCostPerRepair: number;
  totalRepairs: number;
  costEfficiencyRating: string;
  comparison: {
    previousYear?: number;
    cityAverage?: number;
    trend: 'improving' | 'declining' | 'stable';
  };
}

interface BudgetDashboardProps {
  city: string;
  wardDistrict?: string;
}

export function BudgetDashboard({ city, wardDistrict }: BudgetDashboardProps) {
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBudgetData();
    fetchCostAnalysis();
  }, [city, selectedYear, wardDistrict]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/budget/summary?city=${encodeURIComponent(city)}&fiscalYear=${selectedYear}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch budget data');
      }

      const data = await response.json();
      setBudgetSummary(data.data);
      setError(null);
    } catch (err) {
      setError('Unable to load budget data. Please try again.');
      console.error('Error fetching budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCostAnalysis = async () => {
    try {
      const ward = wardDistrict || 'All Wards';
      const response = await fetch(`/api/budget/analysis?city=${encodeURIComponent(city)}&wardDistrict=${encodeURIComponent(ward)}`);
      
      if (response.ok) {
        const data = await response.json();
        setCostAnalysis(data.data);
      }
    } catch (err) {
      console.error('Error fetching cost analysis:', err);
    }
  };

  const refreshBudgetData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, fiscalYear: selectedYear })
      });
      
      if (response.ok) {
        await fetchBudgetData();
        await fetchCostAnalysis();
      }
    } catch (err) {
      console.error('Error refreshing budget data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEfficiencyColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Transparency Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Transparency Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchBudgetData} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget Transparency Dashboard
              </CardTitle>
              <CardDescription>
                Track how {city} spends taxpayer money on infrastructure
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2025, 2024, 2023, 2022].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      FY {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshBudgetData}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {budgetSummary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Allocated</p>
                    <p className="text-2xl font-bold">{formatCurrency(budgetSummary.totalAllocated)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold">{formatCurrency(budgetSummary.totalSpent)}</p>
                    <p className="text-xs text-gray-500">
                      {formatPercentage((budgetSummary.totalSpent / budgetSummary.totalAllocated) * 100)} of budget
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Remaining</p>
                    <p className="text-2xl font-bold">{formatCurrency(budgetSummary.totalRemaining)}</p>
                    <p className="text-xs text-gray-500">
                      {formatPercentage((budgetSummary.totalRemaining / budgetSummary.totalAllocated) * 100)} left
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget by Category</CardTitle>
                <CardDescription>Allocated vs Spent by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetSummary.categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(value), '']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Bar dataKey="allocated" fill="#8884d8" name="Allocated" />
                    <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Spending Percentage Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Distribution</CardTitle>
                <CardDescription>Percentage of budget spent by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={budgetSummary.categories}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="spent"
                      label={(entry) => `${entry.category}: ${formatPercentage(entry.percentSpent)}`}
                    >
                      {budgetSummary.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Budget Breakdown</CardTitle>
              <CardDescription>Complete overview of budget allocation and spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">Allocated</th>
                      <th className="text-right p-2">Spent</th>
                      <th className="text-right p-2">Remaining</th>
                      <th className="text-right p-2">% Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetSummary.categories.map((category, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{category.category.replace('_', ' ').toUpperCase()}</td>
                        <td className="p-2 text-right">{formatCurrency(category.allocated)}</td>
                        <td className="p-2 text-right">{formatCurrency(category.spent)}</td>
                        <td className="p-2 text-right">{formatCurrency(category.remaining)}</td>
                        <td className="p-2 text-right">
                          <Badge 
                            variant={category.percentSpent > 80 ? 'destructive' : category.percentSpent > 60 ? 'default' : 'secondary'}
                          >
                            {formatPercentage(category.percentSpent)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Cost Analysis */}
      {costAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Efficiency Analysis</CardTitle>
            <CardDescription>
              How effectively is {city} {wardDistrict && wardDistrict !== 'All Wards' && `(${wardDistrict})`} spending on pothole repairs?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{formatCurrency(costAnalysis.avgCostPerRepair)}</p>
                <p className="text-sm text-gray-600">Average Cost per Repair</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {getTrendIcon(costAnalysis.comparison.trend)}
                  <span className="text-xs capitalize">{costAnalysis.comparison.trend}</span>
                </div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{costAnalysis.totalRepairs}</p>
                <p className="text-sm text-gray-600">Total Repairs</p>
                {costAnalysis.comparison.previousYear && (
                  <p className="text-xs text-gray-500 mt-2">
                    vs {costAnalysis.comparison.previousYear} last year
                  </p>
                )}
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Badge className={getEfficiencyColor(costAnalysis.costEfficiencyRating)}>
                  {costAnalysis.costEfficiencyRating}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">Efficiency Rating</p>
                {costAnalysis.comparison.cityAverage && (
                  <p className="text-xs text-gray-500 mt-2">
                    City avg: {formatCurrency(costAnalysis.comparison.cityAverage)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {budgetSummary && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(budgetSummary.lastUpdated).toLocaleDateString()} at{' '}
          {new Date(budgetSummary.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}