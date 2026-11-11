import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Section {
  id: string;
  label: string;
  color: string;
}

const SECTIONS: Section[] = [
  { id: 'hero', label: '首页', color: '#7F3222' },
  { id: 'narrative', label: '故事', color: '#C85840' },
  { id: 'categories', label: '探索', color: '#7F3222' },
  { id: 'gallery', label: '画廊', color: '#D4A76A' },
  { id: 'masterpieces', label: '名画', color: '#4A3428' },
  { id: 'showcase', label: '成果', color: '#7F3222' },
];

export default function ColorStrip() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.03], [0.4, 1]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 2;
      let newIndex = 0;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && scrollPos >= el.offsetTop) {
          newIndex = i;
          break;
        }
      }
      setActiveIndex(newIndex);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      className="fixed left-0 top-0 h-screen w-[44px] z-[50] hidden lg:flex flex-col"
      style={{ opacity }}
      aria-label="Section navigation"
    >
      {SECTIONS.map((section, i) => {
        const isActive = activeIndex === i;
        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="relative flex-1 group cursor-pointer overflow-hidden"
            style={{ backgroundColor: section.color }}
            aria-label={section.label}
            aria-current={isActive ? 'true' : undefined}
          >
            {/* Depth layers - inner shadow + highlight */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.3), inset 2px 0 4px rgba(255,255,255,0.08)',
              }}
            />

            {/* Active glow indicator */}
            {isActive && (
              <motion.div
                layoutId="strip-active"
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 16px rgba(255,255,255,0.15), 4px 0 20px rgba(255,255,255,0.08)',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Active left edge accent */}
            {isActive && (
              <motion.div
                layoutId="strip-edge"
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Hover tooltip */}
            <div
              className="absolute left-full top-1/2 -translate-y-1/2 ml-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[60]"
            >
              <div className="w-2 h-2 rotate-45 bg-[#4A3428]/90 backdrop-blur-sm" />
              <div className="px-3 py-1.5 bg-[#4A3428]/90 text-[#E8E3D1] text-xs rounded-md whitespace-nowrap backdrop-blur-sm -ml-2"
                   style={{ fontFamily: "'LXGW WenKai', sans-serif" }}>
                {section.label}
              </div>
            </div>

            {/* Section divider line */}
            {i > 0 && (
              <div className="absolute top-0 left-[6px] right-[6px] h-px bg-white/10" />
            )}
          </button>
        );
      })}
    </motion.nav>
  );
}
