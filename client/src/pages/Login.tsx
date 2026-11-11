import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { CloudDrift, MistEffect, InkBrushStroke, SealStamp } from '@/components/decorative';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type Tab = 'login' | 'register';

// Enhanced Input Component with border animation, corner accents, and floating label
interface EnhancedInputProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder: string;
  required?: boolean;
  label: string;
  showPasswordToggle?: boolean;
  autoComplete?: string;
}

function EnhancedInput({
  id,
  type,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  required,
  label,
  showPasswordToggle,
  autoComplete
}: EnhancedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const hasValue = value.length > 0;
  const showFloatingLabel = isFocused || hasValue;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-museum-brown">
        {label}
      </label>
      <div className="relative">
        {/* Input wrapper with enhanced effects */}
        <div className="relative">
          <input
            id={id}
            type={inputType}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full px-4 py-3 bg-white/50 border-2 border-museum-brown/20 rounded-xl focus:outline-none focus:border-museum-brown/50 transition-all relative z-10"
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            style={{
              boxShadow: isFocused ? '0 0 20px rgba(212,167,106,0.15)' : undefined,
            }}
          />

          {/* Floating placeholder/label */}
          <motion.div
            className="absolute left-4 pointer-events-none text-museum-brown/50"
            initial={false}
            animate={{
              top: showFloatingLabel ? '0.5rem' : '50%',
              y: showFloatingLabel ? 0 : '-50%',
              scale: showFloatingLabel ? 0.75 : 1,
              opacity: showFloatingLabel ? 0 : 0.5,
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {placeholder}
          </motion.div>

          {/* Password Toggle Button */}
          {showPasswordToggle && (
            <motion.button
              type="button"
              onClick={togglePassword}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-museum-brown/50 hover:text-museum-brown z-20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                animate={{ rotate: showPassword ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {showPassword ? (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                ) : (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                )}
              </motion.svg>
              {/* Pulse effect on toggle */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    className="absolute inset-0 bg-museum-gold/20 rounded-full"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* Self-drawing gold border SVG overlay */}
          <AnimatePresence>
            {isFocused && (
              <motion.svg
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{ width: '100%', height: '100%' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="11"
                  stroke="#D4A76A"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ pathLength: 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              </motion.svg>
            )}
          </AnimatePresence>

          {/* L-shaped corner accents */}
          <AnimatePresence>
            {isFocused && (
              <>
                {/* Top-left corner */}
                <motion.div
                  className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-museum-gold rounded-tl-xl pointer-events-none"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                />
                {/* Top-right corner */}
                <motion.div
                  className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-museum-gold rounded-tr-xl pointer-events-none"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
                />
                {/* Bottom-left corner */}
                <motion.div
                  className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-museum-gold rounded-bl-xl pointer-events-none"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                />
                {/* Bottom-right corner */}
                <motion.div
                  className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-museum-gold rounded-br-xl pointer-events-none"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
                />
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  useDocumentTitle('登录');

  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [formBlur, setFormBlur] = useState(false);
  const [rippleOrigin, setRippleOrigin] = useState<{ x: number; y: number } | null>(null);
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Mouse tracking for parallax and brush interaction
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Brush rotation based on focused field
  const brushRotation = focusedField === 'email' ? -15 : focusedField === 'password' ? 15 : 0;
  const brushY = focusedField === 'password' ? 20 : 0;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 20;
        const y = (e.clientY - rect.top - rect.height / 2) / 20;
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Typing indicator
  useEffect(() => {
    if (email || password || name) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 300);
      return () => clearTimeout(timer);
    }
  }, [email, password, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSubmitSuccess(false);

    // Capture ripple origin from click position
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = (e.nativeEvent as MouseEvent).clientX - rect.left;
      const y = (e.nativeEvent as MouseEvent).clientY - rect.top;
      setRippleOrigin({ x, y });
    }

    try {
      if (tab === 'login') {
        if (!email || !password) {
          setError('请输入邮箱和密码');
          setIsLoading(false);
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError('请输入有效的邮箱地址');
          setIsLoading(false);
          return;
        }
        await login(email, password);
      } else {
        if (!email || !password || !name) {
          setError('请填写所有字段');
          setIsLoading(false);
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError('请输入有效的邮箱地址');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('密码长度不能少于6位');
          setIsLoading(false);
          return;
        }
        await register(email, name, password);
      }
      // Show success state briefly
      setSubmitSuccess(true);
      setTimeout(() => {
        setLocation('/');
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试');
      setRippleOrigin(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab switching with blur effect
  const handleTabSwitch = (newTab: Tab) => {
    if (newTab !== tab) {
      setFormBlur(true);
      setTimeout(() => {
        setTab(newTab);
        setError('');
        setFormBlur(false);
      }, 150);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-museum-beige via-museum-beige/95 to-museum-brown/10 relative overflow-hidden">
      {/* Animated Ink Wash Mountain Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Aurora Gradient Background Layers - Behind Mountains */}
        <motion.div
          className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(212,167,106,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,240,0.1) 0%, transparent 70%)',
            filter: 'blur(100px)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
          animate={{
            x: [50, -50, 50],
            y: [30, -30, 30],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            direction: "reverse",
          }}
        />
        <motion.div
          className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(127,50,34,0.08) 0%, transparent 70%)',
            filter: 'blur(90px)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
          animate={{
            x: [-30, 40, -30],
            y: [40, -20, 40],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Layer 1 - Far mountains */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-64 opacity-20"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 1200 300" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mountain1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2c241b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2c241b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,150 Q150,80 300,120 T600,100 T900,130 T1200,110 L1200,300 L0,300 Z"
              fill="url(#mountain1)"
            />
          </svg>
        </motion.div>

        {/* Layer 2 - Middle mountains */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-48 opacity-30"
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <svg viewBox="0 0 1200 300" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,180 Q200,100 400,140 T800,130 T1200,150 L1200,300 L0,300 Z"
              fill="url(#mountain1)"
            />
          </svg>
        </motion.div>

        {/* Layer 3 - Near mountains */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-32 opacity-40"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <svg viewBox="0 0 1200 300" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,220 Q250,180 500,210 T1000,200 T1200,210 L1200,300 L0,300 Z"
              fill="url(#mountain1)"
            />
          </svg>
        </motion.div>

        {/* Floating ink particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-museum-ink/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}

        <CloudDrift />
      </div>

      <MistEffect position="bottom" />

      {/* Main Content - Split Screen Layout */}
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 py-12">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">

          {/* Left Side - Animated Ink Brush Character */}
          <motion.div
            className="flex flex-col items-center justify-center space-y-8 lg:order-1 order-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Title */}
            <div className="text-center space-y-4">
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2
                }}
              >
                <SealStamp text="韵" size={80} color="#7F3222" delay={0.5} />
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-museum-brown tracking-wide flex justify-center gap-1"
                style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              >
                {['画', '韵', '新', '生'].map((char, i) => (
                  <motion.span
                    key={char}
                    className="inline-block"
                    initial={{ opacity: 0, y: 30, rotateX: -60 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: [0.5, 0, 0.3, 1] }}
                    whileHover={{ scale: 1.1, color: '#D4A76A' }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.div
                className="flex justify-center"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <InkBrushStroke width={200} color="#7F3222" />
              </motion.div>

              <motion.p
                className="text-museum-brown/70 text-lg"
                style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                古画修复与艺术重生
              </motion.p>
            </div>

            {/* Animated Ink Brush Character (AI-generated) */}
            <div className="relative w-64 h-96 lg:block hidden">
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  y: focusedField ? brushY : [0, -10, 0],
                }}
                transition={
                  focusedField
                    ? { type: "spring", stiffness: 150, damping: 15 }
                    : {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                }
              >
                <motion.img
                  src="/images/login-brush-v1.png"
                  alt="毛笔吉祥物"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  animate={{
                    rotate: brushRotation,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                  style={{ filter: 'drop-shadow(0 8px 24px rgba(127, 50, 34, 0.2))' }}
                />
              </motion.div>

              {/* Floating Chinese characters around brush */}
              {['书', '画', '墨', '韵'].map((char, i) => (
                <motion.div
                  key={char}
                  className="absolute text-2xl text-museum-brown/30 pointer-events-none"
                  style={{
                    fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive",
                    left: `${50 + Math.cos((i * Math.PI * 2) / 4) * 45}%`,
                    top: `${50 + Math.sin((i * Math.PI * 2) / 4) * 45}%`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.3, 0.6, 0.3],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                >
                  {char}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Form Card */}
          <motion.div
            className="flex items-center justify-center lg:order-2 order-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              ref={cardRef}
              className="w-full max-w-md lg:max-w-lg xl:max-w-xl relative"
              style={{
                rotateX: useTransform(mouseY, [-100, 100], [5, -5]),
                rotateY: useTransform(mouseX, [-100, 100], [-5, 5]),
                transformStyle: "preserve-3d",
                perspective: 1000,
              }}
            >
              {/* Morphing Ink Blob Behind Form Card */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,167,106,0.2), rgba(127,50,34,0.15))',
                  filter: 'blur(60px)',
                  mixBlendMode: 'multiply',
                  zIndex: -1,
                }}
                animate={{
                  borderRadius: [
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                    '30% 60% 70% 40% / 50% 60% 30% 60%',
                    '50% 40% 60% 50% / 30% 70% 50% 60%',
                    '40% 60% 50% 40% / 60% 40% 60% 50%',
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                  ],
                  x: [-20, 20, -20],
                  y: [-15, 15, -15],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Card with scroll texture effect */}
              <div
                className="bg-gradient-to-br from-white via-museum-beige/20 to-white backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden relative"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      rgba(127, 50, 34, 0.03) 2px,
                      rgba(127, 50, 34, 0.03) 4px
                    )
                  `,
                }}
              >
                {/* Traditional Chinese pattern border */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full" style={{ opacity: 0.1 }}>
                    <defs>
                      <pattern id="chinese-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="2" fill="#7F3222" />
                        <path d="M 15 15 L 25 25 M 25 15 L 15 25" stroke="#7F3222" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#chinese-pattern)" />
                  </svg>
                </div>

                {/* Tab Toggle with Ink Brush Slider */}
                <div className="relative border-b border-museum-brown/10">
                  <div className="flex relative z-10" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('login')}
                      className={`flex-1 py-5 text-base lg:text-lg font-medium transition-all relative ${
                        tab === 'login'
                          ? 'text-museum-brown font-bold scale-105'
                          : 'text-museum-brown/50 hover:text-museum-brown/70'
                      }`}
                    >
                      <motion.span
                        className="relative inline-block"
                        animate={
                          tab === 'login'
                            ? {
                                textShadow: [
                                  '0 0 0px rgba(212,167,106,0)',
                                  '0 0 8px rgba(212,167,106,0.5)',
                                  '0 0 0px rgba(212,167,106,0)',
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        登录
                      </motion.span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('register')}
                      className={`flex-1 py-5 text-base lg:text-lg font-medium transition-all relative ${
                        tab === 'register'
                          ? 'text-museum-brown font-bold scale-105'
                          : 'text-museum-brown/50 hover:text-museum-brown/70'
                      }`}
                    >
                      <motion.span
                        className="relative inline-block"
                        animate={
                          tab === 'register'
                            ? {
                                textShadow: [
                                  '0 0 0px rgba(212,167,106,0)',
                                  '0 0 8px rgba(212,167,106,0.5)',
                                  '0 0 0px rgba(212,167,106,0)',
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        注册
                      </motion.span>
                    </button>
                  </div>

                  {/* Animated Ink Brush Underline with Gold Glow - Enhanced with bounce spring */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 flex items-center justify-center"
                    animate={{
                      x: tab === 'login' ? '25%' : '75%',
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      damping: 20,
                      mass: 0.8
                    }}
                  >
                    {/* Gold glow behind underline */}
                    <motion.div
                      className="absolute w-24 h-2 bg-[#D4A76A]/20 blur-sm"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                    />
                    {/* Ink brush stroke */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="w-24 relative z-10"
                    >
                      <InkBrushStroke width={96} color="#7F3222" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Form with blur transition on tab switch */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="p-6 sm:p-8 lg:p-10 xl:p-12 space-y-6"
                  animate={{
                    filter: formBlur ? 'blur(8px)' : 'blur(0px)',
                    opacity: formBlur ? 0.5 : 1,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Error Message with Ink Splash Effect */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        className="relative bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl overflow-hidden"
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Ink splash background */}
                        <motion.div
                          className="absolute inset-0 bg-red-500 opacity-10"
                          initial={{ scale: 0, rotate: 0 }}
                          animate={{ scale: 3, rotate: 180 }}
                          transition={{ duration: 0.5 }}
                          style={{
                            clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                          }}
                        />
                        <div className="relative z-10">{error}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Name Field (Register only) - Enhanced */}
                  <AnimatePresence mode="wait">
                    {tab === 'register' && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <EnhancedInput
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="请输入您的姓名"
                          label="姓名"
                          required={tab === 'register'}
                          autoComplete="name"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email Field - Enhanced */}
                  <EnhancedInput
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="请输入您的邮箱"
                    label="邮箱"
                    required
                    autoComplete="email"
                  />

                  {/* Password Field - Enhanced with toggle */}
                  <EnhancedInput
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="请输入您的密码"
                    label="密码"
                    required
                    showPasswordToggle
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  />

                  {/* Submit Button - Enhanced with ripple, dual rings, and success burst */}
                  <motion.button
                    ref={buttonRef}
                    type="submit"
                    disabled={isLoading || submitSuccess}
                    className="relative w-full bg-gradient-to-br from-museum-gold to-museum-brown text-white py-4 rounded-xl font-medium overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed shadow-lg group"
                    whileHover={!isLoading && !submitSuccess ? { scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" } : {}}
                    whileTap={!isLoading && !submitSuccess ? { scale: 0.97 } : {}}
                    animate={
                      !isLoading && !submitSuccess
                        ? {}
                        : { scale: [0.97, 1] }
                    }
                    transition={
                      !isLoading && !submitSuccess
                        ? {}
                        : { type: 'spring', stiffness: 400, damping: 10 }
                    }
                  >
                    {/* Ink ripple effect on click */}
                    <AnimatePresence>
                      {rippleOrigin && (
                        <motion.div
                          className="absolute bg-museum-gold/30 rounded-full"
                          style={{
                            left: rippleOrigin.x,
                            top: rippleOrigin.y,
                          }}
                          initial={{ width: 0, height: 0, x: 0, y: 0 }}
                          animate={{
                            width: 400,
                            height: 400,
                            x: -200,
                            y: -200,
                            opacity: 0,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          onAnimationComplete={() => setRippleOrigin(null)}
                        />
                      )}
                    </AnimatePresence>

                    {/* Gold shimmer sweep on hover */}
                    {!isLoading && !submitSuccess && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '200%' }}
                        transition={{ duration: 0.6 }}
                      />
                    )}

                    {/* Button content */}
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <>
                          {/* Dual spinning rings loading state */}
                          <div className="relative w-6 h-6">
                            <motion.div
                              className="absolute inset-0 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div
                              className="absolute inset-1 border-2 border-white/30 border-b-white rounded-full"
                              animate={{ rotate: -360 }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                            />
                          </div>
                          <span>处理中...</span>
                        </>
                      ) : submitSuccess ? (
                        <>
                          {/* Success checkmark with particle burst */}
                          <div className="relative w-6 h-6">
                            <motion.svg
                              viewBox="0 0 24 24"
                              className="w-6 h-6 text-green-400"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                              <motion.path
                                d="M5 13l4 4L19 7"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                              />
                            </motion.svg>
                            {/* Particle burst */}
                            {[...Array(6)].map((_, i) => {
                              const angle = (i * 360) / 6;
                              const rad = (angle * Math.PI) / 180;
                              return (
                                <motion.div
                                  key={i}
                                  className="absolute w-1 h-1 bg-museum-gold rounded-full"
                                  style={{
                                    left: '50%',
                                    top: '50%',
                                  }}
                                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                  animate={{
                                    x: Math.cos(rad) * 30,
                                    y: Math.sin(rad) * 30,
                                    opacity: 0,
                                    scale: 0,
                                  }}
                                  transition={{
                                    duration: 0.6,
                                    delay: 0.1 + i * 0.02,
                                    ease: 'easeOut',
                                  }}
                                />
                              );
                            })}
                          </div>
                          <span>成功!</span>
                        </>
                      ) : (
                        <span className="text-lg tracking-wider">
                          {tab === 'login' ? '登录' : '注册'}
                        </span>
                      )}
                    </span>

                    {/* Seal stamp press effect */}
                    {!isLoading && !submitSuccess && (
                      <motion.div
                        className="absolute inset-0 bg-museum-ink/20 pointer-events-none"
                        initial={{ opacity: 0, scale: 1 }}
                        whileTap={{ opacity: [0, 0.5, 0], scale: [1, 0.95, 1] }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>

                  {/* Alternative Action */}
                  <div className="text-center text-sm text-museum-brown/60">
                    {tab === 'login' ? '还没有账号？' : '已有账号？'}
                    <button
                      type="button"
                      onClick={() => handleTabSwitch(tab === 'login' ? 'register' : 'login')}
                      className="ml-1 text-museum-gold hover:text-museum-brown font-medium transition-colors relative group"
                    >
                      {tab === 'login' ? '立即注册' : '立即登录'}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-museum-gold group-hover:w-full transition-all duration-300" />
                    </button>
                  </div>
                </motion.form>
              </div>

              {/* Floating decorative seals around card */}
              {['书', '画'].map((char, i) => (
                <motion.div
                  key={char}
                  className="absolute hidden lg:block"
                  style={{
                    left: i === 0 ? '-60px' : 'auto',
                    right: i === 1 ? '-60px' : 'auto',
                    top: `${30 + i * 40}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                >
                  <SealStamp text={char} size={48} color="#7F3222" delay={i * 0.3} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
