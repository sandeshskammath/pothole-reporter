"use client";

import React from 'react';

interface NoiseProps {
  opacity?: number;
  className?: string;
}

export function Noise({ 
  opacity = 0.03,
  className = "" 
}: NoiseProps) {
  const noiseStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    opacity,
    mixBlendMode: 'overlay' as const,
    pointerEvents: 'none' as const,
  };

  return (
    <>
      <style jsx>{`
        @keyframes noiseAnimation {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-10%, 5%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(-15%, 10%); }
          90% { transform: translate(10%, 5%); }
        }
      `}</style>
      <div
        className={`fixed inset-0 z-10 ${className}`}
        style={{
          ...noiseStyle,
          animation: 'noiseAnimation 8s steps(10) infinite',
        }}
      />
    </>
  );
}