import asset4 from '@/assets/I2673-784-2375-70.svg';
import asset5 from '@/assets/I2673-785-2375-70.svg';
import asset19 from '@/assets/I2675-883-8899-79835.svg';
import { useLocation } from 'wouter';
import ArtGallery from '@/components/ArtGallery';
import MobileMenu from '@/components/MobileMenu';
import RestorationShowcase from '@/components/RestorationShowcase';
import DigitalHumanTeaser from '@/components/DigitalHumanTeaser';
import StickyHeader from '@/components/StickyHeader';
import MuseumHighlight from '@/components/MuseumHighlight';
import Footer from '@/components/layout/Footer';
import React from 'react';
import { InkBrushStroke, WavePattern, TornEdge, ArchitectureSilhouette, ColorStrip } from '@/components/decorative';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

// Premium easing curve (Palace Museum / luxury brand standard)
const PREMIUM_EASE = [0.5, 0, 0.3, 1] as const;

// Era-themed exhibition data
const EXHIBITION_TABS = [
  {
    key: 'shufa',
    name: '书法',
    desc: '笔走龙蛇',
    color: '#C85840',
    bgColor: '#2a1510',
    tabColor: '#9B3A2A',
    subtitle: '翰墨千秋',
    description: '书法是中国文化的灵魂。从甲骨文到行草，每一个笔划都蕴含着先人的智慧与情感。',
    images: ['/images/figma/category-jianzhi.webp', '/images/left_1.png', '/images/left_2.png'],
    route: '/gallery/beike-shufa',
  },
  {
    key: 'bihua',
    name: '壁画',
    desc: '千年壁彩',
    color: '#3A9E9E',
    bgColor: '#162E2E',
    tabColor: '#2E8585',
    subtitle: '壁上丹青',
    description: '从敦煌莫高窟到永乐宫，壁画以宏大的叙事和瑰丽的色彩，记录着中华文明的辉煌。',
    images: ['/images/figma/category-guhua-style2.webp', '/images/bihua-76.jpg', '/images/bihua-30.jpg'],
    route: '/gallery/bihua',
  },
  {
    key: 'guohua',
    name: '国画',
    desc: '水墨丹青',
    color: '#D4A76A',
    bgColor: '#1E1A14',
    tabColor: '#8B7355',
    subtitle: '意在笔先',
    description: '水墨之间，万物皆可入画。山水、花鸟、人物，尽显东方美学之精妙。',
    images: ['/images/figma/category-huaniaohua.webp', '/images/guohua_1.png', '/images/guohua_2.png'],
    route: '/gallery/guohua',
  },
  {
    key: 'qingtong',
    name: '青铜',
    desc: '铸铜铭史',
    color: '#C9A84C',
    bgColor: '#2A2410',
    tabColor: '#A08630',
    subtitle: '铜光千载',
    description: '青铜器承载着上古的礼制与信仰，其纹饰之精美、铸造之精湛，令人叹为观止。',
    images: ['/images/figma/category-guhua-style1.webp', '/images/qingtong-1.jpeg', '/images/qingtong-2.jpeg'],
    route: '/gallery/qingtong',
  },
  {
    key: 'jianzhi',
    name: '剪纸',
    desc: '纸上乾坤',
    color: '#E05545',
    bgColor: '#2E1510',
    tabColor: '#C84031',
    subtitle: '刀剪生花',
    description: '一张红纸，一把剪刀，在民间艺人的手中化为栩栩如生的图案，承载着最质朴的祝福。',
    images: ['/images/figma/category-qingtong.webp', '/images/jianzhi-1.jpg', '/images/jianzhi-11.jpg'],
    route: '/gallery/jianzhi',
  },
];

const HERO_CHARS = ['画', '韵', '新', '生'];

// ============================================================
// PREMIUM COMPONENTS
// ============================================================

