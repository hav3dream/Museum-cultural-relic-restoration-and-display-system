import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import asset24 from '@/assets/I2675-1455-2386-44.svg';
import asset25 from '@/assets/I2675-1458-2306-126.svg';
import asset26 from '@/assets/I2675-1461-17-250.svg';
import asset27 from '@/assets/I2675-1464-2515-33.svg';
import asset28 from '@/assets/2675-1475.svg';
import asset29 from '@/assets/2675-1482.svg';
import asset30 from '@/assets/2675-1486.svg';
import { WavePattern, CloudDrift, SealStamp } from '@/components/decorative';

export default function Footer() {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: false, margin: "-100px" });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className="relative z-0 w-full bg-[#4A3428]/85 backdrop-blur-sm py-16 overflow-hidden">
      {/* Wave pattern decoration at top */}
      <div className="absolute top-0 left-0 right-0">
        <WavePattern height={50} color="#E8E3D1" />
      </div>

      {/* Subtle background cloud decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <CloudDrift count={2} opacity={0.05} />
      </div>

      {/* Background noise/grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(212, 167, 106, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(232, 227, 209, 0.1) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px)
          `,
          animation: 'grain 8s steps(10) infinite'
        }}
      />

      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-10%, 5%); }
          60% { transform: translate(15%, 0); }
          70% { transform: translate(0, 10%); }
          80% { transform: translate(-15%, 0); }
          90% { transform: translate(10%, 5%); }
        }
      `}</style>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-8">
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0, ease: [0.5, 0, 0.3, 1] }}
          >
            <SectionHeader title="关于博物馆文物修复与展示系统" />
            <div className="w-full h-px bg-white mb-6"></div>
            <p className="text-museum-beige text-base md:text-lg lg:text-xl font-light leading-relaxed" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
              "博物馆文物修复与展示系统"是一个致力于古代艺术作品修复与数字活化的平台，通过现代科技让古老的艺术瑰宝焕发新生。
            </p>
            <div className="flex gap-4 mt-8">
              <SocialIcon src={asset24} alt="facebook" />
              <SocialIcon src={asset25} alt="twitter" />
              <SocialIcon src={asset26} alt="linkedin" />
              <SocialIcon src={asset27} alt="google" />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.5, 0, 0.3, 1] }}
          >
            <SectionHeader title="快速链接" />
            <div className="w-full h-px bg-white mb-6"></div>
            <ul className="space-y-4 text-museum-beige text-base md:text-lg lg:text-xl font-light" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
              <li><FooterLink href="/">首页</FooterLink></li>
              <li><FooterLink href="/virtual-restoration">虚拟复原</FooterLink></li>
              <li><FooterLink href="/ai-generation">智绘生成</FooterLink></li>
              <li><FooterLink href="/cultural-activation">活化利用</FooterLink></li>
              <li><FooterLink href="/digital-human">数字人</FooterLink></li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.5, 0, 0.3, 1] }}
          >
            <SectionHeader title="资源中心" />
            <div className="w-full h-px bg-white mb-6"></div>
            <ul className="space-y-4 text-museum-beige text-base md:text-lg lg:text-xl font-light" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
              <li><FooterLink href="/gallery/guohua">艺术作品数据库</FooterLink></li>
              <li><FooterLink href="/virtual-restoration">技术文档</FooterLink></li>
              <li><FooterLink href="/gallery/bihua">案例展示</FooterLink></li>
              <li><FooterLink href="/style-transfer">风格迁移</FooterLink></li>
              <li><FooterLink href="/super-resolution">超分重建</FooterLink></li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.5, 0, 0.3, 1] }}
          >
            <SectionHeader title="联系我们" />
            <div className="w-full h-px bg-white mb-6"></div>
            <div className="space-y-4 text-museum-beige text-base md:text-lg lg:text-xl font-light" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
              <div className="flex gap-3">
                <img src={asset28} alt="location" className="w-6 h-6 flex-shrink-0 mt-1 object-contain" />
                <p className="leading-relaxed">西安市长安区郭杜教育科技产业区学府大街1号</p>
              </div>
              <div className="flex gap-3">
                <img src={asset29} alt="phone" className="w-6 h-6 flex-shrink-0 mt-1 object-contain" />
                <p className="leading-relaxed">+86 12 3456 789</p>
              </div>
              <div className="flex gap-3">
                <img src={asset30} alt="email" className="w-6 h-6 flex-shrink-0 mt-1 object-contain" />
                <p className="leading-relaxed">123@museum-restoration.example.com</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-museum-beige/20 text-center">
          <div className="flex items-center justify-center gap-3">
            <motion.p
              className="relative text-museum-beige/70 text-base md:text-lg lg:text-xl font-light tracking-[0.08em] overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              © {new Date().getFullYear()} 博物馆文物修复与展示系统 Museum. All rights reserved.
              {/* Shimmer/glint effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: 2,
                  delay: 1,
                  ease: "easeInOut"
                }}
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)'
                }}
              />
            </motion.p>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <div className="w-6 h-6 opacity-50">
                <SealStamp size={24} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Back to Top Button with ink particles */}
      <BackToTopButton isInView={isInView} scrollToTop={scrollToTop} />
    </footer>
  );
}

