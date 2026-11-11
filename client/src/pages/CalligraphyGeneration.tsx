import React from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import bgImage from '@/assets/2569-131.webp';
import sectionIcon from '@/assets/2569-150.svg';
import submitIcon from '@/assets/I2647-272;8899-1186.svg';
import clearIcon from '@/assets/I2647-276;2568-128.svg';
import { RestorationLayout, ActionButtons } from '@/components/restoration';
import { restorationService } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorMessages';

// 书法家风格，id 对应 LUO-Calli style_wid 参数
const STYLES = [
  { id: '02', name: '管峻', preview: '永' },
  { id: '03', name: '弘一', preview: '心' },
  { id: '04', name: '柳公权', preview: '龍' },
  { id: '08', name: '欧阳询', preview: '雲' },
  { id: '09', name: '宋徽宗', preview: '禧' },
  { id: '10', name: '颜真卿', preview: '寿' },
];

const PAPER_INFO = {
  title: 'LUO-Calli: 基于 One-DM 的书法风格生成模型',
  authors: '作者团队',
  venue: '学术会议/期刊',
  year: 2024,
  abstract: '利用 LUO-Calli 模型实现古典书法风格的逐字生成，支持管峻、弘一、柳公权、欧阳询、宋徽宗、颜真卿六种名家书体风格。',
  model: 'LUO-Calli (One-DM)',
  endpoint: 'http://127.0.0.1:5003/generate_poem_zip',
  input: '诗文内容 + 书法家风格编号',
  output: '多张单字书法 PNG 图片（ZIP 包）',
};

