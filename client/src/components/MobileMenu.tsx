import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLocation } from 'wouter';
import { CloudDrift, InkBrushStroke, SealStamp } from '@/components/decorative';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const [location, navigate] = useLocation();
    const { isAuthenticated, logout } = useAuth();
    const panelRef = useRef<HTMLDivElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);

    // Focus management + ESC key + focus trap
    useEffect(() => {
        if (!isOpen) return;
        previousFocus.current = document.activeElement as HTMLElement;

        // Auto-focus close button after animation
        const timer = setTimeout(() => {
            const closeBtn = panelRef.current?.querySelector<HTMLButtonElement>('[aria-label="关闭菜单"]');
            closeBtn?.focus();
        }, 100);

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key !== 'Tab' || !panelRef.current) return;
            const focusable = panelRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        };
        window.addEventListener('keydown', onKey);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('keydown', onKey);
            previousFocus.current?.focus();
        };
    }, [isOpen, onClose]);

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('已退出登录');
            navigate('/');
            onClose();
        } catch (error) {
            toast.error('退出失败，请稍后重试');
        }
    };

    const menuItems = [
        { path: '/', label: '首页' },
        { path: '/virtual-restoration', label: '虚拟复原' },
        { path: '/ai-generation', label: '智绘生成' },
        { path: '/cultural-activation', label: '活化利用' },
        { path: '/digital-human', label: '数字人' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with blur effect */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 lg:hidden"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    {/* Menu panel with spring animation */}
                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="导航菜单"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 25,
                            mass: 0.8
                        }}
                        className="fixed top-0 right-0 h-full w-3/4 max-w-sm bg-[#E8E3D1] z-50 p-6 lg:hidden shadow-lg overflow-hidden"
                    >
                        {/* Background CloudDrift decoration */}
                        <div className="absolute inset-0 pointer-events-none">
                            <CloudDrift count={3} opacity={0.06} />
                        </div>

                        {/* SealStamp decoration in bottom corner */}
                        <div className="absolute bottom-6 left-6 opacity-10 pointer-events-none">
                            <SealStamp size={80} />
                        </div>

                        <div className="relative z-10">
                            {/* Close button with rotation on hover */}
                            <div className="flex justify-end mb-8">
                                <motion.button
                                    onClick={onClose}
                                    aria-label="关闭菜单"
                                    className="text-[#7F3222]"
                                    whileHover={{ rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                >
                                    <X size={30} />
                                </motion.button>
                            </div>
                            <nav className="flex flex-col gap-6">
                                {menuItems.map((item, index) => {
                                    const isActive = location === item.path;
                                    return (
                                        <div key={item.path} className="relative">
                                            <motion.button
                                                onClick={() => handleNavigate(item.path)}
                                                className="text-[#7F3222] text-[22px] font-normal text-right hover:opacity-80 transition-opacity w-full flex items-center justify-end gap-2"
                                                style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: 0.1 + index * 0.05,
                                                    ease: 'easeOut'
                                                }}
                                            >
                                                {item.label}
                                                {/* Active indicator - gold dot */}
                                                {isActive && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="w-2 h-2 rounded-full bg-[#D4A76A]"
                                                    />
                                                )}
                                            </motion.button>
                                            <motion.div
                                                className="mt-4 flex justify-end"
                                                initial={{ opacity: 0, scaleX: 0 }}
                                                animate={{ opacity: 1, scaleX: 1 }}
                                                transition={{
                                                    duration: 0.5,
                                                    delay: 0.2 + index * 0.05,
                                                    ease: 'easeOut'
                                                }}
                                                style={{ transformOrigin: 'right' }}
                                            >
                                                <InkBrushStroke width={150} variant="divider" delay={0} />
                                            </motion.div>
                                        </div>
                                    );
                                })}

                                {/* Auth links */}
                                {isAuthenticated ? (
                                    <>
                                        <div className="relative">
                                            <motion.button
                                                onClick={() => handleNavigate('/dashboard')}
                                                className="text-[#7F3222] text-[22px] font-normal text-right hover:opacity-80 transition-opacity w-full flex items-center justify-end gap-2"
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: 0.1 + menuItems.length * 0.05,
                                                    ease: 'easeOut'
                                                }}
                                            >
                                                我的面板
                                                {location === '/dashboard' && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="w-2 h-2 rounded-full bg-[#D4A76A]"
                                                    />
                                                )}
                                            </motion.button>
                                            <motion.div
                                                className="mt-4 flex justify-end"
                                                initial={{ opacity: 0, scaleX: 0 }}
                                                animate={{ opacity: 1, scaleX: 1 }}
                                                transition={{
                                                    duration: 0.5,
                                                    delay: 0.2 + menuItems.length * 0.05,
                                                    ease: 'easeOut'
                                                }}
                                                style={{ transformOrigin: 'right' }}
                                            >
                                                <InkBrushStroke width={150} variant="divider" delay={0} />
                                            </motion.div>
                                        </div>
                                        <div>
                                            <motion.button
                                                onClick={handleLogout}
                                                className="text-[#7F3222] text-[22px] font-normal text-right hover:opacity-80 transition-opacity w-full"
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: 0.1 + (menuItems.length + 1) * 0.05,
                                                    ease: 'easeOut'
                                                }}
                                            >
                                                退出
                                            </motion.button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="relative">
                                        <motion.button
                                            onClick={() => handleNavigate('/login')}
                                            className="text-[#7F3222] text-[22px] font-normal text-right hover:opacity-80 transition-opacity w-full flex items-center justify-end gap-2"
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                duration: 0.4,
                                                delay: 0.1 + menuItems.length * 0.05,
                                                ease: 'easeOut'
                                            }}
                                        >
                                            登录
                                            {location === '/login' && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="w-2 h-2 rounded-full bg-[#D4A76A]"
                                                />
                                            )}
                                        </motion.button>
                                    </div>
                                )}
                            </nav>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
