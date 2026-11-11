import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import asset1 from '@/assets/2675-1190.webp';
import asset2 from '@/assets/2675-1200.webp';
import asset3 from '@/assets/2675-1206.webp';
import asset4 from '@/assets/2637-77.webp';

const PREMIUM_EASE = [0.5, 0, 0.3, 1] as const;

const MASTERPIECES = [
    { img: asset1, title: '千里江山图', era: '北宋', year: '1113年' },
    { img: asset2, title: '清明上河图', era: '北宋', year: '1120年' },
    { img: asset3, title: '富春山居图', era: '元代', year: '1350年' },
    { img: asset4, title: '汉宫春晓图', era: '明代', year: '1521年' },
];

function MuseumHighlight() {
    const [, navigate] = useLocation();
    const [count, setCount] = useState(0);
    const [isInView, setIsInView] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start end", "end start"]
    });

    const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
    const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

    useEffect(() => {
        if (!isInView) return;
        const targetCount = 10;
        const duration = 2000;
        const frameRate = 60;
        const totalFrames = (duration / 1000) * frameRate;
        let frame = 0;
        let frameId: number | null = null;
        const animate = () => {
            frame++;
            const progress = frame / totalFrames;
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(easeOut * targetCount));
            if (frame < totalFrames) frameId = requestAnimationFrame(animate);
            else setCount(targetCount);
        };
        frameId = requestAnimationFrame(animate);
        return () => { if (frameId) cancelAnimationFrame(frameId); };
    }, [isInView]);

    // Auto-advance carousel (paused when off-screen)
    useEffect(() => {
        if (!isInView) return;
        const timer = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % MASTERPIECES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isInView]);

    return (
        <section className="relative w-full py-24 md:py-28 lg:py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #5a1a1a 0%, #3d1210 40%, #2c1810 100%)' }}>
            {/* Palace outline background decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
                <svg viewBox="0 0 1440 800" className="w-full h-full" preserveAspectRatio="none">
                    <path
                        d="M0,400 L100,400 L150,300 L200,350 L250,250 L300,300 L350,200 L400,280 L450,180 L500,250 L550,160 L600,220 L650,280 L700,200 L750,300 L800,250 L850,180 L900,240 L950,160 L1000,220 L1050,300 L1100,250 L1150,350 L1200,300 L1250,400 L1300,350 L1350,400 L1440,400"
                        stroke="#D4A76A" strokeWidth="1.5" fill="none"
                    />
                    <path
                        d="M200,600 L300,600 L350,500 L400,550 L450,480 L500,520 L550,450 L600,500 L650,600 L700,580 L750,500 L800,540 L850,480 L900,520 L950,600 L1000,580 L1050,500 L1100,560 L1200,600"
                        stroke="#D4A76A" strokeWidth="1" fill="none" opacity="0.5"
                    />
                </svg>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 relative z-10">

                {/* Section Header - Gold on dark */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-20 gap-8 md:gap-12">
                    <div>
                        <motion.h2
                            className="text-4xl md:text-[60px] lg:text-[70px] xl:text-[80px] font-normal mb-6"
                            style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive", color: '#D4A76A' }}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            传世名画
                        </motion.h2>
                        <div className="h-[2px] w-32 bg-gradient-to-r from-[#D4A76A] to-transparent" />
                    </div>
                    <p className="text-white/60 text-lg md:text-xl lg:text-2xl max-w-lg lg:max-w-xl text-right md:text-left leading-relaxed" style={{ fontFamily: "'LXGW WenKai', sans-serif" }}>
                        甄选中国美术史上的十座丰碑，通过高精度数字化技术，邀您共赴一场跨越千年的艺术对话。
                    </p>
                </div>

                {/* Featured artwork in circular frame (博物馆 inspired) */}
                <div ref={heroRef} className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center mb-16">
                    {/* Circular artwork frame */}
                    <motion.div
                        className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] flex-shrink-0"
                        onViewportEnter={() => setIsInView(true)}
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: PREMIUM_EASE }}
                    >
                        {/* Decorative ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-[#D4A76A]/30" />
                        <div className="absolute inset-3 rounded-full border border-[#D4A76A]/15" />
                        {/* Artwork circle */}
                        <div className="absolute inset-6 rounded-full overflow-hidden">
                            <motion.img
                                src={MASTERPIECES[activeSlide].img}
                                alt={MASTERPIECES[activeSlide].title}
                                style={{ y: imageY }}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>
                        {/* Count badge */}
                        <motion.div
                            className="absolute -top-2 -right-2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#5a1a1a] border border-[#D4A76A]/40 flex items-center justify-center"
                            animate={count === 10 ? { scale: [1, 1.15, 1] } : {}}
                            transition={{ duration: 0.5, type: "spring" }}
                        >
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl text-[#D4A76A]" style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>{count}</div>
                                <div className="text-[9px] text-[#D4A76A]/60 uppercase tracking-wider">件名画</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        style={{ y: contentY }}
                        className="flex-1"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="inline-block px-4 py-1.5 border border-[#D4A76A]/30 rounded-full text-[#D4A76A]/80 text-sm mb-6">
                            DIGITAL EXHIBITION
                        </div>
                        <h3
                            className="text-4xl md:text-6xl lg:text-7xl font-normal text-[#E8E3D1] mb-4 leading-tight"
                            style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                        >
                            {MASTERPIECES[activeSlide].title}
                        </h3>

                        {/* Dynasty indicator */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="px-3 py-1 bg-[#D4A76A]/10 border border-[#D4A76A]/20 rounded-full text-[#D4A76A] text-sm">
                                {MASTERPIECES[activeSlide].era} · {MASTERPIECES[activeSlide].year}
                            </div>
                            <div className="h-px flex-grow bg-gradient-to-r from-[#D4A76A]/40 to-transparent max-w-[200px]" />
                        </div>

                        <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-10" style={{ fontFamily: "'LXGW WenKai', sans-serif" }}>
                            绘于1113年，是18岁天才画家王希孟的唯一传世作品。全卷以青绿重彩描绘山河壮丽景色，构图宏大，气势磅礴，堪称中国青绿山水画的巅峰之作。
                        </p>

                        <button
                            onClick={() => navigate('/gallery/masterpieces')}
                            className="group/btn flex items-center gap-2 text-[#D4A76A] text-xl transition-all"
                        >
                            <span className="relative">
                                <span style={{ fontFamily: "'LXGW WenKai', sans-serif" }}>进入数字展厅</span>
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4A76A] group-hover/btn:w-full transition-all duration-300" />
                            </span>
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>

                {/* Carousel thumbnails - center mode peek */}
                <div className="flex justify-center gap-4 md:gap-6">
                    {MASTERPIECES.map((item, index) => (
                        <motion.div
                            key={index}
                            className="relative cursor-pointer overflow-hidden rounded-xl aspect-[3/2] ring-0 transition-all duration-500"
                            style={{
                                width: activeSlide === index ? '200px' : '140px',
                                opacity: activeSlide === index ? 1 : 0.5,
                            }}
                            onClick={() => setActiveSlide(index)}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: activeSlide === index ? 1 : 0.5, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, opacity: 0.9 }}
                        >
                            <img
                                src={item.img}
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                                <p className="text-white text-xs md:text-sm" style={{ fontFamily: "'LXGW WenKai', serif" }}>{item.title}</p>
                            </div>
                            {activeSlide === index && (
                                <motion.div
                                    layoutId="active-ring"
                                    className="absolute inset-0 rounded-xl ring-2 ring-[#D4A76A]/60"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Timeline dots */}
                <div className="flex justify-center items-center gap-2 mt-8">
                    {MASTERPIECES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveSlide(i)}
                            className="w-2 h-2 rounded-full transition-all duration-300"
                            style={{
                                backgroundColor: activeSlide === i ? '#D4A76A' : 'rgba(212, 167, 106, 0.2)',
                                width: activeSlide === i ? '24px' : '8px',
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default React.memo(MuseumHighlight);
