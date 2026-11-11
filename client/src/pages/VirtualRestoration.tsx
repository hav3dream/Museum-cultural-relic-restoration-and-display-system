import asset1 from '@/assets/2672-651.webp';
import asset2 from '@/assets/2661-575.webp';
import asset3 from '@/assets/2661-577.webp';
import asset4 from '@/assets/2661-580.webp';
import asset5 from '@/assets/2661-583.webp';
import asset6 from '@/assets/2686-139.webp';
import asset7 from '@/assets/2686-142.webp';
import asset8 from '@/assets/2661-594.svg';
import asset9 from '@/assets/I2661-556-8899-16345.svg';
import asset10 from '@/assets/I2661-571-8899-43674.svg';
import asset11 from '@/assets/I2661-548-8899-35424.svg';
import asset12 from '@/assets/I2686-118-8899-35424.svg';
import asset13 from '@/assets/I2661-552-8899-30891.svg';
import asset14 from '@/assets/I2686-122-8899-30891.svg';
import asset15 from '@/assets/I2661-597-466-116.svg';
import asset16 from '@/assets/I2661-600-466-136.svg';
import asset17 from '@/assets/2661-618.webp';
import asset18 from '@/assets/2661-622.webp';
import { useLocation } from 'wouter';
import MobileMenu from '@/components/MobileMenu';
import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { CloudDrift } from '@/components/decorative';
import Footer from '@/components/layout/Footer';
import StickyHeader from '@/components/StickyHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const FEATURE_CARDS = [
  { title: '古画修复', icon: asset10, image: asset3, route: '/ancient-painting-restoration', desc: '多算法协同修复古代画作破损与褪色' },
  { title: '壁画修复', icon: asset11, image: asset4, route: '/mural-restoration', desc: '基于DCADif的壁画结构与风格重建' },
  { title: '书法碑林', icon: asset13, image: asset5, route: '/stele-restoration', desc: '碑刻拓片的高精度数字化修复' },
  { title: '轮廓解析', icon: asset9, image: asset2, route: '/outline-analysis', desc: '半监督壁画轮廓线稿自动提取' },
  { title: '语义分割', icon: asset12, image: asset6, route: '/semantic-segmentation', desc: '语义级别的文物图像分割分析' },
  { title: '超分重建', icon: asset14, image: asset7, route: '/super-resolution', desc: '低分辨率文物图像的超清重建' },
  { title: '融合修复', icon: asset10, image: asset6, route: '/fusion-repair', desc: '基于Mamba模型的古画智能融合修复' },
];

const ADVANTAGES = [
  { icon: asset8, title: 'AI智能算法', desc: '集成多种先进AI模型，包括SGRGAN、Mamba、ALICE等，提供高精度修复效果', number: '01' },
  { icon: asset15, title: '文化遗产保护', desc: '非接触式数字化修复，最大程度保护文物原貌，为文化传承提供技术支持', number: '02' },
  { icon: asset16, title: '高效便捷', desc: '简化复杂操作流程，用户只需上传图像即可获得专业级修复效果', number: '03' },
];

const SCENARIOS = [
  {
    image: asset17, title: '博物馆与研究机构',
    desc: '为文物修复专家提供数字化修复工具，辅助古画、壁画的保护和研究工作',
    items: ['高精度文物数字化存档', '辅助修复方案制定', '文物状态监测与分析'],
  },
  {
    image: asset18, title: '艺术创作与教育',
    desc: '为艺术家、设计师和学生提供传统艺术学习和创作的数字工具平台',
    items: ['传统艺术技法学习', '创作灵感获取', '艺术作品数字化展示'],
  },
];

