'use client';

import Pothole3DViewer from '@/components/pothole-3d-viewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Eye, Layers, Zap } from 'lucide-react';

export default function ThreeDPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Box className="h-4 w-4" />
            3D Visualization Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Interactive 3D Models
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore detailed 3D representations of road conditions, infrastructure damage, and repair progress through immersive visualizations.
          </p>
        </div>

        {/* Main 3D Viewer */}
        <div className="mb-12">
          <Pothole3DViewer 
            title="Primary Road Surface Model"
            description="Interactive 3D visualization of pothole depth, surface conditions, and surrounding infrastructure"
          />
        </div>

        {/* Additional 3D Models Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Pothole3DViewer 
            splineUrl="https://prod.spline.design/BYQbZmYHRlTkBPcF/scene.splinecode"
            title="Interactive Town Scene"
            description="3D model of urban infrastructure and road conditions"
          />
          <Pothole3DViewer 
            splineUrl="https://prod.spline.design/BYQbZmYHRlTkBPcF/scene.splinecode"
            title="Infrastructure Analysis"
            description="Detailed view of road infrastructure and damage patterns"
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Immersive Views</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Navigate through 360° interactive models to examine road conditions from every angle.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Layered Data</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                View multiple data layers including depth analysis, surface quality, and repair history.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Real-Time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                3D models update automatically as new reports come in and repairs are completed.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}