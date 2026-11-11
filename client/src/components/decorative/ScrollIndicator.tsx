import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Section {
  id: string;
  label: string;
}

interface ScrollIndicatorProps {
  sections: Section[];
}

export default function ScrollIndicator({ sections }: ScrollIndicatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 2;
      let newIndex = 0;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && scrollPos >= el.offsetTop) {
          newIndex = i;
          break;
        }
      }
      setActiveIndex(newIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-6"
      style={{ opacity }}
    >
      {sections.map((section, idx) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <motion.span
            className="text-sm font-light tracking-wide transition-all duration-300"
            animate={{
              opacity: activeIndex === idx ? 1 : 0,
              x: activeIndex === idx ? 0 : 10,
              color: activeIndex === idx ? '#7F3222' : '#7F3222',
            }}
          >
            {section.label}
          </motion.span>
          <div className="relative flex items-center justify-center">
            <motion.div
              className="rounded-full transition-all duration-300"
              animate={{
                width: activeIndex === idx ? 12 : 6,
                height: activeIndex === idx ? 12 : 6,
                backgroundColor: activeIndex === idx ? '#7F3222' : 'rgba(127,50,34,0.3)',
              }}
            />
            {activeIndex === idx && (
              <motion.div
                className="absolute rounded-full border border-[#7F3222]/30"
                initial={{ width: 12, height: 12, opacity: 0 }}
                animate={{ width: 24, height: 24, opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
        </button>
      ))}

      {/* Scroll progress line */}
      <div className="absolute right-[2.5px] top-0 bottom-0 w-[1px] bg-[#7F3222]/10 -z-10" />
    </motion.div>
  );
}
