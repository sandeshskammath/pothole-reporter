"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Dynamically import map to avoid SSR issues
const Map = dynamic(() => import('./simple-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

interface PotholeReport {
  id: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  notes?: string;
  created_at: string;
  status: 'new' | 'confirmed' | 'fixed';
}

export function PotholeMap() {
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchReports = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        
        if (showRefreshToast) {
          toast({
            title: "Map updated",
            description: `Found ${data.reports?.length || 0} pothole reports`,
          });
        }
      } else {
        throw new Error('Failed to fetch reports');
      }
    } catch (error) {
      toast({
        title: "Error loading reports",
        description: "Unable to load pothole data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
    
    // Set up auto-refresh every 30 seconds to catch new reports
    const interval = setInterval(() => {
      fetchReports(false); // Silent refresh
    }, 30000);
    
    // Listen for new pothole reports and refresh immediately
    const handlePotholeReported = () => {
      fetchReports(false); // Silent refresh when new report is submitted
    };
    
    window.addEventListener('potholeReported', handlePotholeReported);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('potholeReported', handlePotholeReported);
    };
  }, []);

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-3 text-2xl font-bold text-white tracking-tight">
              <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-2xl border border-blue-400/30">
                <MapPin className="h-6 w-6 text-blue-400" />
              </div>
              Pothole Map
            </h3>
            <p className="text-lg text-white/70 font-light mt-2">
              Interactive map showing reported potholes in your area
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              {reports.length} reports
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReports(true)}
              disabled={refreshing}
              className="h-10 px-4 rounded-2xl border-white/50 bg-white/20 hover:bg-white/30 text-white hover:text-white backdrop-blur-sm hover:border-white/70 transition-all duration-300"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="w-full h-96 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-white/70">Loading reports...</p>
          </div>
        </div>
      ) : (
        <Map reports={reports} />
      )}
      
      {/* Map Legend - Dark Glass Theme */}
      <div className="mt-6 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
          <span className="text-white/80 font-medium">Reported</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
          <span className="text-white/80 font-medium">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
          <span className="text-white/80 font-medium">Fixed</span>
        </div>
      </div>
    </div>
  );
}