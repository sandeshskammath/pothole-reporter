"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  className?: string;
}

export function GradientText({
  children,
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
  animationSpeed = 3,
  showBorder = false,
  className,
}: GradientTextProps) {
  const gradientStyle = {
    background: `linear-gradient(90deg, ${colors.join(', ')})`,
    backgroundSize: '400% 400%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: `gradientAnimation ${animationSpeed}s ease infinite`,
  };

  const borderStyle = showBorder ? {
    WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)',
  } : {};

  return (
    <>
      <style jsx>{`
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      <span
        className={cn(className)}
        style={{
          ...gradientStyle,
          ...borderStyle,
        }}
      >
        {children}
      </span>
    </>
  );
}