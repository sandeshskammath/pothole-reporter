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

        // Add markers
        const markers: any[] = [];
        reports.forEach((report) => {
          const marker = L.marker([report.latitude, report.longitude], {
            icon: createCustomIcon(report.status)
          });

          const popupContent = `
            <div style="min-width: 200px;">
              <div style="margin-bottom: 8px;">
                <img 
                  src="${report.photo_url}" 
                  alt="Pothole" 
                  style="width: 100%; height: 128px; object-fit: cover; border-radius: 8px;"
                  onerror="this.src='/placeholder-image.svg'"
                />
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 14px; font-weight: 500;">Status:</span>
                  <span style="
                    padding: 4px 8px; 
                    border-radius: 12px; 
                    font-size: 12px; 
                    font-weight: 500;
                    ${report.status === 'reported' ? 'background-color: #fef2f2; color: #dc2626;' :
                      report.status === 'in_progress' ? 'background-color: #fefce8; color: #ca8a04;' :
                      'background-color: #f0fdf4; color: #16a34a;'}
                  ">
                    ${report.status.replace('_', ' ')}
                  </span>
                </div>
                ${report.notes ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">${report.notes}</p>` : ''}
                <p style="font-size: 12px; color: #9ca3af;">
                  Reported: ${new Date(report.created_at).toLocaleDateString()}
                </p>
                <p style="font-size: 12px; color: #9ca3af;">
                  Location: ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.addTo(map);
          markers.push(marker);
        });

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