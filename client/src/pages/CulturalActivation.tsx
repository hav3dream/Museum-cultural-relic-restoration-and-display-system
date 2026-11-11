import asset1 from '@/assets/2672-651.webp';
import asset2 from '@/assets/2686-142.webp';
import asset3 from '@/assets/I2686-122-8899-30891.svg';
import asset4 from '@/assets/I2661-597-466-116.svg';
import asset5 from '@/assets/I2661-600-466-136.svg';
import asset6 from '@/assets/2661-618.webp';
import asset7 from '@/assets/2661-622.webp';
import { useLocation } from 'wouter';
import MobileMenu from '@/components/MobileMenu';
import React from 'react';
import { motion } from 'framer-motion';
import { CloudDrift, InkBrushStroke, MistEffect } from '@/components/decorative';
import Footer from '@/components/layout/Footer';
import StickyHeader from '@/components/StickyHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const ACTIVATION_CARDS = [
  {
    title: '图像外推',
    icon: asset3,
    image: asset2,
    route: '/cultural-activation/image-outpainting',
    desc: '基于对比学习与 Transformer 的古画边缘延伸与画幅扩展',
  },
  {
    title: '多视角生成',
    icon: asset4,
    image: asset6,
    route: '/cultural-activation/multi-view',
    desc: '基于 AdaMPI 自适应多平面图像技术，从单张古画生成多视角漫游视频',
  },
];

const TECH_ITEMS = [
  { icon: asset4, title: '智能延伸', desc: '通过深度学习理解画面风格与构图规律，将图像自然向外延伸', number: '01' },
  { icon: asset5, title: '风格一致', desc: '保持笔墨韵律与色彩氛围的高度一致性，无缝融合扩展区域', number: '02' },
  { icon: asset3, title: '遗产活化', desc: '为古代艺术作品提供新的展示形式，让文物以更完整的面貌呈现', number: '03' },
];

const APP_SCENARIOS = [
  {
    image: asset6, title: '文物修复展示',
    desc: '将残损古画通过 AI 外推还原更完整的画面，辅助学术研究与展览策划',
    items: ['古画画幅延伸', '残损边缘补全', '数字化修复存档'],
  },
  {
    image: asset7, title: '数字创意应用',
    desc: '为数字文创提供高质量的扩展图像资产，拓展传统艺术的展示边界',
    items: ['沉浸式展览背景', '文创产品延伸图案', '影视动画素材'],
  },
];

