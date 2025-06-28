'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CloudSnow, Thermometer, Droplets, AlertTriangle, TrendingUp, MapPin, Calendar, Zap, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface WeatherCorrelation {
  city: string;
  correlationStrength: number;
  freezeThawImpact: number;
  precipitationImpact: number;
  temperatureThreshold: number;
  seasonalPatterns: {
    spring: number;
    summer: number;
    fall: number;
    winter: number;
  };
  lastAnalyzed: Date;
}

interface PotholePrediction {
  locationLat: number;
  locationLng: number;
  address: string;
  probabilityScore: number;
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

interface WeatherAlert {
  city: string;
  alertType: 'freeze_thaw_warning' | 'heavy_precipitation' | 'temperature_fluctuation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  expectedPotholeIncrease: number;
  affectedAreas: string[];
  validUntil: Date;
  recommendedActions: string[];
  createdAt: Date;
}

interface FreezeThawCycle {
  date: Date;
  city: string;
  morningTemp: number;
  afternoonTemp: number;
  crossedFreezing: boolean;
  precipitationLast24h: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface WeatherInsightsProps {
  city: string;
}

export function WeatherInsights({ city }: WeatherInsightsProps) {
  const [correlation, setCorrelation] = useState<WeatherCorrelation | null>(null);
  const [predictions, setPredictions] = useState<PotholePrediction[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [freezeThawCycles, setFreezeThawCycles] = useState<FreezeThawCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, [city]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // Fetch all weather-related data in parallel
      const [correlationRes, predictionsRes, alertsRes, freezeThawRes] = await Promise.all([
        fetch(`/api/weather/correlation?city=${encodeURIComponent(city)}`),
        fetch(`/api/weather/predictions?city=${encodeURIComponent(city)}&limit=10`),
        fetch(`/api/weather/alerts?city=${encodeURIComponent(city)}`),
        fetch(`/api/weather/freeze-thaw?city=${encodeURIComponent(city)}&days=7`)
      ]);

      if (correlationRes.ok) {
        const data = await correlationRes.json();
        setCorrelation(data.data);
      }

      if (predictionsRes.ok) {
        const data = await predictionsRes.json();
        setPredictions(data.data || []);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.data || []);
      }

      if (freezeThawRes.ok) {
        const data = await freezeThawRes.json();
        setFreezeThawCycles(data.data || []);
      }

      setError(null);
    } catch (err) {
      setError('Unable to load weather insights. Please try again.');
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
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

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getProbabilityColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTemperature = (temp: number) => `${temp.toFixed(1)}°F`;

  const seasonalData = correlation ? [
    { season: 'Spring', reports: correlation.seasonalPatterns.spring, period: 'Mar-May' },
    { season: 'Summer', reports: correlation.seasonalPatterns.summer, period: 'Jun-Aug' },
    { season: 'Fall', reports: correlation.seasonalPatterns.fall, period: 'Sep-Nov' },
    { season: 'Winter', reports: correlation.seasonalPatterns.winter, period: 'Dec-Feb' }
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudSnow className="h-5 w-5" />
              Weather Insights & Predictions
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
            <CloudSnow className="h-5 w-5" />
            Weather Insights & Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchWeatherData} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudSnow className="h-5 w-5" />
            Weather Insights & Predictions
          </CardTitle>
          <CardDescription>
            AI-powered analysis of weather patterns and pothole formation in {city}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Weather Alerts
            </CardTitle>
            <CardDescription>
              Weather conditions that may affect road infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{alert.severity.toUpperCase()}</Badge>
                      <Badge variant="secondary">{alert.alertType.replace('_', ' ').toUpperCase()}</Badge>
                    </div>
                    <span className="text-sm text-gray-600">
                      Valid until {new Date(alert.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="font-medium mb-2">{alert.message}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Expected Impact:</p>
                      <p className="text-sm text-gray-600">
                        {alert.expectedPotholeIncrease.toFixed(0)}% increase in pothole reports expected
                      </p>
                      <p className="text-sm text-gray-600">
                        Affected areas: {alert.affectedAreas.join(', ')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {alert.recommendedActions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Correlation Analysis */}
      {correlation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weather Correlation Analysis
              </CardTitle>
              <CardDescription>
                How weather patterns affect pothole formation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Correlation Strength</span>
                    <span className="text-sm font-bold">{(correlation.correlationStrength * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={correlation.correlationStrength * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Thermometer className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Freeze-Thaw</span>
                    </div>
                    <p className="text-lg font-bold">{correlation.freezeThawImpact.toFixed(1)}</p>
                    <p className="text-xs text-gray-600">Avg increase per cycle</p>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Droplets className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Precipitation</span>
                    </div>
                    <p className="text-lg font-bold">{correlation.precipitationImpact.toFixed(1)}</p>
                    <p className="text-xs text-gray-600">Impact factor</p>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-500">
                  Analysis last updated: {new Date(correlation.lastAnalyzed).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seasonal Patterns</CardTitle>
              <CardDescription>
                Average daily pothole reports by season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={seasonalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="season" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(1)} reports/day`, 'Average']}
                  />
                  <Bar dataKey="reports" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Freeze-Thaw Forecast */}
      {freezeThawCycles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              7-Day Freeze-Thaw Forecast
            </CardTitle>
            <CardDescription>
              Temperature cycles that may cause road damage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {freezeThawCycles.map((cycle, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {new Date(cycle.date).toLocaleDateString()}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(cycle.riskLevel)}`}></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Morning:</span>
                      <span>{formatTemperature(cycle.morningTemp)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Afternoon:</span>
                      <span>{formatTemperature(cycle.afternoonTemp)}</span>
                    </div>
                    {cycle.precipitationLast24h > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Precipitation:</span>
                        <span>{cycle.precipitationLast24h.toFixed(1)}&quot;</span>
                      </div>
                    )}
                  </div>
                  
                  <Badge 
                    className={`mt-2 ${
                      cycle.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      cycle.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {cycle.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pothole Predictions */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              AI Pothole Predictions
            </CardTitle>
            <CardDescription>
              Machine learning predictions of future pothole locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.slice(0, 5).map((prediction, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-sm">{prediction.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getProbabilityColor(prediction.probabilityScore)}`}>
                          {prediction.probabilityScore}%
                        </span>
                        <Badge variant="outline">{prediction.predictedTimeframe}</Badge>
                      </div>
                    </div>
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Risk Factors:</p>
                      <div className="space-y-1">
                        {prediction.riskFactors.recentFreezeThaw && (
                          <Badge variant="secondary" className="text-xs">Recent Freeze-Thaw</Badge>
                        )}
                        {prediction.riskFactors.highPrecipitation && (
                          <Badge variant="secondary" className="text-xs">High Precipitation</Badge>
                        )}
                        {prediction.riskFactors.historicalHotspot && (
                          <Badge variant="secondary" className="text-xs">Historical Hotspot</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {prediction.riskFactors.trafficVolume.toUpperCase()} Traffic
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Preventive Actions:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {prediction.preventiveActions.slice(0, 2).map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-1">
                            <span className="text-blue-600">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Model: {prediction.modelVersion} • Expires: {new Date(prediction.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {predictions.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    View All {predictions.length} Predictions
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {!loading && !error && predictions.length === 0 && alerts.length === 0 && freezeThawCycles.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <CloudSnow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No weather insights available at this time.</p>
            <p className="text-sm text-gray-500">
              Weather data and predictions will appear here when conditions are relevant for pothole formation.
            </p>
            <Button onClick={fetchWeatherData} className="mt-4">
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}