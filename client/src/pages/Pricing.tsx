import React from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import bgImage from '@/assets/2675-1206.webp';
import scenarioImg1 from '@/assets/2661-618.webp';
import scenarioImg2 from '@/assets/2661-622.webp';
import scenarioImg3 from '@/assets/2675-1190.webp';
import iconAI from '@/assets/2661-594.svg';
import iconProtect from '@/assets/I2661-597-466-116.svg';
import iconEfficiency from '@/assets/I2661-600-466-136.svg';
import StickyHeader from '@/components/StickyHeader';
import MobileMenu from '@/components/MobileMenu';
import DigitalHumanVideoOverlay from '@/components/DigitalHumanVideoOverlay';
import DigitalHumanDemoOverlay from '@/components/DigitalHumanDemoOverlay';
import { CloudDrift, InkBrushStroke, WavePattern } from '@/components/decorative';
import Footer from '@/components/layout/Footer';

const USE_CASES = [
  {
    title: '数字博物馆',
    description: '将珍贵文物数字化呈现，突破时空限制，让更多人领略传统艺术之美',
    image: scenarioImg1,
    items: ['线上文物展览', '沉浸式体验', '教育互动平台'],
  },
  {
    title: '文化创意产业',
    description: '将传统文化元素与现代设计相融合，赋能文创产品开发与品牌建设',
    image: scenarioImg2,
    items: ['IP 衍生品开发', '品牌视觉设计', '文旅融合项目'],
  },
  {
    title: '学术研究',
    description: '为考古学、艺术史等研究领域提供高精度数字化分析工具',
    image: scenarioImg3,
    items: ['文物数字化存档', '损伤程度评估', '修复方案模拟'],
  },
];

const DIGITAL_HUMAN_CHARS = [
  {
    id: 'libai', name: '李白', title: '诗仙', dynasty: '唐', representChar: '仙',
    quote: '举杯邀明月，对影成三人',
    accentColor: '#D4A76A',
    bgGradient: 'linear-gradient(135deg, #1a0e00 0%, #2d1800 60%, #1a0e00 100%)',
    category: 'wenren' as const,
    activities: ['吟诵诗词', '对月饮酒', '剑舞狂歌', '口播讲解'],
  },
  {
    id: 'dufu', name: '杜甫', title: '诗圣', dynasty: '唐', representChar: '圣',
    quote: '烽火连三月，家书抵万金',
    accentColor: '#7BA87B',
    bgGradient: 'linear-gradient(135deg, #081408 0%, #152015 60%, #081408 100%)',
    category: 'wenren' as const,
    activities: ['吟诗忧国', '讲史论道', '口播解析', '草堂讲学'],
  },
  {
    id: 'sushi', name: '苏轼', title: '东坡居士', dynasty: '宋', representChar: '豪',
    quote: '大江东去，浪淘尽，千古风流人物',
    accentColor: '#C8A96E',
    bgGradient: 'linear-gradient(135deg, #130d00 0%, #241800 60%, #130d00 100%)',
    category: 'wenren' as const,
    activities: ['豪放词赋', '书法挥毫', '品茗论道', '赤壁口播'],
  },
  {
    id: 'yuefei', name: '岳飞', title: '精忠报国', dynasty: '宋', representChar: '忠',
    quote: '壮志饥餐胡虏肉，笑谈渴饮匈奴血',
    accentColor: '#C84040',
    bgGradient: 'linear-gradient(135deg, #100000 0%, #200505 60%, #100000 100%)',
    category: 'wujiang' as const,
    activities: ['骑马征战', '弓箭射击', '点兵阅阵', '精忠故事'],
  },
  {
    id: 'mulan', name: '花木兰', title: '代父从军', dynasty: '北魏', representChar: '勇',
    quote: '万里赴戎机，关山度若飞',
    accentColor: '#9060B0',
    bgGradient: 'linear-gradient(135deg, #080010 0%, #100025 60%, #080010 100%)',
    category: 'wujiang' as const,
    activities: ['骑马射箭', '武艺展示', '从军故事', '铁骑演练'],
  },
  {
    id: 'guanyu', name: '关羽', title: '武圣', dynasty: '三国', representChar: '义',
    quote: '忠义两字，传颂万年',
    accentColor: '#4A8A5A',
    bgGradient: 'linear-gradient(135deg, #001008 0%, #002015 60%, #001008 100%)',
    category: 'wujiang' as const,
    activities: ['青龙偃月', '骑马驰骋', '赤兔奔腾', '义薄云天'],
  },
];

