import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { galleries, categoryMeta, type GalleryCategory } from '@shared/galleries';
import { AnimatePresence, motion } from 'framer-motion';
import StickyHeader from '@/components/StickyHeader';
import MobileMenu from '@/components/MobileMenu';
import ImageViewer from '@/components/ImageViewer';
import { SealStamp, InkBrushStroke } from '@/components/decorative';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const BATCH_SIZE = 30;
const PREMIUM_EASE = [0.5, 0, 0.3, 1] as const;

const GalleryImage = React.memo(function GalleryImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className="absolute inset-0">
      {/* Shimmer skeleton loader */}
      <AnimatePresence>
        {!loaded && !errored && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(110deg, #4A3428 8%, #7F3222 18%, #4A3428 33%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {errored ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#4A3428]/20">
          <span className="text-[#7F3222]/40 text-sm" style={{ fontFamily: "'LXGW WenKai', sans-serif" }}>
            图片加载失败
          </span>
        </div>
      ) : (
        <motion.img
          src={src}
          loading="lazy"
          decoding="async"
          alt={alt}
          className="w-full h-full object-cover"
          initial={{ filter: 'blur(12px)', scale: 1.05, opacity: 0 }}
          animate={loaded ? { filter: 'blur(0px)', scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
});

const GalleryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const galleryCategory = category as GalleryCategory;
  const images = useMemo(
    () => galleryCategory && galleries[galleryCategory] ? galleries[galleryCategory] : [],
    [galleryCategory]
  );
  const meta = galleryCategory && categoryMeta[galleryCategory] ? categoryMeta[galleryCategory] : undefined;

  useDocumentTitle(meta?.title || '艺术长廊');

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    setPreviewIndex(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [galleryCategory]);

  useEffect(() => {
    if (previewIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewIndex(null);
      else if (e.key === 'ArrowLeft') setPreviewIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
      else if (e.key === 'ArrowRight') setPreviewIndex(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : prev));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewIndex, images.length]);

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;
  const remainingCount = images.length - visibleCount;

  return (
    <div className="min-h-screen bg-[#E8E3D1] overflow-hidden font-sans">
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="relative z-10">
        <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="light" />

        {/* ==================== CATEGORY HERO BANNER ==================== */}
        <div className="relative w-full h-[400px] md:h-[480px] lg:h-[520px] overflow-hidden">
          {/* Background image */}
          {meta?.heroImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${meta.heroImage}')` }}
            />
          )}
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#2C1810]" />

          {/* Content */}
          <div className="relative z-10 h-full max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 flex flex-col justify-end pb-12 md:pb-16">
            {/* Breadcrumb */}
            <motion.nav
              aria-label="面包屑导航"
              className="mb-6 text-sm text-[#E8E3D1]/60"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button onClick={() => navigate('/')} className="hover:text-[#D4A76A] transition-colors">首页</button>
              <span className="mx-2">{'>'}</span>
              <span className="text-[#D4A76A]">{meta?.title ?? '藏品展示'}</span>
            </motion.nav>

            {/* Title */}
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-[#E8E3D1] mb-4 md:mb-6"
              style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {meta?.title ?? '藏品展示'}
            </motion.h1>

            {/* Description */}
            {meta?.description && (
              <motion.p
                className="text-[#E8E3D1]/70 text-base md:text-lg max-w-3xl leading-relaxed mb-6"
                style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {meta.description}
              </motion.p>
            )}

            {/* Metadata badges */}
            <motion.div
              className="flex flex-wrap gap-3 items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="px-4 py-1.5 rounded-full border border-[#D4A76A]/40 bg-[#D4A76A]/10 text-[#D4A76A] text-sm">
                共 {images.length} 件藏品
              </div>
              {meta?.eraRange && (
                <div className="px-4 py-1.5 rounded-full border border-[#E8E3D1]/20 bg-white/5 text-[#E8E3D1]/80 text-sm">
                  {meta.eraRange}
                </div>
              )}
              <div className="ml-2 opacity-50">
                <SealStamp size={36} />
              </div>
            </motion.div>
          </div>

          {/* Bottom ink brush decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A76A]/30 to-transparent" />
        </div>

        {/* ==================== CATEGORY NAVIGATION TABS ==================== */}
        <div className="sticky top-[72px] md:top-[80px] z-30 bg-[#E8E3D1]/95 backdrop-blur-md border-b border-[#7F3222]/10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
              {(Object.keys(categoryMeta) as GalleryCategory[]).map((cat) => {
                const isActive = cat === galleryCategory;
                const imageCount = galleries[cat]?.length || 0;
                return (
                  <motion.button
                    key={cat}
                    onClick={() => navigate(`/gallery/${cat}`)}
                    className={`relative px-4 py-2.5 text-sm md:text-base font-medium rounded-full transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#7F3222] text-[#E8E3D1]'
                        : 'text-[#4A3428]/70 hover:text-[#7F3222] hover:bg-[#7F3222]/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center gap-2">
                      {categoryMeta[cat].title}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-[#D4A76A]/30 text-[#D4A76A]' : 'bg-[#4A3428]/10 text-[#4A3428]/50'
                      }`}>
                        {imageCount}
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================== EXHIBITION HALL ==================== */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12 py-10 md:py-14">
          {images.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <motion.div
                animate={{ y: [0, -10, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-6"
              >
                <SealStamp size={80} />
              </motion.div>
              <p className="text-[#4A3428] text-lg mb-6" style={{ fontFamily: "'LXGW WenKai', serif" }}>暂无藏品展示</p>
              <button
                onClick={() => navigate('/gallery/guohua')}
                className="px-8 py-3 bg-[#7F3222] text-[#E8E3D1] rounded-full hover:bg-[#C85840] transition-colors"
                style={{ fontFamily: "'LXGW WenKai', serif" }}
              >
                查看国画藏品
              </button>
            </div>
          ) : (
            <>
              {/* Museum wall exhibition container */}
              <div className="bg-[#2C1810] rounded-2xl p-6 md:p-10 lg:p-12 shadow-2xl">
                {/* Exhibition hall header */}
                <div className="flex items-center justify-between mb-8 md:mb-10 pb-6 border-b border-[#D4A76A]/20">
                  <div className="flex items-center gap-4">
                    <h2
                      className="text-2xl md:text-3xl lg:text-4xl text-[#D4A76A]"
                      style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
                    >
                      展厅作品
                    </h2>
                    <InkBrushStroke width={60} color="#D4A76A" />
                  </div>
                  <div className="text-[#E8E3D1]/50 text-sm md:text-base">
                    共 <span className="text-[#D4A76A]">{images.length}</span> 件藏品
                  </div>
                </div>

                {/* Uniform 3-column exhibition grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {visibleImages.map((src: string, i: number) => (
                    <motion.button
                      key={src}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1613] border-2 border-[#4A3428]/60 hover:border-[#D4A76A]/70 transition-all duration-500 cursor-pointer"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{
                        duration: 0.4,
                        delay: Math.min(i % BATCH_SIZE, 12) * 0.05,
                        ease: PREMIUM_EASE,
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.01,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(212,167,106,0.15)',
                      }}
                      onClick={() => navigate(`/gallery/${galleryCategory}/${i + 1}`)}
                    >
                      {/* Exhibition number badge */}
                      <div className="absolute top-3 left-3 z-20 px-3 py-1 bg-[#D4A76A]/90 rounded-full text-[#2C1810] text-xs font-bold tracking-wider">
                        {String(i + 1).padStart(3, '0')}
                      </div>

                      {/* Image */}
                      <GalleryImage src={src} alt={`${meta?.title ?? '藏品'} ${i + 1}`} />

                      {/* Inner frame shadow */}
                      <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] pointer-events-none rounded-xl" />

                      {/* Hover overlay with museum spotlight */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* Gold frame glow on hover */}
                      <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-2 group-hover:ring-[#D4A76A]/50 transition-all duration-500 pointer-events-none" />

                      {/* Hover info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-2 text-[#D4A76A] text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A76A]" />
                          <span style={{ fontFamily: "'LXGW WenKai', serif" }}>{meta?.title} 第 {i + 1} 件</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="flex flex-col items-center mt-12">
                    <motion.button
                      onClick={() => setVisibleCount(prev => Math.min(prev + BATCH_SIZE, images.length))}
                      className="group relative px-10 py-4 md:px-12 md:py-5 bg-[#7F3222] text-[#E8E3D1] rounded-full border border-[#D4A76A]/30 hover:border-[#D4A76A]/60 transition-all overflow-hidden"
                      style={{ fontFamily: "'LXGW WenKai', serif" }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Gold shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4A76A]/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                      />
                      <span className="relative z-10 flex items-center gap-3 text-base md:text-lg">
                        加载更多藏品
                        <span className="px-2.5 py-0.5 bg-[#D4A76A]/20 rounded-full text-[#D4A76A] text-sm">
                          {remainingCount} 件
                        </span>
                      </span>
                    </motion.button>
                  </div>
                )}

                {!hasMore && images.length > BATCH_SIZE && (
                  <div className="text-center mt-12 text-[#E8E3D1]/40 text-sm" style={{ fontFamily: "'LXGW WenKai', serif" }}>
                    已展出全部 {images.length} 件藏品
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==================== MUSEUM LIGHTBOX (with zoom) ==================== */}
      <AnimatePresence>
        {previewIndex !== null && (
          <ImageViewer
            src={images[previewIndex]}
            title={`${meta?.title ?? '\u85CF\u54C1'} ${previewIndex + 1}`}
            onClose={() => setPreviewIndex(null)}
            onPrev={previewIndex > 0 ? () => setPreviewIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev)) : undefined}
            onNext={previewIndex < images.length - 1 ? () => setPreviewIndex(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : prev)) : undefined}
            counter={`${String(previewIndex + 1).padStart(3, '0')} / ${images.length}`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
