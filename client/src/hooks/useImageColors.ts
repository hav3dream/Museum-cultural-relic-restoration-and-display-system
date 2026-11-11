import { useState, useEffect, useRef } from 'react';

/**
 * Extract dominant colors AND aspect ratio from an image.
 * Colors: primary (center), secondary (top), tertiary (bottom).
 * Aspect ratio drives layout selection -- wide paintings get panoramic layouts,
 * tall scrolls get vertical layouts, etc.
 */

export interface ImageAnalysis {
  primary: string;
  secondary: string;
  tertiary: string;
  isDark: boolean;
  aspectRatio: number; // width/height: >1 = wide, <1 = tall, ~1 = square
  loaded: boolean;
}

const defaultAnalysis: ImageAnalysis = {
  primary: 'rgba(127,50,34,0.15)',
  secondary: 'rgba(212,167,106,0.1)',
  tertiary: 'rgba(74,52,40,0.05)',
  isDark: false,
  aspectRatio: 1,
  loaded: false,
};

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function sampleRegion(
  data: Uint8ClampedArray,
  width: number,
  x1: number, y1: number, x2: number, y2: number,
): [number, number, number] {
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      const i = (y * width + x) * 4;
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
      count++;
    }
  }
  if (count === 0) return [128, 100, 80];
  return [Math.round(rSum / count), Math.round(gSum / count), Math.round(bSum / count)];
}

export function useImageAnalysis(imageSrc: string): ImageAnalysis {
  const [analysis, setAnalysis] = useState<ImageAnalysis>(defaultAnalysis);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Get natural aspect ratio
      const ar = img.naturalWidth / img.naturalHeight;

      try {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setAnalysis({ ...defaultAnalysis, aspectRatio: ar, loaded: true });
          return;
        }

        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const d = imageData.data;
        const w = size;
        const h = size;
        const third = Math.floor(size / 3);

        const center = sampleRegion(d, w, third, third, third * 2, third * 2);
        const topArea = sampleRegion(d, w, 0, 0, w, third);
        const bottomArea = sampleRegion(d, w, 0, third * 2, w, h);
        const lum = luminance(center[0], center[1], center[2]);

        setAnalysis({
          primary: rgbToHex(center[0], center[1], center[2]),
          secondary: rgbToHex(topArea[0], topArea[1], topArea[2]),
          tertiary: rgbToHex(bottomArea[0], bottomArea[1], bottomArea[2]),
          isDark: lum < 0.45,
          aspectRatio: ar,
          loaded: true,
        });
      } catch {
        setAnalysis({ ...defaultAnalysis, aspectRatio: ar, loaded: true });
      }
    };

    img.onerror = () => {
      setAnalysis({ ...defaultAnalysis, loaded: true });
    };

    img.src = imageSrc;
  }, [imageSrc]);

  return analysis;
}
