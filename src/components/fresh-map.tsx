"use client";

import { useEffect, useRef, useState } from 'react';
import { getCityConfig } from '@/lib/cities';

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
  const markerClusterRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(11);

  // Initialize basic map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      try {
        // Import Leaflet and plugins
        const L = (await import('leaflet')).default;
        await import('leaflet.heat');
        await import('leaflet.markercluster');
        
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

        // Get city configuration
        const cityConfig = getCityConfig(selectedCity);
        
        // Create map centered on selected city
        const map = L.map(mapRef.current!, {
          center: cityConfig.center,
          zoom: cityConfig.zoom,
          zoomControl: true
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        setCurrentZoom(cityConfig.zoom);
        setMapReady(true);

        // Add zoom event listener
        map.on('zoomend', () => {
          const zoom = map.getZoom();
          setCurrentZoom(zoom);
          console.log('🔍 Zoom changed to:', zoom);
        });

        console.log('✅ Fresh map initialized successfully for city:', selectedCity);

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
  }, [selectedCity]);

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
        if (markerClusterRef.current) {
          mapInstanceRef.current.removeLayer(markerClusterRef.current);
          markerClusterRef.current = null;
        }
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        if (currentZoom <= 8) {
          // Show heatmap for zoomed out view
          console.log('🔥 Creating heatmap for zoom level', currentZoom);
          
          const heatmapData = reports.map(report => [
            report.latitude,
            report.longitude,
            Math.max(0.5, (report.confirmations || 1) * 0.3) // Higher intensity for confirmed reports
          ]);

          console.log('🔥 Heatmap data sample:', heatmapData.slice(0, 3));
          console.log('🔥 Heatmap data count:', heatmapData.length);

          if ((L as any).heatLayer && heatmapData.length > 0) {
            heatmapLayerRef.current = (L as any).heatLayer(heatmapData, {
              radius: 35,        // Increased from 20 for larger heat spots
              blur: 25,          // Increased from 15 for smoother blending
              maxZoom: 17,
              minOpacity: 0.4,   // Minimum opacity to ensure visibility
              gradient: {
                0.2: '#0066ff',  // Bright blue
                0.4: '#00ff66',  // Bright green 
                0.6: '#ffff00',  // Yellow
                0.8: '#ff6600',  // Orange
                1.0: '#ff0000'   // Bright red
              }
            });
            
            heatmapLayerRef.current.addTo(mapInstanceRef.current);
            console.log('✅ Heatmap added successfully');
          } else {
            console.log('❌ Heatmap not available, showing markers instead');
          }
        } else if (currentZoom <= 12) {
          // Show marker clusters for mid-zoom view
          console.log('🎯 Creating marker clusters for zoom level', currentZoom);

          if ((L as any).markerClusterGroup) {
            markerClusterRef.current = (L as any).markerClusterGroup({
              maxClusterRadius: 50,
              disableClusteringAtZoom: 13,
              iconCreateFunction: function(cluster: any) {
                const count = cluster.getChildCount();
                let className = 'marker-cluster-small';
                let size = 30;
                
                if (count > 15) {
                  className = 'marker-cluster-large';
                  size = 50;
                } else if (count > 8) {
                  className = 'marker-cluster-medium';
                  size = 40;
                }
                
                return new L.DivIcon({
                  html: `<div><span>${count}</span></div>`,
                  className: `marker-cluster ${className}`,
                  iconSize: new L.Point(size, size)
                });
              }
            });

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
                  radius: 6,
                  fillColor: getStatusColor(report.status),
                  color: '#ffffff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                });

                // Enhanced popup with image and status color
                const statusDisplay = report.status.replace('_', ' ').toUpperCase();
                marker.bindPopup(`
                  <div style="padding: 12px; min-width: 250px; max-width: 300px;">
                    <strong>Report #${index + 1}</strong><br/>
                    <span style="color: ${getStatusColor(report.status)}; font-weight: bold;">
                      Status: ${statusDisplay}
                    </span><br/>
                    ${report.photo_url ? `
                      <div style="margin: 8px 0;">
                        <img src="${report.photo_url}" 
                             alt="Pothole photo" 
                             style="width: 100%; max-width: 200px; height: auto; border-radius: 4px; border: 1px solid #ddd;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div style="display: none; padding: 8px; background: #f5f5f5; border-radius: 4px; text-align: center; color: #666; font-size: 12px;">
                          Image not available
                        </div>
                      </div>
                    ` : ''}
                    ${report.notes ? `<div style="margin: 8px 0;"><strong>Notes:</strong><br/>${report.notes}</div>` : ''}
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                      <strong>Date:</strong> ${new Date(report.created_at).toLocaleDateString()}
                      ${report.confirmations ? `<br/><strong>Confirmations:</strong> ${report.confirmations}` : ''}
                    </div>
                  </div>
                `);

                markerClusterRef.current.addLayer(marker);
              }
            });

            mapInstanceRef.current.addLayer(markerClusterRef.current);
            console.log('✅ Marker clusters added successfully');
          } else {
            console.log('❌ MarkerClusterGroup not available');
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

              // Enhanced popup with image and status color
              const statusDisplay = report.status.replace('_', ' ').toUpperCase();
              marker.bindPopup(`
                <div style="padding: 12px; min-width: 250px; max-width: 300px;">
                  <strong>Report #${index + 1}</strong><br/>
                  <span style="color: ${getStatusColor(report.status)}; font-weight: bold;">
                    Status: ${statusDisplay}
                  </span><br/>
                  ${report.photo_url ? `
                    <div style="margin: 8px 0;">
                      <img src="${report.photo_url}" 
                           alt="Pothole photo" 
                           style="width: 100%; max-width: 200px; height: auto; border-radius: 4px; border: 1px solid #ddd;"
                           onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                      <div style="display: none; padding: 8px; background: #f5f5f5; border-radius: 4px; text-align: center; color: #666; font-size: 12px;">
                        Image not available
                      </div>
                    </div>
                  ` : ''}
                  ${report.notes ? `<div style="margin: 8px 0;"><strong>Notes:</strong><br/>${report.notes}</div>` : ''}
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                    <strong>Date:</strong> ${new Date(report.created_at).toLocaleDateString()}
                    ${report.confirmations ? `<br/><strong>Confirmations:</strong> ${report.confirmations}` : ''}
                  </div>
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
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-cluster div {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Enhanced popup styling */
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        
        .leaflet-popup img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
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
    </>
  );
}