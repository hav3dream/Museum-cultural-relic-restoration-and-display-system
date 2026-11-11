import asset1 from '@/assets/2672-651.webp';
import asset3 from '@/assets/2661-577.webp';
import asset4 from '@/assets/2661-580.webp';
import asset5 from '@/assets/2661-583.webp';
import asset10 from '@/assets/I2661-571-8899-43674.svg';
import asset11 from '@/assets/I2661-548-8899-35424.svg';
import asset13 from '@/assets/I2661-552-8899-30891.svg';
import asset8 from '@/assets/2661-594.svg';
import asset15 from '@/assets/I2661-597-466-116.svg';
import asset16 from '@/assets/I2661-600-466-136.svg';
import asset17 from '@/assets/2661-618.webp';
import asset18 from '@/assets/2661-622.webp';
import { useLocation } from 'wouter';
import MobileMenu from '@/components/MobileMenu';
import React from 'react';
import { toast } from 'sonner';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { CloudDrift, InkBrushStroke, MistEffect, SealStamp, WavePattern } from '@/components/decorative';
import Footer from '@/components/layout/Footer';
import StickyHeader from '@/components/StickyHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const CREATION_CARDS = [
  {
    title: '书法创作', icon: asset13, image: asset5, route: '/calligraphy-generation',
    desc: '输入文字即可生成多种书法风格作品',
  },
  {
    title: '风格迁移', icon: asset10, image: asset3, route: '/style-transfer',
    desc: '将现代照片转化为传统国画风格',
  },
  {
    title: '线稿上色', icon: asset11, image: asset4, route: '/pattern-generation',
    desc: '上传线稿与风格参考图，自动上色生成彩色国画',
  },
  {
    title: '山水画生成', icon: asset10, image: asset17, route: '/ai-generation/ink-painting',
    desc: '通过文字描述或引导图生成高质量传统山水画',
  },
  {
    title: '书画融合', icon: asset13, image: asset18, route: '/ai-generation/callipaint',
    desc: '将书法文字自然融入山水画，生成诗画合一的国画作品',
  },
  {
    title: '文本引导上色', icon: asset11, image: asset3, route: '/text-colorization',
    desc: '基于M3FPainter模型，通过文字描述引导线稿智能上色',
  },
];

const TECH_ITEMS = [
  { icon: asset8, title: '生成式AI', desc: '基于最新的Diffusion模型，实现高质量的艺术图像生成与风格转换', number: '01' },
  { icon: asset15, title: '风格学习', desc: '深度学习传统艺术风格特征，精准捕捉笔墨神韵与构图规律', number: '02' },
  { icon: asset16, title: '人机协作', desc: '提供灵活的控制参数，让AI成为艺术家得心应手的创作助手', number: '03' },
];

const APP_SCENARIOS = [
  {
    image: asset17, title: '文创产品设计',
    desc: '快速生成具有传统文化特色的图案和纹样，应用于文创产品开发',
    items: ['包装设计', '服饰印花', '纪念品开发'],
  },
  {
    image: asset18, title: '数字艺术创作',
    desc: '探索传统艺术在数字时代的全新表现形式，创造独特的视觉体验',
    items: ['数字藏品(NFT)', '沉浸式展览', '跨媒体艺术'],
  },
];

function TiltCard({ children, className, onClick, disabled }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={disabled ? undefined : handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.5, 0, 0.3, 1] } },
};

