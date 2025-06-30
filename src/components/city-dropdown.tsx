"use client";

import { useState } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { CITIES, getCityConfig } from '@/lib/cities';

interface CityDropdownProps {
  selectedCity: string;
  onCityChange: (cityId: string) => void;
  className?: string;
}

export function CityDropdown({ selectedCity, onCityChange, className }: CityDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedCityConfig = getCityConfig(selectedCity);

  const handleCitySelect = (cityId: string) => {
    onCityChange(cityId);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between min-w-[160px] bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white ${className}`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{selectedCityConfig.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-56 bg-white border border-gray-200 shadow-lg">
        {Object.entries(CITIES).map(([cityId, city]) => (
          <DropdownMenuItem
            key={cityId}
            onClick={() => handleCitySelect(cityId)}
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{city.name}</span>
                <span className="text-sm text-gray-500">{city.state}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Feature badges */}
              <div className="flex gap-1">
                {city.features.wards && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    Wards
                  </Badge>
                )}
                {city.features.districts && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    Districts
                  </Badge>
                )}
                {city.features.budget_tracking && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    Budget
                  </Badge>
                )}
              </div>
              
              {/* Check mark for selected city */}
              {selectedCity === cityId && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        {/* Info footer */}
        <div className="border-t border-gray-100 p-3">
          <p className="text-xs text-gray-500">
            Each city includes ward/district data, budget tracking, and representative contact features.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default CityDropdown;