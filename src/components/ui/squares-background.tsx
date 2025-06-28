"use client";

import React from 'react';

interface SquaresBackgroundProps {
  className?: string;
  squareSize?: number;
  speed?: number;
  color?: string;
  opacity?: number;
}

export function SquaresBackground({
  className = "",
  squareSize = 40,
  speed = 20,
  color = "#3b82f6",
  opacity = 0.1
}: SquaresBackgroundProps) {
  const squares = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: squareSize + Math.random() * 20,
    delay: Math.random() * speed,
    duration: speed + Math.random() * 10,
    rotation: Math.random() * 360,
  }));

  return (
    <>
      <style jsx>{`
        @keyframes floatSquare {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: ${opacity};
          }
          90% {
            opacity: ${opacity};
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .square {
          position: absolute;
          border: 1px solid ${color};
          background: linear-gradient(45deg, transparent, ${color}20, transparent);
          pointer-events: none;
        }
      `}</style>
      <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
        {squares.map((square) => (
          <div
            key={square.id}
            className="square"
            style={{
              left: `${square.x}%`,
              width: `${square.size}px`,
              height: `${square.size}px`,
              animation: `floatSquare ${square.duration}s linear infinite`,
              animationDelay: `${square.delay}s`,
              transform: `rotate(${square.rotation}deg)`,
            }}
          />
        ))}
        
        {/* Static squares for depth */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`static-${i}`}
            className="square"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${squareSize * 0.5}px`,
              height: `${squareSize * 0.5}px`,
              opacity: opacity * 0.3,
              animation: `pulse ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
    </>
  );
}