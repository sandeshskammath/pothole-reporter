"use client";

import { useEffect, useRef } from 'react';
import { getCityConfig, DEFAULT_CITY } from '@/lib/cities';

interface PotholeReport {
  id: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  notes?: string;
  created_at: string;
  status: 'new' | 'confirmed' | 'fixed';
}

interface SimpleMapProps {
  reports: PotholeReport[];
  selectedCity?: string;
}

export default function SimpleMap({ reports, selectedCity = DEFAULT_CITY }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Get city configuration
        const cityConfig = getCityConfig(selectedCity);
        
        // Create map with city-specific center and zoom
        const map = L.map(mapRef.current!).setView(cityConfig.center, cityConfig.zoom);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Set city boundaries (max bounds to keep users focused on the city)
        const bounds = L.latLngBounds(cityConfig.bounds);
        map.setMaxBounds(bounds);
        map.setMinZoom(cityConfig.zoom - 2); // Allow some zoom out but not too much

        // Create custom icons
        const createCustomIcon = (status: string) => {
          const colors = {
            new: '#ef4444',
            confirmed: '#eab308', 
            fixed: '#22c55e',
          };
          
          const color = colors[status as keyof typeof colors] || colors.new;
          
          return L.divIcon({
            html: `
              <div style="
                background-color: ${color};
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background-color: white;
                  border-radius: 50%;
                "></div>
              </div>
            `,
            className: 'custom-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
        };

        // Function to get readable address from coordinates
        const getReadableAddress = async (lat: number, lng: number): Promise<string> => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.display_name) {
                // Extract meaningful parts: house_number, road, neighbourhood, city
                const addr = data.address || {};
                const parts = [
                  addr.house_number,
                  addr.road || addr.street,
                  addr.neighbourhood || addr.suburb || addr.district,
                  addr.city || addr.town || addr.village
                ].filter(Boolean);
                
                return parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(',');
              }
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
          }
          return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        };

        // Add markers
        const markers: any[] = [];
        for (const report of reports) {
          const marker = L.marker([report.latitude, report.longitude], {
            icon: createCustomIcon(report.status)
          });

          // Create popup with Apple-style design - single container, no nested containers
          const createPopupContent = (address?: string) => `
            <div style="position: relative; margin: -10px -10px 0 -10px;">
              <img 
                src="${report.photo_url}" 
                alt="Pothole Report" 
                style="
                  width: 100%; 
                  height: 160px; 
                  object-fit: cover;
                  border-radius: 12px 12px 0 0;
                "
                onerror="this.src='/placeholder-image.svg'"
              />
              <div style="
                position: absolute;
                top: 12px;
                right: 12px;
                width: 28px;
                height: 28px;
                background: rgba(0,0,0,0.4);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                backdrop-filter: blur(8px);
              " onclick="window.currentMap && window.currentMap.closePopup()">
                <span style="color: white; font-size: 16px; font-weight: 500;">×</span>
              </div>
            </div>
            <div style="padding: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px;">
                <div style="
                  width: 20px;
                  height: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-top: 2px;
                ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div style="flex: 1;">
                  <h3 style="
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1d1d1f;
                    line-height: 1.3;
                    margin-bottom: 2px;
                  ">
                    ${address || 'Loading address...'}
                  </h3>
                  <p style="
                    margin: 0;
                    font-size: 13px;
                    color: #86868b;
                    font-family: 'SF Mono', Monaco, monospace;
                  ">
                    ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              ${report.notes ? `
                <div style="
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                  margin-bottom: 12px;
                ">
                  <div style="
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 2px;
                  ">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86868b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <p style="
                    margin: 0;
                    font-size: 14px;
                    color: #1d1d1f;
                    line-height: 1.4;
                  ">
                    ${report.notes}
                  </p>
                </div>
              ` : ''}
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 0;
              ">
                <div style="
                  width: 20px;
                  height: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86868b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <span style="
                  font-size: 14px;
                  color: #86868b;
                  margin-right: auto;
                ">
                  ${new Date(report.created_at).toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
                <span style="
                  padding: 4px 10px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: 600;
                  text-transform: capitalize;
                  ${report.status === 'new' ? 'background-color: #ffebee; color: #d32f2f;' :
                    report.status === 'confirmed' ? 'background-color: #fff8e1; color: #f57c00;' :
                    'background-color: #e8f5e8; color: #2e7d32;'}
                ">
                  ${report.status}
                </span>
              </div>
            </div>
          `;

          // Set initial popup content with explicit HTML options
          marker.bindPopup(createPopupContent(), {
            maxWidth: 320,
            minWidth: 280,
            className: 'custom-popup',
            closeButton: false // Hide Leaflet's default close button
          });
          
          // When popup opens, fetch and update address
          marker.on('popupopen', async () => {
            const address = await getReadableAddress(report.latitude, report.longitude);
            marker.setPopupContent(createPopupContent(address));
          });

          marker.addTo(map);
          markers.push(marker);
        }

        // Fit bounds if we have markers
        if (markers.length > 0) {
          const group = new L.FeatureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.1));
        }

        mapInstanceRef.current = map;
        // Store map reference globally for close button access
        (window as any).currentMap = map;
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [reports, selectedCity]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-lg border"
      style={{ minHeight: '384px' }}
    />
  );
}