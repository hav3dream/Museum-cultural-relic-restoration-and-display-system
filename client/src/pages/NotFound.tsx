import { Link } from "wouter";
import { motion } from "framer-motion";
import { CloudDrift, InkBrushStroke, SealStamp, MistEffect } from "@/components/decorative";
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

// Animated scroll unrolling effect
function ScrollUnrolling() {
  return (
    <motion.svg
      className="absolute left-1/2 -translate-x-1/2 w-32 h-full"
      viewBox="0 0 120 1000"
      initial={{ height: 0 }}
      animate={{ height: "100%" }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      style={{ top: 0 }}
    >
      {/* Scroll paper */}
      <motion.rect
        x="10"
        y="0"
        width="100"
        height="100%"
        fill="#E8E3D1"
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      {/* Left rod */}
      <rect x="0" y="0" width="8" height="100%" fill="#7F3222" />
      {/* Right rod */}
      <rect x="112" y="0" width="8" height="100%" fill="#7F3222" />
      {/* Top rounded end */}
      <ellipse cx="60" cy="10" rx="60" ry="10" fill="#7F3222" />
      {/* Bottom rounded end */}
      <ellipse cx="60" cy="990" rx="60" ry="10" fill="#7F3222" />
    </motion.svg>
  );
}

// Ink splash decorations
function InkSplash({ delay = 0, position = { top: "20%", left: "15%" } }: { delay?: number; position?: { top: string; left: string } }) {
  return (
    <motion.svg
      className="absolute w-12 h-12"
      style={position}
      viewBox="0 0 50 50"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.3, scale: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <path
        d="M25 5 C15 10, 10 15, 5 25 C10 35, 15 40, 25 45 C35 40, 40 35, 45 25 C40 15, 35 10, 25 5 Z"
        fill="#7F3222"
      />
      <circle cx="20" cy="20" r="3" fill="#7F3222" />
      <circle cx="35" cy="30" r="2" fill="#7F3222" />
    </motion.svg>
  );
}

// Floating ink particles
function FloatingInkParticles() {
  const particles = [
    { delay: 0, x: "20%", duration: 4 },
    { delay: 0.5, x: "40%", duration: 5 },
    { delay: 1, x: "60%", duration: 4.5 },
    { delay: 1.5, x: "80%", duration: 5.5 },
    { delay: 2, x: "30%", duration: 4.8 },
  ];

  return (
    <>
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 w-2 h-2 rounded-full bg-museum-brown/20"
          style={{ left: particle.x }}
          initial={{ y: 0, opacity: 0.6 }}
          animate={{
            y: -800,
            opacity: [0.6, 0.8, 0]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </>
  );
}

// Typewriter effect for poetry text
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <div className="inline-block">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, delay: delay + i * 0.05 }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

export default function NotFound() {
  useDocumentTitle('页面未找到');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-museum-beige-dark relative overflow-hidden">
      {/* Animated scroll unrolling background */}
      <ScrollUnrolling />

      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <CloudDrift />
      </div>
      <MistEffect position="bottom" />

      {/* Ink splash decorations */}
      <InkSplash delay={0.8} position={{ top: "15%", left: "10%" }} />
      <InkSplash delay={1.2} position={{ top: "25%", right: "15%" }} />
      <InkSplash delay={1.5} position={{ top: "70%", left: "20%" }} />

      {/* Floating ink particles */}
      <FloatingInkParticles />

      {/* Main Content */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 404 as Seal Stamp with wobble animation */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
        >
          <motion.div
            animate={{ rotate: [-3, 3, -3] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <SealStamp text="404" size={120} color="#a03020" delay={0.5} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl font-bold text-museum-brown mb-4"
          style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          页面未找到
        </motion.h1>

        {/* Ink Brush Decoration */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <InkBrushStroke variant="underline" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-museum-brown-light text-xl mb-4"
          style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          您访问的页面似乎已随岁月消逝...
        </motion.p>

        <motion.p
          className="text-museum-brown/60 text-base mb-12"
          style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          或许它已被移至他处，又或已不复存在
        </motion.p>

        {/* Return Home Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Link href="/">
            <motion.button
              type="button"
              className="inline-flex items-center gap-2 px-10 py-4 bg-museum-brown text-white rounded-xl font-medium text-lg shadow-lg transition-all"
              style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}
              whileHover={{
                scale: 1.05,
                y: -2,
                boxShadow: "0 20px 40px rgba(127, 50, 34, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              返回首页
            </motion.button>
          </Link>
        </motion.div>

        {/* Optional Poetry with typewriter effect */}
        <div className="mt-16 text-museum-brown/40 text-sm italic" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>
          "<TypewriterText text="古韵流转，岁月如歌，待君归来" delay={1.5} />"
        </div>
      </motion.div>
    </div>
  );
}