// Section Header with self-drawing underline and pulsing dot
function SectionHeader({ title }: { title: string }) {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-50px" });

  return (
    <div ref={headerRef} className="relative mb-4">
      <motion.div
        className="flex items-center gap-2"
        whileHover={{ letterSpacing: '0.05em' }}
        transition={{ duration: 0.3 }}
      >
        {/* Pulsing gold dot with glow */}
        <motion.span
          className="w-2 h-2 rounded-full bg-[#D4A76A] relative"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(212, 167, 106, 0.7)',
              '0 0 0 4px rgba(212, 167, 106, 0)',
              '0 0 0 0 rgba(212, 167, 106, 0)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <h3 className="text-museum-beige text-xl md:text-2xl lg:text-[25px] font-semibold tracking-wide" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>
          {title}
        </h3>
      </motion.div>

      {/* Self-drawing gold underline */}
      <motion.div
        className="absolute -bottom-2 left-0 h-[1px] bg-gradient-to-r from-[#D4A76A] to-[#D4A76A]/50"
        initial={{ width: 0 }}
        animate={isHeaderInView ? { width: '100%' } : { width: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: "easeOut"
        }}
      />
    </div>
  );
}

// Social Icon with tooltip, rotation, and pulsing ring
function SocialIcon({ src, alt }: { src: string; alt: string }) {
  const [hasRotated, setHasRotated] = useState(false);

  return (
    <motion.div
      className="relative cursor-pointer"
      whileHover={{ y: -8, scale: 1.1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 10,
      }}
      onHoverStart={() => {
        if (!hasRotated) {
          setHasRotated(true);
        }
      }}
    >
      {/* Tooltip label */}
      <motion.div
        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#D4A76A] text-white px-3 py-1 rounded text-sm whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, y: 5 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {alt}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#D4A76A]" />
      </motion.div>

      {/* Pulsing gold ring on hover */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-[#D4A76A]"
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 1.8] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 0.5
        }}
      />

      {/* Existing glow ring behind icon */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#D4A76A]/30 blur-md"
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1.3 }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon with rotation animation */}
      <motion.img
        src={src}
        alt={alt}
        className="w-10 h-10 relative z-10 object-contain"
        animate={hasRotated ? { rotate: 360 } : { rotate: 0 }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}

// Back to Top Button with floating ink particles
function BackToTopButton({ isInView, scrollToTop }: { isInView: boolean; scrollToTop: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="absolute bottom-8 right-8"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Floating ink particles */}
      {isHovered && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full bg-[#4A3428]"
              initial={{
                opacity: 0.7,
                y: 0,
                x: -2 + Math.random() * 4
              }}
              animate={{
                opacity: 0,
                y: -60,
                x: -2 + Math.random() * 4 + (Math.random() - 0.5) * 20
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}

      <motion.button
        onClick={scrollToTop}
        className="relative w-14 h-14 rounded-full bg-[#D4A76A] text-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#C09960] transition-colors overflow-visible"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="回到顶部"
      >
        {/* Arrow with bounce animation */}
        <motion.svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{
            y: [0, -3, 0]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </motion.svg>

        {/* Hover text label */}
        <motion.div
          className="absolute -left-24 top-1/2 -translate-y-1/2 bg-[#D4A76A] text-white px-3 py-1.5 rounded whitespace-nowrap text-sm pointer-events-none"
          initial={{ opacity: 0, x: 10 }}
          animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          回到顶部
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

// Footer link component with premium brush-stroke underline and spring arrow
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={href}
      className="relative inline-block group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.span
        className="relative z-10 flex items-center gap-1"
        animate={isHovered ? {
          color: '#D4A76A',
          letterSpacing: '0.02em'
        } : {
          color: 'inherit',
          letterSpacing: '0em'
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.span
          initial={{ opacity: 0, x: -10, scale: 0.8 }}
          animate={isHovered ? {
            opacity: 1,
            x: 0,
            scale: 1
          } : {
            opacity: 0,
            x: -10,
            scale: 0.8
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 15
          }}
          className="text-[#D4A76A]"
        >
          →
        </motion.span>
        {children}
      </motion.span>

      {/* Brush-stroke style underline using SVG */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[2px] overflow-visible pointer-events-none"
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 0 1 Q 25 0.5, 50 1 T 100 1"
          stroke="#D4A76A"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isHovered ? {
            pathLength: 1,
            opacity: 1
          } : {
            pathLength: 0,
            opacity: 0
          }}
          transition={{
            pathLength: { duration: 0.4, ease: "easeInOut" },
            opacity: { duration: 0.2 }
          }}
        />
      </svg>
    </motion.a>
  );
}
