import React from 'react';

type TornVariant = 'rough' | 'smooth' | 'wave';

interface TornEdgeProps {
  topColor?: string;
  bottomColor?: string;
  height?: number;
  variant?: TornVariant;
  className?: string;
  flip?: boolean;
}

// Generate jagged torn-paper SVG path points
function generateTornPath(variant: TornVariant, width: number, height: number): string {
  const points: string[] = [];
  const steps = variant === 'rough' ? 40 : variant === 'smooth' ? 25 : 30;
  const stepW = width / steps;

  // Seeded pseudo-random for consistent renders
  const seed = variant === 'rough' ? 42 : variant === 'smooth' ? 137 : 89;
  let s = seed;
  const rand = () => { s = (s * 16807 + 0) % 2147483647; return (s % 1000) / 1000; };

  // Start from bottom-left
  points.push(`0,${height}`);
  // Go to top-left
  points.push(`0,${height * 0.1}`);

  // Generate torn top edge
  for (let i = 0; i <= steps; i++) {
    const x = i * stepW;
    let y: number;

    if (variant === 'rough') {
      // Very jagged, irregular tears
      y = height * (0.2 + rand() * 0.6);
    } else if (variant === 'smooth') {
      // Gentler undulation
      y = height * (0.3 + Math.sin(i * 0.8) * 0.15 + rand() * 0.2);
    } else {
      // Wave pattern with torn texture
      y = height * (0.35 + Math.sin(i * 0.5) * 0.25 + rand() * 0.1);
    }

    points.push(`${x},${y}`);
  }

  // Close to bottom-right
  points.push(`${width},${height}`);

  return points.join(' ');
}

export default function TornEdge({
  topColor = 'transparent',
  bottomColor = '#f0e5cf',
  height = 100,
  variant = 'rough',
  className = '',
  flip = false,
}: TornEdgeProps) {
  const svgWidth = 1440;
  const tornPath = React.useMemo(
    () => generateTornPath(variant, svgWidth, height),
    [variant, height]
  );

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height,
        backgroundColor: topColor,
        transform: flip ? 'scaleY(-1)' : undefined,
      }}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points={tornPath} fill={bottomColor} />
      </svg>
    </div>
  );
}
