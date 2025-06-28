"use client";

import React, { useEffect, useRef, useState } from 'react';

interface SplashCursorProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
  className?: string;
}

export function SplashCursor({ 
  children, 
  color = "#3b82f6",
  size = 100,
  className = "" 
}: SplashCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splashes, setSplashes] = useState<Array<{ id: number; x: number; y: number; timestamp: number }>>([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovering) return;
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Add random chance for splash
      if (Math.random() > 0.7) {
        const newSplash = {
          id: Date.now() + Math.random(),
          x,
          y,
          timestamp: Date.now(),
        };

        setSplashes(prev => [...prev, newSplash]);

        // Remove splash after animation
        setTimeout(() => {
          setSplashes(prev => prev.filter(splash => splash.id !== newSplash.id));
        }, 800);
      }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovering]);

  return (
    <>
      <style jsx>{`
        @keyframes splashAnimation {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5) rotate(360deg);
            opacity: 0;
          }
        }
        
        .splash-cursor {
          cursor: crosshair;
        }
      `}</style>
      <div 
        ref={containerRef}
        className={`relative splash-cursor ${className}`}
      >
        {children}
        
        {/* Splash Effects */}
        {splashes.map((splash) => (
          <div
            key={splash.id}
            className="absolute pointer-events-none"
            style={{
              left: splash.x - size / 2,
              top: splash.y - size / 2,
              width: size,
              height: size,
              animation: 'splashAnimation 0.8s ease-out forwards',
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `radial-gradient(circle, ${color}40 0%, ${color}20 50%, transparent 100%)`,
                border: `2px solid ${color}60`,
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}