function StyleCard({ style, index, selectedStyle, onSelect }: {
  style: { id: string; name: string; preview: string };
  index: number;
  selectedStyle: string;
  onSelect: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      key={style.id}
      onClick={() => onSelect(style.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative p-3 rounded-[16px] cursor-pointer text-center overflow-hidden"
      style={
        selectedStyle === style.id
          ? {
              background: 'linear-gradient(135deg, rgba(212,167,106,0.12) 0%, rgba(232,227,209,0.18) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(212,167,106,0.3)',
            }
          : {
              background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(232,227,209,0.12) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(232,227,209,0.2)',
            }
      }
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
    >
      {selectedStyle === style.id && (
        <motion.div
          className="absolute top-1 right-1"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
            delay: 0.1
          }}
        >
          <svg className="w-4 h-4 text-museum-gold" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.4, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-museum-brown text-[24px] font-serif" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>
              {style.preview}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative text-museum-brown text-sm font-normal" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>{style.name}</div>
    </motion.div>
  );
}

export default function CalligraphyGeneration() {
  useDocumentTitle('书法创作');

  const [textInput, setTextInput] = React.useState('床前明月光');
  const [selectedStyle, setSelectedStyle] = React.useState('08');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  // LUO-Calli 返回多张单字图，存数组
  const [resultUrls, setResultUrls] = React.useState<string[]>([]);
  const [showPaperInfo, setShowPaperInfo] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pollingProgress, setPollingProgress] = React.useState(0);
  const [statusMessageIndex, setStatusMessageIndex] = React.useState(0);

  const pollingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingAbortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
      pollingAbortRef.current?.abort();
    };
  }, []);

  const statusMessages = [
    '解析文字结构...',
    '选择笔画风格...',
    '生成书法作品...',
    '精细化笔触...'
  ];

  // Cycle through status messages during loading
  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setStatusMessageIndex((prev) => (prev + 1) % statusMessages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);


  const handleGenerateCalligraphy = async () => {
    if (!textInput.trim()) {
      toast.error('请输入要生成的文本内容');
      return;
    }
    setIsLoading(true);
    setShowResults(false);
    setResultUrls([]);
    setError(null);
    setPollingProgress(0);
    try {
      // 直接以 JSON 形式发送 poem + style_wid，无需构造文件
      const response = await restorationService.submitCalligraphy(textInput.trim(), selectedStyle);
      if (response.success && response.data) {
        toast.info('任务已提交，正在处理中...');
        pollResult(response.data.id);
      } else {
        setIsLoading(false);
        const errMsg = getErrorMessage(response.error || '提交失败');
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      setIsLoading(false);
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const pollResult = async (id: string) => {
    pollingAbortRef.current = new AbortController();
    let attempts = 0;
    const maxAttempts = 150; // 5 minutes timeout (150 * 2s = 300s)
    const poll = async () => {
      try {
        attempts++;
        setPollingProgress(Math.min((attempts / maxAttempts) * 100, 99));

        if (attempts >= maxAttempts) {
          setIsLoading(false);
          const errMsg = '请求超时，请检查网络连接或稍后重试';
          setError(errMsg);
          toast.error(errMsg);
          return;
        }

        const res = await restorationService.getRestorationStatus(id, pollingAbortRef.current?.signal);
        if (res.success && res.data) {
          if (res.data.status === 'completed' && res.data.resultUrls.length > 0) {
            // LUO-Calli 返回多张单字图，全部存入 resultUrls
            setResultUrls(res.data.resultUrls);
            setShowResults(true);
            setIsLoading(false);
            setPollingProgress(100);
            toast.success(`生成完成！共 ${res.data.resultUrls.length} 个字`);
            return;
          } else if (res.data.status === 'failed') {
            setIsLoading(false);
            const errMsg = '生成失败，请重试';
            setError(errMsg);
            toast.error(errMsg);
            return;
          }
        }
        pollingTimeoutRef.current = setTimeout(poll, 2000);
      } catch (err) {
        setIsLoading(false);
        const errMsg = getErrorMessage(err);
        setError(errMsg);
        toast.error(errMsg);
      }
    };
    poll();
  };

  const handleClear = () => {
    setTextInput('');
    setSelectedStyle('08');
    setShowResults(false);
    setResultUrls([]);
    setError(null);
    setPollingProgress(0);
  };

  const handleRetry = () => {
    setError(null);
    handleGenerateCalligraphy();
  };

  const handleCancel = () => {
    if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    pollingTimeoutRef.current = null;
    setIsLoading(false);
    setPollingProgress(0);
    toast.info('已取消处理');
  };

  return (
    <RestorationLayout
      backgroundImage={bgImage}
      leftPanel={
        <motion.div
          className="w-full rounded-[24px] p-8"
          style={{
            height: '100%',
            overflowY: 'auto',
            background: 'linear-gradient(135deg, rgba(232,227,209,0.2) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.06) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(232,227,209,0.25)',
            boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
          }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <img src={sectionIcon} alt="" className="w-8 h-8 object-contain" />
            <div className="text-museum-brown text-[17px] font-medium" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>输入文本内容</div>
          </div>
          <div className="relative mb-1">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="写下你想要生成的文字..."
              maxLength={50}
              className="w-full h-[120px] rounded-[16px] border border-museum-brown/20 p-3 text-museum-brown text-sm font-normal resize-none focus:outline-none focus:ring-1 focus:ring-museum-gold/30 transition-shadow"
              style={{
                background: 'rgba(255,255,255,0.5)'
              }}
            />
          </div>
          <div className="mb-1">
            <div className="flex items-center justify-end gap-1 mb-1">
              <div className="text-museum-gold text-xs font-medium tracking-wide">{textInput.length}</div>
              <div className="text-museum-brown/60 text-xs font-light tracking-wide">/50</div>
            </div>
            <div className="w-full h-0.5 bg-museum-brown/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-museum-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(textInput.length / 50) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <div>
            <div className="text-museum-brown text-[17px] font-medium mb-3" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>选择书法风格</div>

            <div className="grid grid-cols-2 gap-4">
              {STYLES.map((style, index) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  index={index}
                  selectedStyle={selectedStyle}
                  onSelect={setSelectedStyle}
                />
              ))}
            </div>
          </div>

          {/* Paper Info Section */}
          <div className="mt-6 border-t border-museum-brown/10 pt-4">
            <button
              type="button"
              className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none p-0"
              onClick={() => setShowPaperInfo(!showPaperInfo)}
              aria-expanded={showPaperInfo}
            >
              <div className="text-museum-brown text-[16px] font-medium" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>论文与模型信息</div>
              <motion.div
                animate={{ rotate: showPaperInfo ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-5 h-5 text-museum-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            </button>
            <AnimatePresence>
              {showPaperInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-3 bg-museum-beige/30 rounded-lg">
                    <div className="text-museum-brown font-bold text-sm mb-2">{PAPER_INFO.title}</div>
                    <div className="text-museum-brown/70 text-xs mb-3">{PAPER_INFO.abstract}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/50 p-2 rounded">
                        <div className="text-museum-brown/60 font-medium">模型名称</div>
                        <div className="text-museum-brown">{PAPER_INFO.model}</div>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <div className="text-museum-brown/60 font-medium">API端点</div>
                        <div className="text-museum-brown text-[10px]">{PAPER_INFO.endpoint}</div>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <div className="text-museum-brown/60 font-medium">输入格式</div>
                        <div className="text-museum-brown">{PAPER_INFO.input}</div>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <div className="text-museum-brown/60 font-medium">输出格式</div>
                        <div className="text-museum-brown">{PAPER_INFO.output}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      }
      rightPanel={
        <motion.div
          className="w-full rounded-[24px] p-8 h-full flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(232,227,209,0.2) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.06) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(232,227,209,0.25)',
            boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
          }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >

          <div className="text-center relative z-10">
            <div className="text-museum-brown/80 text-[18px] font-medium mb-6" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>
              生成结果
            </div>

            <div className="relative inline-block">

              {/* Preview circle */}
              <AnimatePresence mode="wait">
                {showResults && resultUrls.length > 0 ? (
                  <motion.div
                    key="result"
                    className="w-[200px] h-[200px] bg-white rounded-full flex items-center justify-center border border-museum-brown/20 mx-auto overflow-hidden shadow-lg"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    {/* 预览第一个字 */}
                    <motion.img
                      src={resultUrls[0]}
                      alt="首字预览"
                      className="w-full h-full object-contain p-2"
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="w-[200px] h-[200px] bg-white rounded-full flex items-center justify-center border border-museum-brown/15 mx-auto"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    {/* Animated brush pen icon */}
                    <motion.svg
                      className="w-16 h-16 text-museum-brown/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </motion.svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="text-museum-brown/70 text-xs font-light mt-4">点击"开始生成"启动</div>
          </div>
        </motion.div>
      }
      resultsSection={
        <AnimatePresence>
          {/* Loading Card */}
          {isLoading && resultUrls.length === 0 && (
            <motion.div
              className="mt-4 flex justify-center"
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div
                className="rounded-[20px] p-8 shadow-lg min-w-[420px] max-w-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(232,227,209,0.25) 0%, rgba(255,255,255,0.2) 50%, rgba(212,167,106,0.08) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232,227,209,0.3)',
                }}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-col items-center gap-6">
                  {/* Dual-ring ink-wash loader */}
                  <div className="relative w-24 h-24">
                    {/* Outer dashed ring - clockwise */}
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 100 100"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#7F3222"
                        strokeWidth="2"
                        strokeDasharray="8 8"
                        strokeLinecap="round"
                      />
                    </motion.svg>

                    {/* Inner gold gradient ring - counter-clockwise */}
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 100 100"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    >
                      <defs>
                        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#D4A76A" />
                          <stop offset="50%" stopColor="#E0C08A" />
                          <stop offset="100%" stopColor="#D4A76A" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="url(#gold-gradient)"
                        strokeWidth="2"
                        strokeDasharray="110 110"
                        strokeLinecap="round"
                      />
                    </motion.svg>

                    {/* Center pulsing brush icon */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{
                        scale: [0.9, 1.1, 0.9]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      <svg
                        className="w-10 h-10 text-museum-gold"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Character-by-character animated loading message */}
                  <div className="flex items-center gap-1">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={statusMessageIndex}
                        className="flex"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {statusMessages[statusMessageIndex].split('').map((char, i) => (
                          <motion.span
                            key={`${statusMessageIndex}-${i}`}
                            className="text-museum-brown font-medium text-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                    {/* Animated dots */}
                    <div className="flex gap-1 ml-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-museum-gold"
                          animate={{
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: 'easeInOut'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Progress bar with shimmer */}
                  <div className="w-full bg-museum-brown/10 rounded-full h-2.5 overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(90deg, #D4A76A 0%, #7F3222 100%)'
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${pollingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Shimmer sweep */}
                      <motion.div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
                        }}
                        animate={{
                          x: ['-100%', '200%']
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    </motion.div>
                  </div>

                  <div className="text-museum-brown/60 text-sm font-medium">
                    {pollingProgress > 0 ? `${Math.round(pollingProgress)}%` : '正在处理...'}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Error Card */}
          {error && !isLoading && (
            <motion.div
              className="mt-4 flex justify-center"
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div
                className="rounded-[20px] p-8 shadow-lg min-w-[340px] max-w-xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(232,227,209,0.25) 0%, rgba(255,255,255,0.2) 50%, rgba(212,167,106,0.08) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >

                <div className="flex flex-col items-center gap-4 relative z-10">
                  {/* Red error icon with shake animation */}
                  <motion.div
                    className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center"
                    animate={{
                      x: [0, -5, 5, -5, 5, 0]
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: 2,
                      repeatDelay: 0.3
                    }}
                  >
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.div>
                  <div className="text-museum-brown font-medium text-lg">处理失败</div>
                  <div className="text-museum-brown/70 text-sm text-center">{error}</div>
                  {/* Retry button with rotating icon on hover */}
                  <motion.button
                    onClick={handleRetry}
                    className="px-6 py-2.5 bg-museum-gold text-white rounded-lg font-medium flex items-center gap-2 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </motion.svg>
                    重试
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 多字书法生成结果横排展示 */}
          {showResults && resultUrls.length > 0 && (
            <motion.div
              className="mt-4 flex justify-center"
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div
                className="rounded-[20px] p-6 lg:p-8 shadow-lg relative overflow-hidden w-full max-w-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(232,227,209,0.25) 0%, rgba(255,255,255,0.2) 50%, rgba(212,167,106,0.08) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232,227,209,0.3)',
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-museum-brown font-medium text-lg lg:text-xl">
                    书法生成结果
                  </div>
                  <div className="text-museum-brown/50 text-sm">
                    共 {resultUrls.length} 字
                  </div>
                </div>

                {/* 单字图横排，每字带模糊入场动画 */}
                <motion.div
                  className="flex flex-wrap gap-3 justify-center"
                  initial={{ filter: 'blur(12px)', opacity: 0 }}
                  animate={{ filter: 'blur(0px)', opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  {resultUrls.map((url, i) => (
                    <motion.div
                      key={url}
                      className="relative group"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.06, duration: 0.4 }}
                    >
                      <img
                        src={url}
                        alt={`第${i + 1}字`}
                        className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] object-contain rounded-lg bg-white border border-museum-brown/10 shadow-sm"
                      />
                      {/* hover 显示下载按钮 */}
                      <a
                        href={url}
                        download
                        className="absolute inset-0 flex items-center justify-center bg-museum-brown/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"
                        title={`下载第${i + 1}字`}
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      }
      actionsSection={
        <ActionButtons
          onSubmit={handleGenerateCalligraphy}
          onClear={handleClear}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel="开始生成"
          loadingLabel="生成中..."
          submitIcon={submitIcon}
          clearIcon={clearIcon}
        />
      }
    />
  );
}