function TiltCard({ children, className, style, onClick, disabled }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
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
      style={{ ...style, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={disabled ? undefined : handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

function ScenarioListItem({ item, index }: { item: string; index: number }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.li
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        className="rounded-full bg-[#D4A76A] flex-shrink-0"
        animate={isHovered ? {
          width: '10px',
          height: '10px',
          boxShadow: '0 0 8px rgba(212, 167, 106, 0.6)'
        } : {
          width: '8px',
          height: '8px',
          boxShadow: 'none'
        }}
        transition={{ duration: 0.2 }}
      />
      {item}
    </motion.li>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95, rotateY: -3 },
  visible: { opacity: 1, y: 0, scale: 1, rotateY: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function VirtualRestoration() {
  useDocumentTitle('虚拟复原');
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
      <div className="fixed top-20 left-0 right-0 pointer-events-none z-1 opacity-40">
        <CloudDrift />
      </div>

      <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="light" title="虚拟复原" />

      <div className="relative z-10">
        {/* Page Title */}
        <div className="w-full pt-24 md:pt-32 py-10 md:py-24 relative">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 text-center relative z-10">
            <div className="flex justify-center gap-2 md:gap-4 mb-4 md:mb-6">
              {['虚', '拟', '复', '原'].map((char, i) => (
                <motion.span
                  key={`title-${i}`}
                  className="text-4xl md:text-7xl lg:text-8xl font-normal inline-block relative"
                  style={{
                    fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive",
                    backgroundImage: 'linear-gradient(90deg, #7F3222 0%, #D4A76A 50%, #7F3222 100%)',
                    backgroundSize: '200% 100%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                  initial={{ opacity: 0, y: -30, rotateX: -90 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    backgroundPosition: ['0% 0%', '200% 0%'],
                  }}
                  transition={{
                    opacity: { delay: 0.2 + i * 0.12, duration: 0.6 },
                    y: { delay: 0.2 + i * 0.12, duration: 0.6 },
                    rotateX: { delay: 0.2 + i * 0.12, duration: 0.6, type: 'spring' },
                    backgroundPosition: {
                      delay: 0.8 + i * 0.12,
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear'
                    }
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            <motion.div
              className="text-[#7F3222] text-sm md:text-2xl lg:text-3xl font-light max-w-4xl mx-auto leading-relaxed opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {['运用先进AI技术，', '重现古画、壁画、书法的原始风貌，', '让文化遗产焕发新生'].map((segment, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 + i * 0.15 }}
                >
                  {segment}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Feature Cards Grid - 3D tilt with perspective */}
        <div className="w-full py-12 px-6 lg:px-8 xl:px-12" style={{ perspective: '1200px' }}>
          <div className="max-w-[1400px] mx-auto">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {FEATURE_CARDS.map((card) => (
                <motion.div key={card.title} variants={cardVariants}>
                  <TiltCard
                    onClick={() => navigate(card.route)}
                    className="group rounded-[16px] md:rounded-[24px] flex flex-col items-center p-3 md:p-8 relative transition-all duration-300 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(232,227,209,0.2) 50%, rgba(212,167,106,0.08) 100%)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(232,227,209,0.3)',
                      boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Header with icon */}
                    <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-5 w-full">
                      <img src={card.icon} alt="" className="w-5 h-5 md:w-7 md:h-7 opacity-75 object-contain" />
                      <h3 className="text-[#7F3222]/85 text-sm md:text-xl font-medium" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}>{card.title}</h3>
                    </div>

                    {/* Image */}
                    <div className="w-full aspect-[4/3] rounded-[10px] md:rounded-[16px] overflow-hidden mb-2 md:mb-6 relative">
                      <img src={card.image} alt={card.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Description */}
                    <p className="text-[#7F3222]/55 text-xs md:text-base mb-2 md:mb-5 text-center leading-relaxed w-full font-light line-clamp-2" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{card.desc}</p>

                    {/* CTA Button - frosted glass */}
                    <div className="w-24 md:w-40 rounded-[12px] md:rounded-[16px] py-1.5 md:py-3 text-xs md:text-base font-light text-center transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(232,227,209,0.4) 0%, rgba(212,167,106,0.15) 100%)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(212,167,106,0.2)',
                        color: 'rgba(127,50,34,0.75)',
                      }}
                    >
                      开始修复
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Technical Advantages */}
        <div className="w-full py-24">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-normal text-[#7F3222]/80 mb-4"
                style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1] }}
              >
                技术优势
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {ADVANTAGES.map((adv, idx) => (
                <motion.div
                  key={adv.title}
                  className="group relative rounded-[24px] p-10 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(232,227,209,0.2) 50%, rgba(212,167,106,0.06) 100%)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(232,227,209,0.3)',
                    boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
                  }}
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.5, 0, 0.3, 1] }}
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(127,50,34,0.1), 0 4px 12px rgba(0,0,0,0.04)' }}
                >
                  <div className="absolute top-4 right-6 text-[80px] font-bold text-[#7F3222]/4 leading-none select-none" style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>
                    {adv.number}
                  </div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-[16px] flex items-center justify-center mb-6" style={{
                      background: 'rgba(232,227,209,0.3)',
                    }}>
                      <img src={adv.icon} alt={adv.title} className="w-9 h-9 opacity-70 object-contain" />
                    </div>
                    <h3 className="text-[#7F3222]/85 text-2xl font-medium mb-4" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}>{adv.title}</h3>
                    <p className="text-[#7F3222]/55 text-lg font-light leading-relaxed" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{adv.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Application Scenarios */}
        <div className="w-full py-24 pb-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <motion.h2
              className="text-center text-4xl md:text-5xl lg:text-6xl font-normal text-[#7F3222] mb-4"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1] }}
            >
              应用场景
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
              {SCENARIOS.map((sc, idx) => (
                <motion.div
                  key={sc.title}
                  className="group rounded-[24px] overflow-hidden transition-all duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(232,227,209,0.15) 100%)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(232,227,209,0.3)',
                    boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
                  }}
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.2, ease: [0.5, 0, 0.3, 1] }}
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(127,50,34,0.1), 0 4px 12px rgba(0,0,0,0.04)' }}
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <motion.img
                      src={sc.image}
                      alt={sc.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <h3 className="absolute bottom-6 left-8 text-white text-3xl lg:text-4xl font-normal" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}>{sc.title}</h3>
                  </div>
                  <div className="p-10">
                    <p className="text-[#7F3222]/70 text-xl font-light mb-8 leading-relaxed" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{sc.desc}</p>
                    <ul className="text-[#7F3222]/80 text-lg font-light space-y-4">
                      {sc.items.map((item, i) => (
                        <ScenarioListItem key={item} item={item} index={i} />
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA Section with Aurora Gradient */}
        <div className="w-full py-16 md:py-24 pb-24 md:pb-32 relative overflow-hidden">
          {/* Aurora gradient layers */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 'min(600px, 80vw)',
                height: 'min(600px, 80vw)',
                left: '20%',
                top: '30%',
                background: 'radial-gradient(circle, rgba(212, 167, 106, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
              animate={{
                x: [-20, 40, -20],
                y: [-30, 20, -30],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 'min(700px, 90vw)',
                height: 'min(700px, 90vw)',
                right: '15%',
                top: '20%',
                background: 'radial-gradient(circle, rgba(127, 50, 34, 0.12) 0%, transparent 70%)',
                filter: 'blur(80px)',
              }}
              animate={{
                x: [30, -40, 30],
                y: [20, -25, 20],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          <div className="max-w-5xl mx-auto px-6 lg:px-8 xl:px-12 text-center relative z-10">
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-normal text-[#7F3222] mb-6 mt-8"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.5, 0, 0.3, 1] }}
            >
              开启您的文化遗产修复之旅
            </motion.h2>

            <motion.p
              className="text-[#7F3222]/70 text-xl md:text-2xl mb-12 leading-relaxed"
              style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.5, 0, 0.3, 1] }}
            >
              选择适合您需求的修复类型，体验AI赋能的文物数字化修复技术
            </motion.p>

            <motion.button
              type="button"
              className="px-16 py-5 rounded-full text-xl font-light overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(232,227,209,0.5) 0%, rgba(212,167,106,0.2) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(212,167,106,0.25)',
                boxShadow: '0 4px 20px rgba(127,50,34,0.08)',
                color: 'rgba(127,50,34,0.75)',
                fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(212,167,106,0.15)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              探索修复功能
            </motion.button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
