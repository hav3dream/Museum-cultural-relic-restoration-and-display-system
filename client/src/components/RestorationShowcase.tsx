import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowRight, Paintbrush, Layers, PenTool, ScanLine, Landmark } from 'lucide-react';
import { SealStamp, InkBrushStroke } from '@/components/decorative';

import img1 from '@/assets/2675-1190.webp';
import img3 from '@/assets/2675-1206.webp';

const PREMIUM_EASE = [0.5, 0, 0.3, 1] as const;

const FEATURES = [
  {
    key: 'guhua',
    title: '古画修复',
    subtitle: 'Ancient Painting Restoration',
    desc: '基于SGRGAN生成对抗网络，通过线稿引导实现古代山水画的智能修复，支持多种算法模型自由切换。',
    models: ['SGRGAN', 'Mamba', 'ALICE'],
    image: img1,
    route: '/ancient-painting-restoration',
    icon: Paintbrush,
    accent: '#D4A76A',
  },
  {
    key: 'bihua',
    title: '壁画修复',
    subtitle: 'Mural Restoration',
    desc: '运用DCADif条件自适应扩散模型，解耦壁画结构与风格信息，实现高保真壁画修复重建。',
    models: ['DCADif'],
    image: '/images/bihua-76.jpg',
    route: '/mural-restoration',
    icon: Layers,
    accent: '#3A9E9E',
  },
  {
    key: 'beike',
    title: '碑刻修复',
    subtitle: 'Stele Restoration',
    desc: '智能修复因风化侵蚀而残损的碑刻拓片，还原碑文的完整面貌与笔画细节。',
    models: ['SGRGAN'],
    image: '/images/left_1.png',
    route: '/stele-restoration',
    icon: Landmark,
    accent: '#C85840',
  },
  {
    key: 'shufa',
    title: '书法生成',
    subtitle: 'Calligraphy Generation',
    desc: '输入文字即可生成楷书、行书、草书、隶书四大书体，感受AI驱动的传统书法创作。',
    models: ['StyleGAN'],
    image: '/images/left_2.png',
    route: '/calligraphy-generation',
    icon: PenTool,
    accent: '#9B3A2A',
  },
  {
    key: 'outline',
    title: '轮廓解析',
    subtitle: 'Outline Analysis',
    desc: '基于半监督学习的壁画轮廓提取技术，精确分离线稿与色彩层，辅助文物数字化建档。',
    models: ['Relic2Contour'],
    image: img3,
    route: '/outline-analysis',
    icon: ScanLine,
    accent: '#8B7355',
  },
];

