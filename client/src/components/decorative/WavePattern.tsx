import { motion } from 'framer-motion';

interface WavePatternProps {
  className?: string;
  color?: string;
  height?: number;
}

export default function WavePattern({
  className = '',
  color = '#7F3222',
  height = 40,
}: WavePatternProps) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} style={{ height }}>
      <motion.svg
        viewBox="0 0 1200 60"
        className="absolute w-[200%]"
        style={{ height }}
        preserveAspectRatio="none"
        animate={{ x: [0, -600] }}
        transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
      >
        <path
          d="M0,30 Q75,10 150,30 Q225,50 300,30 Q375,10 450,30 Q525,50 600,30 Q675,10 750,30 Q825,50 900,30 Q975,10 1050,30 Q1125,50 1200,30"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeOpacity={0.2}
        />
        <path
          d="M0,35 Q75,15 150,35 Q225,55 300,35 Q375,15 450,35 Q525,55 600,35 Q675,15 750,35 Q825,55 900,35 Q975,15 1050,35 Q1125,55 1200,35"
          fill="none"
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.12}
        />
      </motion.svg>
    </div>
  );
}
