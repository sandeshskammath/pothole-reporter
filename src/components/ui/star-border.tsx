"use client";

import React from 'react';

interface StarBorderProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  color?: string;
}

export function StarBorder({
  children,
  className = "",
  speed = 2,
  color = "#60a5fa"
}: StarBorderProps) {
  const sparkleCount = 20;

  return (
    <>
      <style jsx>{`
        @keyframes starRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .star-border {
          position: relative;
          overflow: hidden;
        }

        .star-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: conic-gradient(
            from 0deg,
            transparent,
            ${color}40,
            transparent,
            ${color}60,
            transparent,
            ${color}40,
            transparent
          );
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
          animation: starRotate ${speed}s linear infinite;
        }

        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: ${color};
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>
      <div className={`star-border ${className}`}>
        {/* Sparkle effects */}
        {Array.from({ length: sparkleCount }).map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `sparkle ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </>
  );
}