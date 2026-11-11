import { motion } from 'framer-motion';

interface MistEffectProps {
  className?: string;
  position?: 'top' | 'bottom' | 'full';
  color?: string;
}

export default function MistEffect({
  className = '',
  position = 'bottom',
  color = '#7F3222',
}: MistEffectProps) {
  const posStyle =
    position === 'top'
      ? 'top-0 h-32'
      : position === 'bottom'
      ? 'bottom-0 h-32'
      : 'inset-0';

  return (
    <div className={`pointer-events-none absolute left-0 right-0 overflow-hidden ${posStyle} ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse ${80 + i * 20}% ${60 + i * 15}% at ${30 + i * 20}% ${position === 'top' ? '0%' : '100%'}, ${color}${i === 0 ? '18' : i === 1 ? '10' : '08'}, transparent)`,
          }}
          animate={{
            opacity: [0.4 + i * 0.1, 0.8 - i * 0.1, 0.4 + i * 0.1],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 8 + i * 4,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}
