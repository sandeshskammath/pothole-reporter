'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { CommunityHub } from '@/components/community-hub';

export default function OrganizationsPage() {
  const [city, setCity] = useState('New York');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | undefined>();
  const [customCity, setCustomCity] = useState('');
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  };

  const searchCity = () => {
    if (customCity.trim()) {
      setCity(customCity.trim());
      setCustomCity('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/civic" className="hover:text-blue-600 transition-colors">
            Civic Action
          </Link>
          <span>/</span>
          <span className="text-gray-900">Community Organizations</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Organizations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with local groups, nonprofits, and civic organizations working on infrastructure and community issues.
          </p>
        </div>

        {/* City Selection */}
        <Card className="max-w-2xl mx-auto mb-12">
          <CardHeader>
            <CardTitle className="text-center">Find Organizations in Your Area</CardTitle>
            <CardDescription className="text-center">
              Currently showing organizations in <strong>{city}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter your city..."
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCity()}
              />
              <Button onClick={searchCity} disabled={!customCity.trim()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <span className="text-gray-500">or</span>
            </div>

            <Button 
              onClick={getCurrentLocation} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {loading ? 'Getting Location...' : 'Use Current Location for Personalized Results'}
            </Button>
          </CardContent>
        </Card>

        {/* Community Hub Component */}
        <CommunityHub 
          city={city}
          userLocation={userLocation}
          userInterests={['infrastructure', 'civic_engagement', 'community_development']}
        />

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link href="/civic">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Civic Action Hub
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}