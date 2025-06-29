'use client';

import { PotholeMap } from '@/components/pothole-map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Filter, Users } from 'lucide-react';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MapPin className="h-4 w-4" />
            Community Map & Activity
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Interactive Pothole Map
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore all reported potholes in your area, track repair status, and see community activity in real-time.
          </p>
        </div>

        {/* Map Component */}
        <div className="mb-8">
          <PotholeMap />
        </div>

        {/* Map Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Real-Time Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                See all pothole reports from the community, updated in real-time as new issues are reported.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Status Filtering</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Filter reports by status: new reports, in progress, or completed repairs to track progress.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Community Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                See which areas are most active and where the community is making the biggest impact.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}