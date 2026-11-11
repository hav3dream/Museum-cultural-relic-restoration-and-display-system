import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
}

export default function SliderControl({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  leftLabel = '弱',
  rightLabel = '强',
}: SliderControlProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const sliderRef = React.useRef<HTMLInputElement>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState(0);

  React.useEffect(() => {
    if (sliderRef.current) {
      const percentage = ((value - min) / (max - min)) * 100;
      setTooltipPosition(percentage);
    }
  }, [value, min, max]);

  return (
    <div className="mb-5">
      <div className="text-museum-brown/80 text-sm font-medium mb-3 flex items-center gap-2" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <motion.span
          className="text-xs font-light"
          animate={{
            opacity: value < 50 ? 0.8 : 0.35,
            color: value < 50 ? '#D4A76A' : '#7F3222',
          }}
          transition={{ duration: 0.3 }}
        >
          {leftLabel}
        </motion.span>
        <div className="flex-1 relative">
          {/* Floating Tooltip - frosted glass */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute -top-11 text-museum-brown/80 text-xs font-medium px-3 py-1.5 rounded-full z-20"
                style={{
                  left: `calc(${tooltipPosition}% - 22px)`,
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212,167,106,0.25)',
                  boxShadow: '0 4px 16px rgba(127,50,34,0.08)',
                }}
              >
                {value}%
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={sliderRef}
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            aria-label={`${label}`}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={`${value}%`}
            className="w-full h-[6px] rounded-full appearance-none cursor-pointer relative z-10"
            style={{
              background: `linear-gradient(to right, rgba(212,167,106,0.4) 0%, rgba(212,167,106,0.6) ${value}%, rgba(232,227,209,0.3) ${value}%, rgba(232,227,209,0.3) 100%)`,
            }}
          />
          <style>{`
            input[type='range']::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: linear-gradient(135deg, rgba(212,167,106,0.85), rgba(232,227,209,0.95));
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(212,167,106,0.2), 0 1px 3px rgba(127,50,34,0.1);
              transition: transform 0.2s, box-shadow 0.2s;
              border: 1px solid rgba(212,167,106,0.3);
            }
            input[type='range']::-webkit-slider-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 3px 12px rgba(212,167,106,0.3), 0 1px 4px rgba(127,50,34,0.12);
            }
            input[type='range']::-webkit-slider-thumb:active {
              transform: scale(1.2);
              box-shadow: 0 4px 16px rgba(212,167,106,0.35), 0 2px 6px rgba(127,50,34,0.15);
            }
            input[type='range']::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: linear-gradient(135deg, rgba(212,167,106,0.85), rgba(232,227,209,0.95));
              cursor: pointer;
              border: 1px solid rgba(212,167,106,0.3);
              box-shadow: 0 2px 8px rgba(212,167,106,0.2), 0 1px 3px rgba(127,50,34,0.1);
              transition: transform 0.2s, box-shadow 0.2s;
            }
            input[type='range']::-moz-range-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 3px 12px rgba(212,167,106,0.3), 0 1px 4px rgba(127,50,34,0.12);
            }
            input[type='range']::-moz-range-thumb:active {
              transform: scale(1.2);
              box-shadow: 0 4px 16px rgba(212,167,106,0.35), 0 2px 6px rgba(127,50,34,0.15);
            }
          `}</style>
        </div>
        <motion.span
          className="text-xs font-light"
          animate={{
            opacity: value >= 50 ? 0.8 : 0.35,
            color: value >= 50 ? '#D4A76A' : '#7F3222',
          }}
          transition={{ duration: 0.3 }}
        >
          {rightLabel}
        </motion.span>
      </div>
    </div>
  );
}
