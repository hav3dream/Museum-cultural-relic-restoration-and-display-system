import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import asset3 from '@/assets/I2673-762-2027-29.svg';
import asset31 from '@/assets/2673-769.svg';
import asset2 from '@/assets/2537-44.svg';
import { CloudDrift } from '@/components/decorative';

interface StickyHeaderProps {
    onMobileMenuOpen: () => void;
    theme?: 'light' | 'dark';
    title?: string;
}

// Navigation button component with magnetic hover effect and active indicator
function NavButton({ onClick, isActive, textColor, children }: { onClick: () => void; isActive: boolean; textColor: string; children: React.ReactNode }) {
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Motion values for magnetic effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring physics for smooth return
    const springX = useSpring(x, { stiffness: 300, damping: 20 });
    const springY = useSpring(y, { stiffness: 300, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.15; // 15% of distance, max ~4px
        const deltaY = (e.clientY - centerY) * 0.15;
        x.set(deltaX);
        y.set(deltaY);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <button
            ref={buttonRef}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative text-[18px] font-normal transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A76A] rounded-sm"
            style={{ color: textColor }}
        >
            {/* Magnetic content wrapper */}
            <motion.div
                style={{ x: springX, y: springY }}
            >
                {children}
            </motion.div>
            {/* Underline animation on hover with magnetic follow */}
            <motion.div
                className="absolute bottom-[-4px] left-0 h-[2px]"
                style={{
                    backgroundColor: textColor,
                    x: springX,
                }}
                initial={{ width: 0 }}
                animate={{ width: isHovered || isActive ? '100%' : 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            {/* Active indicator - gold pulsing dot */}
            {isActive && (
                <motion.div
                    className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#D4A76A]"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            )}
        </button>
    );
}

// Mobile navigation link with gold underline hover effect
function MobileNavLink({ onClick, isActive, children }: { onClick: () => void; isActive: boolean; children: React.ReactNode }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative text-[28px] font-normal text-[#E8E3D1] transition-colors"
            style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
        >
            {children}
            {/* Gold underline animation on hover */}
            <motion.div
                className="absolute bottom-[-4px] left-0 h-[2px] bg-[#D4A76A]"
                initial={{ width: 0 }}
                animate={{ width: isHovered || isActive ? '100%' : 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            {/* Active indicator */}
            {isActive && (
                <motion.div
                    className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D4A76A]"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            )}
        </button>
    );
}

// Animated hamburger icon that morphs to X
function HamburgerIcon({ isOpen, color }: { isOpen: boolean; color: string }) {
    return (
        <div className="w-6 h-6 flex flex-col justify-center items-center gap-[5px] relative">
            {/* Top line */}
            <motion.div
                className="w-6 h-[2px] bg-[#D4A76A] origin-center"
                animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 7 : 0,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            />
            {/* Middle line */}
            <motion.div
                className="w-6 h-[2px] bg-[#D4A76A]"
                animate={{
                    opacity: isOpen ? 0 : 1,
                    scale: isOpen ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
            />
            {/* Bottom line */}
            <motion.div
                className="w-6 h-[2px] bg-[#D4A76A] origin-center"
                animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -7 : 0,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            />
        </div>
    );
}

function StickyHeader({ onMobileMenuOpen, theme = 'dark', title }: StickyHeaderProps) {
    const [location, navigate] = useLocation();
    const { scrollY, scrollYProgress } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [logoHovered, setLogoHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    // Colors based on theme
    const isLight = theme === 'light';
    const textColor = isLight ? '#7F3222' : '#ffffff';
    const borderColor = isLight ? 'rgba(127, 50, 34, 0.2)' : 'rgba(255, 255, 255, 0.2)';

    // Logo selection
    const logoSrc = isLight ? asset2 : asset31;

    // Transform values based on scroll
    // Slower transition: 0 to 300px
    const headerWidth = useTransform(scrollY, [0, 300], ['100%', '90%']);
    const headerTop = useTransform(scrollY, [0, 300], [0, 20]);
    const headerRadius = useTransform(scrollY, [0, 300], [0, 50]);

    // Dynamic background based on theme
    // Dark theme: Starts brown (rgba(127, 50, 34, 1)) and stays brown
    // Light theme: Starts transparent/light and becomes white/light
    const headerBackground = useTransform(
        scrollY,
        [0, 300],
        isLight
            ? ['rgba(232, 227, 209, 0)', 'rgba(232, 227, 209, 0.95)']
            : ['rgba(127, 50, 34, 1)', 'rgba(127, 50, 34, 0.95)']
    );

    const headerBackdropFilter = useTransform(scrollY, [0, 300], ['blur(0px)', 'blur(12px)']);

    const headerShadow = useTransform(
        scrollY,
        [0, 300],
        ['none', '0 8px 32px -8px rgba(0, 0, 0, 0.15)']
    );

    const headerBorder = useTransform(
        scrollY,
        [0, 300],
        ['1px solid transparent', `1px solid ${borderColor}`]
    );

    useEffect(() => {
        const unsubscribe = scrollY.on('change', (latest) => {
            setIsScrolled(latest > 50);
        });
        return () => unsubscribe();
    }, [scrollY]);

    const handleLogoClick = () => {
        if (location === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleMobileNavClick = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <motion.div
                style={{
                    width: headerWidth,
                    top: headerTop,
                    borderRadius: headerRadius,
                    backgroundColor: headerBackground,
                    backdropFilter: headerBackdropFilter,
                    boxShadow: headerShadow,
                    border: headerBorder,
                }}
                className="fixed left-0 right-0 mx-auto z-50 h-[80px] flex items-center justify-between px-8 transition-all duration-300 overflow-hidden"
            >
                {/* Scroll progress indicator with gradient and leading dot */}
                <motion.div
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#7F3222] via-[#D4A76A] to-[#E8E3D1]"
                    style={{
                        scaleX: scrollYProgress,
                        transformOrigin: 'left',
                    }}
                    initial={{ scaleX: 0 }}
                >
                    {/* Pulsing dot at leading edge */}
                    <motion.div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white"
                        style={{
                            boxShadow: '0 0 6px rgba(212, 167, 106, 0.8)',
                        }}
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </motion.div>

                {/* Subtle cloud decoration when scrolled */}
                {isScrolled && (
                    <motion.div
                        className="absolute right-0 top-0 bottom-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 0.15, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <CloudDrift count={1} opacity={0.08} />
                    </motion.div>
                )}
                {/* Logo and brand with enhanced hover effects */}
                <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={handleLogoClick}
                    onMouseEnter={() => setLogoHovered(true)}
                    onMouseLeave={() => setLogoHovered(false)}
                >
                    {/* Logo with tilt and glow on hover */}
                    <motion.div
                        className="flex items-center justify-center w-[44px] h-[44px]"
                        style={{ perspective: '1000px' }}
                        animate={{
                            rotateY: logoHovered ? 15 : 0,
                        }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <motion.img
                            src={logoSrc}
                            alt="博物馆文物修复与展示系统"
                            className="w-[42px] h-auto object-contain"
                            animate={{
                                filter: logoHovered ? 'drop-shadow(0 0 10px rgba(212, 167, 106, 0.4))' : 'drop-shadow(0 0 0px rgba(212, 167, 106, 0))',
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.div>
                    <div className="flex items-center gap-3">
                        {/* Brand name with character wave effect */}
                        <div className="relative overflow-hidden text-[24px] font-normal" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive", color: textColor }}>
                            <div className="flex">
                                {['画', '韵', '新', '生'].map((char, index) => (
                                    <motion.span
                                        key={index}
                                        animate={{
                                            y: logoHovered ? [-2, 0] : [0, 0],
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            delay: logoHovered ? index * 0.05 : 0,
                                            ease: 'easeOut',
                                        }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </div>
                            {/* Shimmer effect on hover */}
                            {logoHovered && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4A76A]/30 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '200%' }}
                                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                                />
                            )}
                        </div>
                        {title && (
                            <>
                                <div className="h-6 w-[1px]" style={{ backgroundColor: textColor, opacity: 0.3 }} />
                                <div className="text-[20px] font-normal" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif", color: textColor }}>
                                    {title}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Navigation menu - Hidden on mobile (below md), visible on md+ */}
                <nav aria-label="主导航" className="hidden md:flex items-center gap-8">
                    <NavButton
                        onClick={() => navigate('/')}
                        isActive={location === '/'}
                        textColor={textColor}
                    >
                        首页
                    </NavButton>
                    <NavButton
                        onClick={() => navigate('/virtual-restoration')}
                        isActive={location === '/virtual-restoration'}
                        textColor={textColor}
                    >
                        虚拟复原
                    </NavButton>
                    <NavButton
                        onClick={() => navigate('/ai-generation')}
                        isActive={location === '/ai-generation'}
                        textColor={textColor}
                    >
                        智绘生成
                    </NavButton>
                    <NavButton
                        onClick={() => navigate('/cultural-activation')}
                        isActive={location === '/cultural-activation' || location.startsWith('/cultural-activation/')}
                        textColor={textColor}
                    >
                        活化利用
                    </NavButton>
                    <NavButton
                        onClick={() => navigate('/digital-human')}
                        isActive={location === '/digital-human'}
                        textColor={textColor}
                    >
                        数字人
                    </NavButton>
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-6">
                    {/* Search Icon - navigate to gallery */}
                    <div className="hidden md:block cursor-pointer" role="link" aria-label="艺术长廊" onClick={() => navigate('/gallery/guohua')}>
                        <img src={asset3} alt="" className="w-6 h-6 opacity-80 hover:opacity-100 transition-opacity object-contain" style={{ filter: isLight ? 'invert(0.4) sepia(1) saturate(0.5) hue-rotate(350deg)' : 'none' }} />
                    </div>

                    {/* Auth UI with entrance animation and enhanced hover */}
                    {isAuthenticated ? (
                        <motion.div
                            className="hidden md:flex items-center gap-4"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <div
                                className="text-[16px] font-normal truncate max-w-[120px]"
                                style={{ color: textColor }}
                            >
                                {user?.name}
                            </div>
                            <motion.button
                                onClick={async () => {
                                    await logout();
                                    navigate('/');
                                }}
                                className="w-[100px] h-[40px] rounded-[20px] flex items-center justify-center border transition-all relative overflow-hidden"
                                style={{
                                    borderColor: borderColor,
                                    backgroundColor: isLight ? 'rgba(127, 50, 34, 0.05)' : 'rgba(245, 240, 227, 0.1)',
                                    color: textColor
                                }}
                                whileHover={{
                                    borderColor: '#D4A76A',
                                    boxShadow: '0 0 12px rgba(212, 167, 106, 0.3)',
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Gold underline effect on hover */}
                                <motion.div
                                    className="absolute bottom-0 left-0 h-[2px] bg-[#D4A76A]"
                                    initial={{ width: 0 }}
                                    whileHover={{ width: '100%' }}
                                    transition={{ duration: 0.3 }}
                                />
                                <div className="text-[16px] font-normal">登出</div>
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.button
                            onClick={() => navigate('/login')}
                            className="hidden md:flex w-[100px] h-[40px] rounded-[20px] items-center justify-center border transition-all relative overflow-hidden"
                            style={{
                                borderColor: borderColor,
                                backgroundColor: isLight ? 'rgba(127, 50, 34, 0.05)' : 'rgba(245, 240, 227, 0.1)',
                                color: textColor
                            }}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            whileHover={{
                                borderColor: '#D4A76A',
                                boxShadow: '0 0 12px rgba(212, 167, 106, 0.3)',
                            }}
                        >
                            {/* Gold underline effect on hover */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-[2px] bg-[#D4A76A]"
                                initial={{ width: 0 }}
                                whileHover={{ width: '100%' }}
                                transition={{ duration: 0.3 }}
                            />
                            <div className="text-[16px] font-normal">登录</div>
                        </motion.button>
                    )}

                    {/* Mobile Hamburger Menu Button */}
                    <motion.button
                        className="md:hidden relative"
                        onClick={toggleMobileMenu}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        <HamburgerIcon isOpen={isMobileMenuOpen} color={textColor} />
                    </motion.button>
                </div>
            </motion.div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop with blur */}
                        <motion.div
                            className="fixed inset-0 bg-[#4A3428]/90 backdrop-blur-md z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu content */}
                        <motion.div
                            className="fixed top-0 right-0 bottom-0 w-[280px] bg-gradient-to-b from-[#7F3222] to-[#4A3428] z-50 flex flex-col px-8 py-24"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                        >
                            {/* Decorative seal stamp in corner */}
                            <motion.div
                                className="absolute top-8 right-8 w-16 h-16 rounded-full border-4 border-[#D4A76A] opacity-30"
                                initial={{ rotate: 0, scale: 0 }}
                                animate={{ rotate: 360, scale: 1 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            >
                                <div className="absolute inset-2 border-2 border-[#D4A76A] rounded-full" />
                            </motion.div>

                            {/* Navigation links with stagger animation */}
                            <div className="flex flex-col gap-8 mb-12">
                                {[
                                    { path: '/', label: '首页' },
                                    { path: '/virtual-restoration', label: '虚拟复原' },
                                    { path: '/ai-generation', label: '智绘生成' },
                                    { path: '/cultural-activation', label: '活化利用' },
                                    { path: '/digital-human', label: '数字人' },
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.path}
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 50, opacity: 0 }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: 0.3,
                                            ease: 'easeOut',
                                        }}
                                    >
                                        <MobileNavLink
                                            onClick={() => handleMobileNavClick(item.path)}
                                            isActive={location === item.path}
                                        >
                                            {item.label}
                                        </MobileNavLink>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Auth button in mobile menu */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ delay: 0.4, duration: 0.3 }}
                                className="mt-auto"
                            >
                                {isAuthenticated ? (
                                    <div className="flex flex-col gap-4">
                                        <div
                                            className="text-[18px] font-normal text-[#E8E3D1]"
                                            style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
                                        >
                                            {user?.name}
                                        </div>
                                        <motion.button
                                            onClick={async () => {
                                                await logout();
                                                setIsMobileMenuOpen(false);
                                                navigate('/');
                                            }}
                                            className="w-full h-[48px] rounded-[24px] flex items-center justify-center border-2 border-[#D4A76A] bg-[#D4A76A]/10 text-[#E8E3D1] text-[18px] font-normal relative overflow-hidden"
                                            style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
                                            whileHover={{
                                                backgroundColor: 'rgba(212, 167, 106, 0.2)',
                                                boxShadow: '0 0 20px rgba(212, 167, 106, 0.4)',
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            登出
                                        </motion.button>
                                    </div>
                                ) : (
                                    <motion.button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            navigate('/login');
                                        }}
                                        className="w-full h-[48px] rounded-[24px] flex items-center justify-center border-2 border-[#D4A76A] bg-[#D4A76A]/10 text-[#E8E3D1] text-[18px] font-normal relative overflow-hidden"
                                        style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
                                        whileHover={{
                                            backgroundColor: 'rgba(212, 167, 106, 0.2)',
                                            boxShadow: '0 0 20px rgba(212, 167, 106, 0.4)',
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        登录 / 注册
                                    </motion.button>
                                )}
                            </motion.div>

                            {/* Decorative ink splash in bottom corner */}
                            <motion.div
                                className="absolute bottom-8 left-8 w-24 h-24 opacity-20"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="50" r="40" fill="#D4A76A" opacity="0.3" />
                                    <circle cx="30" cy="30" r="15" fill="#D4A76A" opacity="0.5" />
                                    <circle cx="70" cy="70" r="20" fill="#D4A76A" opacity="0.4" />
                                    <circle cx="60" cy="35" r="10" fill="#D4A76A" opacity="0.6" />
                                </svg>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default React.memo(StickyHeader);
