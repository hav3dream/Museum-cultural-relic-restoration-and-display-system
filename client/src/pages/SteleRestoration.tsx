import React from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import bgImage from '@/assets/2639-101.webp';
import uploadIcon from '@/assets/I2639-127;8899-43674.svg';
import dropzoneIcon from '@/assets/I2639-186;8899-43804.svg';
import result1 from '@/assets/2549-496.webp';
import result2 from '@/assets/2549-497.webp';
import submitIcon from '@/assets/I2647-272;8899-1186.svg';
import clearIcon from '@/assets/I2647-276;2568-128.svg';
import { RestorationLayout, FileUpload, SliderControl, ResultsGallery, ActionButtons, BeforeAfterSlider } from '@/components/restoration';
import { restorationService } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorMessages';

const RESULT_IMAGES = [
  { src: result1, alt: 'before', label: '修复前' },
  { src: result2, alt: 'after', label: '修复后' },
];

const PAPER_INFO = {
  title: 'SGRGAN: 碑刻拓片智能修复与增强',
  authors: '作者团队',
  venue: '学术会议/期刊',
  year: 2024,
  abstract: '利用SGRGAN模型对碑刻拓片进行智能修复和增强处理，恢复因风化侵蚀而模糊不清的碑文内容。',
  model: 'SGRGAN',
  endpoint: 'http://127.0.0.1:5002/inpaint',
  input: '碑刻拓片图像',
  output: '修复后的碑刻图像',
};

