import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, VolumeX } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DigitalHumanVideoOverlayProps {
  characterId: string;
  characterName: string;
  characterTitle: string;
  dynasty: string;
  quote: string;
  accentColor: string;
  bgGradient: string;
  representChar: string;
  onClose: () => void;
}

type GenerationStatus = 'submitting' | 'generating' | 'ready' | 'error';

// ─── Ink Particle ─────────────────────────────────────────────────────────────

function InkParticle({ color, delay }: { color: string; delay: number }) {
  const size = 2 + Math.random() * 5;
  const left = `${10 + Math.random() * 80}%`;
  const startY = `${50 + Math.random() * 30}%`;
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left, top: startY, backgroundColor: color }}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 0.6, 0], y: [-20, -80 - Math.random() * 120] }}
      transition={{ duration: 3 + Math.random() * 3, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

// ─── Ink Ripple Ring ──────────────────────────────────────────────────────────

function InkRipple({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 0.6, 1.2].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ borderColor: `${color}40` }}
          initial={{ width: 80, height: 80, opacity: 0.7 }}
          animate={{ width: 360, height: 360, opacity: 0 }}
          transition={{ duration: 2.4, delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─── Animated Ink-Brush Character Silhouette ──────────────────────────────────
// A stylised robed figure rendered with SVG — pure CSS animation, no assets

function CharacterSilhouette({ color, characterId }: { color: string; characterId: string }) {
  // Determine pose variant based on character type
  const isFemale = characterId === 'liqingzhao' || characterId === 'mulan';
  const isWarrior = ['yuefei', 'huoqubing', 'mulan', 'guanyu'].includes(characterId);
  const isPoet = ['libai', 'sushi', 'wangwei'].includes(characterId);

  return (
    <motion.div
      className="relative"
      style={{ width: 120, height: 200 }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 120 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Soft glow beneath figure */}
        <ellipse cx="60" cy="190" rx="38" ry="6" fill={color} opacity="0.12" />

        {/* Head */}
        <motion.ellipse
          cx="60"
          cy="28"
          rx="16"
          ry="18"
          fill={color}
          opacity={0.75}
          animate={{ opacity: [0.65, 0.85, 0.65] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Hair / topknot */}
        {!isFemale && (
          <motion.path
            d="M50 16 Q60 4 70 16 Q64 10 60 8 Q56 10 50 16 Z"
            fill={color}
            opacity={0.6}
          />
        )}
        {isFemale && (
          <>
            <motion.path
              d="M44 22 Q40 10 60 8 Q80 10 76 22"
              stroke={color}
              strokeWidth="3"
              fill="none"
              opacity={0.55}
            />
            <motion.circle cx="44" cy="16" r="4" fill={color} opacity={0.4} />
            <motion.circle cx="76" cy="16" r="4" fill={color} opacity={0.4} />
          </>
        )}

        {/* Neck */}
        <rect x="56" y="44" width="8" height="10" fill={color} opacity={0.6} rx="2" />

        {/* Robe body — wide flowing shape */}
        <motion.path
          d="M30 56 Q20 80 18 130 Q22 148 60 152 Q98 148 102 130 Q100 80 90 56 Q78 50 60 50 Q42 50 30 56 Z"
          fill={color}
          opacity={0.55}
          animate={{ d: isWarrior
            ? [
                'M30 56 Q20 80 18 130 Q22 148 60 152 Q98 148 102 130 Q100 80 90 56 Q78 50 60 50 Q42 50 30 56 Z',
                'M28 56 Q18 82 16 132 Q20 150 60 154 Q100 150 104 132 Q102 82 92 56 Q78 50 60 50 Q42 50 28 56 Z',
                'M30 56 Q20 80 18 130 Q22 148 60 152 Q98 148 102 130 Q100 80 90 56 Q78 50 60 50 Q42 50 30 56 Z',
              ]
            : [
                'M30 56 Q20 80 18 130 Q22 148 60 152 Q98 148 102 130 Q100 80 90 56 Q78 50 60 50 Q42 50 30 56 Z',
                'M32 56 Q22 80 20 128 Q24 146 60 150 Q96 146 100 128 Q98 80 88 56 Q78 50 60 50 Q42 50 32 56 Z',
                'M30 56 Q20 80 18 130 Q22 148 60 152 Q98 148 102 130 Q100 80 90 56 Q78 50 60 50 Q42 50 30 56 Z',
              ]
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Collar / sash line */}
        <motion.path
          d="M52 54 Q60 62 68 54"
          stroke={color}
          strokeWidth="2"
          fill="none"
          opacity={0.4}
        />

        {/* Left sleeve / arm */}
        <motion.path
          d={isPoet
            ? 'M32 70 Q10 90 6 110 Q8 116 14 114 Q20 100 38 84 Z'
            : isWarrior
            ? 'M32 70 Q8 78 4 96 Q6 104 14 102 Q22 90 40 80 Z'
            : 'M32 70 Q12 85 8 105 Q10 112 18 110 Q24 96 42 78 Z'
          }
          fill={color}
          opacity={0.45}
          animate={{ rotate: [0, -3, 0, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{ transformOrigin: '35px 72px' }}
        />

        {/* Right sleeve / arm */}
        <motion.path
          d={isPoet
            ? 'M88 70 Q110 88 116 108 Q114 114 108 112 Q100 98 82 82 Z'
            : isWarrior
            ? 'M88 70 Q114 80 118 98 Q116 106 108 104 Q100 90 80 78 Z'
            : 'M88 70 Q108 84 114 104 Q112 112 104 110 Q96 96 78 76 Z'
          }
          fill={color}
          opacity={0.45}
          animate={{ rotate: [0, 4, 0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ transformOrigin: '85px 72px' }}
        />

        {/* Left hand — holding a cup / brush / weapon */}
        {isPoet && (
          <>
            <ellipse cx="7" cy="112" rx="5" ry="5" fill={color} opacity={0.5} />
            {/* Cup */}
            <path d="M3 108 Q7 106 11 108 L10 116 Q7 118 4 116 Z" fill={color} opacity={0.35} />
          </>
        )}
        {isWarrior && (
          <>
            <ellipse cx="5" cy="100" rx="5" ry="5" fill={color} opacity={0.5} />
            {/* Blade / weapon line */}
            <motion.line
              x1="5" y1="96" x2="5" y2="60"
              stroke={color}
              strokeWidth="2.5"
              opacity={0.55}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </>
        )}
        {!isPoet && !isWarrior && (
          <ellipse cx="9" cy="108" rx="5" ry="5" fill={color} opacity={0.45} />
        )}

        {/* Right hand */}
        <ellipse cx="113" cy={isWarrior ? 102 : 108} rx="5" ry="5" fill={color} opacity={0.5} />

        {/* Flowing robe hem / lower panels */}
        <motion.path
          d="M18 130 Q30 168 40 185 Q60 192 80 185 Q90 168 102 130"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          opacity={0.3}
          animate={{ pathLength: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Side robe panels — flow effect */}
        <motion.path
          d="M20 100 Q10 140 14 172 Q26 188 40 186 Q28 160 26 130 Z"
          fill={color}
          opacity={0.2}
          animate={{ opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M100 100 Q110 140 106 172 Q94 188 80 186 Q92 160 94 130 Z"
          fill={color}
          opacity={0.2}
          animate={{ opacity: [0.25, 0.15, 0.25] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Ink brush strokes — decorative calligraphy marks around figure */}
        {[[-8, 55, 10], [122, 75, -12], [-4, 135, 8], [118, 115, -9]].map(([x, y, rot], i) => (
          <motion.line
            key={i}
            x1={x} y1={y} x2={x + 16} y2={y + 4}
            stroke={color}
            strokeWidth="1"
            opacity={0}
            strokeLinecap="round"
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{ duration: 2, delay: i * 0.8, repeat: Infinity, repeatDelay: 4 }}
            style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${x}px ${y}px` }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

// ─── Ambient Sound Generator (Web Audio API) ─────────────────────────────────

function useAmbientSound(active: boolean, color: string) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  useEffect(() => {
    if (!active) return;

    // Attempt to create ambient pentatonic tones
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);
      masterGain.connect(ctx.destination);
      nodesRef.current.push(masterGain);

      // Reverb-like convolver approximation via delay
      const delay = ctx.createDelay(2);
      delay.delayTime.value = 0.4;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.25;
      delay.connect(delayGain);
      delayGain.connect(delay); // feedback loop
      delayGain.connect(masterGain);

      // Low drone — fundamental
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.value = 110; // A2
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.4;
      drone.connect(droneGain);
      droneGain.connect(masterGain);
      drone.start();
      nodesRef.current.push(drone);

      // Pentatonic C major scale notes: C4 E4 G4 A4 D5 (frequencies)
      const pentatonic = [261.63, 329.63, 392, 440, 587.33, 523.25, 659.25];

      let noteIndex = 0;
      function playNote() {
        if (!audioCtxRef.current) return;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = pentatonic[noteIndex % pentatonic.length];
        noteIndex++;

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.15);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

        osc.connect(noteGain);
        noteGain.connect(delay);
        noteGain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      }

      // Play a note every 1.8 seconds, staggered
      playNote();
      const interval = setInterval(playNote, 1800);
      nodesRef.current.push({ disconnect: () => clearInterval(interval) } as any);

    } catch {
      // Web Audio not supported or blocked — silent fallback
    }

    return () => {
      nodesRef.current.forEach(n => {
        try { (n as OscillatorNode).stop?.(); } catch {}
        try { n.disconnect?.(); } catch {}
      });
      nodesRef.current = [];
      try { audioCtxRef.current?.close(); } catch {}
      audioCtxRef.current = null;
    };
  }, [active]);
}

// ─── Faux Progress Bar ────────────────────────────────────────────────────────

function GeneratingProgress({
  accentColor,
  elapsedSeconds,
}: {
  accentColor: string;
  elapsedSeconds: number;
}) {
  // Slowly fills: reaches ~85% at 150s, then stalls waiting for real completion
  const progress = Math.min(85, (elapsedSeconds / 150) * 85);

  const phase =
    elapsedSeconds < 20
      ? '召唤中'
      : elapsedSeconds < 60
      ? 'AI融合历史记忆'
      : elapsedSeconds < 120
      ? '渲染数字形态'
      : '即将完成';

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs tracking-[0.25em]"
          style={{ color: `${accentColor}90`, fontFamily: "'LXGW WenKai', serif" }}
        >
          {phase}
        </span>
        <span
          className="text-xs tabular-nums"
          style={{ color: `${accentColor}60`, fontFamily: "'LXGW WenKai', serif" }}
        >
          {Math.round(progress)}%
        </span>
      </div>
      <div
        className="h-px w-full rounded-full"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

// ─── Main Overlay Component ───────────────────────────────────────────────────

export default function DigitalHumanVideoOverlay({
  characterId,
  characterName,
  characterTitle,
  dynasty,
  quote,
  accentColor,
  bgGradient,
  representChar,
  onClose,
}: DigitalHumanVideoOverlayProps) {
  const [status, setStatus] = useState<GenerationStatus>('submitting');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ambient sound — active while submitting/generating
  const soundActive = status === 'submitting' || status === 'generating';
  useAmbientSound(soundActive, accentColor);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Start elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Submit generation job — falls back to pre-rendered demo video if API unavailable
  useEffect(() => {
    let cancelled = false;
    async function submit() {
      try {
        const res = await fetch('/api/digital-human/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { videoId: string; status: string };
        if (!cancelled) {
          setVideoId(data.videoId);
          setStatus('generating');
        }
      } catch {
        // API unavailable (no key in production) → use pre-rendered demo video
        if (!cancelled) {
          stopPolling();
          setIsDemoMode(true);
          setVideoUrl('/demo/digital-human-demo.mp4');
          setStatus('ready');
        }
      }
    }
    submit();
    return () => { cancelled = true; };
  }, [characterId, stopPolling]);

  // Poll for completion
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (!videoId || status !== 'generating') return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/digital-human/video-status/${videoId}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          status: string; url: string | null; error: string | null;
        };
        if (data.status === 'succeeded' && data.url) {
          stopPolling();
          setVideoUrl(data.url);
          setStatus('ready');
        } else if (data.status === 'failed') {
          stopPolling();
          setErrorMsg(data.error ?? '生成失败');
          setStatus('error');
        }
      } catch {
        // silently ignore transient network errors; keep polling
      }
    }, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [videoId, status, stopPolling]);

  // Auto-play when video is ready
  useEffect(() => {
    if (status === 'ready' && videoRef.current) {
      videoRef.current.play().then(() => setVideoPlaying(true)).catch(() => {});
    }
  }, [status]);

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !muted;
    setMuted(m => !m);
  };

  // ── Particle seeds (stable) ────────────────────────────────────────────────
  const particles = useRef(
    Array.from({ length: 24 }, (_, i) => ({ id: i, delay: (i * 0.4) % 5 }))
  ).current;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgba(4, 2, 1, 0.95)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        />

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${accentColor}15 0%, transparent 70%)`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {particles.map(p => (
            <InkParticle key={p.id} color={accentColor} delay={p.delay} />
          ))}
        </div>

        {/* Close button */}
        <motion.button
          className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-full border text-white/50"
          style={{ borderColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
          whileHover={{ borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.9)' }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <X size={16} />
        </motion.button>

        {/* ── Generating state ── */}
        <AnimatePresence mode="wait">
          {(status === 'submitting' || status === 'generating') && (
            <motion.div
              key="generating"
              className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 max-w-md w-full text-center"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Character silhouette + ripple rings */}
              <div className="relative flex items-center justify-center" style={{ width: 240, height: 260 }}>
                {/* Ripple rings behind figure */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <InkRipple color={accentColor} />
                </div>

                {/* Animated SVG silhouette — front and center */}
                <div className="relative z-10">
                  <CharacterSilhouette color={accentColor} characterId={characterId} />
                </div>

                {/* Floating representative character above silhouette */}
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl font-normal select-none pointer-events-none"
                  style={{
                    fontFamily: "'Ma Shan Zheng', cursive",
                    color: accentColor,
                    textShadow: `0 0 24px ${accentColor}80`,
                    top: -10,
                  }}
                  animate={{ opacity: [0.4, 0.85, 0.4], y: [0, -4, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                >
                  {representChar}
                </motion.div>
              </div>

              {/* Dynasty + name */}
              <div>
                <div
                  className="text-xs tracking-[0.5em] uppercase mb-2"
                  style={{ color: `${accentColor}70`, fontFamily: "'LXGW WenKai', serif" }}
                >
                  {dynasty}朝 · 正在唤醒
                </div>
                <h2
                  className="text-4xl font-normal text-white mb-1"
                  style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                >
                  {characterName}
                </h2>
                <div className="text-sm" style={{ color: accentColor, fontFamily: "'LXGW WenKai', serif" }}>
                  {characterTitle}
                </div>
              </div>

              {/* Quote */}
              <div
                className="px-4 py-3 rounded-xl border max-w-xs"
                style={{
                  borderColor: `${accentColor}25`,
                  backgroundColor: `${accentColor}08`,
                }}
              >
                <p
                  className="text-sm text-white/50 italic leading-relaxed"
                  style={{ fontFamily: "'LXGW WenKai', serif" }}
                >
                  「{quote}」
                </p>
              </div>

              {/* Progress */}
              {status === 'generating' && (
                <motion.div
                  className="w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <GeneratingProgress accentColor={accentColor} elapsedSeconds={elapsedSeconds} />
                </motion.div>
              )}

              {status === 'submitting' && (
                <div
                  className="text-xs tracking-[0.3em] animate-pulse"
                  style={{ color: `${accentColor}60`, fontFamily: "'LXGW WenKai', serif" }}
                >
                  连接中...
                </div>
              )}

              <div
                className="text-[10px] text-white/20 tracking-widest"
                style={{ fontFamily: "'LXGW WenKai', serif" }}
              >
                AI · 视频生成中 · 预计1-3分钟
              </div>
            </motion.div>
          )}

          {/* ── Video ready state ── */}
          {status === 'ready' && videoUrl && (
            <motion.div
              key="ready"
              className="relative z-10 w-full max-w-4xl px-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Video container */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: `1px solid ${accentColor}35`,
                  boxShadow: `0 0 60px ${accentColor}20, 0 20px 60px rgba(0,0,0,0.7)`,
                }}
              >
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full block"
                  loop
                  playsInline
                  muted={muted}
                  onPlay={() => setVideoPlaying(true)}
                />

                {/* Video controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="text-xl font-normal text-white"
                      style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                    >
                      {characterName}
                    </div>
                    <div
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={{
                        borderColor: `${accentColor}50`,
                        color: accentColor,
                        fontFamily: "'LXGW WenKai', serif",
                      }}
                    >
                      {dynasty}朝 · {characterTitle}
                    </div>
                    {isDemoMode && (
                      <div
                        className="text-xs px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: 'rgba(255,255,255,0.4)',
                          fontFamily: "'LXGW WenKai', serif",
                        }}
                      >
                        演示版
                      </div>
                    )}
                  </div>
                  <button
                    onClick={toggleMute}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/70"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>

                {/* Play overlay if paused */}
                {!videoPlaying && (
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={() => videoRef.current?.play()}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${accentColor}30`, border: `1px solid ${accentColor}60` }}
                    >
                      <Play size={24} style={{ color: accentColor }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Caption */}
              <motion.div
                className="text-center mt-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p
                  className="text-sm text-white/40 italic"
                  style={{ fontFamily: "'LXGW WenKai', serif" }}
                >
                  「{quote}」
                </p>
                <div
                  className="text-[10px] text-white/20 tracking-widest mt-2"
                  style={{ fontFamily: "'LXGW WenKai', serif" }}
                >
                  AI · 数字人 · 华韵新生
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── Error state ── */}
          {status === 'error' && (
            <motion.div
              key="error"
              className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="text-5xl font-normal"
                style={{ fontFamily: "'Ma Shan Zheng', cursive", color: accentColor, opacity: 0.6 }}
              >
                {representChar}
              </div>
              <div>
                <div className="text-white/60 text-sm mb-1" style={{ fontFamily: "'LXGW WenKai', serif" }}>
                  生成遇到问题
                </div>
                <div className="text-white/30 text-xs" style={{ fontFamily: "'LXGW WenKai', serif" }}>
                  {errorMsg}
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full text-sm border"
                style={{
                  borderColor: `${accentColor}40`,
                  color: accentColor,
                  fontFamily: "'LXGW WenKai', serif",
                }}
              >
                关闭
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