export default function CulturalActivation() {
  useDocumentTitle('活化利用');
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="w-full bg-white overflow-hidden min-h-screen relative" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="fixed inset-0 z-0">
        <img className="w-full h-full object-cover" src={asset1} alt="" />
      </div>
      <div className="fixed top-20 left-0 right-0 pointer-events-none z-1 opacity-30"><CloudDrift /></div>
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-1"><MistEffect position="bottom" /></div>

      <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="light" title="活化利用" />

      <div className="relative z-10">
        {/* Hero */}
        <div className="w-full pt-32 pb-20 md:pb-24 relative">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 text-center relative z-10">
            <div className="flex justify-center gap-2 md:gap-4 mb-6">
              {['活', '化', '利', '用'].map((char, i) => (
                <motion.span key={i} className="text-5xl md:text-7xl lg:text-8xl font-normal inline-block"
                  style={{
                    fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive",
                    background: 'linear-gradient(90deg,#7F3222 0%,#D4A76A 50%,#7F3222 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}
                  initial={{ opacity: 0, y: -30, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{
                    opacity: { delay: 0.2 + i * 0.12, duration: 0.6 },
                    y: { delay: 0.2 + i * 0.12, duration: 0.6, type: 'spring' },
                    backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' },
                  }}>
                  {char}
                </motion.span>
              ))}
            </div>
            <motion.div className="flex justify-center mb-6" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
              <InkBrushStroke width={200} color="#7F3222" />
            </motion.div>
            <div className="text-[#7F3222] text-xl md:text-2xl lg:text-3xl font-light max-w-5xl mx-auto leading-relaxed opacity-90">
              {['以现代技术延伸传统边界', '让古典艺术在数字时代焕发新生'].map((s, i) => (
                <motion.span key={i} className="inline-block" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.9, y: 0 }} transition={{ duration: 0.6, delay: 0.8 + i * 0.15 }}>
                  {s}{i < 1 && '，'}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="w-full py-16 px-6 lg:px-8 xl:px-12" style={{ perspective: '1200px' }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ACTIVATION_CARDS.map(card => (
                <motion.div key={card.title}
                  className="group rounded-[20px] overflow-hidden bg-[#F5F0E3]/20 backdrop-blur-sm shadow-sm border border-[#7F3222]/10 hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  onClick={() => navigate(card.route)}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <motion.img src={card.image} alt={card.title} className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }} transition={{ duration: 0.7 }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={card.icon} alt="" className="w-12 h-12 opacity-80" />
                      <h3 className="text-[#7F3222] text-2xl font-semibold" style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>{card.title}</h3>
                    </div>
                    <p className="text-[#7F3222]/70 text-base mb-6 leading-relaxed">{card.desc}</p>
                    <div className="w-full rounded-xl py-4 text-lg font-medium text-center transition-all duration-300 bg-[#F5F0E3]/40 text-[#7F3222] group-hover:bg-[#7F3222] group-hover:text-[#F5F0E3]">
                      开始使用
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full py-12 flex justify-center"><InkBrushStroke width={300} color="#7F3222" /></div>

        {/* Tech items */}
        <div className="w-full py-24">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <motion.h2 className="text-center text-4xl md:text-5xl font-normal text-[#7F3222] mb-4"
              style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              核心优势
            </motion.h2>
            <motion.div className="flex justify-center mb-16" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <InkBrushStroke width={160} color="#7F3222" />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TECH_ITEMS.map((item, idx) => (
                <motion.div key={item.title}
                  className="relative bg-[#F5F0E3]/10 backdrop-blur-sm rounded-2xl p-8 border border-[#7F3222]/10 hover:border-[#7F3222]/30 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.15 }} whileHover={{ y: -6 }}>
                  <div className="absolute top-4 right-6 text-[80px] font-bold text-[#7F3222]/5 leading-none" style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>{item.number}</div>
                  <div className="w-16 h-16 rounded-2xl bg-[#F5F0E3]/40 flex items-center justify-center mb-6">
                    <img src={item.icon} alt={item.title} className="w-8 h-8 opacity-80" />
                  </div>
                  <h3 className="text-[#7F3222] text-xl font-semibold mb-3" style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>{item.title}</h3>
                  <p className="text-[#7F3222]/70 text-base leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full py-12 flex justify-center"><InkBrushStroke width={300} color="#7F3222" /></div>

        {/* Scenarios */}
        <div className="w-full py-24 pb-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <motion.h2 className="text-center text-4xl md:text-5xl font-normal text-[#7F3222] mb-4"
              style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              应用场景
            </motion.h2>
            <motion.div className="flex justify-center mb-16" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <InkBrushStroke width={160} color="#7F3222" />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {APP_SCENARIOS.map((sc, idx) => (
                <motion.div key={sc.title}
                  className="group rounded-[20px] overflow-hidden bg-[#F5F0E3]/10 backdrop-blur-sm border border-[#7F3222]/10 hover:shadow-2xl transition-all duration-500"
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.2 }} whileHover={{ y: -6 }}>
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <motion.img src={sc.image} alt={sc.title} className="w-full h-full object-cover" whileHover={{ scale: 1.05 }} transition={{ duration: 0.7 }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <h3 className="absolute bottom-6 left-8 text-white text-3xl font-bold" style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>{sc.title}</h3>
                  </div>
                  <div className="p-8">
                    <p className="text-[#7F3222]/90 text-lg leading-relaxed mb-6">{sc.desc}</p>
                    <ul className="space-y-3">
                      {sc.items.map(item => (
                        <li key={item} className="flex items-center gap-3 text-[#7F3222]">
                          <span className="w-2 h-2 rounded-full bg-[#D4A76A] flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
