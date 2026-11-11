import { motion } from 'framer-motion';

const SEAL_IMAGES: Record<string, string> = {
  '画': '/images/seal-hua.png',
  '韵': '/images/seal-yun.png',
  '新': '/images/seal-xin.png',
  '生': '/images/seal-sheng.png',
};

interface SealStampProps {
  text?: string;
  size?: number;
  className?: string;
  delay?: number;
  color?: string;
}

export default function SealStamp({
  text = '韵',
  size = 48,
  className = '',
  delay = 0,
  color = '#a03020',
}: SealStampProps) {
  const sealSrc = SEAL_IMAGES[text];

  // If we have an AI-generated seal image for this character, use it
  if (sealSrc) {
    return (
      <motion.img
        src={sealSrc}
        alt={text}
        className={`inline-block object-contain select-none ${className}`}
        style={{ width: size, height: size }}
        initial={{ scale: 0, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{
          delay,
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        draggable={false}
      />
    );
  }

  // Fallback: CSS seal for other characters
  const borderWidth = size * 0.06;
  const fontSize = size * 0.45;
  const innerPad = size * 0.08;

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        border: `${borderWidth}px solid ${color}`,
        borderRadius: size * 0.08,
        padding: innerPad,
      }}
      initial={{ scale: 0, rotate: -15, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        delay,
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    >
      <span
        className="font-serif font-bold leading-none select-none"
        style={{
          color,
          fontSize,
          letterSpacing: '0.05em',
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}
