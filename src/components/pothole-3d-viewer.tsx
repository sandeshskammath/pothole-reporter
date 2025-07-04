"use client";

import { useState } from 'react';
import SplineScene from './spline-scene';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Pothole3DViewerProps {
  splineUrl?: string;
  title?: string;
  description?: string;
}

export default function Pothole3DViewer({ 
  splineUrl = "https://prod.spline.design/BYQbZmYHRlTkBPcF/scene.splinecode", // Your actual scene
  title = "3D Pothole Model",
  description = "Interactive 3D visualization of road surface conditions"
}: Pothole3DViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <Card className="w-full h-96">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      <CardContent className="h-80">
        {hasError ? (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-gray-600 text-sm">Failed to load 3D scene</p>
              <button 
                onClick={() => setHasError(false)}
                className="mt-2 text-blue-600 text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <SplineScene
            scene={splineUrl}
            className="w-full h-full rounded-lg overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              minHeight: '300px'
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}