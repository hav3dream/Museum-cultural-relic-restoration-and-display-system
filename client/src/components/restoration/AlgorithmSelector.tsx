import { motion, AnimatePresence } from 'framer-motion';
import { SealStamp } from '@/components/decorative';
import { useState } from 'react';

interface Algorithm {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface AlgorithmSelectorProps {
  title: string;
  algorithms: Algorithm[];
  selected: string;
  onSelect: (id: string) => void;
  sectionIcon?: string;
}

export default function AlgorithmSelector({
  title,
  algorithms,
  selected,
  onSelect,
  sectionIcon,
}: AlgorithmSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="mb-6">
      <div className="text-museum-brown/80 text-sm font-medium mb-3 tracking-wide" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>{title}</div>
      <AnimatePresence mode="sync">
        {algorithms.map((algo, index) => {
          const isSelected = selected === algo.id;
          const isHovered = hoveredId === algo.id;
          return (
            <motion.div
              key={algo.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full h-[72px] rounded-[18px] p-4 mb-3 flex items-center justify-between cursor-pointer transition-all relative overflow-hidden"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(212,167,106,0.12) 0%, rgba(232,227,209,0.18) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(232,227,209,0.12) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: isSelected ? '1px solid rgba(212,167,106,0.3)' : '1px solid rgba(232,227,209,0.2)',
                boxShadow: isSelected
                  ? '0 4px 24px rgba(212,167,106,0.1), 0 2px 8px rgba(127,50,34,0.05)'
                  : '0 2px 12px rgba(0,0,0,0.02)',
              }}
              onClick={() => onSelect(algo.id)}
              onMouseEnter={() => setHoveredId(algo.id)}
              onMouseLeave={() => setHoveredId(null)}
              whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(212,167,106,0.12), 0 2px 8px rgba(127,50,34,0.06)' }}
              whileTap={{ scale: 0.98 }}
              animate={isSelected ? {
                boxShadow: [
                  '0 4px 24px rgba(212,167,106,0.1), 0 2px 8px rgba(127,50,34,0.05)',
                  '0 4px 24px rgba(212,167,106,0.18), 0 2px 8px rgba(127,50,34,0.08)',
                  '0 4px 24px rgba(212,167,106,0.1), 0 2px 8px rgba(127,50,34,0.05)',
                ],
              } : {}}
              transition={isSelected ? {
                opacity: { delay: index * 0.1, duration: 0.4 },
                y: { delay: index * 0.1, duration: 0.4 },
                boxShadow: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              } : { delay: index * 0.1, duration: 0.2 }}
            >
              <div className="flex items-center gap-3 z-10">
                {algo.icon && (
                  <motion.img
                    src={algo.icon}
                    alt=""
                    className="w-6 h-6 opacity-75 object-contain"
                    animate={isSelected ? {
                      scale: [1, 1.1, 1]
                    } : { scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                )}
                <div>
                  <div className="text-museum-brown/90 text-xs font-medium">{algo.name}</div>
                  <motion.div
                    className="text-museum-brown/50 text-[10px] font-light overflow-hidden"
                    animate={isHovered ? {
                      clipPath: 'inset(0 0 0 0)',
                    } : {
                      clipPath: 'inset(0 0 0 0)',
                    }}
                  >
                    {isHovered ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {algo.description.split('').map((char, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </motion.span>
                    ) : (
                      algo.description
                    )}
                  </motion.div>
                </div>
              </div>
              <div className="flex items-center gap-2 z-10">
                <span className="text-museum-brown/50 text-[10px] font-light">{algo.id}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="absolute right-3 pointer-events-none"
                  >
                    <SealStamp text="选" size={24} color="#7F3222" delay={0} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
