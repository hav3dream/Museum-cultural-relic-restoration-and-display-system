import { motion } from 'framer-motion';
import { useState } from 'react';

interface ActionButtonsProps {
  onSubmit: () => void;
  onClear: () => void;
  isLoading: boolean;
  submitLabel: string;
  loadingLabel: string;
  submitIcon: string;
  clearIcon: string;
  clearLabel?: string;
  onCancel?: () => void;
}

export default function ActionButtons({
  onSubmit,
  onClear,
  isLoading,
  submitLabel,
  loadingLabel,
  submitIcon,
  clearIcon,
  clearLabel = '清空',
  onCancel,
}: ActionButtonsProps) {
  const [showRipple, setShowRipple] = useState(false);

  const handleSubmit = () => {
    if (!isLoading) {
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 400);
      onSubmit();
    }
  };

  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <motion.button
        onClick={handleSubmit}
        disabled={isLoading}
        className="flex-1 h-[52px] sm:h-[58px] rounded-[20px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        style={{
          background: isLoading
            ? 'linear-gradient(135deg, rgba(232,227,209,0.4) 0%, rgba(212,167,106,0.15) 100%)'
            : 'linear-gradient(135deg, rgba(232,227,209,0.5) 0%, rgba(212,167,106,0.2) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(212,167,106,0.25)',
          boxShadow: '0 4px 20px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
        }}
        variants={{
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        }}
        whileHover={!isLoading ? {
          scale: 1.02,
          boxShadow: '0 6px 24px rgba(212,167,106,0.15), 0 2px 8px rgba(127,50,34,0.06)',
        } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
      >
        {showRipple && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0, opacity: 0.4 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="w-10 h-10 rounded-full bg-museum-gold/20" />
          </motion.div>
        )}
        {isLoading ? (
          <>
            <svg className="w-5 h-5" viewBox="0 0 50 50">
              <motion.circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="rgba(212,167,106,0.4)"
                strokeWidth="2"
                strokeDasharray="8 4"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ transformOrigin: 'center' }}
              />
              <motion.path
                d="M 25 5 A 20 20 0 0 1 45 25"
                fill="none"
                stroke="rgba(212,167,106,0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ transformOrigin: 'center' }}
              />
            </svg>
            <span className="text-museum-brown/70 text-sm font-light relative z-10">
              {loadingLabel.split('').map((char, i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </>
        ) : (
          <>
            <img src={submitIcon} alt="" className="w-7 h-7 opacity-80 relative z-10 object-contain" />
            <span className="text-museum-brown/80 text-lg font-light relative z-10" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{submitLabel}</span>
          </>
        )}
      </motion.button>
      <motion.button
        onClick={isLoading && onCancel ? onCancel : onClear}
        className="w-full sm:w-[180px] h-[52px] sm:h-[58px] rounded-[20px] flex items-center justify-center gap-2 transition-all relative overflow-hidden"
        style={{
          background: isLoading && onCancel
            ? 'linear-gradient(135deg, rgba(200,88,64,0.12) 0%, rgba(200,88,64,0.06) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(232,227,209,0.15) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isLoading && onCancel
            ? '1px solid rgba(200,88,64,0.25)'
            : '1px solid rgba(232,227,209,0.25)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
        }}
        variants={{
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.4 } },
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: '0 4px 16px rgba(212,167,106,0.1), 0 2px 6px rgba(0,0,0,0.03)',
        }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading && onCancel ? (
          <>
            <svg className="w-5 h-5 text-museum-brown-light/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-museum-brown-light/70 text-lg font-light" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>取消</span>
          </>
        ) : (
          <>
            <img src={clearIcon} alt="" className="w-6 h-6 opacity-60 object-contain" />
            <span className="text-museum-brown/60 text-lg font-light" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{clearLabel}</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
