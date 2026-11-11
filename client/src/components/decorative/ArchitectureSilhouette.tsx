import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

type SilhouetteVariant = 'palace' | 'mountain' | 'citywall';

interface ArchitectureSilhouetteProps {
  variant?: SilhouetteVariant;
  color?: string;
  bgColor?: string;
  height?: number;
  flip?: boolean;
  className?: string;
}

// Chinese palace roofline (翘角飞檐)
const PALACE_PATH = `
M0,120 L0,90
L60,90 L80,70 L100,80 L120,50 L140,65 L160,35
L180,55 L200,25 L210,30 L220,15 L230,30 L240,25
L260,45 L280,30 L300,55 L310,40 L320,60
L340,45 L360,70 L380,55 L400,35 L410,45 L420,20
L430,35 L440,15 L450,30 L460,10 L470,25 L480,15
L490,30 L500,20 L520,40 L540,30 L560,50
L580,35 L600,55 L620,40 L640,60 L660,45
L680,65 L700,50 L720,35 L730,45 L740,25
L750,40 L760,15 L770,30 L780,10 L790,25 L800,15
L810,35 L820,20 L840,45 L860,30 L880,55
L900,40 L920,60 L940,45 L960,70 L980,55
L1000,35 L1020,50 L1040,65 L1060,45 L1080,60
L1100,40 L1120,55 L1140,70 L1160,80 L1180,65
L1200,85 L1220,90 L1260,85 L1300,90
L1350,88 L1400,90 L1440,90 L1440,120 Z
`;

// Mountain ridge with Chinese painting style
const MOUNTAIN_PATH = `
M0,120 L0,80
L40,75 L80,65 L120,70 L160,55 L200,60
L240,45 L280,50 L320,35 L360,40 L400,25
L420,30 L440,20 L460,30 L480,15 L500,25
L520,10 L530,15 L540,8 L550,12 L560,18
L580,25 L600,20 L620,30 L640,25 L660,35
L680,30 L700,40 L720,35 L740,28 L760,32
L780,22 L790,18 L800,25 L820,15 L830,20
L840,12 L850,8 L860,15 L880,22 L900,18
L920,28 L940,35 L960,30 L980,40 L1000,45
L1020,38 L1040,50 L1060,42 L1080,55
L1100,48 L1120,60 L1140,55 L1160,65
L1180,60 L1200,70 L1240,65 L1280,72
L1320,68 L1360,75 L1400,80 L1440,78
L1440,120 Z
`;

// City wall with crenellations (城墙垛口)
const CITYWALL_PATH = `
M0,120 L0,60
L30,60 L30,40 L60,40 L60,60
L90,60 L90,40 L120,40 L120,60
L150,60 L150,40 L180,40 L180,60
L210,60 L210,40 L240,40 L240,60
L270,60 L270,40 L300,40 L300,60
L330,60 L330,40 L360,40 L360,60
L390,60 L390,40 L420,40 L420,60
L450,60 L450,40 L480,40 L480,60
L510,60 L510,40 L540,40 L540,60
L570,60 L570,40 L600,40 L600,60
L630,60 L630,40 L660,40 L660,60
L690,60 L690,40 L720,40 L720,60
L750,60 L750,40 L780,40 L780,60
L810,60 L810,40 L840,40 L840,60
L870,60 L870,40 L900,40 L900,60
L930,60 L930,40 L960,40 L960,60
L990,60 L990,40 L1020,40 L1020,60
L1050,60 L1050,40 L1080,40 L1080,60
L1110,60 L1110,40 L1140,40 L1140,60
L1170,60 L1170,40 L1200,40 L1200,60
L1230,60 L1230,40 L1260,40 L1260,60
L1290,60 L1290,40 L1320,40 L1320,60
L1350,60 L1350,40 L1380,40 L1380,60
L1410,60 L1410,40 L1440,40 L1440,120 Z
`;

const PATHS: Record<SilhouetteVariant, string> = {
  palace: PALACE_PATH,
  mountain: MOUNTAIN_PATH,
  citywall: CITYWALL_PATH,
};

export default function ArchitectureSilhouette({
  variant = 'palace',
  color = '#7F3222',
  bgColor = 'transparent',
  height = 120,
  flip = false,
  className = '',
}: ArchitectureSilhouetteProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height,
        backgroundColor: bgColor,
        transform: flip ? 'scaleY(-1)' : undefined,
      }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d={PATHS[variant]}
          fill={color}
          fillOpacity={0.15}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.5, 0, 0.3, 1] }}
        />
        {/* Outline stroke for definition */}
        <motion.path
          d={PATHS[variant]}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeOpacity={0.25}
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}
