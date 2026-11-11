import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import StickyHeader from '@/components/StickyHeader';
import MobileMenu from '@/components/MobileMenu';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { InkBrushStroke, SealStamp } from '@/components/decorative';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface DashboardData {
  user: {
    id: number;
    email: string;
    name: string | null;
    created_at: Date;
  };
  creditBalance: number;
  subscription: {
    id: number;
    plan_id: string | null;
    status: string;
    current_period_start: Date | null;
    current_period_end: Date | null;
  } | null;
  recentRestorations: Array<{
    id: number;
    type: string;
    status: string;
    inputFileUrl: string | null;
    resultUrls: string[];
    algorithm: string | null;
    parameters: Record<string, unknown>;
    created_at: Date;
    completed_at: Date | null;
  }>;
  galleryItemsCount: number;
}

export default function Dashboard() {
  useDocumentTitle('个人中心');

  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch('/api/user/dashboard', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          toast.error('请先登录');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setData(result);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Dashboard error:', error);
        toast.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [navigate]);

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-CN');
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-museum-beige text-museum-brown border-museum-brown/30',
      processing: 'bg-[#D4A76A]/15 text-[#D4A76A] border-[#D4A76A]/30',
      completed: 'bg-museum-beige text-museum-brown-dark border-museum-brown/30',
      failed: 'bg-red-50 text-red-700 border-red-300',
      active: 'bg-museum-beige text-museum-brown-dark border-museum-brown/30',
      canceled: 'bg-museum-beige-dark text-museum-brown border-museum-brown/20',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
          colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
        }`}
      >
        {status === 'processing' && (
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-[#D4A76A]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {status === 'pending' && '等待处理'}
        {status === 'processing' && '处理中'}
        {status === 'completed' && '已完成'}
        {status === 'failed' && '失败'}
        {status === 'active' && '活跃'}
        {status === 'canceled' && '已取消'}
        {!['pending', 'processing', 'completed', 'failed', 'active', 'canceled'].includes(status) && status}
      </span>
    );
  };

  const getPlanName = (planId: string | null) => {
    const plans: Record<string, string> = {
      starter: '入门版',
      professional: '专业版',
      enterprise: '企业版',
    };
    return planId ? plans[planId] || planId : '无订阅';
  };

  // Type labels mapping
  const TYPE_LABELS: Record<string, string> = {
    'ancient-painting': '古画修复',
    'mural': '壁画修复',
    'calligraphy': '书法生成',
    'outline': '轮廓解析',
    'stele': '碑石修复',
  };

  const getTypeLabel = (type: string) => {
    return TYPE_LABELS[type] || type;
  };

  const formatProcessingTime = (createdAt: Date | null, completedAt: Date | null) => {
    if (!createdAt || !completedAt) return '-';
    const created = new Date(createdAt).getTime();
    const completed = new Date(completedAt).getTime();
    const diff = Math.floor((completed - created) / 1000); // in seconds
    if (diff < 60) return `${diff}秒`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟`;
    return `${Math.floor(diff / 3600)}小时`;
  };

  // Ink ripple handler for quick action cards
  const handleCardClick = (e: React.MouseEvent<HTMLButtonElement>, navigateTo: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.width / 2;
    const y = rect.height / 2;
    const id = Date.now();

    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 400);

    navigate(navigateTo);
  };

  // Animated counter hook with spring physics
  const useCountUp = (end: number) => {
    const springValue = useSpring(0, { stiffness: 80, damping: 12 });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      springValue.set(end);

      const unsubscribe = springValue.on('change', (latest) => {
        setDisplayValue(Math.round(latest));
      });

      return () => unsubscribe();
    }, [end, springValue]);

    return displayValue;
  };

  // Circular progress component with decorative rotating ring
  const CircularProgress = ({ percentage, size = 120 }: { percentage: number; size?: number }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const decorativeRadius = radius + 8;

    return (
      <div className="relative">
        <svg
          width={size + 16}
          height={size + 16}
          className="transform -rotate-90"
          style={{
            filter: percentage > 50 ? 'drop-shadow(0 0 8px rgba(212,167,106,0.3))' : 'none'
          }}
        >
          {/* Decorative rotating dashed ring */}
          <motion.circle
            cx={(size + 16) / 2}
            cy={(size + 16) / 2}
            r={decorativeRadius}
            fill="none"
            stroke="#D4A76A"
            strokeWidth="1"
            strokeDasharray="4 8"
            opacity="0.3"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: 'center' }}
          />

          {/* Background circle */}
          <circle
            cx={(size + 16) / 2}
            cy={(size + 16) / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-museum-brown/10"
          />

          {/* Progress circle */}
          <motion.circle
            cx={(size + 16) / 2}
            cy={(size + 16) / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />

          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7F3222" />
              <stop offset="50%" stopColor="#D4A76A" />
              <stop offset="100%" stopColor="#7F3222" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-museum-beige font-sans">
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="light" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 py-16 pt-[180px]">
          <div className="mb-12">
            <motion.div
              className="h-12 w-48 mb-4 rounded-lg overflow-hidden"
              style={{
                background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.div
              className="h-6 w-64 rounded-lg overflow-hidden"
              style={{
                background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Hero credit card skeleton */}
            <motion.div
              className="md:col-span-2 bg-white/60 backdrop-blur-xl border border-white/20 rounded-[24px] p-10 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
              transition={{ delay: 0 }}
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <motion.div
                    className="h-4 w-20 rounded-lg"
                    style={{
                      background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{
                      backgroundPosition: ['200% 0', '-200% 0'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="h-14 w-32 rounded-lg"
                    style={{
                      background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{
                      backgroundPosition: ['200% 0', '-200% 0'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="h-4 w-24 rounded-lg"
                    style={{
                      background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{
                      backgroundPosition: ['200% 0', '-200% 0'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
                <motion.div
                  className="w-[140px] h-[140px] rounded-full"
                  style={{
                    background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['200% 0', '-200% 0'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </motion.div>

            {/* Subscription card skeleton */}
            <motion.div
              className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-[24px] p-10 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
              transition={{ delay: 0.15 }}
            >
              <div className="space-y-4">
                <motion.div
                  className="h-4 w-20 rounded-lg"
                  style={{
                    background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['200% 0', '-200% 0'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="h-8 w-24 rounded-lg"
                  style={{
                    background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['200% 0', '-200% 0'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="h-6 w-20 rounded-full"
                  style={{
                    background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['200% 0', '-200% 0'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </motion.div>

            {/* Gallery card skeleton */}
            <motion.div
              className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-[24px] p-10 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-4">
                <motion.div
                  className="h-4 w-20 rounded-lg"
                  style={{
                    background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['200% 0', '-200% 0'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="h-12 w-24 rounded-lg"
                  style={{
                    background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['200% 0', '-200% 0'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="h-4 w-16 rounded-lg"
                  style={{
                    background: 'linear-gradient(110deg, #f0e5cf 8%, #E8E3D1 18%, #f0e5cf 33%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['200% 0', '-200% 0'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-museum-beige font-sans">
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="light" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 py-16 pt-[180px] flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-museum-brown/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-museum-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-museum-brown text-xl mb-2" style={{ fontFamily: "'LXGW WenKai', serif" }}>
              数据加载失败
            </p>
            <p className="text-museum-brown/50 text-sm mb-8">
              请检查网络连接后重试
            </p>
            <motion.button
              onClick={() => { setLoading(true); fetchDashboardData(); }}
              className="px-8 py-3 rounded-xl text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #7F3222, #C85840)', fontFamily: "'LXGW WenKai', serif" }}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(127,50,34,0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              重新加载
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Component to display animated count with spring physics
  const AnimatedCount = ({ value, gradient = false }: { value: number; gradient?: boolean }) => {
    const count = useCountUp(value);

    return (
      <span className={gradient ? "bg-gradient-to-r from-[#7F3222] to-[#D4A76A] bg-clip-text text-transparent" : ""}>
        {count}
      </span>
    );
  };

  // Get status color for timeline dots
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-museum-brown';
      case 'processing':
      case 'pending':
        return 'bg-[#D4A76A]';
      case 'failed':
        return 'bg-[#a03020]';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-museum-beige font-sans relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(127, 50, 34, 0.3) 0%, transparent 70%)',
            top: '-200px',
            left: '-200px',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(212, 167, 106, 0.3) 0%, transparent 70%)',
            bottom: '-100px',
            right: '-100px',
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Paper texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="light" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 py-16 pt-[180px] relative z-10">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-[48px] lg:text-[56px] font-bold text-museum-brown mb-2" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}>用户中心</h1>
          <p className="text-museum-brown text-lg lg:text-xl" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
            欢迎回来，{data.user.name || data.user.email}
          </p>
        </motion.div>

        <div className="mb-8">
          <InkBrushStroke variant="divider" />
        </div>

        {/* Bento Grid Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Credits Card - Hero Card (col-span-2) */}
          <motion.div
            className="md:col-span-2 bg-white/60 backdrop-blur-xl border border-white/20 rounded-[24px] p-10 shadow-lg hover:shadow-xl transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="text-museum-brown/60 text-base mb-4 font-medium">可用额度</div>
                <div className="text-[64px] lg:text-[72px] font-bold mb-6 leading-none">
                  <AnimatedCount value={data.creditBalance} gradient={true} />
                </div>
                <div className="text-museum-brown/50 text-base font-medium">
                  学术演示模式
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <CircularProgress percentage={Math.min((data.creditBalance / 1000) * 100, 100)} size={140} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-museum-brown">
                        <AnimatedCount value={Math.min(Math.round((data.creditBalance / 1000) * 100), 100)} />%
                      </div>
                      <motion.div
                        className="text-sm text-museum-brown/60"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                      >
                        剩余
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            className="relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-[24px] p-10 shadow-lg transition-all overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ boxShadow: '0 0 0 1px rgba(212,167,106,0.3), 0 0 20px rgba(212,167,106,0.1)' }}
          >
            {/* Gold corner accent */}
            <div className="absolute top-0 right-0 w-2 h-8 bg-museum-gold opacity-60" />
            <div className="absolute top-0 right-0 w-8 h-2 bg-museum-gold opacity-60" />

            <div className="text-museum-brown/60 text-base mb-4 font-medium flex items-center gap-2">
              订阅计划
              {/* Breathing crown icon */}
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-museum-gold"
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M8 2L9 6L12 4L11 8H5L4 4L7 6L8 2Z" fill="currentColor" opacity="0.8" />
                <rect x="4" y="8" width="8" height="2" fill="currentColor" />
              </motion.svg>
            </div>
            <div className="text-[28px] lg:text-[32px] font-bold text-museum-brown mb-4">
              {getPlanName(data.subscription?.plan_id || null)}
            </div>
            {data.subscription && (
              <div className="mb-3">{getStatusBadge(data.subscription.status)}</div>
            )}
            {data.subscription?.current_period_end && (
              <div className="text-museum-brown/60 text-xs mb-4">
                到期: {formatDate(data.subscription.current_period_end)}
              </div>
            )}
            <motion.button
              onClick={() => navigate('/pricing')}
              className="text-museum-brown text-sm font-medium relative group"
              whileHover="hover"
            >
              <span className="relative z-10">{data.subscription ? '管理 →' : '订阅 →'}</span>
              <motion.div
                className="absolute bottom-0 left-0 h-[1px] bg-museum-gold"
                initial={{ scaleX: 0 }}
                variants={{ hover: { scaleX: 1 } }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />
            </motion.button>
          </motion.div>

          {/* Gallery Card */}
          <motion.div
            className="relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-[24px] p-10 shadow-lg transition-all overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ boxShadow: '0 0 0 1px rgba(212,167,106,0.3), 0 0 20px rgba(212,167,106,0.1)' }}
          >
            {/* Gold corner accent */}
            <div className="absolute top-0 right-0 w-2 h-8 bg-museum-gold opacity-60" />
            <div className="absolute top-0 right-0 w-8 h-2 bg-museum-gold opacity-60" />

            <div className="text-museum-brown/60 text-base mb-4 font-medium flex items-center gap-2">
              修复成果
              {/* Floating gallery icon */}
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-museum-gold"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <rect x="2" y="3" width="12" height="10" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1" />
                <path d="M2 10L5 7L7 9L11 5L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="5" cy="6" r="1" fill="currentColor" />
              </motion.svg>
            </div>
            <div className="text-[56px] lg:text-[64px] font-bold text-museum-brown mb-6 leading-none">
              <AnimatedCount value={data.galleryItemsCount} />
            </div>
            <motion.button
              onClick={() => navigate('/gallery/guohua')}
              className="text-museum-brown text-sm font-medium relative group"
              whileHover="hover"
            >
              <span className="relative z-10">查看 →</span>
              <motion.div
                className="absolute bottom-0 left-0 h-[1px] bg-museum-gold"
                initial={{ scaleX: 0 }}
                variants={{ hover: { scaleX: 1 } }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />
            </motion.button>
          </motion.div>
        </div>

        <div className="mb-8">
          <InkBrushStroke variant="divider" />
        </div>

        {/* Quick Actions - Icon Cards */}
        <motion.div
          className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-[24px] p-10 shadow-lg mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <motion.h2
              className="text-[28px] lg:text-[32px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-museum-brown via-museum-gold to-museum-brown"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: '200% 200%', fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
            >
              快速操作
            </motion.h2>
            {/* Decorative seal dots */}
            <div className="flex gap-1.5">
              {[0, 0.15, 0.3].map((delay, idx) => (
                <motion.div
                  key={idx}
                  className="w-1.5 h-1.5 rounded-full bg-museum-gold"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
                  transition={{ duration: 0.6, delay: 0.5 + delay, repeat: Infinity, repeatDelay: 3 }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ancient Painting */}
            <motion.button
              onClick={(e) => handleCardClick(e, '/ancient-painting-restoration')}
              className="group relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-[20px] p-10 text-center transition-all overflow-hidden hover:bg-gradient-to-br hover:from-white/70 hover:to-[#E8E3D1]/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(127, 50, 34, 0.2)' }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Ink ripple effects */}
              <AnimatePresence>
                {ripples.map(ripple => (
                  <motion.div
                    key={ripple.id}
                    className="absolute rounded-full bg-museum-gold/40 pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.6 }}
                    animate={{ width: 300, height: 300, x: -150, y: -150, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                ))}
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7F3222] to-[#D4A76A] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <motion.div
                className="w-20 h-20 mx-auto mb-6 flex items-center justify-center text-museum-brown transition-all"
                whileHover={{ rotate: 5, filter: 'drop-shadow(0 0 12px rgba(212,167,106,0.4))' }}
                transition={{ duration: 0.3 }}
              >
                <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.path
                    d="M20 52C20 52 22 42 28 38C34 34 36 28 36 28"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0 }}
                  />
                  <motion.path
                    d="M28 20C28 20 30 28 34 32C38 36 44 38 44 38"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                  <motion.path
                    d="M16 16L12 12M48 16L52 12M16 48L12 52M48 48L52 52"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                </svg>
              </motion.div>
              <h3 className="text-xl lg:text-2xl font-bold text-museum-brown mb-2">古画修复</h3>
              <p className="text-base text-museum-brown/60">修复受损古画</p>
            </motion.button>

            {/* Mural Restoration */}
            <motion.button
              onClick={(e) => handleCardClick(e, '/mural-restoration')}
              className="group relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-[20px] p-10 text-center transition-all overflow-hidden hover:bg-gradient-to-br hover:from-white/70 hover:to-[#E8E3D1]/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(127, 50, 34, 0.2)' }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Ink ripple effects */}
              <AnimatePresence>
                {ripples.map(ripple => (
                  <motion.div
                    key={ripple.id}
                    className="absolute rounded-full bg-museum-gold/40 pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.6 }}
                    animate={{ width: 300, height: 300, x: -150, y: -150, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                ))}
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7F3222] to-[#D4A76A] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <motion.div
                className="w-20 h-20 mx-auto mb-6 flex items-center justify-center text-museum-brown transition-all"
                whileHover={{ rotate: 5, filter: 'drop-shadow(0 0 12px rgba(212,167,106,0.4))' }}
                transition={{ duration: 0.3 }}
              >
                <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.path
                    d="M12 48L20 32L28 40L36 24L44 36L52 28"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.15 }}
                  />
                  <motion.rect
                    x="8"
                    y="16"
                    width="48"
                    height="36"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    rx="4"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.25 }}
                  />
                  <motion.path
                    d="M16 24L24 32M32 20L40 28M44 24L48 28"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                  />
                </svg>
              </motion.div>
              <h3 className="text-xl lg:text-2xl font-bold text-museum-brown mb-2">壁画修复</h3>
              <p className="text-base text-museum-brown/60">恢复壁画原貌</p>
            </motion.button>

            {/* Calligraphy Generation */}
            <motion.button
              onClick={(e) => handleCardClick(e, '/calligraphy-generation')}
              className="group relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-[20px] p-10 text-center transition-all overflow-hidden hover:bg-gradient-to-br hover:from-white/70 hover:to-[#E8E3D1]/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(127, 50, 34, 0.2)' }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Ink ripple effects */}
              <AnimatePresence>
                {ripples.map(ripple => (
                  <motion.div
                    key={ripple.id}
                    className="absolute rounded-full bg-museum-gold/40 pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.6 }}
                    animate={{ width: 300, height: 300, x: -150, y: -150, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                ))}
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7F3222] to-[#D4A76A] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <motion.div
                className="w-20 h-20 mx-auto mb-6 flex items-center justify-center text-museum-brown transition-all"
                whileHover={{ rotate: 5, filter: 'drop-shadow(0 0 12px rgba(212,167,106,0.4))' }}
                transition={{ duration: 0.3 }}
              >
                <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.path
                    d="M32 8V56M32 8C32 8 28 12 24 16M32 8C32 8 36 12 40 16"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                  <motion.path
                    d="M20 24C20 24 24 28 32 28C40 28 44 24 44 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  />
                  <motion.path
                    d="M18 38C18 38 22 42 32 42C42 42 46 38 46 38"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  />
                  <ellipse cx="32" cy="54" rx="6" ry="3" fill="currentColor" opacity="0.3"/>
                </svg>
              </motion.div>
              <h3 className="text-xl lg:text-2xl font-bold text-museum-brown mb-2">书法生成</h3>
              <p className="text-base text-museum-brown/60">生成传统书法</p>
            </motion.button>
          </div>
        </motion.div>

        <div className="mb-8">
          <InkBrushStroke variant="divider" />
        </div>

        {/* Recent Restorations */}
        <motion.div
          className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-[24px] p-10 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-[28px] lg:text-[32px] font-bold text-museum-brown mb-8" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>最近修复历史</h2>
          {data.recentRestorations.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="mb-6 relative">
                {/* Animated ink brush illustration */}
                <motion.svg
                  className="mx-auto h-32 w-32 text-museum-brown/30"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.path
                    d="M50 20 L50 70"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <circle cx="50" cy="15" r="8" fill="currentColor" />
                  <motion.ellipse
                    cx="50"
                    cy="75"
                    rx="12"
                    ry="6"
                    fill="currentColor"
                    opacity="0.4"
                    animate={{ scaleX: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Ink drops */}
                  <motion.circle
                    cx="45"
                    cy="40"
                    r="2"
                    fill="currentColor"
                    opacity="0.6"
                    animate={{ y: [0, 20], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                  />
                  <motion.circle
                    cx="55"
                    cy="50"
                    r="2"
                    fill="currentColor"
                    opacity="0.6"
                    animate={{ y: [0, 20], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  />
                </motion.svg>
              </div>
              <p className="text-museum-brown/60 text-xl mb-6">暂无修复记录</p>
              <p className="text-museum-brown/50 text-base mb-8">
                开始您的第一次古画修复之旅，让艺术重焕新生
              </p>
              <motion.button
                onClick={() => navigate('/ancient-painting-restoration')}
                className="inline-block px-10 py-4 bg-museum-brown text-white rounded-lg text-lg font-medium shadow-md"
                whileHover={{ y: -2, shadow: '0 8px 16px rgba(0,0,0,0.15)' }}
                whileTap={{ scale: 0.98 }}
              >
                开始第一次修复 →
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-8 relative">
              {/* Timeline line with animated gradient shimmer */}
              {data.recentRestorations.length > 1 && (
                <motion.div
                  className="absolute left-[11px] top-6 bottom-6 w-[2px] overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #7F3222 0%, #D4A76A 50%, #bea085 100%)',
                    opacity: 0.2,
                  }}
                >
                  <motion.div
                    className="absolute inset-0 w-full"
                    style={{
                      background: 'linear-gradient(180deg, transparent 0%, rgba(212,167,106,0.6) 50%, transparent 100%)',
                      height: '100px',
                    }}
                    animate={{
                      y: ['-100px', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              )}

              {data.recentRestorations.map((restoration, index) => (
                <div key={restoration.id} className="relative">
                  <motion.div
                    className="flex items-center gap-6 p-6 border border-white/40 rounded-[16px] hover:border-museum-brown/30 transition-all relative cursor-pointer bg-white/40 backdrop-blur-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    onClick={() => setExpandedId(expandedId === restoration.id ? null : restoration.id)}
                  >
                    {/* Status dot */}
                    <div className="relative flex-shrink-0">
                      <motion.div
                        className={`w-6 h-6 rounded-full border-3 border-white shadow-md ${getStatusColor(restoration.status)}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      />
                    </div>

                    {restoration.status === 'completed' && (
                      <div className="absolute -right-2 -top-2 z-10">
                        <SealStamp text="完成" size={40} color="#7F3222" delay={1 + index * 0.1} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="text-museum-brown text-lg font-medium mb-2">
                        {getTypeLabel(restoration.type)}
                      </div>
                      <div className="text-museum-brown/60 text-base">
                        {formatDate(restoration.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {getStatusBadge(restoration.status)}
                      <button className="text-museum-brown text-base font-medium hover:underline">
                        {expandedId === restoration.id ? '收起 ↑' : '查看 →'}
                      </button>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {expandedId === restoration.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="p-8 border border-[#D4A76A]/30 rounded-[16px] bg-white/30 backdrop-blur-sm ml-10 shadow-[0_0_20px_rgba(212,167,106,0.15)]">
                          {/* Before/After Comparison Layout */}
                          {restoration.inputFileUrl && restoration.resultUrls && restoration.resultUrls.length > 0 ? (
                            <div className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Input Image - Before */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-museum-brown font-semibold text-base uppercase tracking-wide">修复前</h4>
                                    <span className="text-sm text-museum-brown/50">BEFORE</span>
                                  </div>
                                  <div className="bg-white/80 rounded-xl p-4 border border-museum-brown/20 shadow-sm">
                                    <motion.img
                                      src={restoration.inputFileUrl}
                                      alt="原始图像"
                                      className="w-full h-auto rounded-lg"
                                      initial={{ filter: 'blur(10px)' }}
                                      animate={{ filter: 'blur(0px)' }}
                                      transition={{ duration: 0.5, delay: 0.1 }}
                                    />
                                  </div>
                                </div>

                                {/* Result Image - After */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-museum-brown font-semibold text-base uppercase tracking-wide">修复后</h4>
                                    <span className="text-sm text-museum-brown/50">AFTER</span>
                                  </div>
                                  <div className="bg-white/80 rounded-xl p-4 border border-museum-brown/20 shadow-sm">
                                    <motion.img
                                      src={restoration.resultUrls[0]}
                                      alt="修复结果"
                                      className="w-full h-auto rounded-lg"
                                      initial={{ filter: 'blur(10px)' }}
                                      animate={{ filter: 'blur(0px)' }}
                                      transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                    <a
                                      href={restoration.resultUrls[0]}
                                      download
                                      className="block mt-4 text-center text-base text-museum-brown hover:underline font-medium"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      下载图像 ↓
                                    </a>
                                  </div>
                                </div>
                              </div>

                              {/* Additional results if any */}
                              {restoration.resultUrls.length > 1 && (
                                <div>
                                  <h4 className="text-museum-brown font-medium mb-4 text-base">其他修复结果</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {restoration.resultUrls.slice(1).map((url, idx) => (
                                      <div key={idx} className="bg-white/80 rounded-lg p-3 border border-museum-brown/20">
                                        <motion.img
                                          src={url}
                                          alt={`修复结果 ${idx + 2}`}
                                          className="w-full h-auto rounded"
                                          initial={{ filter: 'blur(10px)' }}
                                          animate={{ filter: 'blur(0px)' }}
                                          transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                                        />
                                        <a
                                          href={url}
                                          download
                                          className="block mt-3 text-center text-sm text-museum-brown hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          下载 ↓
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Fallback for when only one type of image is available */}
                              {restoration.inputFileUrl && (
                                <div>
                                  <h4 className="text-museum-brown font-medium mb-4 text-base">原始图像</h4>
                                  <div className="bg-white/80 rounded-lg p-3 border border-museum-brown/20">
                                    <motion.img
                                      src={restoration.inputFileUrl}
                                      alt="原始图像"
                                      className="w-full h-auto rounded"
                                      initial={{ filter: 'blur(10px)' }}
                                      animate={{ filter: 'blur(0px)' }}
                                      transition={{ duration: 0.5, delay: 0.1 }}
                                    />
                                  </div>
                                </div>
                              )}
                              {restoration.resultUrls && restoration.resultUrls.length > 0 && (
                                <div>
                                  <h4 className="text-museum-brown font-medium mb-4 text-base">修复结果</h4>
                                  <div className="space-y-4">
                                    {restoration.resultUrls.map((url, idx) => (
                                      <div key={idx} className="bg-white/80 rounded-lg p-3 border border-museum-brown/20">
                                        <motion.img
                                          src={url}
                                          alt={`修复结果 ${idx + 1}`}
                                          className="w-full h-auto rounded"
                                          initial={{ filter: 'blur(10px)' }}
                                          animate={{ filter: 'blur(0px)' }}
                                          transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                                        />
                                        <a
                                          href={url}
                                          download
                                          className="block mt-3 text-center text-base text-museum-brown hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          下载图像 ↓
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="mt-8 pt-8 border-t border-museum-brown/10">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-base">
                              {restoration.algorithm && (
                                <div>
                                  <div className="text-museum-brown/60 mb-2">算法</div>
                                  <div className="text-museum-brown font-medium">{restoration.algorithm}</div>
                                </div>
                              )}
                              <div>
                                <div className="text-museum-brown/60 mb-2">处理时长</div>
                                <div className="text-museum-brown font-medium">
                                  {formatProcessingTime(restoration.created_at, restoration.completed_at)}
                                </div>
                              </div>
                              <div>
                                <div className="text-museum-brown/60 mb-2">创建时间</div>
                                <div className="text-museum-brown font-medium">
                                  {formatDate(restoration.created_at)}
                                </div>
                              </div>
                              {restoration.completed_at && (
                                <div>
                                  <div className="text-museum-brown/60 mb-2">完成时间</div>
                                  <div className="text-museum-brown font-medium">
                                    {formatDate(restoration.completed_at)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
