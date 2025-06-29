'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CloudSnow } from 'lucide-react';
import Link from 'next/link';
import { WeatherInsights } from '@/components/weather-insights';

export default function WeatherPage() {
  const [selectedCity, setSelectedCity] = useState('New York');

  const cities = [
    'New York',
    'Chicago', 
    'Boston',
    'Philadelphia',
    'Detroit',
    'Minneapolis'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/transparency" className="hover:text-blue-600 transition-colors">
            Transparency
          </Link>
          <span>/</span>
          <span className="text-gray-900">Weather Insights</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Weather Impact Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Understand how weather patterns affect pothole formation and predict future infrastructure challenges using AI.
            </p>
          </div>
        </div>

        {/* City Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select City</CardTitle>
            <CardDescription>
              Choose a city to view weather correlation data and predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Weather Insights Component */}
        <WeatherInsights city={selectedCity} />

        {/* Information Card */}
        <Card className="mt-8 bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-600 rounded-lg">
                <CloudSnow className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">
                  How Weather Predictions Work
                </h3>
                <div className="text-purple-800 text-sm leading-relaxed space-y-2">
                  <p>
                    Our AI system analyzes historical weather data, temperature fluctuations, precipitation patterns, 
                    and freeze-thaw cycles to predict where potholes are most likely to form.
                  </p>
                  <p>
                    <strong>Freeze-Thaw Cycles:</strong> The most damaging pattern occurs when temperatures 
                    cross the freezing point multiple times, causing water to expand and contract in road cracks.
                  </p>
                  <p>
                    <strong>Predictive Alerts:</strong> Get advance warning of high-risk periods so maintenance 
                    crews can take preventive action before damage occurs.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link href="/transparency">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Transparency Hub
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}