function HeroCharacterReveal() {
  return (
    <div className="flex gap-3 md:gap-5 lg:gap-7" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', 'Noto Serif SC', serif" }}>
      {HERO_CHARS.map((char, i) => (
        <motion.span
          key={char}
          className="inline-block"
          style={{
            fontSize: 'clamp(3rem, 10vw, 10rem)',
            color: '#E8E3D1',
            textShadow: '0 4px 40px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
            fontWeight: 400,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            opacity: { delay: 0.4 + i * 0.12, duration: 1, ease: PREMIUM_EASE },
            y: { delay: 0.4 + i * 0.12, duration: 1, ease: PREMIUM_EASE },
          }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

function ScrollDownHint() {
  return (
    <motion.div
      className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
    >
      <span className="text-[#E8E3D1]/50 text-[10px] tracking-[0.4em] uppercase font-light">Scroll to explore</span>
      <motion.div
        className="w-[1px] h-10 bg-gradient-to-b from-[#E8E3D1]/50 to-transparent"
        animate={{ scaleY: [0, 1, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'top' }}
      />
    </motion.div>
  );
}

// Narrative text reveal
function ScrollRevealText({ children }: { children: string }) {
  return (
    <motion.p
      style={{ fontSize: 'clamp(1rem, 3.5vw, 3.5rem)', fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
      className="text-[#7F3222] leading-[1.6] max-w-5xl text-center mx-auto"
      initial={{ opacity: 0.15, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: PREMIUM_EASE }}
    >
      {children}
    </motion.p>
  );
}

// Section wrapper - simple container, no opacity animation to avoid hiding content
function RevealSection({ children, id, className = '' }: {
  children: React.ReactNode; id?: string; className?: string;
}) {
  return (
    <div id={id} className={`relative ${className}`}>
      {children}
    </div>
  );
}

// Shared button for exhibition panels
function ExploreButton({ tab, navigate }: { tab: typeof EXHIBITION_TABS[0]; navigate: (path: string) => void }) {
  return (
    <motion.button
      type="button"
      onClick={() => navigate(tab.route)}
      className="self-start px-8 py-3 rounded-full border text-sm tracking-widest transition-colors duration-300"
      style={{ borderColor: `${tab.color}80`, color: tab.color }}
      whileHover={{ scale: 1.05, backgroundColor: `${tab.color}20` }}
      whileTap={{ scale: 0.97 }}
    >
      探索 {tab.name}
    </motion.button>
  );
}

// Era-themed exhibition tab panel -- each tab has a distinct layout
function ExhibitionPanel({ tab, isActive }: { tab: typeof EXHIBITION_TABS[0]; isActive: boolean }) {
  const [, navigate] = useLocation();
  if (!isActive) return null;

  const panelProps = {
    key: tab.key,
    initial: { opacity: 0 } as const,
    animate: { opacity: 1 } as const,
    exit: { opacity: 0 } as const,
    transition: { duration: 0.5, ease: PREMIUM_EASE },
  };

  // ===== CALLIGRAPHY: Scroll & ink style -- large + 2 small + text =====
  if (tab.key === 'shufa') {
    return (
      <motion.div {...panelProps} className="relative w-full min-h-[500px] md:min-h-[600px] rounded-[16px] overflow-hidden" style={{ backgroundColor: tab.bgColor }}>
        <div className="relative z-10 flex flex-col md:flex-row h-full p-6 md:p-10 lg:p-14 gap-6 md:gap-8">
          <div className="relative w-full md:w-[58%] h-[280px] md:h-[500px] rounded-[16px] overflow-hidden group">
            <img src={tab.images[0]} alt={tab.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="flex flex-col w-full md:w-[42%] gap-4 md:gap-6">
            <div className="flex gap-4">
              <div className="w-1/2 h-[140px] md:h-[180px] rounded-[12px] overflow-hidden">
                <img src={tab.images[1]} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="w-1/2 h-[140px] md:h-[180px] rounded-[12px] overflow-hidden">
                <img src={tab.images[2]} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-normal mb-3" style={{ fontFamily: "'Ma Shan Zheng', cursive", color: tab.color }}>{tab.subtitle}</h3>
              <p className="text-white/60 text-base md:text-lg leading-relaxed mb-6" style={{ fontFamily: "'LXGW WenKai', serif" }}>{tab.description}</p>
              <ExploreButton tab={tab} navigate={navigate} />
            </div>
          </div>
        </div>
        {/* Ink stroke decorative line */}
        <div className="absolute bottom-6 left-6 right-6 h-[2px] opacity-10" style={{ background: `linear-gradient(90deg, transparent, ${tab.color}, transparent)` }} />
      </motion.div>
    );
  }

  // ===== MURAL: Panoramic cinema -- full-width cinematic backdrop with floating detail cards =====
  if (tab.key === 'bihua') {
    return (
      <motion.div {...panelProps} className="relative w-full min-h-[500px] md:min-h-[600px] rounded-[16px] overflow-hidden" style={{ backgroundColor: tab.bgColor }}>
        {/* Full-bleed mural backdrop */}
        <div className="absolute inset-0">
          <img src={tab.images[0]} alt={tab.name} loading="lazy" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#162E2E]/95 via-[#162E2E]/70 to-[#162E2E]/95" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center h-full p-6 md:p-10 lg:p-14 gap-8">
          {/* Left: text + button */}
          <div className="w-full md:w-[40%] flex flex-col justify-center">
            <div className="text-[#3A9E9E]/40 text-xs tracking-[0.5em] uppercase mb-3" style={{ fontFamily: "'LXGW WenKai', serif" }}>Dunhuang &middot; Yongle</div>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-normal mb-4" style={{ fontFamily: "'Ma Shan Zheng', cursive", color: tab.color }}>{tab.subtitle}</h3>
            <div className="w-16 h-[2px] mb-5" style={{ background: `linear-gradient(90deg, ${tab.color}, transparent)` }} />
            <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8" style={{ fontFamily: "'LXGW WenKai', serif" }}>{tab.description}</p>
            <ExploreButton tab={tab} navigate={navigate} />
          </div>
          {/* Right: floating detail cards with perspective */}
          <div className="w-full md:w-[60%] flex gap-4 md:gap-6 justify-center items-end">
            <motion.div
              className="w-[45%] h-[220px] md:h-[380px] rounded-[12px] overflow-hidden shadow-2xl border border-white/10"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <img src={tab.images[1]} alt="" loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="w-[45%] h-[260px] md:h-[440px] rounded-[12px] overflow-hidden shadow-2xl border border-white/10"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              <img src={tab.images[2]} alt="" loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ===== CHINESE PAINTING: Vertical scroll aesthetic -- asymmetric with ink wash gradient =====
  if (tab.key === 'guohua') {
    return (
      <motion.div {...panelProps} className="relative w-full min-h-[500px] md:min-h-[600px] rounded-[16px] overflow-hidden" style={{ backgroundColor: tab.bgColor }}>
        {/* Subtle ink wash gradient background */}
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(212,167,106,0.15), transparent 70%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row h-full p-6 md:p-10 lg:p-14 gap-6 md:gap-8">
          {/* Left: vertical scroll-style image (tall) */}
          <motion.div
            className="w-full md:w-[35%] h-[300px] md:h-[520px] rounded-[8px] overflow-hidden relative"
            style={{ boxShadow: '8px 8px 30px rgba(0,0,0,0.4)' }}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <img src={tab.images[0]} alt={tab.name} loading="lazy" className="w-full h-full object-cover" />
            {/* Scroll mount effect */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#D4A76A]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#D4A76A]/40 to-transparent" />
          </motion.div>
          {/* Center: text content */}
          <div className="w-full md:w-[30%] flex flex-col justify-center py-4">
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-normal mb-4 leading-tight" style={{ fontFamily: "'Ma Shan Zheng', cursive", color: tab.color }}>{tab.subtitle}</h3>
            <div className="w-12 h-[1px] mb-5" style={{ backgroundColor: tab.color }} />
            <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8" style={{ fontFamily: "'LXGW WenKai', serif" }}>{tab.description}</p>
            <ExploreButton tab={tab} navigate={navigate} />
          </div>
          {/* Right: two stacked paintings */}
          <div className="w-full md:w-[35%] flex flex-col gap-4">
            <motion.div
              className="h-[150px] md:h-[250px] rounded-[8px] overflow-hidden"
              style={{ boxShadow: '4px 4px 20px rgba(0,0,0,0.3)' }}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              <img src={tab.images[1]} alt="" loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="h-[150px] md:h-[250px] rounded-[8px] overflow-hidden"
              style={{ boxShadow: '4px 4px 20px rgba(0,0,0,0.3)' }}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <img src={tab.images[2]} alt="" loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ===== BRONZE: Museum pedestal -- centered hero with spotlight glow =====
  if (tab.key === 'qingtong') {
    return (
      <motion.div {...panelProps} className="relative w-full min-h-[500px] md:min-h-[600px] rounded-[16px] overflow-hidden" style={{ backgroundColor: tab.bgColor }}>
        {/* Spotlight radial */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.12), transparent 65%)' }} />
        {/* Decorative bronze pattern border */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="none">
            <defs><pattern id="bronze-pat" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="40" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
              <circle cx="20" cy="20" r="4" fill="none" stroke="#C9A84C" strokeWidth="0.3"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#bronze-pat)" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center h-full p-6 md:p-10 lg:p-14 gap-8">
          {/* Left: two detail images stacked */}
          <div className="hidden md:flex flex-col w-[22%] gap-4">
            <motion.div className="h-[220px] rounded-[8px] overflow-hidden border border-[#C9A84C]/20"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <img src={tab.images[1]} alt="" loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div className="h-[220px] rounded-[8px] overflow-hidden border border-[#C9A84C]/20"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
              <img src={tab.images[2]} alt="" loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
          </div>
          {/* Center: hero bronze piece with glow */}
          <motion.div
            className="w-full md:w-[40%] h-[320px] md:h-[480px] rounded-[12px] overflow-hidden relative"
            style={{ boxShadow: '0 0 60px rgba(201,168,76,0.15), 0 20px 40px rgba(0,0,0,0.3)' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: PREMIUM_EASE }}
          >
            <img src={tab.images[0]} alt={tab.name} loading="lazy" className="w-full h-full object-cover" />
            {/* Vignette */}
            <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4)' }} />
          </motion.div>
          {/* Right: text */}
          <div className="w-full md:w-[38%] flex flex-col justify-center">
            <div className="text-[#C9A84C]/30 text-xs tracking-[0.5em] uppercase mb-2" style={{ fontFamily: "'LXGW WenKai', serif" }}>Bronze &middot; Ritual</div>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-normal mb-4" style={{ fontFamily: "'Ma Shan Zheng', cursive", color: tab.color }}>{tab.subtitle}</h3>
            <div className="w-20 h-[1px] mb-5" style={{ background: `linear-gradient(90deg, ${tab.color}, transparent)` }} />
            <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8" style={{ fontFamily: "'LXGW WenKai', serif" }}>{tab.description}</p>
            <ExploreButton tab={tab} navigate={navigate} />
            {/* Mobile: show detail images */}
            <div className="flex md:hidden gap-4 mt-6">
              <div className="w-1/2 h-[140px] rounded-[8px] overflow-hidden"><img src={tab.images[1]} alt="" loading="lazy" className="w-full h-full object-cover" /></div>
              <div className="w-1/2 h-[140px] rounded-[8px] overflow-hidden"><img src={tab.images[2]} alt="" loading="lazy" className="w-full h-full object-cover" /></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ===== PAPER-CUTTING: Folk festive -- red/white, paper-cut silhouette border =====
  if (tab.key === 'jianzhi') {
    return (
      <motion.div {...panelProps} className="relative w-full min-h-[500px] md:min-h-[600px] rounded-[16px] overflow-hidden" style={{ backgroundColor: tab.bgColor }}>
        {/* Red glow backdrop */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(224,85,69,0.1), transparent 60%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row h-full p-6 md:p-10 lg:p-14 gap-6 md:gap-8">
          {/* Left: text + description */}
          <div className="w-full md:w-[40%] flex flex-col justify-center order-2 md:order-1">
            <div className="text-[#E05545]/30 text-xs tracking-[0.5em] uppercase mb-2" style={{ fontFamily: "'LXGW WenKai', serif" }}>Folk Art &middot; 民间</div>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-normal mb-4" style={{ fontFamily: "'Ma Shan Zheng', cursive", color: tab.color }}>{tab.subtitle}</h3>
            <div className="w-16 h-[2px] rounded-full mb-5" style={{ backgroundColor: tab.color }} />
            <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8" style={{ fontFamily: "'LXGW WenKai', serif" }}>{tab.description}</p>
            <ExploreButton tab={tab} navigate={navigate} />
          </div>
          {/* Right: overlapping paper-cut images with rotation */}
          <div className="w-full md:w-[60%] flex items-center justify-center relative h-[300px] md:h-[500px] order-1 md:order-2">
            <motion.div
              className="absolute w-[55%] h-[70%] rounded-[12px] overflow-hidden shadow-2xl border-2 border-white/10"
              style={{ left: '5%', top: '10%', transform: 'rotate(-3deg)' }}
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: -3, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <img src={tab.images[0]} alt={tab.name} loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute w-[45%] h-[55%] rounded-[12px] overflow-hidden shadow-2xl border-2 border-[#E05545]/30"
              style={{ right: '5%', top: '5%', transform: 'rotate(4deg)' }}
              initial={{ rotate: 12, opacity: 0 }}
              animate={{ rotate: 4, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <img src={tab.images[1]} alt="" loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute w-[40%] h-[45%] rounded-[12px] overflow-hidden shadow-2xl border-2 border-white/10"
              style={{ right: '15%', bottom: '5%', transform: 'rotate(-2deg)' }}
              initial={{ rotate: -8, opacity: 0 }}
              animate={{ rotate: -2, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              <img src={tab.images[2]} alt="" loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
        {/* Top decorative zigzag (paper-cut style) */}
        <div className="absolute top-0 left-0 right-0 h-4 opacity-20 pointer-events-none">
          <svg viewBox="0 0 1200 16" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,16 L20,0 L40,16 L60,0 L80,16 L100,0 L120,16 L140,0 L160,16 L180,0 L200,16 L220,0 L240,16 L260,0 L280,16 L300,0 L320,16 L340,0 L360,16 L380,0 L400,16 L420,0 L440,16 L460,0 L480,16 L500,0 L520,16 L540,0 L560,16 L580,0 L600,16 L620,0 L640,16 L660,0 L680,16 L700,0 L720,16 L740,0 L760,16 L780,0 L800,16 L820,0 L840,16 L860,0 L880,16 L900,0 L920,16 L940,0 L960,16 L980,0 L1000,16 L1020,0 L1040,16 L1060,0 L1080,16 L1100,0 L1120,16 L1140,0 L1160,16 L1180,0 L1200,16" fill="#E05545" />
          </svg>
        </div>
      </motion.div>
    );
  }

  // Fallback (should not reach)
  return null;
}

// ============================================================
// MAIN HOME PAGE
// ============================================================
export default function Home() {
  useDocumentTitle(undefined);
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  const autoPlayRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseUntil = React.useRef(0);

  // Auto-rotate exhibition tabs every 5s, pause 12s on manual click
  React.useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      if (Date.now() < pauseUntil.current) return;
      setActiveTab(prev => (prev + 1) % EXHIBITION_TABS.length);
    }, 5000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, []);

  const handleTabClick = React.useCallback((i: number) => {
    setActiveTab(i);
    pauseUntil.current = Date.now() + 12000; // pause auto-rotate 12s after manual click
  }, []);

  const { scrollY } = useScroll();

  // Hero parallax
  const bgY = useTransform(scrollY, [0, 1000], ['0%', '40%']);
  const heroOverlayY = useTransform(scrollY, [0, 800], ['0%', '20%']);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const fixedBgOpacity = useTransform(scrollY, [0, 600, 900], [1, 1, 0]);

  return (
    <div className="w-full bg-[#E8E3D1]" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Background layers */}
      <motion.div
        style={{ y: bgY, opacity: fixedBgOpacity, pointerEvents: 'none' }}
        className="fixed inset-0 w-full h-screen z-0"
      >
        <img className="w-full h-full object-cover" src="/images/figma/bg-ink-wash-landscape.webp" alt="" />
      </motion.div>
      <motion.div
        style={{ y: heroOverlayY, opacity: fixedBgOpacity, pointerEvents: 'none' }}
        className="fixed inset-0 w-full h-screen z-[1]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.5, 0, 0.3, 1] }}
      >
        <img className="w-full h-full object-cover" src="/images/figma/hero-guohua.webp" alt="" />
      </motion.div>
      {/* Dark overlay for 博物馆 museum hero look */}
      <motion.div
        style={{ opacity: fixedBgOpacity, pointerEvents: 'none' }}
        className="fixed inset-0 w-full h-screen z-[2] bg-black/35"
      />

      {/* Left sidebar navigation (desktop only) */}
      <ColorStrip />

      <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="dark" title="首页" />

      {/* ==================== HERO ==================== */}
      <div id="hero" className="relative z-[5] w-full h-screen flex flex-col items-center justify-center overflow-hidden">

        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 flex flex-col items-center text-center">
          <div className="mb-8 md:mb-10 lg:mb-12">
            <HeroCharacterReveal />
          </div>

          <motion.div
            className="font-light text-[#E8E3D1] mb-12 md:mb-14 lg:mb-16 tracking-[0.2em] drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8, ease: PREMIUM_EASE }}
          >
            <span style={{ fontSize: 'clamp(1rem, 2.5vw, 2rem)', fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif", textShadow: '0 2px 12px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)' }}>AI驱动的中国传统艺术创作平台</span>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-5 md:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8, ease: PREMIUM_EASE }}
          >
            <motion.button
              type="button"
              onClick={() => navigate('/virtual-restoration')}
              className="px-10 py-4 rounded-full bg-[#7F3222] flex items-center justify-center overflow-hidden relative group"
              style={{ boxShadow: '0 4px 20px rgba(127, 50, 34, 0.25)' }}
              whileHover={{ scale: 1.04, y: -2, boxShadow: '0 8px 30px rgba(127, 50, 34, 0.35)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: PREMIUM_EASE }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="text-white text-lg md:text-xl font-medium relative tracking-widest" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>开始体验</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => document.getElementById('narrative')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 rounded-full flex items-center justify-center gap-2 backdrop-blur-sm border border-white/30"
              whileHover={{ scale: 1.04, y: -2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: PREMIUM_EASE }}
            >
              <span className="text-[#E8E3D1] text-lg md:text-xl font-normal tracking-widest" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>了解更多</span>
              <img src={asset19} alt="" className="w-[9px] h-[17px] opacity-70" />
            </motion.button>
          </motion.div>
        </div>

        <ScrollDownHint />
      </div>

      {/* ==================== HERO → NARRATIVE TRANSITION ==================== */}
      <div className="relative z-[6] w-full">
        {/* Gradient fade */}
        <div className="h-[300px] md:h-[400px] bg-gradient-to-b from-transparent to-[#E8E3D1] overflow-hidden">
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.5, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2 }}
          >
            <WavePattern color="#7F3222" opacity={0.12} />
          </motion.div>
        </div>
        {/* Torn paper edge transition */}
        <TornEdge topColor="#E8E3D1" bottomColor="#E8E3D1" height={80} variant="rough" />
      </div>

      {/* ==================== NARRATIVE SCROLL SECTION ==================== */}
      <section id="narrative" className="relative z-[7] w-full py-12 md:py-28 lg:py-36 bg-[#E8E3D1]">
        <div className="max-w-6xl mx-auto px-8 space-y-8 md:space-y-24 lg:space-y-32">
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: PREMIUM_EASE }}
          >
            <img
              src="/images/figma/text-chuancheng-jingdian.svg"
              alt="传承经典，创新未来"
              className="w-auto"
              style={{ height: 'clamp(2.5rem, 7vw, 6rem)' }}
            />
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-3 max-w-md mx-auto"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: PREMIUM_EASE }}
          >
            <div className="w-2 h-2 rounded-full bg-[#7F3222]" />
            <div className="flex-1 border-t-2 border-dashed border-[#7F3222]/40" />
            <div className="w-2 h-2 rounded-full bg-[#7F3222]" />
          </motion.div>

          <ScrollRevealText>
            每一笔墨痕，都承载着千年的文化记忆
          </ScrollRevealText>
          <ScrollRevealText>
            每一次修复，都是对历史的敬畏与传承
          </ScrollRevealText>
          <ScrollRevealText>
            AI 与传统艺术的融合，让文化遗产焕发新生
          </ScrollRevealText>
        </div>
      </section>

      {/* ==================== NARRATIVE → CATEGORIES TRANSITION ==================== */}
      <div className="relative z-[7]">
        <ArchitectureSilhouette variant="palace" color="#7F3222" bgColor="#E8E3D1" height={100} />
      </div>

      {/* ==================== ERA-THEMED EXHIBITION (Categories) ==================== */}
      <RevealSection id="categories" className="z-[7] w-full py-16 md:py-24 lg:py-28 bg-[#E8E3D1]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
          {/* Section title */}
          <motion.div
            className="text-center mb-10 md:mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: PREMIUM_EASE }}
          >
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-normal text-[#7F3222] mb-4"
              style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
            >
              常设展览
            </h2>
            <p className="text-[#7F3222]/60 text-sm md:text-base tracking-widest">还原历史的风貌与震撼</p>
          </motion.div>

          {/* Horizontal tab bar (museum-inspired) */}
          <div className="flex justify-center mb-8 md:mb-12 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 md:gap-4 lg:gap-8 px-4 py-2">
              {EXHIBITION_TABS.map((tab, i) => (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => handleTabClick(i)}
                  className="relative px-5 md:px-7 py-3 text-base md:text-lg whitespace-nowrap transition-all duration-300 rounded-lg"
                  style={{
                    fontFamily: "'LXGW WenKai', serif",
                    color: activeTab === i ? tab.tabColor : '#7F322266',
                    fontWeight: activeTab === i ? 600 : 400,
                    backgroundColor: activeTab === i ? `${tab.tabColor}12` : 'transparent',
                  }}
                >
                  {tab.name}
                  {/* Active underline + auto-play progress bar */}
                  {activeTab === i && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full overflow-hidden"
                      style={{ backgroundColor: `${tab.tabColor}30`, width: 40 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <motion.div
                        key={`progress-${activeTab}`}
                        className="h-full rounded-full"
                        style={{ backgroundColor: tab.tabColor }}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                      />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Exhibition panel */}
          <AnimatePresence mode="wait">
            <ExhibitionPanel
              key={EXHIBITION_TABS[activeTab].key}
              tab={EXHIBITION_TABS[activeTab]}
              isActive={true}
            />
          </AnimatePresence>
        </div>
      </RevealSection>

      {/* ==================== CATEGORIES → GALLERY TRANSITION ==================== */}
      <TornEdge topColor="#E8E3D1" bottomColor="#F5F0E3" height={90} variant="smooth" />

      {/* ==================== ART GALLERY ==================== */}
      <RevealSection id="gallery" className="z-[7] w-full py-16 md:py-24 lg:py-28 bg-[#F5F0E3]">
        <ArtGallery />
      </RevealSection>

      {/* ==================== GALLERY → MUSEUM HIGHLIGHT TRANSITION ==================== */}
      <ArchitectureSilhouette variant="mountain" color="#7F3222" bgColor="#F5F0E3" height={100} />

      {/* ==================== MUSEUM HIGHLIGHT ==================== */}
      <RevealSection id="masterpieces" className="z-[7]">
        <MuseumHighlight />
      </RevealSection>

      {/* ==================== HIGHLIGHT → SHOWCASE TRANSITION ==================== */}
      <TornEdge topColor="#5a1a1a" bottomColor="#2c241b" height={80} variant="wave" />

      {/* ==================== LANDSCAPE BACKDROP FOR BOTTOM SECTIONS ==================== */}
      <div
        className="relative z-[7] w-full"
        style={{
          backgroundImage: "url('/images/figma/bg-ink-wash-landscape.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Top gradient overlay: dark → semi-transparent to reveal landscape gradually */}
        <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[#2c241b] via-[#2c241b]/60 to-transparent pointer-events-none z-[1]" />

        {/* ==================== RESTORATION SHOWCASE ==================== */}
        <RevealSection id="showcase">
          <RestorationShowcase />
        </RevealSection>

        {/* ==================== DIGITAL HUMAN TEASER ==================== */}
        <RevealSection id="digital-human">
          <DigitalHumanTeaser />
        </RevealSection>

        {/* ==================== FOOTER ==================== */}
        <Footer />
      </div>
    </div>
  );
}
