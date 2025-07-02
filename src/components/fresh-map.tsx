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

                // Modern user-focused popup design
                const statusDisplay = report.status.replace('_', ' ').toUpperCase();
                const statusColor = getStatusColor(report.status);
                const reportDate = new Date(report.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
                const coordinates = `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`;
                
                // Generate human-readable location from coordinates or notes
                const getLocationFromCoordinates = (lat, lng) => {
                  // India
                  if (lat >= 12.5 && lat <= 13.5 && lng >= 77.0 && lng <= 78.0) return 'Bangalore, India';
                  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.5) return 'New Delhi, India';
                  if (lat >= 18.8 && lat <= 19.3 && lng >= 72.7 && lng <= 73.1) return 'Mumbai, India';
                  
                  // USA
                  if (lat >= 41.5 && lat <= 42.2 && lng >= -88.0 && lng <= -87.0) return 'Chicago, IL';
                  if (lat >= 40.4 && lat <= 41.0 && lng >= -74.5 && lng <= -73.5) return 'New York City, NY';
                  if (lat >= 37.6 && lat <= 37.9 && lng >= -122.6 && lng <= -122.2) return 'San Francisco, CA';
                  if (lat >= 33.9 && lat <= 34.3 && lng >= -118.7 && lng <= -118.0) return 'Los Angeles, CA';
                  
                  // UK
                  if (lat >= 51.3 && lat <= 51.7 && lng >= -0.5 && lng <= 0.3) return 'London, UK';
                  
                  // Canada
                  if (lat >= 43.5 && lat <= 43.9 && lng >= -79.7 && lng <= -79.1) return 'Toronto, Canada';
                  
                  // Default to coordinates if no match
                  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                };
                
                // Extract location from notes if it contains location info, otherwise use coordinates
                let humanLocation;
                if (report.notes && (report.notes.includes('Avenue') || report.notes.includes('Street') || report.notes.includes('Road') || report.notes.includes('Park'))) {
                  // Extract location from notes if it seems to contain street/location info
                  humanLocation = report.notes.split(' - ')[0] || report.notes.split('.')[0].substring(0, 50);
                  if (humanLocation.length > 50) humanLocation = humanLocation.substring(0, 47) + '...';
                } else {
                  // Use coordinate-based location
                  humanLocation = getLocationFromCoordinates(report.latitude, report.longitude);
                }
                
                marker.bindPopup(`
                  <div style="
                    width: 280px; 
                    max-height: 350px; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                  ">
                    <!-- Header with human-readable location -->
                    <div style="
                      padding: 16px 20px 12px;
                      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    ">
                      <div style="
                        font-size: 17px; 
                        font-weight: 600; 
                        color: #1d1d1f; 
                        margin-bottom: 4px;
                        line-height: 1.3;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                      ">
                        📍 ${humanLocation}
                      </div>
                      <div style="
                        font-size: 11px; 
                        color: #86868b; 
                        margin-bottom: 6px;
                        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
                      ">${coordinates}</div>
                      <div style="
                        font-size: 13px; 
                        color: #86868b; 
                        margin-bottom: 8px;
                      ">Reported ${reportDate}</div>
                      <div style="
                        display: inline-flex;
                        align-items: center;
                        padding: 4px 12px;
                        background: ${statusColor}15;
                        border: 1px solid ${statusColor}30;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 500;
                        color: ${statusColor};
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      ">
                        <div style="
                          width: 6px; 
                          height: 6px; 
                          background: ${statusColor}; 
                          border-radius: 50%; 
                          margin-right: 6px;
                        "></div>
                        ${statusDisplay}
                      </div>
                    </div>

                    <!-- Image Section -->
                    ${report.photo_url ? `
                      <div style="position: relative; height: 140px; overflow: hidden;">
                        <img src="${report.photo_url}" 
                             alt="Pothole photo" 
                             style="
                               width: 100%; 
                               height: 100%; 
                               object-fit: cover;
                               transition: transform 0.3s ease;
                             "
                             onerror="this.parentElement.innerHTML='<div style=\\'display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f7; color: #86868b; font-size: 14px;\\'>Image not available</div>';">
                      </div>
                    ` : ''}

                    <!-- Content Section -->
                    <div style="padding: 16px 20px 20px; max-height: 140px; overflow-y: auto;">
                      ${report.notes ? `
                        <div>
                          <div style="
                            font-size: 14px; 
                            font-weight: 600; 
                            color: #1d1d1f; 
                            margin-bottom: 6px;
                          ">Notes</div>
                          <div style="
                            font-size: 14px; 
                            color: #424245; 
                            line-height: 1.5;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                          ">${report.notes}</div>
                        </div>
                      ` : ''}
                      
                      ${report.confirmations ? `
                        <div style="
                          margin-top: ${report.notes ? '16px' : '0'};
                          padding-top: ${report.notes ? '12px' : '0'};
                          border-top: ${report.notes ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'};
                          font-size: 12px;
                          color: #86868b;
                          text-align: center;
                        ">
                          ${report.confirmations} community confirmations
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `, {
                  maxWidth: 280,
                  maxHeight: 320,
                  className: 'modern-popup'
                });

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

              // Modern user-focused popup design
              const statusDisplay = report.status.replace('_', ' ').toUpperCase();
              const statusColor = getStatusColor(report.status);
              const reportDate = new Date(report.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              });
              const coordinates = `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`;
              
              // Generate human-readable location from coordinates or notes
              const getLocationFromCoordinates = (lat, lng) => {
                // India
                if (lat >= 12.5 && lat <= 13.5 && lng >= 77.0 && lng <= 78.0) return 'Bangalore, India';
                if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.5) return 'New Delhi, India';
                if (lat >= 18.8 && lat <= 19.3 && lng >= 72.7 && lng <= 73.1) return 'Mumbai, India';
                
                // USA
                if (lat >= 41.5 && lat <= 42.2 && lng >= -88.0 && lng <= -87.0) return 'Chicago, IL';
                if (lat >= 40.4 && lat <= 41.0 && lng >= -74.5 && lng <= -73.5) return 'New York City, NY';
                if (lat >= 37.6 && lat <= 37.9 && lng >= -122.6 && lng <= -122.2) return 'San Francisco, CA';
                if (lat >= 33.9 && lat <= 34.3 && lng >= -118.7 && lng <= -118.0) return 'Los Angeles, CA';
                
                // UK
                if (lat >= 51.3 && lat <= 51.7 && lng >= -0.5 && lng <= 0.3) return 'London, UK';
                
                // Canada
                if (lat >= 43.5 && lat <= 43.9 && lng >= -79.7 && lng <= -79.1) return 'Toronto, Canada';
                
                // Default to coordinates if no match
                return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              };
              
              // Extract location from notes if it contains location info, otherwise use coordinates
              let humanLocation;
              if (report.notes && (report.notes.includes('Avenue') || report.notes.includes('Street') || report.notes.includes('Road') || report.notes.includes('Park'))) {
                // Extract location from notes if it seems to contain street/location info
                humanLocation = report.notes.split(' - ')[0] || report.notes.split('.')[0].substring(0, 50);
                if (humanLocation.length > 50) humanLocation = humanLocation.substring(0, 47) + '...';
              } else {
                // Use coordinate-based location
                humanLocation = getLocationFromCoordinates(report.latitude, report.longitude);
              }
              
              marker.bindPopup(`
                <div style="
                  width: 280px; 
                  max-height: 350px; 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: rgba(255, 255, 255, 0.95);
                  backdrop-filter: blur(20px);
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                  border: 1px solid rgba(255, 255, 255, 0.2);
                ">
                  <!-- Header with human-readable location -->
                  <div style="
                    padding: 16px 20px 12px;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                  ">
                    <div style="
                      font-size: 17px; 
                      font-weight: 600; 
                      color: #1d1d1f; 
                      margin-bottom: 4px;
                      line-height: 1.3;
                      display: flex;
                      align-items: center;
                      gap: 6px;
                    ">
                      📍 ${humanLocation}
                    </div>
                    <div style="
                      font-size: 11px; 
                      color: #86868b; 
                      margin-bottom: 6px;
                      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
                    ">${coordinates}</div>
                    <div style="
                      font-size: 13px; 
                      color: #86868b; 
                      margin-bottom: 8px;
                    ">Reported ${reportDate}</div>
                    <div style="
                      display: inline-flex;
                      align-items: center;
                      padding: 4px 12px;
                      background: ${statusColor}15;
                      border: 1px solid ${statusColor}30;
                      border-radius: 20px;
                      font-size: 11px;
                      font-weight: 500;
                      color: ${statusColor};
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                    ">
                      <div style="
                        width: 6px; 
                        height: 6px; 
                        background: ${statusColor}; 
                        border-radius: 50%; 
                        margin-right: 6px;
                      "></div>
                      ${statusDisplay}
                    </div>
                  </div>

                  <!-- Image Section -->
                  ${report.photo_url ? `
                    <div style="position: relative; height: 140px; overflow: hidden;">
                      <img src="${report.photo_url}" 
                           alt="Pothole photo" 
                           style="
                             width: 100%; 
                             height: 100%; 
                             object-fit: cover;
                             transition: transform 0.3s ease;
                           "
                           onerror="this.parentElement.innerHTML='<div style=\\'display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f7; color: #86868b; font-size: 14px;\\'>Image not available</div>';">
                    </div>
                  ` : ''}

                  <!-- Content Section -->
                  <div style="padding: 16px 20px 20px; max-height: 140px; overflow-y: auto;">
                    ${report.notes ? `
                      <div>
                        <div style="
                          font-size: 14px; 
                          font-weight: 600; 
                          color: #1d1d1f; 
                          margin-bottom: 6px;
                        ">Notes</div>
                        <div style="
                          font-size: 14px; 
                          color: #424245; 
                          line-height: 1.5;
                          word-wrap: break-word;
                          overflow-wrap: break-word;
                        ">${report.notes}</div>
                      </div>
                    ` : ''}
                    
                    ${report.confirmations ? `
                      <div style="
                        margin-top: ${report.notes ? '16px' : '0'};
                        padding-top: ${report.notes ? '12px' : '0'};
                        border-top: ${report.notes ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'};
                        font-size: 12px;
                        color: #86868b;
                        text-align: center;
                      ">
                        ${report.confirmations} community confirmations
                      </div>
                    ` : ''}
                  </div>
                </div>
              `, {
                maxWidth: 280,
                maxHeight: 320,
                className: 'modern-popup'
              });

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
        
        /* Modern popup styling */
        .modern-popup .leaflet-popup-content-wrapper {
          background: transparent;
          border-radius: 16px;
          box-shadow: none;
          border: none;
          padding: 0;
          overflow: hidden;
        }
        
        .modern-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
          line-height: 1.4;
          width: 280px !important;
          max-height: 320px;
          overflow: hidden;
        }
        
        .modern-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .modern-popup .leaflet-popup-close-button {
          position: absolute;
          top: 12px;
          right: 16px;
          width: 24px;
          height: 24px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #86868b;
          text-decoration: none;
          z-index: 10;
          transition: all 0.2s ease;
        }
        
        .modern-popup .leaflet-popup-close-button:hover {
          background: rgba(0, 0, 0, 0.2);
          color: #424245;
          transform: scale(1.05);
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