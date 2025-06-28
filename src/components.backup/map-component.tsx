"use client";

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PotholeReport {
  id: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  notes?: string;
  created_at: string;
  status: 'reported' | 'in_progress' | 'fixed';
}

interface MapComponentProps {
  reports: PotholeReport[];
}

// Custom markers for different statuses
const createCustomIcon = (status: string) => {
  const colors = {
    reported: '#ef4444', // red
    in_progress: '#eab308', // yellow
    fixed: '#22c55e', // green
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

function MapUpdater({ reports }: { reports: PotholeReport[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (reports.length > 0 && map) {
      try {
        const group = new L.FeatureGroup(
          reports.map(report => 
            L.marker([report.latitude, report.longitude])
          )
        );
        map.fitBounds(group.getBounds().pad(0.1));
      } catch (error) {
        console.log('Map bounds error:', error);
      }
    }
  }, [map, reports]);
  
  return null;
}

export default function MapComponent({ reports }: MapComponentProps) {
  const mapRef = useRef<L.Map>(null);
  
  // Default center (San Francisco)
  const defaultCenter: [number, number] = [37.7749, -122.4194];
  
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
{reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createCustomIcon(report.status)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="space-y-2">
                  <img 
                    src={report.photo_url} 
                    alt="Pothole" 
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'reported' ? 'bg-red-100 text-red-800' :
                        report.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>
                    {report.notes && (
                      <p className="text-sm text-gray-600 mb-2">{report.notes}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Reported: {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Location: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapUpdater reports={reports} />
      </MapContainer>
    </div>
  );
}