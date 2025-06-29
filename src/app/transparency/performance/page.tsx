'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PerformanceDashboard } from '@/components/performance-dashboard';

export default function PerformancePage() {
  const [selectedCity, setSelectedCity] = useState('New York');
  const [selectedWard, setSelectedWard] = useState('All Wards');

  const cities = [
    'New York',
    'Chicago', 
    'Boston',
    'Philadelphia'
  ];

  const wards = [
    'All Wards',
    'Ward 1 - Downtown',
    'Ward 2 - Midtown', 
    'Ward 3 - Upper East',
    'Ward 4 - Brooklyn Heights',
    'Ward 5 - Queens'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/transparency" className="hover:text-blue-600 transition-colors">
            Transparency
          </Link>
          <span>/</span>
          <span className="text-gray-900">Performance Tracking</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Government Performance Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Track how well your local government is meeting its infrastructure promises and commitments.
            </p>
          </div>
        </div>

        {/* City and Ward Selectors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Location</CardTitle>
            <CardDescription>
              Choose a city and ward to view specific performance data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
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
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ward/District
                </label>
                <Select value={selectedWard} onValueChange={setSelectedWard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward} value={ward}>
                        {ward}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Dashboard Component */}
        <PerformanceDashboard 
          city={selectedCity}
          wardDistrict={selectedWard}
        />

        {/* Information Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-white rotate-180" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  How Performance Grades Work
                </h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Performance grades are calculated based on repair completion time, budget efficiency, 
                  citizen satisfaction, and adherence to promised timelines. Grades range from A (excellent) 
                  to F (failing), helping citizens hold their government accountable.
                </p>
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