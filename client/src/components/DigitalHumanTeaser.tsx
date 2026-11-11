import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';

const PREMIUM_EASE = [0.5, 0, 0.3, 1] as const;

const FEATURED_CHARS = [
  {
    id: 'libai',
    name: '李白',
    title: '诗仙',
    dynasty: '唐',
    representChar: '仙',
    quote: '举杯邀明月，对影成三人',
    accentColor: '#D4A76A',
    bgGradient: 'linear-gradient(135deg, #1a0e00 0%, #2d1800 60%, #1a0e00 100%)',
    category: 'wenren' as const,
    activities: ['吟诵诗词', '对月饮酒', '剑舞狂歌'],
  },
  {
    id: 'yuefei',
    name: '岳飞',
    title: '精忠报国',
    dynasty: '宋',
    representChar: '忠',
    quote: '壮志饥餐胡虏肉，笑谈渴饮匈奴血',
    accentColor: '#C84040',
    bgGradient: 'linear-gradient(135deg, #100000 0%, #200505 60%, #100000 100%)',
    category: 'wujiang' as const,
    activities: ['骑马征战', '弓箭射击', '精忠故事'],
  },
  {
    id: 'sushi',
    name: '苏轼',
    title: '东坡居士',
    dynasty: '宋',
    representChar: '豪',
    quote: '大江东去，浪淘尽，千古风流人物',
    accentColor: '#C8A96E',
    bgGradient: 'linear-gradient(135deg, #130d00 0%, #241800 60%, #130d00 100%)',
    category: 'wenren' as const,
    activities: ['豪放词赋', '书法挥毫', '品茗论道'],
  },
  {
    id: 'mulan',
    name: '花木兰',
    title: '代父从军',
    dynasty: '北魏',
    representChar: '勇',
    quote: '万里赴戎机，关山度若飞',
    accentColor: '#9060B0',
    bgGradient: 'linear-gradient(135deg, #080010 0%, #100025 60%, #080010 100%)',
    category: 'wujiang' as const,
    activities: ['骑马射箭', '武艺展示', '从军故事'],
  },
];

function LiteraryFigureMini({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="100" cy="38" rx="22" ry="26" fill={color} opacity="0.55" />
      <path d="M82 22 L100 8 L118 22 L114 28 L86 28 Z" fill={color} opacity="0.45" />
      <path d="M74 64 L58 100 L48 185 L62 188 L76 130 L100 148 L124 130 L138 188 L152 185 L142 100 L126 64 Z"
        fill={color} opacity="0.40" />
      <path d="M74 72 Q38 88 18 98 Q28 118 50 112 L74 102 Z" fill={color} opacity="0.32" />
      <path d="M126 72 Q162 88 182 98 Q172 118 150 112 L126 102 Z" fill={color} opacity="0.32" />
      <rect x="14" y="92" width="7" height="28" rx="3" fill={color} opacity="0.50" />
      <path d="M48 185 Q38 220 30 250 Q60 240 75 210 L62 188 Z" fill={color} opacity="0.22" />
      <path d="M152 185 Q162 220 170 250 Q140 240 125 210 L138 188 Z" fill={color} opacity="0.22" />
    </svg>
  );
}

function MartialFigureMini({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="100" cy="36" rx="24" ry="28" fill={color} opacity="0.55" />
      <path d="M78 22 Q100 2 122 22 L118 30 L82 30 Z" fill={color} opacity="0.50" />
      <path d="M76 64 L58 92 L52 170 L68 175 L82 120 L100 138 L118 120 L132 175 L148 170 L142 92 L124 64 Z"
        fill={color} opacity="0.45" />
      <ellipse cx="62" cy="72" rx="18" ry="12" fill={color} opacity="0.38" transform="rotate(-15 62 72)" />
      <ellipse cx="138" cy="72" rx="18" ry="12" fill={color} opacity="0.38" transform="rotate(15 138 72)" />
      <path d="M124 68 L158 42 L168 20 L155 14 L140 35 L118 62 Z" fill={color} opacity="0.38" />
      <line x1="160" y1="6" x2="100" y2="50" stroke={color} strokeWidth="3" opacity="0.55" />
      <path d="M162 2 L168 8 L158 12 Z" fill={color} opacity="0.60" />
      <path d="M52 170 Q38 210 35 245 Q62 230 72 200 L68 175 Z" fill={color} opacity="0.25" />
      <path d="M148 170 Q162 210 165 245 Q138 230 128 200 L132 175 Z" fill={color} opacity="0.25" />
    </svg>
  );
}

