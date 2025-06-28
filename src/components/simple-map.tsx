"use client";

import { useEffect, useRef } from 'react';

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

          // Create popup with Apple-style design matching the reference image
          const createPopupContent = (address?: string) => `
            <div style="
              min-width: 280px; 
              max-width: 320px; 
              background: white; 
              border-radius: 16px; 
              overflow: hidden;
              box-shadow: 0 4px 24px rgba(0,0,0,0.15);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
              <!-- Close button -->
              <div style="position: relative;">
                <img 
                  src="${report.photo_url}" 
                  alt="Pothole Report" 
                  style="
                    width: 100%; 
                    height: 160px; 
                    object-fit: cover;
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
                ">
                  <span style="color: white; font-size: 16px; font-weight: 500;">×</span>
                </div>
              </div>
              
              <!-- Content -->
              <div style="padding: 16px;">
                <!-- Location with icon -->
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px;">
                  <div style="
                    width: 20px;
                    height: 20px;
                    background: #007AFF;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 2px;
                  ">
                    <div style="
                      width: 6px;
                      height: 6px;
                      background: white;
                      border-radius: 50%;
                    "></div>
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

                <!-- Notes if available -->
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
                      <span style="font-size: 14px;">💬</span>
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

                <!-- Date and Status -->
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
                    <span style="font-size: 14px;">📅</span>
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