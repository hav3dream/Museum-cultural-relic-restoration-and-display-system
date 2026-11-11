import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { galleries, categoryMeta, type GalleryCategory } from '@shared/galleries';
import {
  getArtworksByCategory,
  getArtworkById,
  getMasterpiecesArtworks,
  type ArtworkDetail,
} from '@/data/artwork-details';
import { useImageAnalysis, type ImageAnalysis } from '@/hooks/useImageColors';
import StickyHeader from '@/components/StickyHeader';
import MobileMenu from '@/components/MobileMenu';
import ImageViewer from '@/components/ImageViewer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const FS = "'LXGW WenKai', 'Noto Serif SC', serif";
const FC = "'Ma Shan Zheng', 'LXGW WenKai', cursive";

/* ═══ Color helpers ═══ */
function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgba(hex: string, a: number) {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/* ═══ Layout types ═══ */
type LayoutType = 'classic' | 'hero' | 'vertical' | 'centered' | 'immersive';

/* ═══ Per-image layout selector ═══
   Analyses each painting's aspect ratio, tags, and category
   to pick the layout that best suits THIS specific artwork. */
function selectLayout(
  img: ImageAnalysis, category: string, artwork: ArtworkDetail | undefined,
): LayoutType {
  const ar = img.aspectRatio;
  const tags = artwork?.tags || [];
  const tagStr = tags.join(',');

  // Very wide panoramic works → hero (full-width image, info below)
  if (ar > 2.2) return 'hero';

  // Wide landscapes/scrolls → hero
  if (ar > 1.6 && (tagStr.includes('\u5C71\u6C34') || tagStr.includes('\u957F\u5377')
    || tagStr.includes('\u624B\u5377') || tagStr.includes('\u5168\u666F'))) return 'hero';

  // Tall vertical scrolls/calligraphy → vertical (image left, text right)
  if (ar < 0.55) return 'vertical';

  // Moderately tall with scroll tags → vertical
  if (ar < 0.75 && (tagStr.includes('\u7ACB\u8F74') || tagStr.includes('\u4E66\u6CD5')
    || tagStr.includes('\u62D3\u7247') || tagStr.includes('\u6761\u5E45'))) return 'vertical';

  // Square-ish objects/artifacts → centered
  if (category === 'qingtong') return 'centered';
  if (ar > 0.85 && ar < 1.15 && category === 'jianzhi') return 'centered';

  // Detailed/important works → immersive (big image, overlay info)
  if (tagStr.includes('\u540D\u753B') || tagStr.includes('\u4EE3\u8868\u4F5C')
    || tagStr.includes('\u98DE\u5929') || tagStr.includes('\u4F5B\u50CF')) return 'immersive';

  // Stone rubbings → vertical (usually tall)
  if (category === 'beike-shufa' && ar < 1.0) return 'vertical';

  // Slightly wide → classic side-by-side
  if (ar > 1.15) return 'hero';

  // Default fallback
  return 'classic';
}

/* ═══ Per-image visual seed ═══
   A deterministic hash from artwork ID + category gives each page
   unique gradient angles, animation delays, and decoration positions. */
function visualSeed(id: number, cat: string): number {
  let h = 0;
  const s = `${cat}-${id}`;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/* ═══ Category base config ═══ */
interface CatCfg {
  dark: boolean;
  pageTint: string;
  headerTheme: 'light' | 'dark';
  sectionDeco: 'seal' | 'lotus' | 'ink' | 'diamond' | 'blossom' | 'dot';
}
const catCfg: Record<string, CatCfg> = {
  'beike-shufa': { dark: true, pageTint: 'rgba(30,27,23,0.92)', headerTheme: 'dark', sectionDeco: 'seal' },
  'bihua': { dark: false, pageTint: 'rgba(212,196,168,0.65)', headerTheme: 'light', sectionDeco: 'lotus' },
  'guohua': { dark: false, pageTint: 'rgba(245,240,230,0.8)', headerTheme: 'light', sectionDeco: 'ink' },
  'qingtong': { dark: true, pageTint: 'rgba(26,34,32,0.9)', headerTheme: 'dark', sectionDeco: 'diamond' },
  'jianzhi': { dark: false, pageTint: 'rgba(253,248,242,0.75)', headerTheme: 'light', sectionDeco: 'blossom' },
};
const defaultCfg: CatCfg = { dark: false, pageTint: 'rgba(237,229,213,0.8)', headerTheme: 'light', sectionDeco: 'dot' };

/* ═══ Small sub-components ═══ */

function Chip({ label, value, glass, border, body, muted }: {
  label: string; value: string; glass: string; border: string; body: string; muted: string;
}) {
  return (
    <div className="px-4 py-2.5 rounded-[14px]" style={{
      background: glass, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      border: `1px solid ${border}`,
    }}>
      <div className="text-xs font-light mb-0.5" style={{ fontFamily: FS, color: muted }}>{label}</div>
      <div className="text-sm" style={{ fontFamily: FS, color: body }}>{value}</div>
    </div>
  );
}

function NavBtn({ dir, onClick, label, glass, border, body, muted, disabled }: {
  dir: 'prev' | 'next'; onClick: () => void; label: string;
  glass: string; border: string; body: string; muted: string;
  disabled?: boolean;
}) {
  return (
    <motion.button onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      aria-label={dir === 'prev' ? '上一件藏品' : '下一件藏品'}
      className="group flex items-center gap-3 px-5 py-3 rounded-[16px] transition-all"
      style={{ background: glass, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${border}`, opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'default' : 'pointer' }}
      whileHover={disabled ? {} : { scale: 1.02 }} whileTap={disabled ? {} : { scale: 0.98 }}>
      {dir === 'prev' && <span style={{ color: muted }} className="text-lg">&larr;</span>}
      <div className={dir === 'prev' ? 'text-left' : 'text-right'}>
        <div className="text-xs font-light" style={{ fontFamily: FS, color: muted }}>
          {dir === 'prev' ? '\u4E0A\u4E00\u4EF6' : '\u4E0B\u4E00\u4EF6'}
        </div>
        {!disabled && (
          <div className="text-sm font-light truncate max-w-[140px]" style={{ fontFamily: FS, color: body }}>
            {label}
          </div>
        )}
      </div>
      {dir === 'next' && <span style={{ color: muted }} className="text-lg">&rarr;</span>}
    </motion.button>
  );
}

function SectionHead({ children, accent, title, deco }: {
  children: string; accent: string; title: string; deco: CatCfg['sectionDeco'];
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {deco === 'seal' && (
        <div className="w-7 h-7 rounded-sm flex items-center justify-center text-xs"
          style={{ border: `1.5px solid ${accent}`, color: accent, fontFamily: FC }}>
          {children.charAt(0)}
        </div>
      )}
      {deco === 'lotus' && (
        <div className="w-6 h-6 rounded-full"
          style={{ background: `radial-gradient(circle, ${rgba(accent, 0.25)} 0%, transparent 70%)`,
            border: `1px solid ${rgba(accent, 0.15)}` }} />
      )}
      {deco === 'ink' && (
        <div className="flex items-center gap-1">
          <div className="w-5 h-px" style={{ background: `linear-gradient(90deg, transparent, ${rgba(accent, 0.4)})` }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#B83030' }} />
          <div className="w-3 h-px" style={{ background: `linear-gradient(90deg, ${rgba(accent, 0.4)}, transparent)` }} />
        </div>
      )}
      {deco === 'diamond' && (
        <div className="flex items-center gap-0.5">
          {[1.5, 2.5, 1.5].map((s, i) => (
            <div key={i} className={`w-[${s * 4}px] h-[${s * 4}px]`}
              style={{ width: s * 4, height: s * 4, background: accent,
                transform: 'rotate(45deg)', opacity: i === 1 ? 0.4 : 1 }} />
          ))}
        </div>
      )}
      {deco === 'blossom' && <span style={{ color: accent, fontSize: 16 }}>{'\u2740'}</span>}
      {deco === 'dot' && <span style={{ color: accent }}>{'\u2022'}</span>}
      <h2 className="text-xl" style={{ fontFamily: FC, color: title }}>{children}</h2>
      <div className="flex-1 h-px ml-2" style={{
        background: `linear-gradient(90deg, ${rgba(accent, 0.2)}, transparent 50%)` }} />
    </div>
  );
}

/* Fullscreen viewer is now in @/components/ImageViewer */

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const ArtworkDetailPage: React.FC = () => {
  const { category, id } = useParams<{ category: string; id: string }>();
  const [, navigate] = useLocation();
  const [menu, setMenu] = useState(false);
  const [artworks, setArtworks] = useState<ArtworkDetail[]>([]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [fs, setFs] = useState(false);

  const cat = category || '';
  const gCat = category as GalleryCategory;
  const nId = parseInt(id ?? '1', 10);
  const meta = gCat && categoryMeta[gCat] ? categoryMeta[gCat] : undefined;
  const images = gCat && galleries[gCat] ? galleries[gCat] : [];
  const isValidId = !isNaN(nId) && nId >= 1 && nId <= images.length;
  const imgSrc = isValidId ? images[nId - 1] : '';
  const cfg = catCfg[cat] || defaultCfg;

  const imgA = useImageAnalysis(imgSrc);
  const { scrollYProgress } = useScroll();
  const bdY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  useEffect(() => {
    setImgLoaded(false); setFs(false);
    const load = async () => {
      const data = gCat === 'masterpieces'
        ? await getMasterpiecesArtworks()
        : await getArtworksByCategory(gCat);
      setArtworks(data);
    };
    load();
  }, [gCat]);

  const artwork = getArtworkById(artworks, nId);
  const total = images.length;
  const hasPrev = nId > 1;
  const hasNext = nId < total;
  const prevAw = hasPrev ? getArtworkById(artworks, nId - 1) : undefined;
  const nextAw = hasNext ? getArtworkById(artworks, nId + 1) : undefined;

  const goTo = useCallback((newId: number) => {
    navigate(`/gallery/${category}/${newId}`);
    setImgLoaded(false); setFs(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate, category]);

  useEffect(() => {
    const hk = (e: KeyboardEvent) => {
      if (fs) return;
      if (e.key === 'ArrowLeft' && hasPrev) goTo(nId - 1);
      if (e.key === 'ArrowRight' && hasNext) goTo(nId + 1);
    };
    window.addEventListener('keydown', hk);
    return () => window.removeEventListener('keydown', hk);
  }, [hasPrev, hasNext, nId, goTo, fs]);

  // Touch swipe navigation for mobile
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { if (!fs) startX = e.changedTouches[0].screenX; };
    const onEnd = (e: TouchEvent) => {
      if (fs) return;
      const diff = startX - e.changedTouches[0].screenX;
      if (Math.abs(diff) < 60) return;
      if (diff > 0 && hasNext) goTo(nId + 1);
      else if (diff < 0 && hasPrev) goTo(nId - 1);
    };
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    return () => { document.removeEventListener('touchstart', onStart); document.removeEventListener('touchend', onEnd); };
  }, [hasPrev, hasNext, nId, goTo, fs]);

  const title = artwork?.title || `${meta?.title ?? '\u85CF\u54C1'} \u7B2C${nId}\u53F7`;
  const desc = artwork?.description || '';

  useDocumentTitle(title);

  // ── Per-image visual parameters ──
  const layout = imgA.loaded ? selectLayout(imgA, cat, artwork) : 'classic';
  const seed = visualSeed(nId, cat);
  const gradAngle = seed % 360;
  const animDelay = (seed % 3) * 0.1;

  const dk = cfg.dark;
  const accent = imgA.loaded ? imgA.primary : (dk ? '#C4A35A' : '#7F3222');
  const titleC = dk ? 'rgba(255,255,255,0.9)' : 'rgba(30,25,20,0.88)';
  const bodyC = dk ? 'rgba(255,255,255,0.68)' : 'rgba(40,30,20,0.68)';
  const mutedC = dk ? 'rgba(255,255,255,0.32)' : 'rgba(60,45,30,0.32)';
  const glass = dk ? 'rgba(40,35,28,0.55)' : 'rgba(255,252,248,0.42)';
  const gBorder = rgba(accent, dk ? 0.12 : 0.06);

  /* ── Shared content sections (description, cultural, technique) ── */
  const contentSections = (
    <>
      {desc && (
        <motion.div className="relative mb-8 p-8 rounded-[24px]"
          style={{ background: glass, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${gBorder}`, boxShadow: `0 8px 40px ${rgba(accent, dk ? 0.06 : 0.02)}` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 + animDelay }}>
          <SectionHead accent={accent} title={titleC} deco={cfg.sectionDeco}>{'\u4F5C\u54C1\u8D4F\u6790'}</SectionHead>
          <div className="text-base leading-[1.9] font-light whitespace-pre-line"
            style={{ fontFamily: FS, color: bodyC }}>{desc}</div>
        </motion.div>
      )}
      {artwork?.culturalContext && (
        <motion.div className="relative mb-8 p-8 rounded-[24px]"
          style={{ background: glass, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${gBorder}`, boxShadow: `0 8px 40px ${rgba(accent, dk ? 0.06 : 0.02)}` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 + animDelay }}>
          <SectionHead accent={accent} title={titleC} deco={cfg.sectionDeco}>{'\u6587\u5316\u80CC\u666F'}</SectionHead>
          <div className="text-base leading-[1.9] font-light whitespace-pre-line"
            style={{ fontFamily: FS, color: bodyC }}>{artwork.culturalContext}</div>
        </motion.div>
      )}
      {artwork?.technique && (
        <motion.div className="relative mb-8 p-8 rounded-[24px]"
          style={{ background: glass, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${gBorder}`, boxShadow: `0 8px 40px ${rgba(accent, dk ? 0.06 : 0.02)}` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 + animDelay }}>
          <SectionHead accent={accent} title={titleC} deco={cfg.sectionDeco}>{'\u5DE5\u827A\u6280\u6CD5'}</SectionHead>
          <div className="text-base leading-[1.9] font-light whitespace-pre-line"
            style={{ fontFamily: FS, color: bodyC }}>{artwork.technique}</div>
        </motion.div>
      )}
    </>
  );

  /* ── Shared info elements ── */
  const titleCard = (
    <div className="relative p-6 rounded-[20px]" style={{
      background: glass, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${gBorder}`, boxShadow: `0 8px 40px ${rgba(accent, dk ? 0.1 : 0.03)}`,
    }}>
      <h1 className="text-3xl lg:text-4xl leading-tight mb-2" style={{ fontFamily: FC, color: titleC }}>
        {title}
        {cat === 'guohua' && (
          <span className="inline-flex items-center justify-center w-10 h-10 ml-3 align-middle"
            style={{ border: '2px solid #B83030', borderRadius: 3, color: '#B83030',
              fontFamily: FC, fontSize: 14, lineHeight: 1, transform: 'rotate(-3deg)', opacity: 0.6 }}>
            {title.substring(0, 2)}
          </span>
        )}
      </h1>
      {artwork?.titleEn && (
        <p className="text-sm font-light italic mb-3" style={{ fontFamily: FS, color: mutedC }}>{artwork.titleEn}</p>
      )}
      {imgA.loaded && (
        <div className="h-0.5 w-16 rounded-full mb-4" style={{
          background: `linear-gradient(90deg, ${rgba(accent, 0.5)}, ${rgba(imgA.secondary, 0.2)})` }} />
      )}
      {artwork?.tags && artwork.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {artwork.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full text-xs" style={{
              background: rgba(accent, dk ? 0.1 : 0.05),
              border: `1px solid ${rgba(accent, 0.1)}`,
              color: dk ? rgba(accent, 0.8) : rgba(accent, 0.7),
            }}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );

  const metaChips = artwork && (
    <div className="grid grid-cols-2 gap-3">
      {artwork.dynasty && <Chip label={'\u671D\u4EE3'} value={artwork.dynasty} glass={glass} border={gBorder} body={bodyC} muted={mutedC} />}
      {artwork.author && <Chip label={'\u4F5C\u8005'} value={artwork.author} glass={glass} border={gBorder} body={bodyC} muted={mutedC} />}
      {artwork.medium && <Chip label={'\u6750\u8D28/\u6280\u6CD5'} value={artwork.medium} glass={glass} border={gBorder} body={bodyC} muted={mutedC} />}
      {artwork.dimensions && <Chip label={'\u5C3A\u5BF8'} value={artwork.dimensions} glass={glass} border={gBorder} body={bodyC} muted={mutedC} />}
      {artwork.collection && <Chip label={'\u6536\u85CF'} value={artwork.collection} glass={glass} border={gBorder} body={bodyC} muted={mutedC} />}
    </div>
  );

  const backBtn = (
    <motion.button onClick={() => navigate(`/gallery/${category}`)}
      className="flex items-center gap-2 px-5 py-3 rounded-[16px] text-sm font-light transition-all self-start"
      style={{ background: rgba(accent, dk ? 0.1 : 0.05), border: `1px solid ${rgba(accent, 0.1)}`,
        color: dk ? rgba(accent, 0.8) : accent, fontFamily: FS }}
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <span>&larr;</span><span>{'\u8FD4\u56DE'}{meta?.title ?? '\u5C55\u5385'}</span>
    </motion.button>
  );

  const imgEl = (maxH: string, radius: string, extraCls?: string) => (
    <motion.div className={`relative overflow-hidden cursor-zoom-in ${extraCls || ''}`}
      style={{
        background: rgba(accent, dk ? 0.08 : 0.04),
        borderRadius: radius,
        boxShadow: `0 16px 60px ${rgba(accent, dk ? 0.15 : 0.06)}`,
        /* No minHeight -- let the image dictate the container size.
           For loading state, the skeleton occupies space via aspect-ratio. */
        ...(imgA.loaded && imgA.aspectRatio > 0
          ? { aspectRatio: `${imgA.aspectRatio}`, maxHeight: maxH }
          : { minHeight: 280, maxHeight: maxH }),
      }}
      onClick={() => imgLoaded && setFs(true)}>
      <AnimatePresence>
        {!imgLoaded && (
          <motion.div className="absolute inset-0 z-10"
            style={{ background: `linear-gradient(110deg, ${rgba(accent, 0.05)} 8%, ${glass} 18%, ${rgba(accent, 0.05)} 33%)`,
              backgroundSize: '200% 100%' }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            exit={{ opacity: 0 }} />
        )}
      </AnimatePresence>
      <motion.img src={imgSrc} alt={title} className="w-full object-contain" style={{ maxHeight: maxH }}
        initial={{ filter: 'blur(10px)', opacity: 0 }}
        animate={imgLoaded ? { filter: 'blur(0px)', opacity: 1 } : {}}
        transition={{ duration: 0.5 }} onLoad={() => setImgLoaded(true)} />
      <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs tracking-wider z-20"
        style={{ background: dk ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)', border: `1px solid ${rgba(accent, 0.15)}`, color: accent }}>
        {String(nId).padStart(3, '0')} / {total}
      </div>
      {imgLoaded && (
        <motion.div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs z-20"
          style={{ background: dk ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(6px)', color: mutedC, fontFamily: FS }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          {'\u70B9\u51FB\u653E\u5927'}
        </motion.div>
      )}
      {cat === 'guohua' && (
        <>
          <div className="absolute top-0 left-2 right-2 h-2 rounded-b-sm z-20"
            style={{ background: 'linear-gradient(180deg, #7A6B5A 0%, #5C4A3A 40%, #4D3C2E 100%)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
          <div className="absolute bottom-0 left-2 right-2 h-2 rounded-t-sm z-20"
            style={{ background: 'linear-gradient(0deg, #7A6B5A 0%, #5C4A3A 40%, #4D3C2E 100%)',
              boxShadow: '0 -2px 6px rgba(0,0,0,0.15)' }} />
        </>
      )}
    </motion.div>
  );

  const nav = (
    <motion.div className="flex justify-between items-center pt-4"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}>
      <NavBtn dir="prev" onClick={() => hasPrev && goTo(nId - 1)}
        label={hasPrev ? (prevAw?.title || `\u7B2C${nId - 1}\u53F7`) : ''}
        glass={glass} border={gBorder} body={bodyC} muted={mutedC}
        disabled={!hasPrev} />
      <NavBtn dir="next" onClick={() => hasNext && goTo(nId + 1)}
        label={hasNext ? (nextAw?.title || `\u7B2C${nId + 1}\u53F7`) : ''}
        glass={glass} border={gBorder} body={bodyC} muted={mutedC}
        disabled={!hasNext} />
    </motion.div>
  );

  /* ══════════════════════════════════════════════════════
     5 LAYOUT VARIANTS -- each painting gets the one that
     best suits its visual character.
     ══════════════════════════════════════════════════════ */

  const heroLayout = (
    /* Full-width image at top, info panel below -- for panoramic/wide works */
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}>
        {imgEl('60vh', '16px', 'w-full')}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          {titleCard}
        </motion.div>
        <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          {metaChips}
          {backBtn}
        </motion.div>
      </div>
      {contentSections}
      {nav}
    </motion.div>
  );

  const verticalLayout = (
    /* Tall image on left, info scrolling on right -- for vertical scrolls/calligraphy */
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mb-12">
        <motion.div className="lg:w-[45%] lg:sticky lg:top-24 lg:self-start"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          {imgEl('80vh', '6px')}
        </motion.div>
        <motion.div className="lg:w-[55%] flex flex-col gap-6"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          {titleCard}
          {metaChips}
          {backBtn}
          {contentSections}
        </motion.div>
      </div>
      {nav}
    </motion.div>
  );

  const centeredLayout = (
    /* Image centered large, info cards below -- for objects/square artworks */
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex justify-center mb-10">
        <motion.div className="max-w-[600px] w-full" initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          {imgEl('65vh', '16px')}
        </motion.div>
      </div>
      <div className="max-w-[800px] mx-auto">
        <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          {titleCard}
        </motion.div>
        <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          {metaChips}
        </motion.div>
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          {backBtn}
        </motion.div>
        {contentSections}
      </div>
      {nav}
    </motion.div>
  );

  const immersiveLayout = (
    /* Big image with overlaid info -- for dramatic/important works */
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="relative mb-12">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}>
          {imgEl('75vh', '20px', 'w-full')}
        </motion.div>
        {/* Gradient overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 h-40 rounded-b-[20px] pointer-events-none"
          style={{ background: `linear-gradient(to top, ${dk ? 'rgba(20,18,15,0.8)' : 'rgba(240,235,225,0.8)'}, transparent)` }} />
        {/* Title overlaid at bottom */}
        <motion.div className="absolute bottom-6 left-6 right-6 z-20"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}>
          <h1 className="text-4xl lg:text-5xl leading-tight mb-2 drop-shadow-lg"
            style={{ fontFamily: FC, color: dk ? 'rgba(255,255,255,0.95)' : 'rgba(30,25,20,0.92)' }}>
            {title}
          </h1>
          {artwork?.titleEn && (
            <p className="text-sm font-light italic drop-shadow-md"
              style={{ fontFamily: FS, color: dk ? 'rgba(255,255,255,0.5)' : 'rgba(40,30,20,0.5)' }}>
              {artwork.titleEn}
            </p>
          )}
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <div className="relative p-6 rounded-[20px]" style={{
            background: glass, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${gBorder}` }}>
            {artwork?.tags && artwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {artwork.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs" style={{
                    background: rgba(accent, dk ? 0.1 : 0.05),
                    border: `1px solid ${rgba(accent, 0.1)}`,
                    color: dk ? rgba(accent, 0.8) : rgba(accent, 0.7),
                  }}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
        <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          {metaChips}
          {backBtn}
        </motion.div>
      </div>
      {contentSections}
      {nav}
    </motion.div>
  );

  const classicLayout = (
    /* Side-by-side image + info -- versatile default */
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
        <motion.div className="flex-1" initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {imgEl('70vh', '20px')}
        </motion.div>
        <motion.div className="lg:w-[380px] flex-shrink-0 flex flex-col gap-6"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}>
          {titleCard}
          {metaChips}
          {backBtn}
        </motion.div>
      </div>
      {contentSections}
      {nav}
    </motion.div>
  );

  const layoutMap: Record<LayoutType, React.ReactNode> = {
    hero: heroLayout,
    vertical: verticalLayout,
    centered: centeredLayout,
    immersive: immersiveLayout,
    classic: classicLayout,
  };

  // Invalid ID or category → show error with navigation back
  if (!isValidId || !meta) {
    return (
      <div className="min-h-screen bg-museum-beige font-sans">
        <MobileMenu isOpen={menu} onClose={() => setMenu(false)} />
        <StickyHeader onMobileMenuOpen={() => setMenu(true)} theme="light" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-24 pb-16 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-museum-brown/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-museum-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
            <p className="text-museum-brown text-xl mb-2" style={{ fontFamily: FS }}>
              {!meta ? '未找到该分类' : '未找到该藏品'}
            </p>
            <p className="text-museum-brown/50 text-sm mb-8">
              {!meta ? '请检查分类名称是否正确' : `有效编号范围: 1 - ${images.length}`}
            </p>
            <div className="flex gap-4 justify-center">
              {meta && (
                <motion.button onClick={() => navigate(`/gallery/${category}`)}
                  className="px-6 py-3 rounded-xl text-museum-brown border border-museum-brown/20"
                  style={{ fontFamily: FS }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  返回展厅
                </motion.button>
              )}
              <motion.button onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #7F3222, #C85840)', fontFamily: FS }}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(127,50,34,0.3)' }}
                whileTap={{ scale: 0.97 }}>
                返回首页
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Layer 1: Blurred artwork backdrop -- unique per image */}
      <motion.div className="fixed inset-0 z-0" style={{ y: bdY }}>
        {imgSrc && (
          <motion.img src={imgSrc} alt="" className="w-full h-full object-cover"
            style={{ filter: 'blur(60px) saturate(0.6) brightness(0.7)', transform: 'scale(1.3)',
              opacity: dk ? 0.3 : 0.2 }}
            initial={{ opacity: 0 }} animate={{ opacity: dk ? 0.3 : 0.2 }} transition={{ duration: 1 }} />
        )}
      </motion.div>

      {/* Layer 2: Category tint */}
      <div className="fixed inset-0 z-[1]" style={{ background: cfg.pageTint }} />

      {/* Layer 3: Per-image ambient glow */}
      {imgA.loaded && (
        <div className="fixed inset-0 z-[2] pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[60vh]" style={{
            background: `radial-gradient(ellipse 80% 50% at ${30 + (gradAngle % 40)}% 0%, ${rgba(imgA.secondary, dk ? 0.08 : 0.06)}, transparent)`,
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-[40vh]" style={{
            background: `radial-gradient(ellipse 80% 50% at ${60 - (gradAngle % 30)}% 100%, ${rgba(imgA.tertiary, dk ? 0.06 : 0.04)}, transparent)`,
          }} />
        </div>
      )}

      {/* Layer 4: Content */}
      <div className="relative z-10">
        <MobileMenu isOpen={menu} onClose={() => setMenu(false)} />
        <StickyHeader onMobileMenuOpen={() => setMenu(true)} theme={cfg.headerTheme} />

        {/* Breadcrumb */}
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-24 pb-4">
          <motion.nav aria-label="面包屑导航" className="text-sm font-light" style={{ fontFamily: FS, color: mutedC }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <button onClick={() => navigate('/')} style={{ color: mutedC }}
              className="transition-opacity hover:opacity-80">{'\u9996\u9875'}</button>
            <span className="mx-2" style={{ opacity: 0.5 }}>/</span>
            <button onClick={() => navigate(`/gallery/${category}`)} style={{ color: mutedC }}
              className="transition-opacity hover:opacity-80">{meta?.title ?? '\u85CF\u54C1'}</button>
            <span className="mx-2" style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: bodyC }}>{title}</span>
          </motion.nav>
        </div>

        {/* Layout-specific content */}
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pb-16">
          <AnimatePresence mode="wait" key={`${cat}-${nId}`}>
            {layoutMap[layout]}
          </AnimatePresence>
        </div>
      </div>

      {/* Fullscreen */}
      <AnimatePresence>
        {fs && <ImageViewer src={imgSrc} title={title} onClose={() => setFs(false)}
          counter={`${String(nId).padStart(3, '0')} / ${total}`} />}
      </AnimatePresence>
    </div>
  );
};

export default ArtworkDetailPage;