const PREMIUM_EASE = [0.5, 0, 0.3, 1] as const;

function DigitalHumanSVG({ category, color }: { category: 'wenren' | 'wujiang'; color: string }) {
  if (category === 'wujiang') {
    return (
      <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <ellipse cx="100" cy="36" rx="24" ry="28" fill={color} opacity="0.55" />
        <path d="M78 22 Q100 2 122 22 L118 30 L82 30 Z" fill={color} opacity="0.50" />
        <path d="M76 64 L58 92 L52 170 L68 175 L82 120 L100 138 L118 120 L132 175 L148 170 L142 92 L124 64 Z" fill={color} opacity="0.45" />
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
  return (
    <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="100" cy="38" rx="22" ry="26" fill={color} opacity="0.55" />
      <path d="M82 22 L100 8 L118 22 L114 28 L86 28 Z" fill={color} opacity="0.45" />
      <path d="M74 64 L58 100 L48 185 L62 188 L76 130 L100 148 L124 130 L138 188 L152 185 L142 100 L126 64 Z" fill={color} opacity="0.40" />
      <path d="M74 72 Q38 88 18 98 Q28 118 50 112 L74 102 Z" fill={color} opacity="0.32" />
      <path d="M126 72 Q162 88 182 98 Q172 118 150 112 L126 102 Z" fill={color} opacity="0.32" />
      <rect x="14" y="92" width="7" height="28" rx="3" fill={color} opacity="0.50" />
      <path d="M48 185 Q38 220 30 250 Q60 240 75 210 L62 188 Z" fill={color} opacity="0.22" />
      <path d="M152 185 Q162 220 170 250 Q140 240 125 210 L138 188 Z" fill={color} opacity="0.22" />
    </svg>
  );
}

const ADVANTAGES = [
  {
    icon: iconAI,
    title: '多模态AI引擎',
    desc: '集成SGRGAN、DCADif、Relic2Contour等前沿模型，覆盖修复、生成、解析全流程',
  },
  {
    icon: iconProtect,
    title: '非接触式保护',
    desc: '纯数字化修复与分析，对原始文物零损伤，实现文化遗产的可持续保护',
  },
  {
    icon: iconEfficiency,
    title: '学术级精度',
    desc: '基于顶级学术论文的AI模型，达到专业修复师认可的修复精度与还原度',
  },
];

const COOPERATION_MODELS = [
  {
    id: 'academic',
    title: '学术合作',
    subtitle: '面向高校与研究院',
    features: [
      '无限制使用全部AI模型',
      '论文数据集支持',
      '联合发表学术成果',
      '专属技术指导',
      '优先体验新模型',
    ],
    cta: '申请合作',
    highlight: false,
  },
  {
    id: 'institution',
    title: '机构合作',
    subtitle: '面向博物馆与文保机构',
    features: [
      '定制化修复方案',
      '批量文物数字化',
      '专属部署与培训',
      'API 接口全开放',
      '7×24 技术支持',
      '数据安全保障',
    ],
    cta: '联系我们',
    highlight: true,
  },
  {
    id: 'enterprise',
    title: '商业授权',
    subtitle: '面向文创企业',
    features: [
      'AI 生成内容商用授权',
      '高分辨率素材输出',
      '品牌定制化服务',
      '技术集成支持',
      '优先需求响应',
    ],
    cta: '咨询详情',
    highlight: false,
  },
];

const FAQ_ITEMS = [
  {
    q: '平台目前是否收费？',
    a: '博物馆文物修复与展示系统当前处于学术研究阶段，面向学术用户免费开放全部功能。',
  },
  {
    q: '如何申请学术合作？',
    a: '您可以通过"申请合作"按钮提交合作意向，我们将在 3 个工作日内与您联系。',
  },
  {
    q: '修复结果的版权如何界定？',
    a: '用户上传的原始图像版权归用户所有，AI 修复后的结果在学术场景中可自由使用。',
  },
  {
    q: '是否支持私有化部署？',
    a: '机构合作方案支持私有化部署，确保文物数据安全，详情请联系我们。',
  },
];

export default function Pricing() {
  useDocumentTitle('活化利用');

  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleCooperationClick = (model: string) => {
    toast.success(`已收到 ${model} 合作申请，我们将尽快与您联系`);
  };

  return (
    <div className="w-full bg-white overflow-hidden min-h-screen relative" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Fixed Background */}
      <div className="fixed inset-0 z-0">
        <img className="w-full h-full object-cover" src={bgImage} alt="" />
      </div>

      <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="light" title="活化利用" />

      {/* Floating cloud decorations */}
      <div className="fixed top-20 left-0 right-0 pointer-events-none z-1 opacity-30">
        <CloudDrift />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="w-full pt-32 pb-20 lg:pt-40 lg:pb-24">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 text-center">
            <DecodeTitle text="活化利用" />

            <motion.div className="flex justify-center mb-8" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <InkBrushStroke width={200} color="#7F3222" />
            </motion.div>
            <motion.p
              className="text-[#7F3222] text-xl md:text-2xl lg:text-3xl font-light max-w-4xl mx-auto leading-relaxed opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              让沉睡的文化遗产重新焕发生机，AI赋能文化传承与创新
            </motion.p>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="w-full py-16 lg:py-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <motion.h2
              className="text-center text-4xl md:text-5xl lg:text-6xl font-normal text-[#7F3222] mb-6"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1] }}
            >
              应用场景
            </motion.h2>
            <motion.div className="flex justify-center mb-20" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <InkBrushStroke width={160} color="#7F3222" />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
              {USE_CASES.map((uc, idx) => (
                <motion.div
                  key={uc.title}
                  className="rounded-[20px] overflow-hidden bg-[#E8E3D1]/20 backdrop-blur-sm shadow-sm border border-[#7F3222]/10 hover:shadow-xl transition-all duration-300 relative group"
                  initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.5, 0, 0.3, 1] }}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px -12px rgba(127, 50, 34, 0.2)' }}
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <motion.img
                      src={uc.image}
                      alt={uc.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05, y: -4 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  {/* Gold bottom border on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4A76A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  <div className="p-10 lg:p-12">
                    <h3 className="text-[#7F3222] text-2xl lg:text-3xl font-semibold mb-4" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}>{uc.title}</h3>
                    <p className="text-[#7F3222]/80 text-base lg:text-lg font-light leading-relaxed mb-6" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{uc.description}</p>
                    <ul className="space-y-3">
                      {uc.items.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-[#7F3222]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A76A] flex-shrink-0" />
                          <span className="text-base lg:text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== DIGITAL HUMAN SECTION ==================== */}
        <DigitalHumanSection navigate={navigate} />

        {/* Technical Advantages Section */}
        <div className="w-full py-20 lg:py-28">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <motion.h2
              className="text-center text-4xl md:text-5xl lg:text-6xl font-normal text-[#7F3222] mb-6"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1] }}
            >
              核心能力
            </motion.h2>
            <motion.div className="flex justify-center mb-20" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <InkBrushStroke width={160} color="#7F3222" />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20">
              {ADVANTAGES.map((adv, idx) => (
                <motion.div
                  key={adv.title}
                  className="text-center group"
                  initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.5, 0, 0.3, 1] }}
                >
                  <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-[#E8E3D1]/30 flex items-center justify-center group-hover:bg-[#E8E3D1]/50 transition-colors">
                      <img src={adv.icon} alt={adv.title} className="w-12 h-12 lg:w-14 lg:h-14 opacity-80 object-contain" />
                    </div>
                  </div>
                  <h3 className="text-[#7F3222] text-2xl lg:text-3xl font-semibold mb-5" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}>{adv.title}</h3>
                  <p className="text-[#7F3222]/80 text-lg lg:text-xl font-light leading-relaxed px-2" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{adv.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Cooperation Models Section */}
        <div className="w-full py-20 lg:py-28">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <h2
              className="text-center text-4xl md:text-5xl lg:text-6xl font-normal text-[#7F3222] mb-8"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
            >
              合作模式
            </h2>
            <p className="text-center text-[#7F3222]/70 text-lg lg:text-xl font-light mb-20 max-w-3xl mx-auto" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
              我们为不同类型的合作伙伴提供灵活的合作方案
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
              {COOPERATION_MODELS.map((model, idx) => (
                <PricingCard
                  key={model.id}
                  model={model}
                  idx={idx}
                  hoveredCard={hoveredCard}
                  setHoveredCard={setHoveredCard}
                  mousePosition={mousePosition}
                  setMousePosition={setMousePosition}
                  handleCooperationClick={handleCooperationClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full py-20 lg:py-28 pb-32 lg:pb-40 relative">
          <div className="absolute top-0 left-0 right-0 opacity-20 pointer-events-none">
            <WavePattern height={40} color="#7F3222" />
          </div>
          <div className="max-w-4xl mx-auto px-6 lg:px-8 xl:px-12">
            <motion.h2
              className="text-center text-4xl md:text-5xl lg:text-6xl font-normal text-[#7F3222] mb-6"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1] }}
            >
              常见问题
            </motion.h2>
            <motion.div className="flex justify-center mb-20" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <InkBrushStroke width={160} color="#7F3222" />
            </motion.div>
            <div className="space-y-5">
              {FAQ_ITEMS.map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="rounded-[16px] bg-[#E8E3D1]/20 backdrop-blur-sm border border-[#7F3222]/10 overflow-hidden relative"
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.5, 0, 0.3, 1] }}
                >
                  {/* Enhanced gold gradient border when expanded */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{
                      background: 'linear-gradient(180deg, #D4A76A 0%, #C49A5C 50%, #D4A76A 100%)',
                      originY: 0,
                    }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{
                      scaleY: expandedFaq === idx ? 1 : 0,
                      opacity: expandedFaq === idx ? 1 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center pr-4">
                      <motion.div
                        className="flex items-center justify-center w-10 h-10 rounded-full mr-4 relative"
                        style={{
                          background: 'linear-gradient(135deg, rgba(212, 167, 106, 0.2) 0%, rgba(212, 167, 106, 0.1) 100%)',
                          border: '1px solid rgba(212, 167, 106, 0.3)',
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: idx * 0.1 + 0.2,
                        }}
                      >
                        <span className="text-[#D4A76A] text-sm font-bold font-mono">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </motion.div>
                      <motion.span
                        className="text-lg lg:text-xl font-medium"
                        style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}
                        animate={{
                          color: expandedFaq === idx ? '#7F3222' : '#7F3222',
                          fontWeight: expandedFaq === idx ? 600 : 500,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {faq.q}
                      </motion.span>
                    </div>
                    <motion.svg
                      className="w-5 h-5 text-[#7F3222] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                        animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
                        exit={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-6 pl-[72px] text-[#7F3222]/80 text-base lg:text-lg font-light leading-relaxed" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="w-full pb-32 lg:pb-40">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 xl:px-12 text-center">
            <div className="rounded-[20px] bg-[#7F3222]/85 backdrop-blur-sm p-12 md:p-16 lg:p-20 relative overflow-hidden">
              {/* Aurora Background Layers */}
              <AuroraLayers />

              {/* Floating particles */}
              <FloatingParticles />

              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-normal text-[#E8E3D1] mb-6 relative z-10"
                style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              >
                开启文化遗产的数字新生
              </h2>
              <p className="text-[#E8E3D1]/70 text-lg lg:text-xl font-light mb-10 max-w-3xl mx-auto relative z-10">
                立即体验博物馆文物修复与展示系统的AI修复功能，让千年古韵在数字时代重放光彩
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center relative z-10">
                <motion.button
                  type="button"
                  onClick={() => navigate('/virtual-restoration')}
                  className="relative px-10 py-4 bg-[#D4A76A] text-white rounded-xl font-medium text-lg lg:text-xl overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-[#D4A76A]"
                    animate={{
                      scale: [1, 1.1, 1.1],
                      opacity: [0.5, 0, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                  <span className="relative z-10" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>开始修复体验</span>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => navigate('/ai-generation')}
                  className="px-10 py-4 bg-transparent border-2 border-[#E8E3D1]/50 text-[#E8E3D1] rounded-xl font-medium text-lg lg:text-xl hover:bg-[#E8E3D1]/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}
                >
                  探索智绘生成
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

// ==================== DIGITAL HUMAN SECTION ====================
function DigitalHumanSection({ navigate }: { navigate: (path: string) => void }) {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [overlayOpen, setOverlayOpen] = React.useState(false);
  const [videoOverlayOpen, setVideoOverlayOpen] = React.useState(false);
  const active = DIGITAL_HUMAN_CHARS[activeIdx];

  return (
    <div className="w-full py-20 lg:py-28">
      {/* Static demo overlay — instant, zero AI */}
      <AnimatePresence>
        {overlayOpen && (
          <DigitalHumanDemoOverlay
            characterId={active.id}
            onClose={() => setOverlayOpen(false)}
            onGenerateVideo={() => { setOverlayOpen(false); setTimeout(() => setVideoOverlayOpen(true), 200); }}
          />
        )}
      </AnimatePresence>

      {/* AI video generation overlay — Google Veo 3.1, with audio */}
      <AnimatePresence>
        {videoOverlayOpen && (
          <DigitalHumanVideoOverlay
            characterId={active.id}
            characterName={active.name}
            characterTitle={active.title}
            dynasty={active.dynasty}
            quote={active.quote}
            accentColor={active.accentColor}
            bgGradient={active.bgGradient}
            representChar={active.representChar}
            onClose={() => setVideoOverlayOpen(false)}
          />
        )}
      </AnimatePresence>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
        {/* Section header — matches existing page style */}
        <motion.h2
          className="text-center text-4xl md:text-5xl lg:text-6xl font-normal text-[#7F3222] mb-6"
          style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1] }}
        >
          数字人
        </motion.h2>
        <motion.div className="flex justify-center mb-4" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <InkBrushStroke width={160} color="#7F3222" />
        </motion.div>
        <motion.p
          className="text-center text-[#7F3222]/65 text-lg lg:text-xl font-light mb-14 max-w-3xl mx-auto"
          style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          AI驱动古代文人武将数字重生，吟诵诗词、骑马射箭、口播讲解——让历史人物跨越千年与你对话
        </motion.p>

        {/* Dark showcase panel */}
        <motion.div
          className="rounded-[24px] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f0906 0%, #1a0f08 50%, #0f0906 100%)',
            border: '1px solid rgba(212,167,106,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: PREMIUM_EASE }}
        >
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            {/* Left: character list */}
            <div
              className="flex lg:flex-col gap-2 p-4 lg:p-6 overflow-x-auto lg:overflow-x-visible lg:w-52 shrink-0"
              style={{ borderRight: '1px solid rgba(212,167,106,0.12)' }}
            >
              <div
                className="hidden lg:block text-[10px] tracking-[0.4em] text-[#E8E3D1]/30 mb-3 px-2 uppercase"
                style={{ fontFamily: "'LXGW WenKai', serif" }}
              >
                选择人物
              </div>
              {DIGITAL_HUMAN_CHARS.map((char, idx) => (
                <motion.button
                  type="button"
                  key={char.id}
                  onClick={() => setActiveIdx(idx)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl shrink-0 text-left transition-all"
                  style={{
                    background: activeIdx === idx ? `${char.accentColor}18` : 'transparent',
                    border: `1px solid ${activeIdx === idx ? char.accentColor + '50' : 'transparent'}`,
                  }}
                  whileHover={{ background: `${char.accentColor}12` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{
                      background: char.bgGradient,
                      fontFamily: "'Ma Shan Zheng', cursive",
                      color: char.accentColor,
                      border: `1px solid ${char.accentColor}30`,
                    }}
                  >
                    {char.representChar}
                  </div>
                  <div className="hidden lg:block">
                    <div
                      className="text-sm text-[#E8E3D1]/80 leading-tight"
                      style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                    >
                      {char.name}
                    </div>
                    <div
                      className="text-[10px] mt-0.5"
                      style={{ color: char.accentColor, fontFamily: "'LXGW WenKai', serif" }}
                    >
                      {char.dynasty} · {char.title}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Right: active character detail */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  className="absolute inset-0 flex flex-col md:flex-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: PREMIUM_EASE }}
                >
                  {/* Ink glow bg */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
                      <defs><filter id={`dh-blur-${active.id}`}><feGaussianBlur stdDeviation="50" /></filter></defs>
                      <ellipse cx="650" cy="250" rx="280" ry="320" fill={active.accentColor} opacity="0.09" filter={`url(#dh-blur-${active.id})`} />
                      <ellipse cx="150" cy="150" rx="160" ry="200" fill={active.accentColor} opacity="0.05" filter={`url(#dh-blur-${active.id})`} />
                    </svg>
                  </div>

                  {/* Character silhouette column */}
                  <div className="relative hidden md:flex items-end justify-center w-64 shrink-0 overflow-hidden">
                    {/* Large bg char */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                      <span
                        className="text-[200px] leading-none"
                        style={{ fontFamily: "'Ma Shan Zheng', cursive", color: active.accentColor, opacity: 0.05 }}
                      >
                        {active.representChar}
                      </span>
                    </div>
                    {/* Silhouette */}
                    <div className="relative z-10 w-44 h-72 mb-4">
                      <DigitalHumanSVG category={active.category} color={active.accentColor} />
                    </div>
                    {/* Bottom fade */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, #0f0906 0%, transparent 100%)' }}
                    />
                  </div>

                  {/* Info column */}
                  <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-between relative z-10">
                    <div>
                      {/* Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="text-[10px] px-3 py-1 rounded-full border tracking-widest"
                          style={{ borderColor: `${active.accentColor}40`, color: active.accentColor, backgroundColor: `${active.accentColor}12`, fontFamily: "'LXGW WenKai', serif" }}
                        >
                          {active.dynasty}朝 · {active.category === 'wenren' ? '文人墨客' : '豪侠武将'}
                        </span>
                      </div>

                      {/* Name + title */}
                      <h3
                        className="text-5xl md:text-6xl font-normal text-white mb-1 leading-none"
                        style={{ fontFamily: "'Ma Shan Zheng', cursive", textShadow: `0 2px 24px ${active.accentColor}30` }}
                      >
                        {active.name}
                      </h3>
                      <div className="text-base mb-5" style={{ color: active.accentColor, fontFamily: "'LXGW WenKai', serif" }}>
                        {active.title}
                      </div>

                      {/* Quote */}
                      <div className="pl-4 mb-6" style={{ borderLeft: `2px solid ${active.accentColor}40` }}>
                        <p className="text-sm text-white/45 leading-relaxed" style={{ fontFamily: "'LXGW WenKai', serif" }}>
                          「{active.quote}」
                        </p>
                      </div>
                    </div>

                    {/* Activities grid */}
                    <div>
                      <div className="text-[10px] text-white/30 tracking-[0.35em] mb-3" style={{ fontFamily: "'LXGW WenKai', serif" }}>
                        互动场景
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        {active.activities.map((act, i) => (
                          <motion.div
                            key={act}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
                            style={{ borderColor: `${active.accentColor}25`, backgroundColor: `${active.accentColor}08` }}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.35 }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: active.accentColor }}
                            />
                            <span className="text-xs text-white/60" style={{ fontFamily: "'LXGW WenKai', serif" }}>
                              {act}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA buttons */}
                      <div className="flex flex-wrap gap-3">
                        <motion.button
                          type="button"
                          onClick={() => setOverlayOpen(true)}
                          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm tracking-[0.15em] relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${active.accentColor}30, ${active.accentColor}15)`,
                            border: `1px solid ${active.accentColor}50`,
                            color: active.accentColor,
                            fontFamily: "'LXGW WenKai', serif",
                          }}
                          whileHover={{ scale: 1.04, y: -1, boxShadow: `0 6px 20px ${active.accentColor}25` }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span>唤醒 · 生成视频</span>
                          <ArrowRight size={14} />
                          <motion.div
                            className="absolute inset-0"
                            style={{ background: `linear-gradient(90deg, transparent, ${active.accentColor}15, transparent)` }}
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                          />
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => navigate('/digital-human')}
                          className="px-6 py-3 rounded-full text-sm tracking-[0.15em] border text-white/40"
                          style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: "'LXGW WenKai', serif" }}
                          whileHover={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' }}
                          whileTap={{ scale: 0.97 }}
                        >
                          全部十位人物
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom stat bar */}
          <div
            className="flex items-center justify-between px-6 lg:px-8 py-4"
            style={{ borderTop: '1px solid rgba(212,167,106,0.12)' }}
          >
            {[
              { num: '10', label: '历史人物' },
              { num: '6', label: '文人墨客' },
              { num: '4', label: '豪侠武将' },
              { num: '40+', label: '互动场景' },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <div className="w-px h-6" style={{ backgroundColor: 'rgba(212,167,106,0.15)' }} />}
                <div className="text-center px-4">
                  <div
                    className="text-lg font-normal text-[#D4A76A]"
                    style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                  >
                    {stat.num}
                  </div>
                  <div
                    className="text-[10px] text-white/30 tracking-widest"
                    style={{ fontFamily: "'LXGW WenKai', serif" }}
                  >
                    {stat.label}
                  </div>
                </div>
              </React.Fragment>
            ))}
            <motion.button
              type="button"
              onClick={() => navigate('/digital-human')}
              className="hidden sm:flex items-center gap-2 text-xs tracking-widest text-[#D4A76A]/60 hover:text-[#D4A76A] transition-colors"
              style={{ fontFamily: "'LXGW WenKai', serif" }}
              whileHover={{ x: 3 }}
            >
              <span>探索全部</span>
              <ArrowRight size={12} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Decode/Scramble Title Effect
function DecodeTitle({ text }: { text: string }) {
  const [displayText, setDisplayText] = React.useState<string[]>([]);
  const chars = text.split('');

  // Random Chinese characters for scrambling effect
  const randomChars = ['幻', '梦', '影', '墨', '韵', '画', '诗', '云', '风', '月', '星', '霜', '雪', '雨', '竹', '松', '梅', '兰'];

  React.useEffect(() => {
    const iterations = 3; // Number of random chars before settling
    const delays: number[] = [];

    chars.forEach((char, i) => {
      for (let j = 0; j <= iterations; j++) {
        const delay = i * 100 + j * 50;
        delays.push(
          window.setTimeout(() => {
            setDisplayText((prev) => {
              const newText = [...prev];
              if (j < iterations) {
                // Show random character
                newText[i] = randomChars[Math.floor(Math.random() * randomChars.length)];
              } else {
                // Show final character
                newText[i] = char;
              }
              return newText;
            });
          }, delay)
        );
      }
    });

    return () => delays.forEach(clearTimeout);
  }, []);

  return (
    <motion.h1
      className="text-5xl md:text-6xl lg:text-7xl font-normal mb-8 tracking-wide gold-shimmer-title"
      style={{
        fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive",
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {displayText.join('') || text}
    </motion.h1>
  );
}

// Pricing Card with 3D Tilt and Mouse Effects
interface PricingCardProps {
  model: typeof COOPERATION_MODELS[0];
  idx: number;
  hoveredCard: string | null;
  setHoveredCard: (id: string | null) => void;
  mousePosition: { x: number; y: number };
  setMousePosition: (pos: { x: number; y: number }) => void;
  handleCooperationClick: (id: string) => void;
}

function PricingCard({
  model,
  idx,
  hoveredCard,
  setHoveredCard,
  mousePosition,
  setMousePosition,
  handleCooperationClick,
}: PricingCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // For mouse glow effect
    setMousePosition({ x, y });

    // For 3D tilt effect
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -3; // Max 3 degrees
    const rotateYValue = ((x - centerX) / centerX) * 3;

    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
  };

  const handleMouseEnter = () => {
    setHoveredCard(model.id);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative"
      initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.5, 0, 0.3, 1] }}
      style={{
        perspective: '1000px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated gradient border for highlighted card */}
      {model.highlight && (
        <motion.div
          className="absolute inset-0 rounded-[20px] overflow-hidden"
          style={{
            background: 'conic-gradient(from 0deg, #D4A76A, #7F3222, #E8E3D1, #D4A76A)',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      <motion.div
        className={`rounded-[20px] p-10 lg:p-12 backdrop-blur-lg border transition-all relative flex flex-col group ${
          model.highlight
            ? 'bg-[#7F3222]/90 border-[#D4A76A]/50 shadow-xl shadow-[#D4A76A]/20 gold-pulse-glow'
            : 'bg-white/10 backdrop-blur-lg border-white/20 shadow-sm hover:shadow-xl'
        }`}
        style={
          model.highlight
            ? {
                background:
                  'linear-gradient(135deg, rgba(127, 50, 34, 0.95) 0%, rgba(127, 50, 34, 0.85) 100%)',
                boxShadow: '0 0 40px rgba(212, 167, 106, 0.3), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                zIndex: 1,
                margin: model.highlight ? '2px' : '0',
                transformStyle: 'preserve-3d',
                rotateX: rotateXSpring,
                rotateY: rotateYSpring,
              }
            : {
                transformStyle: 'preserve-3d',
                rotateX: rotateXSpring,
                rotateY: rotateYSpring,
              }
        }
        whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(127, 50, 34, 0.25)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Mouse-following glow for non-highlighted cards */}
        {!model.highlight && hoveredCard === model.id && (
          <motion.div
            className="absolute inset-0 rounded-[20px] pointer-events-none"
            style={{
              background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(212, 167, 106, 0.15), transparent)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Gold bottom border for non-highlighted cards on hover */}
        {!model.highlight && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4A76A] opacity-40 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        )}

        {model.highlight && (
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4A76A] text-white text-xs font-bold px-4 py-1 rounded-full z-10"
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            推荐
          </motion.div>
        )}

        <h3
          className={`text-2xl lg:text-3xl font-semibold mb-2 ${
            model.highlight ? 'text-[#E8E3D1]' : 'text-[#7F3222]'
          }`}
          style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
        >
          {model.title}
        </h3>
        <p
          className={`text-base lg:text-lg font-light mb-8 ${
            model.highlight ? 'text-[#E8E3D1]/70' : 'text-[#7F3222]/60'
          }`}
          style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
        >
          {model.subtitle}
        </p>
        <div className="space-y-4 flex-1 mb-10">
          {model.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <span
                className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  model.highlight ? 'bg-[#D4A76A]' : 'bg-[#7F3222]'
                }`}
              />
              <span
                className={`text-base lg:text-lg ${
                  model.highlight ? 'text-[#E8E3D1]/90' : 'text-[#7F3222]'
                }`}
                style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
        <motion.button
          type="button"
          onClick={() => handleCooperationClick(model.id)}
          className={`w-full py-4 rounded-xl font-medium text-lg lg:text-xl transition-colors ${
            model.highlight
              ? 'bg-[#D4A76A] text-white hover:bg-[#C49A5C]'
              : 'bg-[#7F3222] text-[#E8E3D1] hover:bg-[#5C2418]'
          }`}
          style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {model.cta}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Aurora background layers for CTA section
function AuroraLayers() {
  return (
    <>
      {/* Layer 1: Gold gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(212, 167, 106, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
        animate={{
          x: ['0%', '30%', '0%'],
          y: ['0%', '20%', '0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Layer 2: Beige gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(241, 223, 190, 0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
        animate={{
          x: ['30%', '0%', '30%'],
          y: ['20%', '0%', '20%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          direction: 'reverse',
        }}
      />
    </>
  );
}

// Floating particles component for CTA section
function FloatingParticles() {
  const particles = [
    { delay: 0, x: '20%', duration: 8 },
    { delay: 1, x: '60%', duration: 10 },
    { delay: 2, x: '40%', duration: 9 },
    { delay: 1.5, x: '80%', duration: 11 },
  ];

  return (
    <>
      {particles.map((particle, idx) => (
        <motion.div
          key={idx}
          className="absolute w-2 h-2 rounded-full bg-[#D4A76A]"
          style={{
            left: particle.x,
            bottom: '20%',
          }}
          animate={{
            y: [-20, -80, -20],
            x: [0, 30, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}
