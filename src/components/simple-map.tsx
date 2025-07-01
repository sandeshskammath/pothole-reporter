"use client";

import { useEffect, useRef, useCallback } from 'react';
import { getCityConfig, DEFAULT_CITY } from '@/lib/cities';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

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

interface SimpleMapProps {
  reports: PotholeReport[];
  selectedCity?: string;
}

export default function SimpleMap({ reports, selectedCity = DEFAULT_CITY }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const heatmapLayerRef = useRef<any>(null);
  const markerClusterRef = useRef<any>(null);
  const currentZoomRef = useRef<number>(10);

  // Debug props changes
  useEffect(() => {
    console.log('🗺️ SimpleMap received props:', { 
      reportCount: reports.length, 
      selectedCity,
      sampleReport: reports[0],
      mapInitialized: !!mapInstanceRef.current 
    });
  }, [reports, selectedCity]);

  const updateVisualization = useCallback(async () => {
    try {
      if (!mapInstanceRef.current || typeof window === 'undefined') {
        console.log('⚠️ updateVisualization skipped:', { 
          mapExists: !!mapInstanceRef.current, 
          windowDefined: typeof window !== 'undefined' 
        });
        return;
      }

      console.log('🔄 Starting updateVisualization...');
      const L = window.L || (await import('leaflet')).default;
      await import('leaflet.heat');
      const zoom = currentZoomRef.current;

      // Debug logging
      console.log('📊 updateVisualization called with:', { 
        reportsCount: reports.length, 
        zoom, 
        LdefinedOnWindow: !!window.L,
        firstReport: reports[0]
      });

      // Clear existing layers
    if (heatmapLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }
    if (markerClusterRef.current) {
      mapInstanceRef.current.removeLayer(markerClusterRef.current);
      markerClusterRef.current.clearLayers();
    }

    if (zoom <= 11) {
      // Show heatmap for zoomed-out view (city/regional level)
      const heatmapData = reports.map(report => [
        report.latitude,
        report.longitude,
        Math.min((report.confirmations || 1) * 0.8, 1.0) // Intensity based on confirmations
      ]);

      if (heatmapData.length > 0) {
        heatmapLayerRef.current = (L as any).heatLayer(heatmapData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: {
            0.2: '#3b82f6', // Blue for low density
            0.4: '#10b981', // Green for low-medium
            0.6: '#f59e0b', // Yellow for medium
            0.8: '#f97316', // Orange for medium-high
            1.0: '#ef4444'  // Red for high density
          }
        }).addTo(mapInstanceRef.current);
      }

    } else if (zoom <= 14) {
      // Show marker clusters for neighborhood view
      reports.forEach(report => {
        const getMarkerColor = (status: string) => {
          switch (status) {
            case 'reported': return '#ef4444';
            case 'in_progress': return '#f97316';
            case 'fixed': return '#22c55e';
            default: return '#6b7280';
          }
        };

        const marker = L.circleMarker([report.latitude, report.longitude], {
          radius: 6,
          fillColor: getMarkerColor(report.status),
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });

        const confirmationText = report.confirmations ? ` (${report.confirmations} confirmations)` : '';
        const popupContent = `
          <div class="p-3 min-w-[200px]">
            <div class="font-semibold mb-2 text-sm">Status: ${report.status.replace('_', ' ').toUpperCase()}</div>
            ${report.notes ? `<div class="text-sm text-gray-600 mb-2 leading-relaxed">${report.notes}</div>` : ''}
            <div class="text-xs text-gray-500 border-t pt-2">
              <div>Reported: ${new Date(report.created_at).toLocaleDateString()}</div>
              ${confirmationText ? `<div>Community Support${confirmationText}</div>` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markerClusterRef.current.addLayer(marker);
      });

      mapInstanceRef.current.addLayer(markerClusterRef.current);

    } else {
      // Show individual pins for street-level view
      reports.forEach(report => {
        const getMarkerColor = (status: string) => {
          switch (status) {
            case 'reported': return '#ef4444';
            case 'in_progress': return '#f97316';
            case 'fixed': return '#22c55e';
            default: return '#6b7280';
          }
        };

        const marker = L.circleMarker([report.latitude, report.longitude], {
          radius: 8,
          fillColor: getMarkerColor(report.status),
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });

        const confirmationText = report.confirmations ? ` (${report.confirmations} confirmations)` : '';
        const popupContent = `
          <div class="p-3 min-w-[200px]">
            <div class="font-semibold mb-2">Status: ${report.status.replace('_', ' ').toUpperCase()}</div>
            ${report.notes ? `<div class="text-sm text-gray-600 mb-3 leading-relaxed">${report.notes}</div>` : ''}
            <div class="text-xs text-gray-500 border-t pt-2">
              <div>Reported: ${new Date(report.created_at).toLocaleDateString()}</div>
              ${confirmationText ? `<div>Community Support${confirmationText}</div>` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(mapInstanceRef.current);
      });
    }
    } catch (error) {
      console.error('💥 updateVisualization error:', error);
    }
  }, [reports]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('🚀 Initializing map...');
        const L = (await import('leaflet')).default;
        await import('leaflet.heat');
        const MarkerClusterGroup = (await import('leaflet.markercluster')).default;
        console.log('📦 Leaflet modules loaded successfully');
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const cityConfig = getCityConfig(selectedCity);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const map = L.map(mapRef.current!).setView(cityConfig.center, cityConfig.zoom);
        mapInstanceRef.current = map;
        currentZoomRef.current = cityConfig.zoom;
        console.log('🗺️ Map instance created successfully', { center: cityConfig.center, zoom: cityConfig.zoom });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        console.log('🎯 Map tiles added successfully');

        // Set city boundaries (temporarily disabled to show all data)
        // const bounds = L.latLngBounds(cityConfig.bounds);
        // map.setMaxBounds(bounds);
        // map.setMinZoom(cityConfig.zoom - 2);

        // Initialize marker cluster group with custom styling
        markerClusterRef.current = new MarkerClusterGroup({
          maxClusterRadius: 50,
          iconCreateFunction: function(cluster: any) {
            const count = cluster.getChildCount();
            let className = 'marker-cluster-small';
            
            // Color clusters based on density
            if (count > 15) {
              className = 'marker-cluster-large'; // Red for high density
            } else if (count > 8) {
              className = 'marker-cluster-medium'; // Orange for medium density
            }
            
            return new L.DivIcon({
              html: `<div><span>${count}</span></div>`,
              className: `marker-cluster ${className}`,
              iconSize: new L.Point(40, 40)
            });
          }
        });

        // Add zoom-based layer switching
        map.on('zoomend', () => {
          const zoom = map.getZoom();
          currentZoomRef.current = zoom;
          updateVisualization();
        });

        // Store map reference globally
        (window as any).currentMap = map;
        console.log('✅ Map initialization completed successfully');
      } catch (error) {
        console.error('💥 Error initializing map:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          mapRef: !!mapRef.current,
          selectedCity,
          windowDefined: typeof window !== 'undefined'
        });
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedCity, updateVisualization]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    updateVisualization();
  }, [reports, updateVisualization]);

  return (
    <>
      <style jsx global>{`
        .marker-cluster-small {
          background-color: rgba(59, 130, 246, 0.6);
          border: 2px solid rgba(59, 130, 246, 0.8);
        }
        .marker-cluster-medium {
          background-color: rgba(249, 115, 22, 0.6);
          border: 2px solid rgba(249, 115, 22, 0.8);
        }
        .marker-cluster-large {
          background-color: rgba(239, 68, 68, 0.6);
          border: 2px solid rgba(239, 68, 68, 0.8);
        }
        .marker-cluster {
          border-radius: 50%;
          text-align: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
        }
        .marker-cluster div {
          width: 40px;
          height: 40px;
          margin-left: 5px;
          margin-top: 5px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      <div ref={mapRef} className="w-full h-96 rounded-3xl border border-white/10 overflow-hidden" />
    </>
  );
}