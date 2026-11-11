import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FS = "'LXGW WenKai', 'Noto Serif SC', serif";

interface ImageViewerProps {
  src: string;
  title: string;
  onClose: () => void;
  /** If provided, enables left/right navigation */
  onPrev?: () => void;
  onNext?: () => void;
  /** e.g. "003 / 100" */
  counter?: string;
}

export default function ImageViewer({ src, title, onClose, onPrev, onNext, counter }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const pinchRef = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const clampScale = (s: number) => Math.min(Math.max(s, 0.5), 6);
  const zoomIn = () => setScale(s => clampScale(s + 0.4));
  const zoomOut = () => setScale(s => clampScale(s - 0.4));
  const resetView = () => { setScale(1); setPos({ x: 0, y: 0 }); };

  // Reset zoom when image changes
  useEffect(() => { resetView(); }, [src]);

  /* Focus management: save previous focus, auto-focus close, restore on unmount */
  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;
    const closeBtn = containerRef.current?.querySelector<HTMLButtonElement>('[aria-label="关闭"]');
    closeBtn?.focus();
    return () => { previousFocus.current?.focus(); };
  }, []);

  /* Focus trap: keep Tab cycling within the modal */
  useEffect(() => {
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onTab);
    return () => window.removeEventListener('keydown', onTab);
  }, []);

  /* Keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === '0') resetView();
      if (e.key === 'ArrowLeft' && onPrev && scale <= 1) onPrev();
      if (e.key === 'ArrowRight' && onNext && scale <= 1) onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext, scale]);

  /* Mouse wheel zoom */
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale(s => clampScale(s - e.deltaY * 0.002));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  /* Touch: pinch-to-zoom */
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current = Math.hypot(dx, dy);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (pinchRef.current > 0) {
          const delta = (dist - pinchRef.current) * 0.008;
          setScale(s => clampScale(s + delta));
        }
        pinchRef.current = dist;
      }
    };
    const onTouchEnd = () => { pinchRef.current = 0; };
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  /* Mouse drag to pan (when zoomed) */
  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setPos({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  };
  const onPointerUp = () => setDragging(false);

  const bgClick = () => { if (!dragging) onClose(); };

  return (
    <motion.div ref={containerRef} role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
        cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-out',
        touchAction: 'none' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={bgClick}>

      {/* Top controls */}
      <div className="absolute top-6 right-6 flex gap-3 z-10">
        {[{ t: '+', fn: zoomIn, label: '放大' }, { t: '\u2212', fn: zoomOut, label: '缩小' },
          { t: '\u21BA', fn: resetView, label: '重置视图' }, { t: '\u00D7', fn: onClose, label: '关闭' }].map(b => (
          <button key={b.t} onClick={e => { e.stopPropagation(); b.fn(); }} aria-label={b.label}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/70 hover:text-white text-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>{b.t}</button>
        ))}
      </div>

      {/* Scale indicator */}
      {scale !== 1 && (
        <div className="absolute top-6 left-6 z-10 px-3 py-1.5 rounded-full text-white/50 text-sm"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Left/Right navigation arrows (only when not zoomed) */}
      {onPrev && scale <= 1 && (
        <motion.button
          className="absolute left-4 lg:left-8 z-10 w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white text-xl transition-colors"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
          onClick={e => { e.stopPropagation(); onPrev(); }}
          aria-label="上一张"
          whileHover={{ scale: 1.1, x: -3 }} whileTap={{ scale: 0.95 }}>
          &#8249;
        </motion.button>
      )}
      {onNext && scale <= 1 && (
        <motion.button
          className="absolute right-4 lg:right-8 z-10 w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white text-xl transition-colors"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
          onClick={e => { e.stopPropagation(); onNext(); }}
          aria-label="下一张"
          whileHover={{ scale: 1.1, x: 3 }} whileTap={{ scale: 0.95 }}>
          &#8250;
        </motion.button>
      )}

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img ref={imgRef} key={src} src={src} alt={title}
          className="max-w-[95vw] max-h-[95vh] object-contain select-none"
          style={{ touchAction: 'none' }}
          animate={{ scale, x: pos.x, y: pos.y, opacity: 1 }}
          initial={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()} draggable={false}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />
      </AnimatePresence>

      {/* Bottom bar: counter + hints */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        {counter && (
          <div className="px-4 py-1.5 rounded-full text-sm"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <span className="text-white/60">{counter}</span>
          </div>
        )}
        <div className="text-white/30 text-xs" style={{ fontFamily: FS }}>
          {'\u6EDA\u8F6E/\u638F\u5408\u7F29\u653E \u00B7 \u62D6\u62FD\u5E73\u79FB \u00B7 0\u91CD\u7F6E \u00B7 ESC\u5173\u95ED'}
        </div>
      </div>
    </motion.div>
  );
}