export default function SteleRestoration() {
  useDocumentTitle('碑刻修复');

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [restorationStrength, setRestorationStrength] = React.useState(50);
  const [contrastEnhancement, setContrastEnhancement] = React.useState(50);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [showPaperInfo, setShowPaperInfo] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pollingProgress, setPollingProgress] = React.useState(0);
  const [loadingStage, setLoadingStage] = React.useState(0);

  const originalUrl = React.useMemo(
    () => uploadedFile ? URL.createObjectURL(uploadedFile) : null,
    [uploadedFile]
  );

  React.useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  const pollingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingAbortRef = React.useRef<AbortController | null>(null);

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
      pollingAbortRef.current?.abort();
    };
  }, []);

  // Cycle loading stages
  React.useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLoading]);


  const handleStartRestoration = async () => {
    if (!uploadedFile) {
      toast.error('请先上传碑林图像');
      return;
    }
    setIsLoading(true);
    setShowResults(false);
    setResultUrl(null);
    setError(null);
    setPollingProgress(0);
    setLoadingStage(0);

    try {
      const response = await restorationService.restoreStele(
        uploadedFile,
        undefined,
        {
          algorithm: 'SGRGAN',
          strength: restorationStrength,
          contrast: contrastEnhancement
        }
      );

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
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const pollResult = async (id: string) => {
    pollingAbortRef.current = new AbortController();
    const maxAttempts = 150;
    let attempts = 0;

    const poll = async () => {
      attempts++;
      setPollingProgress(Math.min((attempts / maxAttempts) * 100, 95));

      if (attempts >= maxAttempts) {
        setIsLoading(false);
        const timeoutMsg = '请求超时，请检查网络连接或稍后重试';
        setError(timeoutMsg);
        toast.error(timeoutMsg);
        return;
      }

      try {
        const res = await restorationService.getRestorationStatus(id, pollingAbortRef.current?.signal);
        if (res.success && res.data) {
          if (res.data.status === 'completed' && res.data.resultUrls.length > 0) {
            setPollingProgress(100);
            setResultUrl(res.data.resultUrls[0]);
            setShowResults(true);
            setIsLoading(false);
            toast.success('修复完成！');
            return;
          } else if (res.data.status === 'failed') {
            setIsLoading(false);
            const failMsg = '修复失败，请重试';
            setError(failMsg);
            toast.error(failMsg);
            return;
          }
        }
        pollingTimeoutRef.current = setTimeout(poll, 2000);
      } catch (err) {
        setIsLoading(false);
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        toast.error(errorMsg);
      }
    };
    poll();
  };

  const handleClear = () => {
    setUploadedFile(null);
    setRestorationStrength(50);
    setContrastEnhancement(50);
    setShowResults(false);
    setResultUrl(null);
    setError(null);
    setPollingProgress(0);
  };

  const handleCancel = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    setIsLoading(false);
    setPollingProgress(0);
    toast.info('已取消操作');
  };

  const handleRetry = () => {
    setError(null);
    handleStartRestoration();
  };

  return (
    <RestorationLayout
      backgroundImage={bgImage}
      leftPanel={
        <FileUpload
          uploadedFile={uploadedFile}
          onFileUpload={setUploadedFile}
          title="上传碑刻拓片"
          uploadIcon={uploadIcon}
          dropzoneIcon={dropzoneIcon}
          sectionIcon={uploadIcon}
        />
      }
      rightPanel={
        <div
          className="w-full rounded-[24px] p-8 relative"
          style={{
            height: '100%',
            overflowY: 'auto',
            background: 'linear-gradient(135deg, rgba(232,227,209,0.2) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.06) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(232,227,209,0.25)',
            boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-6">
            <img src={uploadIcon} alt="" className="w-7 h-7 opacity-80 object-contain" />
            <div className="text-museum-brown/80 text-[17px] font-medium tracking-wide" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>
              修复参数设置
            </div>
          </div>
          <div className="space-y-6">
            <SliderControl label="修复强度" value={restorationStrength} onChange={setRestorationStrength} />
            <SliderControl label="对比度增强" value={contrastEnhancement} onChange={setContrastEnhancement} />
          </div>
          <div className="mt-8 p-4 rounded-[16px]" style={{
            background: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(232,227,209,0.2)',
          }}>
            <div className="text-museum-brown/60 text-xs font-light">
              调节参数后点击"开始修复"，修复过程需要等待片刻
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
              <div className="text-museum-brown text-[16px] font-medium">论文与模型信息</div>
              <motion.div
                animate={{
                  rotate: showPaperInfo ? 90 : 0
                }}
                transition={{
                  rotate: { duration: 0.2 }
                }}
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

          {showResults && (
            <motion.div className="mt-6 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="text-museum-brown/60 text-xs font-light">修复完成</div>
            </motion.div>
          )}
        </div>
      }
      resultsSection={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading && !resultUrl && (
            <motion.div
              className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-[24px] p-8 max-w-xl text-center" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(232,227,209,0.4) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(232,227,209,0.3)',
                boxShadow: '0 4px 24px rgba(127,50,34,0.06)',
              }}>
                {/* Dual-ring loading animation */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {/* Outer ring - stone colored, dashed, clockwise */}
                  <motion.svg
                    className="absolute inset-0 w-full h-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="rgba(127,50,34,0.4)"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="12 8"
                      opacity="0.6"
                    />
                  </motion.svg>

                  {/* Inner ring - gold gradient, counter-clockwise */}
                  <motion.svg
                    className="absolute inset-0 w-full h-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  >
                    <defs>
                      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(212,167,106,0.6)" />
                        <stop offset="100%" stopColor="rgba(212,167,106,0.8)" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="48"
                      cy="48"
                      r="32"
                      stroke="url(#goldGradient)"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="60 140"
                    />
                  </motion.svg>

                  {/* Center simple dot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-museum-brown/40 rounded-full" />
                  </div>
                </div>

                {/* Animated processing text */}
                <div className="text-museum-brown/80 font-medium text-base mb-2 flex items-center justify-center gap-1">
                  AI模型处理中
                  {/* Animated dots */}
                  <span className="inline-flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      >
                        .
                      </motion.span>
                    ))}
                  </span>
                </div>

                <div className="text-museum-brown/50 text-sm mb-4">
                  请耐心等待，这可能需要几分钟时间
                </div>

                {/* Progress bar */}
                <div className="w-full bg-museum-brown/20 rounded-full h-2 overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, rgba(212,167,106,0.6) 0%, rgba(212,167,106,0.8) 100%)',
                      width: `${pollingProgress}%`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pollingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="text-museum-brown/60 text-xs mt-2">
                  {Math.round(pollingProgress)}%
                </div>

                {/* Stage indicators */}
                <motion.div
                  className="text-museum-brown/50 text-xs mt-3 h-4"
                  key={loadingStage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  {['读取碑刻纹理...', '分析文字结构...', '智能修复重建...', '细节增强处理...'][loadingStage]}
                </motion.div>
              </div>
            </motion.div>
          )}

          {error && !isLoading && (
            <motion.div
              className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-[24px] p-8 text-center max-w-xl relative" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(232,227,209,0.4) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(232,227,209,0.3)',
                boxShadow: '0 4px 24px rgba(127,50,34,0.06)',
              }}>

                {/* Error icon with shake animation */}
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center relative z-10"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.div>

                {/* Title with underline animation */}
                <div className="relative inline-block mb-2">
                  <div className="text-museum-brown font-bold text-lg relative z-10">处理失败</div>
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-red-400/50"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  />
                </div>

                <div className="text-museum-brown/70 text-sm mb-4 mt-4 relative z-10">{error}</div>

                {/* Retry button with spinning icon on hover */}
                <motion.button
                  onClick={handleRetry}
                  className="px-6 py-2 bg-museum-gold text-white rounded-full font-medium hover:bg-museum-gold/90 transition-colors inline-flex items-center gap-2 relative z-10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
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
          )}

          {showResults && resultUrl && originalUrl && (
            <motion.div
              className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div
                className="rounded-[24px] p-6 lg:p-8 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(232,227,209,0.4) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(232,227,209,0.3)',
                  boxShadow: '0 4px 24px rgba(127,50,34,0.06)',
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              >
                {/* Title */}
                <div className="flex items-center gap-2 mb-4 relative">
                  <h3 className="text-museum-brown/80 text-lg lg:text-xl font-medium">
                    修复结果对比
                  </h3>
                </div>

                {/* Images with blur-to-sharp effect */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <BeforeAfterSlider
                    beforeSrc={originalUrl}
                    afterSrc={resultUrl}
                    beforeLabel="原图"
                    afterLabel="修复结果"
                  />
                </motion.div>

                {/* Download link with slide up spring animation */}
                <motion.a
                  href={resultUrl}
                  download
                  className="block mt-3 text-center text-museum-gold hover:underline text-sm transition-all"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  下载修复结果
                </motion.a>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      }
      actionsSection={
        <ActionButtons
          onSubmit={handleStartRestoration}
          onClear={handleClear}
          isLoading={isLoading}
          submitLabel="开始修复"
          loadingLabel="修复中..."
          submitIcon={submitIcon}
          clearIcon={clearIcon}
          onCancel={handleCancel}
        />
      }
    />
  );
}
