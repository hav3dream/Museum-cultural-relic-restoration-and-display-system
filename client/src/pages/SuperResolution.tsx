import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import bgImage from '@/assets/2672-653.webp';
import sectionIcon from '@/assets/I2686-122-8899-30891.svg';
import submitIcon from '@/assets/I2647-272;8899-1186.svg';
import clearIcon from '@/assets/I2647-276;2568-128.svg';
import {
  RestorationLayout,
  FileUpload,
  AlgorithmSelector,
  SliderControl,
  ActionButtons,
  BeforeAfterSlider,
} from '@/components/restoration';
import { restorationService } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorMessages';

const MODELS = [
  { id: 'convsrgan', name: 'ConvSRGAN', description: '卷积超分辨率生成对抗网络，专为文物图像优化', icon: sectionIcon },
];

const PAPER_INFO = {
  title: 'ConvSRGAN: Super-Resolution for Cultural Heritage Image Enhancement',
  authors: '刘天飞团队',
  venue: '学术会议/期刊',
  year: 2024,
  abstract: '本文提出了一种基于卷积超分辨率生成对抗网络（ConvSRGAN）的文物图像增强方法，能够将低分辨率文物、壁画图像重建为高清晰度版本，在保留纹理细节的同时有效提升图像质量。',
  model: 'ConvSRGAN',
  endpoint: 'http://127.0.0.1:5006/enhance',
  input: '低分辨率图像（JPG/PNG）+ outscale（放大倍数）',
  output: '高分辨率重建图像（PNG）',
};

