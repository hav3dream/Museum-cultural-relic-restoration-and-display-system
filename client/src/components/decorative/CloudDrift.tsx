import { motion } from 'framer-motion';

interface CloudDriftProps {
  className?: string;
  count?: number;
  opacity?: number;
}

const cloudPaths = [
  'M20,50 Q35,20 60,35 Q80,15 100,30 Q120,10 140,25 Q155,5 170,20 Q185,35 170,50 Q155,65 140,55 Q120,70 100,55 Q80,65 60,50 Q40,65 20,50Z',
  'M10,40 Q30,15 55,28 Q75,5 95,22 Q110,8 130,20 Q145,35 130,48 Q110,60 95,50 Q75,62 55,48 Q35,58 10,40Z',
  'M15,45 Q40,18 65,32 Q85,10 110,25 Q130,12 150,22 Q165,38 150,50 Q130,60 110,48 Q85,58 65,45 Q40,55 15,45Z',
];

export default function CloudDrift({ className = '', count = 3, opacity = 0.15 }: CloudDriftProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 180 70"
          className="absolute"
          style={{
            width: `${120 + i * 40}px`,
            top: `${10 + i * 25}%`,
            left: `${5 + i * 30}%`,
            opacity,
          }}
          animate={{
            x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, -10 - i * 3, 0],
            opacity: [opacity, opacity * 1.8, opacity],
          }}
          transition={{
            duration: 20 + i * 5,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        >
          <path
            d={cloudPaths[i % cloudPaths.length]}
            fill="#7F3222"
            fillOpacity={0.3}
          />
        </motion.svg>
      ))}
    </div>
  );
}
