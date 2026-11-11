// Unified animation timing system for Museum
export const duration = {
  instant: 0.15,
  fast: 0.25,
  normal: 0.35,
  moderate: 0.5,
  slow: 0.8,
  slower: 1.2,
} as const;

export const delay = {
  none: 0,
  xs: 0.05,
  sm: 0.1,
  md: 0.2,
  lg: 0.3,
  xl: 0.5,
} as const;

export const easing = {
  enter: [0.32, 0.72, 0, 1] as const,
  enterSubtle: [0.25, 0.46, 0.45, 0.94] as const,
  exit: [0.4, 0, 0.68, 0.06] as const,
  exitSubtle: [0.55, 0.085, 0.68, 0.53] as const,
  emphasis: [0.87, 0, 0.13, 1] as const,
  standard: [0.4, 0, 0.2, 1] as const,
  inkBrush: [0.6, 0.01, 0.05, 0.95] as const,
} as const;

export const spring = {
  gentle: { type: 'spring' as const, stiffness: 100, damping: 15 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 20 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },
} as const;

export const stagger = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
  character: 0.06,
} as const;

// Pre-built animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.normal, ease: easing.enter },
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: duration.fast, ease: easing.standard },
};

export const inkReveal = {
  initial: { clipPath: 'circle(0% at 50% 50%)' },
  animate: { clipPath: 'circle(100% at 50% 50%)' },
  transition: { duration: duration.slow, ease: easing.enter },
};

export const blurToSharp = {
  initial: { filter: 'blur(12px)', opacity: 0 },
  animate: { filter: 'blur(0px)', opacity: 1 },
  transition: { duration: duration.moderate, ease: easing.enterSubtle },
};

export const goldShimmer = {
  animate: { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] },
  transition: { duration: 3, repeat: Infinity, ease: 'linear' as const },
  style: {
    backgroundSize: '200% 100%',
    backgroundImage: 'linear-gradient(90deg, #7F3222, #D4A76A, #7F3222)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
};
