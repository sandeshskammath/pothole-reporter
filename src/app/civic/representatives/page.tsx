'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { RepresentativeContact } from '@/components/representative-contact';

export default function RepresentativesPage() {
  const [location, setLocation] = useState<{latitude: number, longitude: number, address?: string} | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location'
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

  const searchAddress = async () => {
    if (!address.trim()) return;
    
    setLoading(true);
    // For demo purposes, use NYC coordinates
    // In a real app, you'd geocode the address
    setLocation({
      latitude: 40.7128,
      longitude: -74.0060,
      address: address
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/civic" className="hover:text-blue-600 transition-colors">
            Civic Action
          </Link>
          <span>/</span>
          <span className="text-gray-900">Contact Representatives</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Your Representatives
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find and contact your elected officials about infrastructure issues in your area.
          </p>
        </div>

        {/* Location Input */}
        {!location && (
          <Card className="max-w-2xl mx-auto mb-12">
            <CardHeader>
              <CardTitle className="text-center">Find Your Representatives</CardTitle>
              <CardDescription className="text-center">
                Enter your address or use your current location to find your elected officials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
                />
                <Button onClick={searchAddress} disabled={loading || !address.trim()}>
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
                {loading ? 'Getting Location...' : 'Use Current Location'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Representatives List */}
        {location && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Representatives for {location.address}
                </h2>
                <p className="text-gray-600">
                  Contact your elected officials about infrastructure issues
                </p>
              </div>
              <Button 
                onClick={() => setLocation(null)}
                variant="outline"
              >
                Change Location
              </Button>
            </div>

            <RepresentativeContact 
              location={location}
              potholeReportId={undefined}
            />
          </div>
        )}

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