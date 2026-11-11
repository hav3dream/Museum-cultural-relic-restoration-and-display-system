import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import bgImage from '@/assets/2537-33.webp';
import sectionIcon from '@/assets/I2537-55;8899-58194.svg';
import dropzoneIcon from '@/assets/I2537-60;8899-43804.svg';
import algoIcon1 from '@/assets/I2538-295;8899-59881.svg';
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

const ALGORITHMS = [
  { id: 'Mamba', name: 'Mamba融合修复', description: '基于Mamba/IGILR模型', icon: algoIcon1 },
];

const PAPER_INFO = {
  title: 'IGILR: Image-Guided Inpainting with Learned Representations',
  model: 'Mamba/IGILR',
  endpoint: 'http://127.0.0.1:5000/predict',
  input: '原始图像 + Mask遮罩',
  output: '修复后的图像',
};

export default function FusionRepair() {
  useDocumentTitle('古画融合修复');

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [maskFile, setMaskFile] = React.useState<File | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = React.useState('Mamba');
  const [restorationStrength, setRestorationStrength] = React.useState(50);
  const [isLoading, setIsLoading] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [restorationId, setRestorationId] = React.useState<string | null>(null);
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
    if (!isLoading) return;
    const interval = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleStartGeneration = async () => {
    if (!uploadedFile) {
      toast.error('请先上传古画图像');
      return;
    }
    if (!maskFile) {
      toast.error('请上传Mask遮罩图（必需）');
      return;
    }
    setIsLoading(true);
    setResultUrl(null);
    setError(null);
    setPollingProgress(0);

    try {
      const response = await restorationService.fusionRepair(uploadedFile, maskFile);

      if (response.success && response.data) {
        setRestorationId(response.data.id);
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
            toast.success('修复完成！');
            return;
          } else if (res.data.status === 'failed') {
            setIsLoading(false);
            const errorMsg = '修复失败：AI模型处理出错，请重试';
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
    setMaskFile(null);
    setSelectedAlgorithm('Mamba');
    setRestorationStrength(50);
    setResultUrl(null);
    setRestorationId(null);
    setError(null);
    setPollingProgress(0);
  };

  const handleRetry = () => {
    setError(null);
    handleStartGeneration();
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
        <div className="flex flex-col gap-6 h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FileUpload
              uploadedFile={uploadedFile}
              onFileUpload={setUploadedFile}
              title="上传需要修复的古画"
              uploadIcon={sectionIcon}
              dropzoneIcon={dropzoneIcon}
              sectionIcon={sectionIcon}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FileUpload
              uploadedFile={maskFile}
              onFileUpload={setMaskFile}
              title="上传Mask遮罩图 (必需)"
              uploadIcon={sectionIcon}
              dropzoneIcon={dropzoneIcon}
              sectionIcon={sectionIcon}
              formatHint="标记需要修复的区域，白色=修复区域"
            />
          </motion.div>
        </div>
      }
      rightPanel={
        <motion.div
          className="w-full rounded-[24px] p-8 relative overflow-hidden"
          style={{
            height: '100%',
            overflowY: 'auto',
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
          <div className="flex items-center gap-2.5 mb-6" style={{ zIndex: 1 }}>
            <img src={sectionIcon} alt="" className="w-7 h-7 opacity-80 object-contain" />
            <div className="text-museum-brown/80 text-[17px] font-medium tracking-wide" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>
              修复参数设置
            </div>
          </div>
          <div style={{ zIndex: 1, position: 'relative' }}>
            <AlgorithmSelector
              title="修复算法"
              algorithms={ALGORITHMS}
              selected={selectedAlgorithm}
              onSelect={setSelectedAlgorithm}
            />
          </div>

          <div style={{ zIndex: 1, position: 'relative' }} className="mt-6">
            <SliderControl label="修复强度" value={restorationStrength} onChange={setRestorationStrength} />
          </div>

          {/* Paper Info Section */}
          <div className="mt-6 border-t border-museum-brown/10 pt-4 relative" style={{ zIndex: 1 }}>
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
              <div
                className="rounded-[24px] p-8 w-full max-w-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(232,227,209,0.2) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.06) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232,227,209,0.25)',
                  boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  {/* Dual-ring ink-wash loader */}
                  <div className="w-24 h-24 relative">
                    {/* Outer ring - dashed, clockwise */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                    >
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="rgba(127,50,34,0.4)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray="15, 10"
                        />
                      </svg>
                    </motion.div>
                    {/* Inner ring - gradient, counter-clockwise */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(212,167,106,0.5)" />
                            <stop offset="100%" stopColor="rgba(127,50,34,0.5)" />
                          </linearGradient>
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="30"
                          fill="none"
                          stroke="url(#ring-gradient)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray="120, 188"
                        />
                      </svg>
                    </motion.div>
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: 'rgba(127,50,34,0.3)' }}
                        animate={{
                          opacity: [0.3, 0.7, 0.3],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      />
                    </div>
                  </div>

                  {/* Pulsing text */}
                  <div className="text-center">
                    <div className="text-museum-brown/80 font-medium text-base mb-2 flex items-center justify-center">
                      <span>AI模型处理中</span>
                      {/* Animated dots */}
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
                    {/* Cycling status messages */}
                    <motion.div
                      key={statusMessageIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="text-museum-brown/60 text-sm"
                    >
                      {['分析画作结构...', '提取特征信息...', '生成修复方案...', '精细化处理...'][statusMessageIndex]}
                    </motion.div>
                  </div>

                  {pollingProgress > 0 && (
                    <div className="w-full">
                      <div className="w-full h-2 bg-museum-brown/10 rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, rgba(212,167,106,0.6) 0%, rgba(127,50,34,0.5) 100%)',
                          }}
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
              <div
                className="rounded-[24px] p-8 w-full max-w-2xl relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(254,242,242,0.3) 0%, rgba(255,255,255,0.2) 50%, rgba(254,226,226,0.15) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  boxShadow: '0 4px 24px rgba(239,68,68,0.08), 0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-red-50/80 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-red-500/80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-red-700/80 font-medium text-base mb-2">处理失败</div>
                    <div className="text-red-600/70 text-sm">{error}</div>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-museum-beige/80 hover:bg-museum-gold/60 text-museum-brown/80 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    重试
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {resultUrl && originalUrl && (
            <motion.div
              className="mt-4 flex flex-col items-center relative"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="rounded-[24px] p-6 lg:p-8 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(232,227,209,0.2) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.06) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232,227,209,0.25)',
                  boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center gap-2 mb-4 relative">
                  <h3 className="text-museum-brown/80 text-lg lg:text-xl font-medium">修复结果对比</h3>
                </div>
                <div>
                  <BeforeAfterSlider
                    beforeSrc={originalUrl}
                    afterSrc={resultUrl}
                    beforeLabel="原图"
                    afterLabel="修复结果"
                  />
                </div>
                <a
                  href={resultUrl}
                  download="fusion-repaired-painting.png"
                  className="block mt-3 text-center text-museum-gold/80 hover:text-museum-gold hover:underline text-sm transition-all"
                >
                  下载修复结果
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      }
      actionsSection={
        <ActionButtons
          onSubmit={handleStartGeneration}
          onClear={handleClear}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel="开始生成"
          loadingLabel="AI处理中..."
          submitIcon={submitIcon}
          clearIcon={clearIcon}
        />
      }
    />
  );
}