export default function SuperResolution() {
  useDocumentTitle('超分重建');

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [selectedModel, setSelectedModel] = React.useState('convsrgan');
  const [scaleFactor, setScaleFactor] = React.useState(50);
  const [denoiseStrength, setDenoiseStrength] = React.useState(30);
  const [isLoading, setIsLoading] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
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

  const originalUrl = React.useMemo(
    () => uploadedFile ? URL.createObjectURL(uploadedFile) : null,
    [uploadedFile]
  );

  React.useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  React.useEffect(() => {
    return () => {
      if (resultUrl && resultUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setStatusMessageIndex((prev) => (prev + 1) % 4);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setStatusMessageIndex(0);
    }
  }, [isLoading]);

  const handleStartAnalysis = async () => {
    if (!uploadedFile) {
      toast.error('请先上传图像');
      return;
    }
    setIsLoading(true);
    setResultUrl(null);
    setError(null);
    setPollingProgress(0);

    try {
      const response = await restorationService.superResolution(uploadedFile, {
        scale: scaleFactor,
        model: selectedModel,
        denoise: denoiseStrength
      });

      if (response.success && response.data) {
        toast.info('任务已提交，正在处理中...');
        pollResult(response.data.id);
      } else {
        setIsLoading(false);
        const errorMsg = getErrorMessage(response.error);
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setIsLoading(false);
      const errorMsg = '网络连接失败，请检查AI服务是否正常运行';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const pollResult = async (id: string) => {
    pollingAbortRef.current = new AbortController();
    let attempts = 0;
    const maxAttempts = 150; // 5 minutes max (150 * 2 seconds)

    const poll = async () => {
      attempts++;
      setPollingProgress(Math.min((attempts / maxAttempts) * 100, 95));

      try {
        const res = await restorationService.getRestorationStatus(id, pollingAbortRef.current?.signal);
        if (res.success && res.data) {
          if (res.data.status === 'completed' && res.data.resultUrls.length > 0) {
            setResultUrl(res.data.resultUrls[0]);
            setIsLoading(false);
            setPollingProgress(100);
            toast.success('重建完成！');
            return;
          } else if (res.data.status === 'failed') {
            setIsLoading(false);
            const errorMsg = '重建失败：AI模型处理出错，请重试或更换算法';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
          }
        }

        if (attempts >= maxAttempts) {
          setIsLoading(false);
          const errorMsg = '处理超时，请重试或联系技术支持';
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        pollingTimeoutRef.current = setTimeout(poll, 2000);
      } catch (err) {
        setIsLoading(false);
        const errorMsg = '获取处理状态失败，请检查网络连接';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    };
    poll();
  };


  const handleClear = () => {
    setUploadedFile(null);
    setSelectedModel('convsrgan');
    setScaleFactor(50);
    setDenoiseStrength(30);
    setResultUrl(null);
    setError(null);
    setPollingProgress(0);
  };

  const handleRetry = () => {
    setError(null);
    handleStartAnalysis();
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FileUpload
            uploadedFile={uploadedFile}
            onFileUpload={setUploadedFile}
            title="上传低分辨率图像"
            uploadIcon={sectionIcon}
            dropzoneIcon={sectionIcon}
            sectionIcon={sectionIcon}
          />
        </motion.div>
      }
      rightPanel={
        <motion.div
          className="w-full rounded-[24px] p-8 relative overflow-hidden"
          style={{
            height: '100%', overflowY: 'auto',
            background: 'linear-gradient(135deg, rgba(232,227,209,0.2) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.06) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(232,227,209,0.25)',
            boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative" style={{ zIndex: 1 }}>
            <div className="flex items-center gap-2.5 mb-6">
              <img src={sectionIcon} alt="" className="w-7 h-7 opacity-80 object-contain" />
              <div className="text-museum-brown/80 text-[17px] font-medium tracking-wide" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>
                增强参数设置
              </div>
            </div>
            <AlgorithmSelector
              title="超分模型"
              algorithms={MODELS}
              selected={selectedModel}
              onSelect={setSelectedModel}
            />

            <div className="mt-6" />

            <SliderControl label="放大倍数" value={scaleFactor} onChange={setScaleFactor} leftLabel="2x" rightLabel="8x" />

            <div className="mt-6" />

            <SliderControl label="降噪强度" value={denoiseStrength} onChange={setDenoiseStrength} leftLabel="低" rightLabel="高" />

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
                transition={{ type: 'spring', bounce: 0.4 }}
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
          </div>
        </motion.div>
      }
      resultsSection={
        <AnimatePresence>
          {isLoading && !resultUrl && (
            <motion.div
              className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-[24px] p-8 w-full max-w-2xl" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(232,227,209,0.4) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(232,227,209,0.3)',
                boxShadow: '0 4px 24px rgba(127,50,34,0.06)',
              }}>
                <div className="flex flex-col items-center gap-4">
                  {/* Enhanced Line-Drawing Loader */}
                  <div className="w-24 h-24 relative">
                    {/* Outer ring - thin dashed stroke rotating clockwise */}
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 100 100"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(127,50,34,0.3)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="8, 4"
                      />
                    </motion.svg>

                    {/* Inner ring - gold gradient rotating counter-clockwise */}
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 100 100"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    >
                      <defs>
                        <linearGradient id="goldGradient-super" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(212,167,106,0.5)" />
                          <stop offset="50%" stopColor="rgba(224,192,138,0.6)" />
                          <stop offset="100%" stopColor="rgba(212,167,106,0.5)" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="url(#goldGradient-super)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="90, 130"
                      />
                    </motion.svg>

                    {/* Center pulsing simple circle */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="8"
                      fill="rgba(212,167,106,0.4)"
                      animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.6, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-museum-brown font-medium text-base mb-2 flex items-center justify-center gap-0.5">
                      AI处理中
                      {/* Animated ellipsis */}
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={`dot-${i}`}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        >
                          .
                        </motion.span>
                      ))}
                    </div>

                    {/* Cycling stage messages */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={statusMessageIndex}
                        className="text-museum-brown/60 text-sm h-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                      >
                        {['提取图像特征...', '增强图像分辨率...', '优化纹理细节...', '生成高清图像...'][statusMessageIndex]}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {pollingProgress > 0 && (
                    <div className="w-full">
                      <div className="w-full h-2 bg-museum-brown/10 rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(to right, rgba(212,167,106,0.6), rgba(212,167,106,0.8))' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pollingProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="text-center text-museum-brown/60 text-xs mt-2">
                        处理进度: {Math.round(pollingProgress)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {error && !isLoading && (
            <motion.div
              className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-[24px] p-8 w-full max-w-2xl relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(254,202,202,0.5) 0%, rgba(255,255,255,0.6) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(239,68,68,0.2)',
                boxShadow: '0 4px 24px rgba(239,68,68,0.08)',
              }}>
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    {/* X icon with shake animation */}
                    <motion.svg
                      className="w-8 h-8 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: [0, -5, 5, -3, 3, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </motion.svg>
                  </div>
                  <div className="text-center">
                    <div className="text-red-700 font-medium text-base mb-2">处理失败</div>
                    <div className="text-red-600 text-sm">
                      {error}
                    </div>
                  </div>
                  <motion.button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-museum-beige hover:bg-museum-gold text-museum-brown rounded-lg font-medium transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Rotating refresh icon on hover */}
                    <motion.svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </motion.svg>
                    重试
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          {resultUrl && originalUrl && (
            <motion.div
              className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Container with vertical wipe reveal */}
              <motion.div
                className="rounded-[24px] p-6 lg:p-8 relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(232,227,209,0.3) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(232,227,209,0.3)',
                  boxShadow: '0 4px 24px rgba(127,50,34,0.08)',
                }}
                initial={{ y: 20, clipPath: 'inset(0 0 100% 0)' }}
                animate={{ y: 0, clipPath: 'inset(0 0 0 0)' }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                {/* Title */}
                <div className="flex items-center gap-2 mb-4 relative">
                  <h3 className="text-museum-brown text-lg lg:text-xl font-medium">
                    超分重建对比
                  </h3>
                </div>

                {/* BeforeAfterSlider with blur-to-sharp effect */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(15px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 0.6, duration: 0.6, type: 'spring' }}
                >
                  <BeforeAfterSlider
                    beforeSrc={originalUrl}
                    afterSrc={resultUrl}
                    beforeLabel="原图"
                    afterLabel="超分结果"
                  />
                </motion.div>

                {/* Download link with spring slide-up animation */}
                <motion.a
                  href={resultUrl}
                  download
                  className="block mt-3 text-center text-museum-gold hover:underline text-sm transition-all"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 1.2,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  下载高清图像
                </motion.a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      }
      actionsSection={
        <ActionButtons
          onSubmit={handleStartAnalysis}
          onClear={handleClear}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel="开始重建"
          loadingLabel="AI处理中..."
          submitIcon={submitIcon}
          clearIcon={clearIcon}
        />
      }
    />
  );
}
