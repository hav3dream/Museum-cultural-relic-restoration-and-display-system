import { motion } from 'framer-motion';

interface ResultItem {
  src: string;
  alt: string;
  label?: string;
}

interface ResultsGalleryProps {
  results: ResultItem[];
  visible: boolean;
  title?: string;
  thumbnailSize?: number;
}

export default function ResultsGallery({
  results,
  visible,
  title = '修复结果',
  thumbnailSize = 80,
}: ResultsGalleryProps) {
  if (!visible) return null;

  return (
    <motion.div
      className="w-full rounded-[20px] p-5 mb-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(135deg, rgba(232,227,209,0.2) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.06) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(232,227,209,0.25)',
        boxShadow: '0 4px 20px rgba(127,50,34,0.04), 0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      {title && (
        <div className="mb-4">
          <span
            className="text-museum-brown/70 text-sm font-medium tracking-wide"
            style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
          >
            {title}
          </span>
        </div>
      )}
      <div className="flex gap-4 overflow-x-auto justify-center">
        {results.map((result, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0 text-center"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: 'easeOut'
            }}
          >
            <motion.img
              src={result.src}
              alt={result.alt}
              className="object-cover rounded-[16px]"
              style={{
                width: `${thumbnailSize}px`,
                height: `${thumbnailSize}px`,
                border: '1px solid rgba(212,167,106,0.2)',
                boxShadow: '0 2px 12px rgba(127,50,34,0.04)',
              }}
              initial={{ filter: 'blur(4px)' }}
              animate={{ filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 4px 16px rgba(212,167,106,0.15), 0 2px 6px rgba(0,0,0,0.05)',
              }}
            />
            {result.label && (
              <motion.div
                className="text-museum-brown/60 text-xs font-light mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {result.label}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
