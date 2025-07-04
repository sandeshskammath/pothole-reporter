"use client";

import { Suspense } from 'react';
import Spline from '@splinetool/react-spline';

interface SplineSceneProps {
  scene: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function SplineScene({ scene, className, style }: SplineSceneProps) {
  return (
    <div className={`spline-container ${className || ''}`} style={style}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading 3D scene...</p>
          </div>
        </div>
      }>
        <Spline
          scene={scene}
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </div>
  );
}