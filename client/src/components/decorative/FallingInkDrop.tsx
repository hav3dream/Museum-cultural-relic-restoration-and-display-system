import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * FallingInkDrop - A scroll-driven ink drop that descends as the user scrolls.
 * Inspired by yunqi.aliyun.com's falling crystal block effect.
 * The ink drop starts at the top of the hero, falls through the page,
 * and "splashes" when it reaches the content area.
 */
export default function FallingInkDrop() {
  const { scrollYProgress } = useScroll();

  // Drop falls from top to bottom of viewport (first 40% of scroll)
  const y = useTransform(scrollYProgress, [0, 0.15, 0.25], ['10vh', '60vh', '85vh']);
  const rotate = useTransform(scrollYProgress, [0, 0.15, 0.25], [0, 15, -5]);
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.25], [0.8, 1, 1.1, 0.3]);
  const opacity = useTransform(scrollYProgress, [0, 0.02, 0.2, 0.25], [0, 1, 1, 0]);

  // Splash effect appears when drop reaches bottom
  const splashScale = useTransform(scrollYProgress, [0.22, 0.25, 0.35], [0, 1.5, 2]);
  const splashOpacity = useTransform(scrollYProgress, [0.22, 0.25, 0.35], [0, 0.6, 0]);

  // Ink ripple rings
  const ring1Scale = useTransform(scrollYProgress, [0.24, 0.3, 0.4], [0, 2, 4]);
  const ring1Opacity = useTransform(scrollYProgress, [0.24, 0.3, 0.4], [0, 0.4, 0]);
  const ring2Scale = useTransform(scrollYProgress, [0.26, 0.32, 0.42], [0, 1.5, 3]);
  const ring2Opacity = useTransform(scrollYProgress, [0.26, 0.32, 0.42], [0, 0.3, 0]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 hidden md:block">
      {/* The falling ink drop */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ y, rotate, scale, opacity }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
          {/* Ink drop shape */}
          <defs>
            <radialGradient id="inkGrad" cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor="#3D3D3D" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#4a3828" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7F3222" stopOpacity="0.3" />
            </radialGradient>
            <filter id="inkBlur">
              <feGaussianBlur stdDeviation="1" />
            </filter>
          </defs>
          <path
            d="M30 0 C30 0 5 40 5 55 C5 69 16.2 80 30 80 C43.8 80 55 69 55 55 C55 40 30 0 30 0Z"
            fill="url(#inkGrad)"
            filter="url(#inkBlur)"
          />
          {/* Highlight reflection */}
          <ellipse cx="22" cy="50" rx="6" ry="8" fill="white" opacity="0.15" />
        </svg>
      </motion.div>

      {/* Splash effect at landing point */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '85vh',
          scale: splashScale,
          opacity: splashOpacity,
        }}
      >
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
          {/* Ink splash splatter */}
          <ellipse cx="60" cy="20" rx="50" ry="12" fill="#3D3D3D" opacity="0.3" />
          <ellipse cx="60" cy="20" rx="30" ry="8" fill="#3D3D3D" opacity="0.5" />
          {/* Small splatter dots */}
          <circle cx="20" cy="15" r="3" fill="#3D3D3D" opacity="0.4" />
          <circle cx="100" cy="12" r="2.5" fill="#3D3D3D" opacity="0.3" />
          <circle cx="35" cy="8" r="2" fill="#3D3D3D" opacity="0.35" />
          <circle cx="85" cy="6" r="2.5" fill="#3D3D3D" opacity="0.25" />
          <circle cx="45" cy="30" r="1.5" fill="#3D3D3D" opacity="0.2" />
          <circle cx="75" cy="32" r="2" fill="#3D3D3D" opacity="0.2" />
        </svg>
      </motion.div>

      {/* Ripple ring 1 */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '85vh',
          scale: ring1Scale,
          opacity: ring1Opacity,
        }}
      >
        <div className="w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7F3222]/40" />
      </motion.div>

      {/* Ripple ring 2 */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '85vh',
          scale: ring2Scale,
          opacity: ring2Opacity,
        }}
      >
        <div className="w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7F3222]/30" />
      </motion.div>
    </div>
  );
}
