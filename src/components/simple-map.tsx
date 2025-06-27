"use client";

import { useEffect, useRef } from 'react';

interface PotholeReport {
  id: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  notes?: string;
  created_at: string;
  status: 'reported' | 'in_progress' | 'fixed';
}

interface SimpleMapProps {
  reports: PotholeReport[];
}

export default function SimpleMap({ reports }: SimpleMapProps) {
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

        // Create map
        const map = L.map(mapRef.current!).setView([37.7749, -122.4194], 13);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Create custom icons
        const createCustomIcon = (status: string) => {
          const colors = {
            reported: '#ef4444',
            in_progress: '#eab308', 
            fixed: '#22c55e',
          };
          
          const color = colors[status as keyof typeof colors] || colors.reported;
          
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

          // Create popup with loading state initially
          const createPopupContent = (address?: string) => `
            <div style="min-width: 240px; max-width: 300px;">
              <div style="margin-bottom: 12px;">
                <img 
                  src="${report.photo_url}" 
                  alt="Pothole" 
                  style="width: 100%; height: 128px; object-fit: cover; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                  onerror="this.src='/placeholder-image.svg'"
                />
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 14px; font-weight: 600; color: #374151;">Status:</span>
                  <span style="
                    padding: 4px 12px; 
                    border-radius: 16px; 
                    font-size: 12px; 
                    font-weight: 600;
                    ${report.status === 'reported' ? 'background-color: #fef2f2; color: #dc2626;' :
                      report.status === 'in_progress' ? 'background-color: #fefce8; color: #ca8a04;' :
                      'background-color: #f0fdf4; color: #16a34a;'}
                  ">
                    ${report.status.replace('_', ' ')}
                  </span>
                </div>
                ${report.notes ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 10px; line-height: 1.4;">${report.notes}</p>` : ''}
                <div style="margin-bottom: 8px;">
                  <p style="font-size: 13px; color: #9ca3af; margin-bottom: 2px;">
                    📅 Reported: ${new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
                  <p style="font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                    📍 ${address || 'Loading address...'}
                  </p>
                  <p style="font-size: 11px; color: #9ca3af; font-family: monospace;">
                    ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          `;

          // Set initial popup content
          marker.bindPopup(createPopupContent());
          
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
  }, [reports]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-lg border"
      style={{ minHeight: '384px' }}
    />
  );
}