export default function RestorationShowcase() {
  const [, navigate] = useLocation();
  const hero = FEATURES[0];
  const rest = FEATURES.slice(1);

  return (
    <section className="relative w-full py-24 md:py-28 lg:py-32 bg-[#4A3428]/70 backdrop-blur-[2px]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="text-center mb-14 md:mb-20 relative">
          <div className="inline-block relative">
            <motion.h2
              className="text-4xl md:text-[60px] lg:text-[70px] xl:text-[80px] font-normal text-[#E8E3D1] mb-6 md:mb-8"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              AI修复工坊
            </motion.h2>
            <div className="absolute -right-16 -top-4 opacity-60">
              <SealStamp size={48} />
            </div>
          </div>
          <div className="flex justify-center mb-6">
            <InkBrushStroke width={80} color="#7F3222" variant="divider" duration={1.5} delay={0.3} />
          </div>
          <p
            className="text-[#E8E3D1]/50 text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed tracking-[0.08em]"
            style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}
          >
            融合前沿深度学习算法，让千年文物在数字世界中重获新生
          </p>
        </div>

        {/* Hero Feature - full width */}
        <motion.div
          className="group relative mb-6 md:mb-8 rounded-[20px] overflow-hidden cursor-pointer"
          style={{ height: 'clamp(320px, 40vw, 480px)' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: PREMIUM_EASE }}
          onClick={() => navigate(hero.route)}
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={hero.image}
              alt={hero.title}
              className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[1.2s] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/30" />
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center px-8 md:px-14 lg:px-20 max-w-2xl">
            {/* Model badges */}
            <div className="flex gap-2 mb-4">
              {hero.models.map(m => (
                <span
                  key={m}
                  className="px-3 py-1 text-xs rounded-full border"
                  style={{
                    color: hero.accent,
                    borderColor: `${hero.accent}40`,
                    backgroundColor: `${hero.accent}15`,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>

            <h3
              className="text-3xl md:text-5xl lg:text-6xl text-[#E8E3D1] mb-2"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
            >
              {hero.title}
            </h3>
            <p className="text-[#E8E3D1]/40 text-xs md:text-sm tracking-[0.2em] uppercase mb-5" style={{ fontFamily: "'LXGW WenKai', sans-serif" }}>
              {hero.subtitle}
            </p>
            <p className="text-[#E8E3D1]/70 text-sm md:text-base leading-relaxed mb-8 max-w-lg" style={{ fontFamily: "'LXGW WenKai', sans-serif" }}>
              {hero.desc}
            </p>

            <button
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm md:text-base transition-all duration-300 w-fit group/btn"
              style={{
                backgroundColor: `${hero.accent}20`,
                border: `1px solid ${hero.accent}50`,
                color: hero.accent,
                fontFamily: "'LXGW WenKai', sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = `${hero.accent}35`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = `${hero.accent}20`;
              }}
            >
              <span className="tracking-widest">立即体验</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Corner accent */}
          <div className="absolute top-6 right-6 md:top-8 md:right-8 opacity-40 group-hover:opacity-70 transition-opacity">
            <hero.icon className="w-12 h-12 md:w-16 md:h-16" style={{ color: hero.accent }} strokeWidth={1} />
          </div>
        </motion.div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 lg:gap-8">
          {rest.map((feat, i) => (
            <motion.div
              key={feat.key}
              className="group relative h-[260px] md:h-[300px] lg:h-[320px] rounded-[16px] overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: PREMIUM_EASE }}
              onClick={() => navigate(feat.route)}
            >
              {/* Background */}
              <div className="absolute inset-0">
                <img
                  src={feat.image}
                  alt={feat.title}
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[1s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                {/* Icon */}
                <div className="absolute top-5 right-5 opacity-30 group-hover:opacity-60 transition-opacity">
                  <feat.icon className="w-8 h-8 md:w-10 md:h-10" style={{ color: feat.accent }} strokeWidth={1.2} />
                </div>

                {/* Model badge */}
                <div className="flex gap-2 mb-3">
                  {feat.models.map(m => (
                    <span
                      key={m}
                      className="px-2.5 py-0.5 text-[10px] md:text-xs rounded-full border"
                      style={{
                        color: feat.accent,
                        borderColor: `${feat.accent}35`,
                        backgroundColor: `${feat.accent}12`,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>

                <h3
                  className="text-2xl md:text-3xl text-[#E8E3D1] mb-1"
                  style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
                >
                  {feat.title}
                </h3>
                <p className="text-[#E8E3D1]/35 text-[10px] md:text-xs tracking-[0.15em] uppercase mb-3" style={{ fontFamily: "'LXGW WenKai', sans-serif" }}>
                  {feat.subtitle}
                </p>
                <p className="text-[#E8E3D1]/60 text-xs md:text-sm leading-relaxed mb-5 line-clamp-2" style={{ fontFamily: "'LXGW WenKai', sans-serif" }}>
                  {feat.desc}
                </p>

                {/* CTA */}
                <div
                  className="inline-flex items-center gap-2 text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400"
                  style={{ color: feat.accent, fontFamily: "'LXGW WenKai', sans-serif" }}
                >
                  <span className="tracking-widest">立即体验</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Hover border glow */}
              <div
                className="absolute inset-0 rounded-[16px] border border-transparent group-hover:border-opacity-30 transition-all duration-500 pointer-events-none"
                style={{ borderColor: `${feat.accent}00`, }}
              />
              <style>{`
                .group:hover > [style*="${feat.accent}"] {
                  border-color: ${feat.accent}40 !important;
                }
              `}</style>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA to virtual-restoration overview */}
        <motion.div
          className="text-center mt-12 md:mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={() => navigate('/virtual-restoration')}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-[#7F3222]/15 hover:bg-[#7F3222]/25 border border-[#7F3222]/30 hover:border-[#7F3222]/50 transition-all duration-300 group/all"
          >
            <span
              className="text-[#E8E3D1]/80 text-base md:text-lg tracking-[0.15em] group-hover/all:tracking-[0.2em] transition-all"
              style={{ fontFamily: "'LXGW WenKai', serif" }}
            >
              查看全部修复功能
            </span>
            <ArrowRight className="w-4 h-4 text-[#D4A76A] group-hover/all:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
