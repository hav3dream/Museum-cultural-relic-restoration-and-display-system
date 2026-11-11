import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = '原图',
  afterLabel = '修复结果',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showPercentage, setShowPercentage] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragEndTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMove = React.useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => {
    setIsDragging(true);
    setShowPercentage(true);
    if (dragEndTimerRef.current) {
      clearTimeout(dragEndTimerRef.current);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragEndTimerRef.current = setTimeout(() => {
      setShowPercentage(false);
    }, 1000);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove]);

  React.useEffect(() => {
    return () => {
      if (dragEndTimerRef.current) {
        clearTimeout(dragEndTimerRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-[20px] select-none mx-auto"
      style={{
        width: '75vw',
        maxWidth: '1200px',
        aspectRatio: '16/9',
        boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
      }}
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* After image (full background) */}
      <div className="absolute inset-0 bg-black/5">
        <img
          src={afterSrc}
          alt={afterLabel}
          className="w-full h-full object-contain"
          draggable={false}
        />
        {/* After label - frosted glass */}
        <motion.div
          className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-light flex items-center gap-1.5"
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'rgba(127,50,34,0.7)',
          }}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(127,50,34,0.5)' }}
          />
          {afterLabel}
        </motion.div>
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 bg-black/5"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="w-full h-full object-contain"
          draggable={false}
        />
        {/* Before label - frosted glass */}
        <motion.div
          className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-light flex items-center gap-1.5"
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'rgba(212,167,106,0.9)',
          }}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(212,167,106,0.7)' }}
          />
          {beforeLabel}
        </motion.div>
      </div>

      {/* Divider line - soft gradient fade */}
      <div
        className="absolute top-0 bottom-0 w-[2px] cursor-ew-resize"
        style={{
          left: `${sliderPosition}%`,
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.8) 15%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.8) 85%, transparent 100%)',
          boxShadow: isDragging
            ? '0 0 8px rgba(212,167,106,0.4), 0 0 20px rgba(212,167,106,0.15)'
            : '0 0 6px rgba(255,255,255,0.4)',
          transition: isDragging ? 'none' : 'box-shadow 0.3s ease',
        }}
      >
        {/* Drag handle - frosted glass circle */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-9 h-9 rounded-full flex items-center justify-center cursor-ew-resize"
          style={{
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(232,227,209,0.9) 100%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(212,167,106,0.3)',
            boxShadow: isDragging
              ? '0 4px 16px rgba(212,167,106,0.3), 0 2px 8px rgba(0,0,0,0.1)'
              : '0 2px 12px rgba(212,167,106,0.2), 0 2px 6px rgba(0,0,0,0.08)',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          tabIndex={0}
          role="slider"
          aria-label="比较滑块: 滑动查看修复前后对比"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPosition)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setSliderPosition(Math.max(0, sliderPosition - 5));
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              setSliderPosition(Math.min(100, sliderPosition + 5));
            }
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Left arrow */}
          <svg
            className="w-2.5 h-2.5 absolute left-2"
            fill="none"
            stroke="rgba(127,50,34,0.5)"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {/* Right arrow */}
          <svg
            className="w-2.5 h-2.5 absolute right-2"
            fill="none"
            stroke="rgba(127,50,34,0.5)"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.div>

        {/* Position indicator percentage */}
        <AnimatePresence>
          {showPercentage && (
            <motion.div
              className="absolute left-1/2 pointer-events-none px-2 py-0.5 rounded-full"
              style={{
                top: 'calc(50% + 24px)',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(212,167,106,0.2)',
                color: 'rgba(127,50,34,0.6)',
              }}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {Math.round(sliderPosition)}%
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
