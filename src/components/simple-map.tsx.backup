"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { getCityConfig, DEFAULT_CITY } from '@/lib/cities';

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
  const [mapInitialized, setMapInitialized] = useState(false);
  const [L, setL] = useState<any>(null);

  // Debug props changes
  useEffect(() => {
    console.log('🗺️ SimpleMap received props:', { 
      reportCount: reports.length, 
      selectedCity,
      sampleReport: reports[0],
      mapInitialized 
    });
  }, [reports, selectedCity, mapInitialized]);

  // Validate coordinates helper
  const validateCoordinates = (lat: number, lng: number) => {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn('Invalid coordinates:', { lat, lng });
      return false;
    }
    return true;
  };

  const updateVisualization = useCallback(async () => {
    try {
      if (!mapInstanceRef.current || !L || !mapInitialized) {
        console.log('⚠️ updateVisualization skipped:', { 
          mapExists: !!mapInstanceRef.current, 
          leafletLoaded: !!L,
          mapInitialized 
        });
        return;
      }

      console.log('🔄 Starting updateVisualization...');
      const zoom = currentZoomRef.current;

      // Validate reports data
      const validReports = reports.filter(report => 
        validateCoordinates(report.latitude, report.longitude)
      );

      console.log('📊 updateVisualization called with:', { 
        totalReports: reports.length,
        validReports: validReports.length,
        zoom,
        firstValidReport: validReports[0]
      });

      if (validReports.length === 0) {
        console.warn('No valid reports to display');
        return;
      }

      // Clear existing layers
      if (heatmapLayerRef.current) {
        mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }
      if (markerClusterRef.current) {
        mapInstanceRef.current.removeLayer(markerClusterRef.current);
        markerClusterRef.current = null;
      }

      // Clear all existing markers/layers
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer !== (mapInstanceRef.current as any)._tileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      console.log('🧹 Cleared existing layers');

      if (zoom <= 11) {
        // Heatmap for zoomed-out view
        try {
          const heatmapData = validReports.map(report => [
            report.latitude,
            report.longitude,
            Math.min((report.confirmations || 1) * 0.8, 1.0)
          ]);

          console.log('🔥 HEATMAP DEBUG START');
          console.log('🔥 validReports count:', validReports.length);
          console.log('🔥 Raw heatmap data:', JSON.stringify(heatmapData.slice(0, 3), null, 2));
          console.log('🔥 L.heatLayer exists:', !!L.heatLayer);
          console.log('🔥 Current zoom:', zoom);

          if (L.heatLayer && heatmapData.length > 0) {
            console.log('🔥 Creating heatmap layer...');
            
            // Create heatmap layer
            heatmapLayerRef.current = L.heatLayer(heatmapData, {
              radius: 25,
              blur: 15,
              maxZoom: 17,
              gradient: {
                0.2: '#3b82f6',
                0.4: '#10b981', 
                0.6: '#f59e0b',
                0.8: '#f97316',
                1.0: '#ef4444'
              }
            });

            console.log('🔥 Heatmap layer created:', !!heatmapLayerRef.current);
            
            // Add to map
            heatmapLayerRef.current.addTo(mapInstanceRef.current);
            console.log('✅ Heatmap layer added to map successfully');
            
            // Verify layer is on map
            const layersOnMap = [];
            mapInstanceRef.current.eachLayer((layer: any) => {
              layersOnMap.push(layer.constructor.name);
            });
            console.log('🔥 All layers on map:', layersOnMap);
            
          } else {
            console.error('❌ L.heatLayer not available or no data');
            console.error('❌ L.heatLayer exists:', !!L.heatLayer);
            console.error('❌ heatmapData.length:', heatmapData.length);
          }
        } catch (heatError) {
          console.error('💥 Heatmap creation error:', heatError);
          console.error('💥 Error stack:', heatError.stack);
        }

      } else if (zoom <= 14) {
        // Marker clusters for neighborhood view
        try {
          if (L.markerClusterGroup) {
            markerClusterRef.current = L.markerClusterGroup({
              maxClusterRadius: 50,
              disableClusteringAtZoom: 15,
              iconCreateFunction: function(cluster: any) {
                const count = cluster.getChildCount();
                let className = 'marker-cluster-small';
                
                if (count > 15) {
                  className = 'marker-cluster-large';
                } else if (count > 8) {
                  className = 'marker-cluster-medium';
                }
                
                return new L.DivIcon({
                  html: `<div><span>${count}</span></div>`,
                  className: `marker-cluster ${className}`,
                  iconSize: new L.Point(40, 40)
                });
              }
            });

            validReports.forEach((report, index) => {
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
              console.log(`➕ Added cluster marker ${index + 1}/${validReports.length}`);
            });

            mapInstanceRef.current.addLayer(markerClusterRef.current);
            console.log('✅ Marker cluster layer added successfully');
          } else {
            console.error('❌ L.markerClusterGroup not available');
          }
        } catch (clusterError) {
          console.error('💥 Marker cluster creation error:', clusterError);
        }

      } else {
        // Individual pins for street-level view
        try {
          let addedMarkers = 0;
          validReports.forEach((report, index) => {
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
            addedMarkers++;
            console.log(`➕ Added individual marker ${index + 1}/${validReports.length}`);
          });
          console.log(`✅ Added ${addedMarkers} individual markers successfully`);
        } catch (markerError) {
          console.error('💥 Individual marker creation error:', markerError);
        }
      }

      // Force map refresh
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          console.log('🔄 Map size invalidated');
        }
      }, 100);

    } catch (error) {
      console.error('💥 updateVisualization error:', error);
    }
  }, [reports, L, mapInitialized]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('🚀 Initializing map...');
        
        // Load Leaflet dynamically
        const leaflet = (await import('leaflet')).default;
        
        // Load heatmap plugin
        await import('leaflet.heat');
        
        // Load marker cluster plugin  
        const MarkerClusterGroup = (await import('leaflet.markercluster')).default;
        
        setL(leaflet);
        console.log('📦 Leaflet modules loaded successfully');
        
        // Fix marker icons
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        console.log('🔧 Marker icons fixed');

        const cityConfig = getCityConfig(selectedCity);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const map = leaflet.map(mapRef.current!, {
          center: cityConfig.center,
          zoom: cityConfig.zoom,
          zoomControl: true,
          attributionControl: true
        });
        
        mapInstanceRef.current = map;
        currentZoomRef.current = cityConfig.zoom;
        console.log('🗺️ Map instance created successfully', { 
          center: cityConfig.center, 
          zoom: cityConfig.zoom 
        });

        const tileLayer = leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        });
        
        tileLayer.addTo(map);
        (map as any)._tileLayer = tileLayer; // Store reference for layer clearing
        console.log('🎯 Map tiles added successfully');

        // Add zoom event handler
        map.on('zoomend', () => {
          const zoom = map.getZoom();
          currentZoomRef.current = zoom;
          console.log('🔍 Zoom changed to:', zoom);
          updateVisualization();
        });

        // Store map reference globally for debugging
        (window as any).currentMap = map;
        (window as any).leaflet = leaflet;
        
        setMapInitialized(true);
        console.log('✅ Map initialization completed successfully');
        
        // Initial visualization with fallback
        setTimeout(() => {
          updateVisualization();
          
          // Fallback: If no layers are visible after 2 seconds, force show simple markers
          setTimeout(() => {
            let visibleLayers = 0;
            mapInstanceRef.current.eachLayer((layer: any) => {
              if (layer.constructor.name !== 'TileLayer') {
                visibleLayers++;
              }
            });
            
            if (visibleLayers === 0 && reports.length > 0) {
              console.log('🚨 FALLBACK: No layers visible, adding simple markers');
              reports.forEach(report => {
                if (validateCoordinates(report.latitude, report.longitude)) {
                  const marker = leaflet.circleMarker([report.latitude, report.longitude], {
                    radius: 8,
                    fillColor: '#ef4444',
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                  }).addTo(mapInstanceRef.current);
                }
              });
            }
          }, 2000);
        }, 100);
        
      } catch (error) {
        console.error('💥 Error initializing map:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
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
        setMapInitialized(false);
      }
    };
  }, [selectedCity]);

  // Update visualization when reports change
  useEffect(() => {
    if (mapInitialized && reports.length > 0) {
      console.log('📈 Reports changed, updating visualization...');
      updateVisualization();
    }
  }, [reports, updateVisualization, mapInitialized]);

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
        
        /* Ensure map container has proper dimensions */
        .map-container {
          height: 24rem; /* 384px / h-96 */
          width: 100%;
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }
        
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
          border-radius: 1.5rem;
        }
      `}</style>
      <div 
        ref={mapRef} 
        className="map-container"
        style={{ 
          height: '384px', 
          width: '100%',
          minHeight: '384px',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}
      />
    </>
  );
}