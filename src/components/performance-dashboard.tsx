'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Target, Clock, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Award, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface PerformanceReport {
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

interface AccountabilityAlert {
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

interface SeasonalPattern {
  city: string;
  metric: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  averageValue: number;
  expectedVariation: number;
  historicalTrend: 'improving' | 'declining' | 'stable';
}

interface PerformanceDashboardProps {
  city: string;
  wardDistrict?: string;
}

export function PerformanceDashboard({ city, wardDistrict }: PerformanceDashboardProps) {
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [alerts, setAlerts] = useState<AccountabilityAlert[]>([]);
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchPerformanceData();
    fetchAlerts();
    fetchSeasonalPatterns();
  }, [city, wardDistrict, selectedPeriod]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const ward = wardDistrict || 'All Wards';
      const response = await fetch(
        `/api/performance/report?city=${encodeURIComponent(city)}&wardDistrict=${encodeURIComponent(ward)}&period=${selectedPeriod}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }

      const data = await response.json();
      setPerformanceReport(data.data);
      setError(null);
    } catch (err) {
      setError('Unable to load performance data. Please try again.');
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/performance/alerts?city=${encodeURIComponent(city)}`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  const fetchSeasonalPatterns = async () => {
    try {
      const response = await fetch(`/api/performance/seasonal?city=${encodeURIComponent(city)}&metric=avg_repair_time_days`);
      if (response.ok) {
        const data = await response.json();
        setSeasonalPatterns(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching seasonal patterns:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'bg-green-100 text-green-800';
      case 'on-track': return 'bg-blue-100 text-blue-800';
      case 'behind': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatMetricName = (name: string) => {
    return name.split(/(?=[A-Z])/).join(' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Accountability Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
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
            <Target className="h-5 w-5" />
            Performance Accountability Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchPerformanceData} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const radarData = performanceReport ? [
    {
      metric: 'Repair Time',
      actual: (performanceReport.metrics.avgRepairTime.target / Math.max(performanceReport.metrics.avgRepairTime.actual, 1)) * 100,
      target: 100
    },
    {
      metric: 'Completion Rate',
      actual: (performanceReport.metrics.completionRate.actual / performanceReport.metrics.completionRate.target) * 100,
      target: 100
    },
    {
      metric: 'Cost Efficiency',
      actual: (performanceReport.metrics.costPerRepair.target / Math.max(performanceReport.metrics.costPerRepair.actual, 1)) * 100,
      target: 100
    },
    {
      metric: 'Satisfaction',
      actual: (performanceReport.metrics.citizenSatisfaction.actual / performanceReport.metrics.citizenSatisfaction.target) * 100,
      target: 100
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance Accountability Dashboard
              </CardTitle>
              <CardDescription>
                Track {city} {wardDistrict && wardDistrict !== 'All Wards' && `(${wardDistrict})`} performance against promises
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {performanceReport && (
        <>
          {/* Overall Grade Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Performance Grade</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className={`w-16 h-16 rounded-full ${getGradeColor(performanceReport.grade)} flex items-center justify-center`}>
                      <span className="text-2xl font-bold text-white">{performanceReport.grade}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{performanceReport.overallScore.toFixed(1)}/100</p>
                      <p className="text-sm text-gray-500">Performance Score</p>
                    </div>
                  </div>
                </div>
                <Award className="h-12 w-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(performanceReport.metrics).map(([key, metric]) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {formatMetricName(key)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {key === 'avgRepairTime' ? `${metric.actual.toFixed(1)} days` :
                         key === 'completionRate' ? `${metric.actual.toFixed(1)}%` :
                         key === 'costPerRepair' ? `$${metric.actual.toFixed(0)}` :
                         `${metric.actual.toFixed(0)}%`}
                      </span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Target: {key === 'avgRepairTime' ? `${metric.target} days` :
                                    key === 'completionRate' ? `${metric.target}%` :
                                    key === 'costPerRepair' ? `$${metric.target}` :
                                    `${metric.target}%`}</span>
                        <Badge className={getStatusColor(metric.status)} variant="secondary">
                          {metric.status}
                        </Badge>
                      </div>
                      
                      <Progress 
                        value={key === 'avgRepairTime' ? Math.min((metric.target / metric.actual) * 100, 100) :
                               (metric.actual / metric.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Actual vs Target performance across all metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 120]} />
                  <Radar
                    name="Actual"
                    dataKey="actual"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.1}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Accountability Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Accountability Alerts
            </CardTitle>
            <CardDescription>
              Performance issues requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{alert.severity.toUpperCase()}</Badge>
                        <span className="text-sm text-gray-600">{alert.wardDistrict}</span>
                      </div>
                      <p className="font-medium mb-2">{alert.message}</p>
                      <p className="text-sm text-gray-600 mb-3">
                        Target missed by {alert.targetMissedBy.toFixed(1)}% • {alert.daysOverdue} days overdue
                      </p>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {alert.suggestedActions.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seasonal Patterns */}
      {seasonalPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Performance Patterns</CardTitle>
            <CardDescription>
              How performance varies throughout the year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={seasonalPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(1)} days`, 'Average Repair Time']}
                />
                <Bar dataKey="averageValue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {performanceReport && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(performanceReport.lastUpdated).toLocaleDateString()} at{' '}
          {new Date(performanceReport.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}