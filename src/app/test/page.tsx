"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Database, Upload, MapPin } from 'lucide-react';

interface ApiResult {
  status: number | string;
  data: any;
  timestamp: string;
}

export default function TestPage() {
  const [apiResults, setApiResults] = useState<Record<string, ApiResult>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(endpoint);
    try {
      const options: RequestInit = {
        method,
        headers: method === 'GET' ? {} : undefined,
      };
      
      if (body && method === 'POST') {
        options.body = body;
      }
      
      const response = await fetch(endpoint, options);
      const data = await response.json();
      
      setApiResults((prev: Record<string, ApiResult>) => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setApiResults((prev: Record<string, ApiResult>) => ({
        ...prev,
        [endpoint]: {
          status: 'error',
          data: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  const testPhotoUpload = async () => {
    // Create a mock image file for testing
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText('Test', 30, 55);
    }
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append('photo', blob, 'test-pothole.png');
        formData.append('latitude', '41.8781');
        formData.append('longitude', '-87.6298');
        formData.append('notes', 'Test pothole report from web interface');
        
        await testEndpoint('/api/reports', 'POST', formData);
      }
    }, 'image/png');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Backend API Testing
        </h1>
        <p className="text-xl text-muted-foreground">
          Test the Community Pothole Reporter API endpoints
        </p>
        <Badge variant="outline">Phase 2 Complete</Badge>
      </div>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Database connections will show errors until Vercel Postgres is configured. 
          This is expected behavior and shows our validation is working correctly.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="schema">Database Schema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="endpoints" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  GET /api/reports
                </CardTitle>
                <CardDescription>Fetch all pothole reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => testEndpoint('/api/reports')}
                  disabled={loading === '/api/reports'}
                  className="w-full"
                >
                  {loading === '/api/reports' ? 'Testing...' : 'Test GET Reports'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  POST /api/reports
                </CardTitle>
                <CardDescription>Create new pothole report</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={testPhotoUpload}
                  disabled={loading === '/api/reports'}
                  className="w-full"
                >
                  {loading === '/api/reports' ? 'Testing...' : 'Test Photo Upload'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  GET /api/reports/stats
                </CardTitle>
                <CardDescription>Get dashboard statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => testEndpoint('/api/reports/stats')}
                  disabled={loading === '/api/reports/stats'}
                  className="w-full"
                >
                  {loading === '/api/reports/stats' ? 'Testing...' : 'Test Statistics'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  POST /api/init
                </CardTitle>
                <CardDescription>Initialize database tables</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => testEndpoint('/api/init', 'POST')}
                  disabled={loading === '/api/init'}
                  className="w-full"
                >
                  {loading === '/api/init' ? 'Testing...' : 'Test DB Init'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {Object.keys(apiResults).length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  No test results yet. Click the buttons above to test API endpoints.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(apiResults).map(([endpoint, result]: [string, ApiResult]) => (
                <Card key={endpoint}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        {endpoint}
                      </span>
                      <Badge variant={typeof result.status === 'number' && result.status >= 200 && result.status < 300 ? "default" : "destructive"}>
                        {result.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Tested at {result.timestamp}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema Overview</CardTitle>
              <CardDescription>
                PostgreSQL schema with geospatial capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">pothole_reports table</h3>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm">{`
CREATE TABLE pothole_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  photo_url TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'reported',
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}</pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Key Features</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>UUID primary keys for security</li>
                  <li>Geospatial indexing for location queries</li>
                  <li>Automatic timestamp management</li>
                  <li>20-meter duplicate detection</li>
                  <li>Status tracking (reported → in_progress → fixed)</li>
                  <li>Community confirmation system</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}