import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Artwork {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  position: string;
}

interface ArtCardProps {
  artworks: Artwork[];
  count?: number;
}

const ArtCard: React.FC<ArtCardProps> = ({ artworks, count }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedSet, setLoadedSet] = useState<Set<string>>(() => new Set());
  const [hovered, setHovered] = useState(false);
  const imgRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const title = artworks[0].title;

  // Mark an image as loaded
  const markLoaded = useCallback((url: string) => {
    setLoadedSet(prev => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }, []);

  // Check for already-cached images on mount and after render
  useEffect(() => {
    imgRefs.current.forEach((img, url) => {
      if (img && img.complete && img.naturalWidth > 0) {
        markLoaded(url);
      }
    });
  }, [markLoaded]);

  // Cycle images on interval (only if multiple images)
  useEffect(() => {
    if (artworks.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % artworks.length);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [artworks.length]);

  const anyLoaded = loadedSet.size > 0;

  return (
    <div
      className="group relative w-full h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden rounded-sm bg-[#ebe8e3] w-full h-full">
        {/* Shimmer - only until first image loads */}
        {!anyLoaded && (
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(110deg, #ebe8e3 8%, #f0ece6 18%, #ebe8e3 33%)',
              backgroundSize: '200% 100%',
              animation: 'artcard-shimmer 1.5s linear infinite',
            }}
          />
        )}

        {/* All images rendered, crossfade via opacity */}
        {artworks.map((artwork, idx) => {
          const isActive = idx === currentIndex;
          const isLoaded = loadedSet.has(artwork.imageUrl);
          return (
            <img
              key={artwork.imageUrl}
              ref={el => {
                if (el) {
                  imgRefs.current.set(artwork.imageUrl, el);
                  // Also check immediately when ref is set (handles cached images)
                  if (el.complete && el.naturalWidth > 0) {
                    markLoaded(artwork.imageUrl);
                  }
                }
              }}
              src={artwork.imageUrl}
              alt={artwork.title || `art-${artwork.id}`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: isActive && isLoaded ? 1 : 0,
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'opacity 0.8s ease, transform 1.2s cubic-bezier(0.5, 0, 0.3, 1)',
                zIndex: isActive ? 2 : 1,
              }}
              onLoad={() => markLoaded(artwork.imageUrl)}
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
          );
        })}

        {/* Hover gradient */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            opacity: hovered ? 1 : 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 45%, transparent 100%)',
            transition: 'opacity 0.5s ease',
          }}
        />

        {/* Hover info */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 p-4 lg:p-5 pointer-events-none"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          <p
            className="text-white text-lg lg:text-xl font-medium tracking-wide drop-shadow-lg"
            style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
          >
            {title}
          </p>
          {count !== undefined && (
            <p className="text-white/60 text-xs mt-1.5 tracking-wider"
               style={{ fontFamily: "'LXGW WenKai', sans-serif" }}>
              {count} 件作品
            </p>
          )}
        </div>

        {/* Corner accent */}
        <div
          className="absolute top-3 right-3 z-20 w-5 h-5 pointer-events-none"
          style={{
            opacity: hovered ? 0.35 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="#D4A76A" strokeWidth="1">
            <path d="M20 0 L20 20 L0 20" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes artcard-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(ArtCard);