export default function SmartCreation() {
  useDocumentTitle('智绘生成');
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="w-full bg-white overflow-hidden min-h-screen relative" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Fixed Background */}
      <div className="fixed inset-0 z-0">
        <img className="w-full h-full object-cover" src={asset1} alt="" />
      </div>

      {/* Floating cloud decorations */}
      <div className="fixed top-20 left-0 right-0 pointer-events-none z-1 opacity-30">
        <CloudDrift />
      </div>

      {/* Bottom mist */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-1">
        <MistEffect position="bottom" />
      </div>

      <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="light" title="智绘生成" />

      <div className="relative z-10">
        {/* Page Title - character stagger animation */}
        <div className="w-full pt-32 pb-20 md:pb-24 relative">
          {/* Floating ink particles behind hero */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full bg-[#7F3222]/20"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + Math.sin(i) * 20}%`,
                  filter: 'blur(2px)',
                }}
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.sin(i) * 10, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>

          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 text-center relative z-10">
            <div className="flex justify-center gap-2 md:gap-4 mb-6">
              {['智', '绘', '生', '成'].map((char, i) => (
                <motion.span
                  key={`title-${i}`}
                  className="text-5xl md:text-7xl lg:text-8xl font-normal inline-block"
                  style={{
                    fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive",
                    background: 'linear-gradient(90deg, #7F3222 0%, #D4A76A 50%, #7F3222 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  initial={{ opacity: 0, y: -30, rotateX: -90 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    opacity: { delay: 0.2 + i * 0.12, duration: 0.6 },
                    y: { delay: 0.2 + i * 0.12, duration: 0.6, type: 'spring' },
                    rotateX: { delay: 0.2 + i * 0.12, duration: 0.6, type: 'spring' },
                    backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' },
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            <motion.div className="flex justify-center mb-6" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
              <InkBrushStroke width={200} color="#7F3222" />
            </motion.div>
            <div className="text-[#7F3222] text-xl md:text-2xl lg:text-3xl font-light max-w-5xl mx-auto leading-relaxed opacity-90">
              {['融合传统美学与现代AI', '激发无限创意', '让每个人都能成为艺术创作者'].map((segment, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.9, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + i * 0.15 }}
                >
                  {segment}
                  {i < 2 && '，'}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards - 3D tilt cards with perspective */}
        <div className="w-full py-16 px-6 lg:px-8 xl:px-12" style={{ perspective: '1200px' }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {CREATION_CARDS.map((card) => (
                <motion.div key={card.title} variants={cardVariants}>
                  <TiltCard
                    onClick={() => navigate(card.route)}
                    className="group rounded-[20px] overflow-hidden bg-[#F5F0E3]/20 backdrop-blur-sm shadow-sm border border-[#7F3222]/10 hover:shadow-2xl transition-shadow duration-300 cursor-pointer text-left relative"
                  >
                    {/* Animated gradient border on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-[20px] pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, #D4A76A 0%, #7F3222 50%, #D4A76A 100%)',
                        padding: '2px',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="aspect-[4/3] overflow-hidden relative">
                      <motion.img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05, y: -4 }}
                        transition={{ duration: 0.7 }}
                      />

                      {/* Gold shimmer overlay on image hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-[#D4A76A]/30 via-transparent to-[#D4A76A]/30 pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <SealStamp text="创" size={40} color="#D4A76A" delay={0} />
                      </div>
                    </div>
                    <div className="p-8 relative">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.img src={card.icon} alt="" className="w-12 h-12 opacity-80" whileHover={{ scale: 1.2, rotate: 5 }} />
                        <h3 className="text-[#7F3222] text-2xl lg:text-3xl font-semibold" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}>{card.title}</h3>
                      </div>
                      <p className="text-[#7F3222]/70 text-base lg:text-lg mb-6 leading-relaxed" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{card.desc}</p>
                      <div className="w-full rounded-xl py-4 text-lg lg:text-xl font-medium text-center transition-all duration-300 relative overflow-hidden bg-[#F5F0E3]/40 text-[#7F3222] group-hover:bg-[#7F3222] group-hover:text-[#F5F0E3]">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <span className="relative">开始创作</span>
                      </div>

                      {/* Gold accent line at bottom */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4A76A] to-transparent"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* InkBrushStroke divider */}
        <div className="w-full py-12 flex justify-center">
          <InkBrushStroke width={300} color="#7F3222" />
        </div>

        {/* Technical Advantages - numbered cards with accent lines */}
        <div className="w-full py-24 md:py-28">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-normal text-[#7F3222] mb-4"
                style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1] }}
              >
                核心技术
              </motion.h2>
              <motion.div className="flex justify-center" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <InkBrushStroke width={160} color="#7F3222" />
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 relative">
              {/* SVG connecting lines between tech items (desktop only) */}
              <svg className="hidden md:block absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                <motion.line
                  x1="33%"
                  y1="50%"
                  x2="50%"
                  y2="50%"
                  stroke="#D4A76A"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.4 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                <motion.line
                  x1="66%"
                  y1="50%"
                  x2="83%"
                  y2="50%"
                  stroke="#D4A76A"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.4 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </svg>

              {TECH_ITEMS.map((tech, idx) => (
                <motion.div
                  key={tech.title}
                  className="group relative bg-[#F5F0E3]/10 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-[#7F3222]/10 hover:border-[#7F3222]/30 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.5, 0, 0.3, 1] }}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px -12px rgba(127, 50, 34, 0.2)' }}
                >
                  <div className="absolute top-4 right-6 text-[80px] font-bold text-[#7F3222]/5 leading-none select-none" style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>
                    {tech.number}
                  </div>
                  {/* Animated circle behind number */}
                  <motion.svg
                    className="absolute top-4 right-6 pointer-events-none"
                    width="90"
                    height="90"
                    viewBox="0 0 90 90"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.15 + 0.3 }}
                  >
                    <motion.circle
                      cx="45"
                      cy="45"
                      r="40"
                      fill="none"
                      stroke="#D4A76A"
                      strokeWidth="1.5"
                      opacity="0.2"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: idx * 0.15 + 0.5, ease: 'easeInOut' }}
                    />
                  </motion.svg>
                  <div className="relative z-10">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-[#F5F0E3]/40 flex items-center justify-center mb-6 group-hover:bg-[#7F3222]/10 transition-colors duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <img src={tech.icon} alt={tech.title} className="w-8 h-8 opacity-80 object-contain" />
                    </motion.div>
                    <h3 className="text-[#7F3222] text-xl lg:text-2xl font-semibold mb-3" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}>{tech.title}</h3>
                    <p className="text-[#7F3222]/70 text-base lg:text-lg font-light leading-relaxed" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{tech.desc}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A76A]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* InkBrushStroke divider */}
        <div className="w-full py-12 flex justify-center">
          <InkBrushStroke width={300} color="#7F3222" />
        </div>

        {/* Application Scenarios - enhanced with overlay title */}
        <div className="w-full py-24 md:py-28 pb-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <motion.h2
              className="text-center text-4xl md:text-5xl lg:text-6xl font-normal text-[#7F3222] mb-4"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1] }}
            >
              创意应用
            </motion.h2>
            <motion.div className="flex justify-center mb-16" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <InkBrushStroke width={160} color="#7F3222" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {APP_SCENARIOS.map((sc, idx) => (
                <motion.div
                  key={sc.title}
                  className="group rounded-[20px] overflow-hidden bg-[#F5F0E3]/10 backdrop-blur-sm shadow-sm border border-[#7F3222]/10 hover:shadow-2xl transition-all duration-500"
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.2, ease: [0.5, 0, 0.3, 1] }}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px -12px rgba(127, 50, 34, 0.2)' }}
                >
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <motion.img
                      src={sc.image}
                      alt={sc.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05, y: -4 }}
                      transition={{ duration: 0.7 }}
                    />

                    {/* Gold shimmer overlay on image hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-[#D4A76A]/40 via-transparent to-[#D4A76A]/30 pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <h3 className="absolute bottom-6 left-8 text-white text-3xl lg:text-4xl font-bold" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}>{sc.title}</h3>
                  </div>
                  <div className="p-8 lg:p-10">
                    <p className="text-[#7F3222]/90 text-lg lg:text-xl font-light mb-6 leading-relaxed" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{sc.desc}</p>
                    <ul className="text-[#7F3222] text-lg lg:text-xl font-normal space-y-3 mb-6">
                      {sc.items.map((item, i) => (
                        <motion.li
                          key={item}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <span className="w-2 h-2 rounded-full bg-[#D4A76A] flex-shrink-0" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div
                      className="group/link flex items-center gap-2 text-[#D4A76A] cursor-pointer w-fit"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-base lg:text-lg font-medium">查看详情</span>
                      <motion.span
                        className="inline-block"
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        →
                      </motion.span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section with aurora gradient background */}
        <div className="w-full py-32 md:py-40 relative overflow-hidden">
          {/* Aurora gradient layers */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 30% 50%, rgba(212, 167, 106, 0.15), transparent 50%)',
              filter: 'blur(60px)',
            }}
            animate={{
              x: [-20, 20, -20],
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 70% 50%, rgba(127, 50, 34, 0.1), transparent 50%)',
              filter: 'blur(80px)',
            }}
            animate={{
              x: [20, -20, 20],
              y: [10, -10, 10],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <div className="max-w-5xl mx-auto px-6 lg:px-8 xl:px-12 text-center relative z-10">
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-normal text-[#7F3222] mb-6"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1] }}
            >
              开启您的创作之旅
            </motion.h2>
            <motion.p
              className="text-[#7F3222]/80 text-xl lg:text-2xl mb-12 leading-relaxed"
              style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.5, 0, 0.3, 1] }}
            >
              让AI成为您的创作助手，探索传统艺术的无限可能
            </motion.p>

            <motion.div
              className="relative inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Pulsing glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(212, 167, 106, 0.3), transparent 70%)',
                  filter: 'blur(20px)',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <motion.button
                type="button"
                className="relative px-14 py-5 bg-[#7F3222] text-white text-lg lg:text-xl font-medium rounded-full shadow-lg hover:bg-[#6B2A1C] transition-colors duration-300 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/calligraphy-generation')}
              >
                {/* Gold shimmer sweep on hover */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4A76A]/40 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>立即体验</span>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* WavePattern decoration at bottom */}
        <div className="w-full">
          <WavePattern />
        </div>

        <Footer />
      </div>
    </div>
  );
}
