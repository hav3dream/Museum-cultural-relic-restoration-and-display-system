import { motion } from 'framer-motion';

interface InkBrushStrokeProps {
  className?: string;
  width?: number;
  color?: string;
  duration?: number;
  delay?: number;
  variant?: 'underline' | 'divider' | 'accent';
}

const strokePaths = {
  underline: 'M5,15 Q50,5 100,12 Q150,20 200,10 Q250,5 295,15',
  divider: 'M0,10 Q75,2 150,10 Q225,18 300,10',
  accent: 'M5,20 Q40,5 80,15 Q120,25 160,10 Q200,0 240,12 Q280,22 295,8',
};

export default function InkBrushStroke({
  className = '',
  width = 300,
  color = '#7F3222',
  duration = 1.2,
  delay = 0,
  variant = 'underline',
}: InkBrushStrokeProps) {
  const path = strokePaths[variant];

  return (
    <svg
      viewBox="0 0 300 25"
      className={`overflow-visible ${className}`}
      style={{ width }}
      fill="none"
    >
      <motion.path
        d={path}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration, delay, ease: 'easeOut' }}
      />
      <motion.path
        d={path}
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeOpacity={0.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: duration * 0.8, delay: delay + 0.2, ease: 'easeOut' }}
        style={{ transform: 'translateY(2px)' }}
      />
    </svg>
  );
}