function DigitalHumanTeaser() {
  const [, navigate] = useLocation();
  const [activeIdx, setActiveIdx] = useState(0);
  const active = FEATURED_CHARS[activeIdx];

  return (
    <section
      className="relative w-full py-20 md:py-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f0906 0%, #1a0f08 50%, #0f0906 100%)' }}
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <filter id="tsr-blur"><feGaussianBlur stdDeviation="80" /></filter>
          </defs>
          <AnimatePresence>
            <motion.ellipse
              key={active.id}
              cx="600" cy="300" rx="400" ry="280"
              fill={active.accentColor}
              opacity="0.06"
              filter="url(#tsr-blur)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.06 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
        </svg>
      </div>

      {/* Top border line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,167,106,0.2), transparent)' }}
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
        {/* Section header */}
        <motion.div
          className="text-center mb-14 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: PREMIUM_EASE }}
        >
          <div
            className="text-xs text-[#D4A76A]/60 tracking-[0.5em] uppercase mb-4"
            style={{ fontFamily: "'LXGW WenKai', serif" }}
          >
            活化利用 · Digital Humans
          </div>
          <h2
            className="text-4xl md:text-6xl font-normal text-[#E8E3D1] mb-4"
            style={{ fontFamily: "'Ma Shan Zheng', cursive", textShadow: '0 2px 30px rgba(212,167,106,0.15)' }}
          >
            数字人·古今对话
          </h2>
          <p
            className="text-sm md:text-base text-[#E8E3D1]/40 tracking-[0.15em] max-w-xl mx-auto"
            style={{ fontFamily: "'LXGW WenKai', serif" }}
          >
            AI赋能千年文人武将，以数字形态重述历史，传承文化记忆
          </p>
        </motion.div>

        {/* Main layout: character selector + detail */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
          {/* Left: character selection cards */}
          <div className="flex flex-row lg:flex-col gap-2 md:gap-3 lg:gap-4 w-full lg:w-auto lg:shrink-0 overflow-x-auto scrollbar-hide">
            {FEATURED_CHARS.map((char, idx) => (
              <motion.button
                key={char.id}
                onClick={() => setActiveIdx(idx)}
                className="relative flex items-center gap-2 md:gap-3 p-2.5 md:p-4 rounded-xl border text-left transition-all shrink-0 lg:w-48 min-h-[44px]"
                style={{
                  background: activeIdx === idx ? `${char.accentColor}18` : 'rgba(255,255,255,0.03)',
                  borderColor: activeIdx === idx ? `${char.accentColor}60` : 'rgba(255,255,255,0.08)',
                  boxShadow: activeIdx === idx ? `0 0 20px ${char.accentColor}15` : 'none',
                }}
                whileHover={{ borderColor: `${char.accentColor}40`, transition: { duration: 0.2 } }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                {/* Mini character indicator */}
                <div
                  className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-lg font-normal"
                  style={{
                    background: char.bgGradient,
                    fontFamily: "'Ma Shan Zheng', cursive",
                    color: char.accentColor,
                    border: `1px solid ${char.accentColor}30`,
                  }}
                >
                  {char.representChar}
                </div>
                <div className="min-w-0 hidden md:block">
                  <div
                    className="text-sm font-normal text-[#E8E3D1]"
                    style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                  >
                    {char.name}
                  </div>
                  <div
                    className="text-[10px] truncate"
                    style={{ color: char.accentColor, fontFamily: "'LXGW WenKai', serif" }}
                  >
                    {char.title}
                  </div>
                </div>
                {/* Active indicator */}
                {activeIdx === idx && (
                  <motion.div
                    className="absolute right-2 w-1.5 h-1.5 rounded-full hidden lg:block"
                    style={{ backgroundColor: char.accentColor }}
                    layoutId="teaser-active-dot"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}

            {/* View all button */}
            <motion.button
              onClick={() => navigate('/digital-human')}
              className="p-3 md:p-4 rounded-xl border text-center lg:w-48 transition-all"
              style={{
                background: 'rgba(127, 50, 34, 0.08)',
                borderColor: 'rgba(127, 50, 34, 0.3)',
                color: '#C85840',
              }}
              whileHover={{ borderColor: '#C85840', backgroundColor: 'rgba(127, 50, 34, 0.15)' }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <span
                className="text-xs tracking-widest hidden md:block"
                style={{ fontFamily: "'LXGW WenKai', serif" }}
              >
                +6 更多人物
              </span>
              <span
                className="text-xs tracking-widest md:hidden"
                style={{ fontFamily: "'LXGW WenKai', serif" }}
              >
                +6
              </span>
            </motion.button>
          </div>

          {/* Right: character showcase */}
          <div className="flex-1 min-h-[320px] md:min-h-[460px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="w-full h-full rounded-2xl overflow-hidden relative"
                style={{
                  background: active.bgGradient,
                  border: `1px solid ${active.accentColor}25`,
                  minHeight: '320px',
                }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: PREMIUM_EASE }}
              >
                {/* Ink glow background */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
                    <defs>
                      <filter id="tsr-card-blur"><feGaussianBlur stdDeviation="40" /></filter>
                    </defs>
                    <ellipse cx="600" cy="250" rx="250" ry="300" fill={active.accentColor} opacity="0.10"
                      filter="url(#tsr-card-blur)" />
                    <ellipse cx="200" cy="150" rx="150" ry="180" fill={active.accentColor} opacity="0.07"
                      filter="url(#tsr-card-blur)" />
                  </svg>
                </div>

                {/* Large background character */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <span
                    className="text-[240px] leading-none"
                    style={{
                      fontFamily: "'Ma Shan Zheng', cursive",
                      color: active.accentColor,
                      opacity: 0.05,
                    }}
                  >
                    {active.representChar}
                  </span>
                </div>

                {/* Character silhouette - right side */}
                <div className="absolute right-6 md:right-12 bottom-0 w-[180px] md:w-[220px] h-[75%]">
                  {active.category === 'wenren'
                    ? <LiteraryFigureMini color={active.accentColor} />
                    : <MartialFigureMini color={active.accentColor} />
                  }
                </div>

                {/* Bottom fade on silhouette */}
                <div
                  className="absolute bottom-0 right-0 w-[260px] h-20 pointer-events-none"
                  style={{ background: `linear-gradient(to top, ${active.bgGradient.match(/#\w+/)?.[0] || '#0a0603'} 0%, transparent 100%)` }}
                />

                {/* Content overlay */}
                <div className="relative z-10 p-6 md:p-10 flex flex-col justify-between h-full">
                  {/* Top: badge */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span
                        className="px-3 py-1 rounded-full text-xs tracking-widest border"
                        style={{
                          borderColor: `${active.accentColor}50`,
                          color: active.accentColor,
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          fontFamily: "'LXGW WenKai', serif",
                        }}
                      >
                        {active.dynasty}朝 · {active.category === 'wenren' ? '文人墨客' : '豪侠武将'}
                      </span>
                    </div>

                    {/* Name */}
                    <h3
                      className="text-6xl md:text-7xl font-normal text-white mb-2 leading-none"
                      style={{ fontFamily: "'Ma Shan Zheng', cursive", textShadow: `0 2px 30px ${active.accentColor}30` }}
                    >
                      {active.name}
                    </h3>
                    <div
                      className="text-base mb-6"
                      style={{ color: active.accentColor, fontFamily: "'LXGW WenKai', serif" }}
                    >
                      {active.title}
                    </div>

                    {/* Quote */}
                    <div
                      className="pl-4 mb-8 max-w-xs"
                      style={{ borderLeft: `2px solid ${active.accentColor}50` }}
                    >
                      <p
                        className="text-sm md:text-base text-white/50 leading-relaxed"
                        style={{ fontFamily: "'LXGW WenKai', serif" }}
                      >
                        「{active.quote}」
                      </p>
                    </div>
                  </div>

                  {/* Bottom: activities + CTA */}
                  <div>
                    {/* Activity tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {active.activities.map(act => (
                        <span
                          key={act}
                          className="px-3 py-1 rounded-full text-xs tracking-wider border"
                          style={{
                            borderColor: `${active.accentColor}40`,
                            color: `${active.accentColor}80`,
                            backgroundColor: `${active.accentColor}12`,
                            fontFamily: "'LXGW WenKai', serif",
                          }}
                        >
                          {act}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex gap-3 flex-wrap">
                      <motion.button
                        onClick={() => navigate('/digital-human')}
                        className="flex items-center gap-2 px-5 md:px-6 py-3.5 md:py-3 rounded-full text-sm tracking-[0.2em] relative overflow-hidden min-h-[44px]"
                        style={{
                          background: `linear-gradient(135deg, ${active.accentColor}35, ${active.accentColor}15)`,
                          border: `1px solid ${active.accentColor}50`,
                          color: active.accentColor,
                          fontFamily: "'LXGW WenKai', serif",
                        }}
                        whileHover={{ scale: 1.04, y: -1, boxShadow: `0 6px 24px ${active.accentColor}25` }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span>唤醒 · 对话</span>
                        <ArrowRight size={14} />
                        <motion.div
                          className="absolute inset-0"
                          style={{ background: `linear-gradient(90deg, transparent, ${active.accentColor}15, transparent)` }}
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                        />
                      </motion.button>

                      <motion.button
                        onClick={() => navigate('/digital-human')}
                        className="px-5 md:px-6 py-3.5 md:py-3 rounded-full text-sm tracking-[0.2em] border text-white/50 min-h-[44px]"
                        style={{
                          borderColor: 'rgba(255,255,255,0.1)',
                          fontFamily: "'LXGW WenKai', serif",
                        }}
                        whileHover={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)' }}
                        whileTap={{ scale: 0.97 }}
                      >
                        全部人物
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom: view all CTA */}
        <motion.div
          className="text-center mt-12 md:mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.button
            onClick={() => navigate('/digital-human')}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-sm tracking-[0.25em] border"
            style={{
              borderColor: 'rgba(212,167,106,0.3)',
              color: '#D4A76A',
              fontFamily: "'LXGW WenKai', serif",
              backgroundColor: 'rgba(212,167,106,0.05)',
            }}
            whileHover={{
              borderColor: 'rgba(212,167,106,0.6)',
              backgroundColor: 'rgba(212,167,106,0.12)',
              x: 0,
              boxShadow: '0 4px 20px rgba(212,167,106,0.15)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            <span>探索全部十位历史人物</span>
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom border line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,167,106,0.15), transparent)' }}
      />
    </section>
  );
}

export default React.memo(DigitalHumanTeaser);
