"use client";

import { useEffect, useRef, useState } from 'react';

interface PotholeReport {
  id: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  notes?: string;
  created_at: string;
  status: 'reported' | 'in_progress' | 'fixed';
  confirmations?: number;
}

interface FreshMapProps {
  reports: PotholeReport[];
  selectedCity?: string;
}

export default function FreshMap({ reports, selectedCity = 'chicago' }: FreshMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize basic map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      try {
        // Import Leaflet
        const L = (await import('leaflet')).default;
        
        // Fix default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Clean up existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Create map centered on Chicago
        const map = L.map(mapRef.current!, {
          center: [41.8781, -87.6298], // Chicago coordinates
          zoom: 11,
          zoomControl: true
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);

        console.log('✅ Fresh map initialized successfully');

      } catch (error) {
        console.error('❌ Map initialization failed:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Add markers when map is ready and we have data
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !reports.length) return;

    const addMarkers = async () => {
      try {
        const L = (await import('leaflet')).default;
        
        console.log('📍 Adding', reports.length, 'markers to map');

        // Clear existing markers
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // Add simple red circle markers
        reports.forEach((report, index) => {
          if (report.latitude && report.longitude) {
            const marker = L.circleMarker([report.latitude, report.longitude], {
              radius: 8,
              fillColor: '#ef4444',
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            });

            // Simple popup
            marker.bindPopup(`
              <div style="padding: 8px;">
                <strong>Report #${index + 1}</strong><br/>
                Status: ${report.status}<br/>
                ${report.notes ? `Notes: ${report.notes}<br/>` : ''}
                Date: ${new Date(report.created_at).toLocaleDateString()}
              </div>
            `);

            marker.addTo(mapInstanceRef.current);
          }
        });

        console.log('✅ Markers added successfully');

      } catch (error) {
        console.error('❌ Failed to add markers:', error);
      }
    };

    addMarkers();
  }, [mapReady, reports]);

  return (
    <div 
      ref={mapRef}
      style={{
        height: '400px',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
      className="border border-gray-300"
    />
  );
}