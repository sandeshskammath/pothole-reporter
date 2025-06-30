"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building2, Users } from 'lucide-react';
import { CITIES, DEFAULT_CITY, getCityConfig, detectCityFromLocation } from '@/lib/cities';

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (cityId: string) => void;
  className?: string;
}

export function CitySelector({ selectedCity, onCityChange, className }: CitySelectorProps) {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [suggestedCity, setSuggestedCity] = useState<string | null>(null);

  // Try to detect user's city on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          const detectedCity = detectCityFromLocation(latitude, longitude);
          if (detectedCity && detectedCity !== selectedCity) {
            setSuggestedCity(detectedCity);
          }
        },
        () => {
          // Geolocation failed, use default
          console.log('Geolocation not available, using default city');
        },
        { timeout: 5000 }
      );
    }
  }, [selectedCity]);

  const handleCitySelect = (cityId: string) => {
    onCityChange(cityId);
    setSuggestedCity(null); // Clear suggestion after user makes choice
  };

  return (
    <div className={className}>
      {/* Location Suggestion */}
      {suggestedCity && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  It looks like you&apos;re in <strong>{getCityConfig(suggestedCity).name}</strong>
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSuggestedCity(null)}
                >
                  Dismiss
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleCitySelect(suggestedCity)}
                >
                  Switch to {getCityConfig(suggestedCity).name}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* City Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(CITIES).map(([cityId, city]) => (
          <Card 
            key={cityId}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCity === cityId 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:border-blue-300'
            }`}
            onClick={() => handleCitySelect(cityId)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {city.name}
                </CardTitle>
                {selectedCity === cityId && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {city.state}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Full civic engagement features</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {city.features.wards && (
                    <Badge variant="secondary" className="text-xs">Ward Data</Badge>
                  )}
                  {city.features.districts && (
                    <Badge variant="secondary" className="text-xs">Districts</Badge>
                  )}
                  {city.features.budget_tracking && (
                    <Badge variant="secondary" className="text-xs">Budget Tracking</Badge>
                  )}
                  {city.features.performance_metrics && (
                    <Badge variant="secondary" className="text-xs">Performance</Badge>
                  )}
                  {city.features.weather_correlation && (
                    <Badge variant="secondary" className="text-xs">Weather Data</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Select your city to see location-specific features like ward boundaries, 
          budget tracking, and representative contact information.
        </p>
      </div>
    </div>
  );
}

export default CitySelector;