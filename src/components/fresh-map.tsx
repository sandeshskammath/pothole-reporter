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
  const heatmapLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(11);

  // Initialize basic map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      try {
        // Import Leaflet and heatmap plugin
        const L = (await import('leaflet')).default;
        await import('leaflet.heat');
        
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
        setCurrentZoom(11);
        setMapReady(true);

        // Add zoom event listener
        map.on('zoomend', () => {
          const zoom = map.getZoom();
          setCurrentZoom(zoom);
          console.log('🔍 Zoom changed to:', zoom);
        });

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

  // Update visualization based on zoom level
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !reports.length) return;

    const updateVisualization = async () => {
      try {
        const L = (await import('leaflet')).default;
        
        console.log('🔄 Updating visualization, zoom:', currentZoom);
        
        // Debug: Show status distribution
        const statusCounts = reports.reduce((acc, report) => {
          acc[report.status] = (acc[report.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('📊 Status distribution:', statusCounts);

        // Clear existing layers
        if (heatmapLayerRef.current) {
          mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
          heatmapLayerRef.current = null;
        }
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        if (currentZoom <= 10) {
          // Show heatmap for zoomed out view
          console.log('🔥 Creating heatmap for zoom level', currentZoom);
          
          const heatmapData = reports.map(report => [
            report.latitude,
            report.longitude,
            1.0 // Basic intensity
          ]);

          if ((L as any).heatLayer && heatmapData.length > 0) {
            heatmapLayerRef.current = (L as any).heatLayer(heatmapData, {
              radius: 20,
              blur: 15,
              maxZoom: 17,
              gradient: {
                0.4: 'blue',
                0.65: 'lime', 
                1.0: 'red'
              }
            });
            
            heatmapLayerRef.current.addTo(mapInstanceRef.current);
            console.log('✅ Heatmap added successfully');
          } else {
            console.log('❌ Heatmap not available, showing markers instead');
          }
        } else {
          // Show individual markers for zoomed in view
          console.log('📍 Creating individual markers for zoom level', currentZoom);

          // Add colored circle markers based on status
          reports.forEach((report, index) => {
            if (report.latitude && report.longitude) {
              // Get color based on status
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'reported': return '#ef4444'; // Red
                  case 'in_progress': return '#f97316'; // Orange
                  case 'fixed': return '#22c55e'; // Green
                  default: return '#6b7280'; // Gray fallback
                }
              };

              const marker = L.circleMarker([report.latitude, report.longitude], {
                radius: 8,
                fillColor: getStatusColor(report.status),
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
              });

              // Enhanced popup with status color
              const statusDisplay = report.status.replace('_', ' ').toUpperCase();
              marker.bindPopup(`
                <div style="padding: 12px; min-width: 200px;">
                  <strong>Report #${index + 1}</strong><br/>
                  <span style="color: ${getStatusColor(report.status)}; font-weight: bold;">
                    Status: ${statusDisplay}
                  </span><br/>
                  ${report.notes ? `<br/><strong>Notes:</strong> ${report.notes}<br/>` : ''}
                  <br/><strong>Date:</strong> ${new Date(report.created_at).toLocaleDateString()}
                  ${report.confirmations ? `<br/><strong>Confirmations:</strong> ${report.confirmations}` : ''}
                </div>
              `);

              marker.addTo(mapInstanceRef.current);
            }
          });

          console.log('✅ Markers added successfully');
        }

      } catch (error) {
        console.error('❌ Failed to update visualization:', error);
      }
    };

    updateVisualization();
  }, [mapReady, reports, currentZoom]);

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