import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import bgImage from '@/assets/2539-384.webp';
import sectionIcon from '@/assets/2539-397.svg';
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

const MODES = [
  { id: 'structure', name: '结构风格解析修复', description: '智能分离壁画结构与风格', icon: sectionIcon },
  { id: 'semantic', name: '语义风格修复', description: '基于语义理解的修复技术', icon: sectionIcon },
];

const PAPER_INFO_STRUCTURE = {
  title: 'DCADif: Decoupled Conditional Adaptive Diffusion for Mural Restoration',
  authors: '李超团队',
  venue: '学术会议/期刊',
  year: 2024,
  abstract: '本文提出了一种解耦条件自适应扩散模型（DCADif），专门用于壁画修复任务。通过将条件信息解耦为结构和纹理两部分，实现了对严重破损壁画的高保真修复。',
  model: 'DCADif',
  endpoint: 'http://127.0.0.1:5004/generate',
  input: 'sketch_image（线稿图）+ merged_image（破损壁画）',
  output: '修复后的壁画图像',
};

const PAPER_INFO_SEMANTIC = {
  title: 'M3SFormer: Multi-Scale Multi-Style Semantic Mural Restoration',
  authors: '郭琦芳团队',
  venue: '学术会议/期刊',
  year: 2024,
  abstract: '本文提出了一种多尺度多风格语义壁画修复方法（M3SFormer），运行于内网服务器（127.0.0.1:25565），通过语义理解和风格建模，实现对壁画缺损区域的精准语义填充。',
  model: 'M3SFormer',
  endpoint: 'http://127.0.0.1:25565/api/inpaint',
  input: 'image（破损壁画）+ mask（mask图）',
  output: '修复后的壁画图像',
};

export default function MuralRestoration() {
  useDocumentTitle('壁画修复');

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [sketchFile, setSketchFile] = React.useState<File | null>(null);
  const [selectedMode, setSelectedMode] = React.useState('structure');

  // 根据当前修复模式动态切换论文信息（结构风格→DCADif，语义风格→M3SFormer）
  const paperInfo = selectedMode === 'semantic' ? PAPER_INFO_SEMANTIC : PAPER_INFO_STRUCTURE;
  const [restorationStrength, setRestorationStrength] = React.useState(50);
  const [clarityEnhancement, setClarityEnhancement] = React.useState(50);
  const [isLoading, setIsLoading] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [showPaperInfo, setShowPaperInfo] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pollingProgress, setPollingProgress] = React.useState(0);
  const [statusMessageIndex, setStatusMessageIndex] = React.useState(0);

  const statusMessages = [
    "分析图像结构...",
    "提取特征信息...",
    "生成修复方案...",
    "精细化处理..."
  ];

  const pollingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingAbortRef = React.useRef<AbortController | null>(null);

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
      pollingAbortRef.current?.abort();
    };
  }, []);

  // Cycle through status messages every 5 seconds during loading
  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setStatusMessageIndex((prev) => (prev + 1) % statusMessages.length);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setStatusMessageIndex(0);
    }
  }, [isLoading]);

  const originalUrl = React.useMemo(
    () => uploadedFile ? URL.createObjectURL(uploadedFile) : null,
    [uploadedFile]
  );

  React.useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  const handleStartRestoration = async () => {
    if (!uploadedFile) {
      toast.error('请先上传壁画图像');
      return;
    }
    setIsLoading(true);
    setResultUrl(null);
    setError(null);
    setPollingProgress(0);

    try {
      // 根据修复模式路由到不同 AI 模型
      // structure → DCADif (port 5004): sketch_image + merged_image
      // semantic  → M3SFormer (port 25565): image + mask
      const response = selectedMode === 'semantic'
        ? await restorationService.restoreMuralSemantic(
            uploadedFile,
            sketchFile || undefined,
            { strength: restorationStrength }
          )
        : await restorationService.restoreMural(
            uploadedFile,
            sketchFile || undefined,
            {
              algorithm: 'DCADif',
              strength: restorationStrength,
              clarity: clarityEnhancement,
              mode: selectedMode
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
            const errorMsg = '修复失败：AI模型处理出错，请重试或更换修复模式';
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


  const handleCancel = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    setIsLoading(false);
    setPollingProgress(0);
    toast.info('已取消操作');
  };

  const handleClear = () => {
    setUploadedFile(null);
    setSketchFile(null);
    setSelectedMode('structure');
    setRestorationStrength(50);
    setClarityEnhancement(50);
    setResultUrl(null);
    setError(null);
    setPollingProgress(0);
  };

  const handleRetry = () => {
    setError(null);
    handleStartRestoration();
  };

  return (
    <RestorationLayout
      backgroundImage={bgImage}
      leftPanel={
        <motion.div
          className="flex flex-col gap-6 h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FileUpload
            uploadedFile={uploadedFile}
            onFileUpload={setUploadedFile}
            title="上传壁画图像 (破损图)"
            uploadIcon={sectionIcon}
            dropzoneIcon={sectionIcon}
            sectionIcon={sectionIcon}
          />
          <FileUpload
            uploadedFile={sketchFile}
            onFileUpload={setSketchFile}
            title="上传线稿图 (可选)"
            uploadIcon={sectionIcon}
            dropzoneIcon={sectionIcon}
            sectionIcon={sectionIcon}
            formatHint="DCADif模型使用线稿引导壁画修复"
          />
        </motion.div>
      }
      rightPanel={
        <motion.div
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2.5 mb-6">
            <img src={sectionIcon} alt="" className="w-7 h-7 opacity-80 object-contain" />
            <div className="text-museum-brown/80 text-[17px] font-medium tracking-wide" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>
              修复参数设置
            </div>
          </div>
          <div className="relative">
            <AlgorithmSelector title="修复模式" algorithms={MODES} selected={selectedMode} onSelect={setSelectedMode} />
          </div>
          <div className="space-y-6">
            <SliderControl label="修复强度" value={restorationStrength} onChange={setRestorationStrength} />
            <SliderControl label="清晰度增强" value={clarityEnhancement} onChange={setClarityEnhancement} />
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
                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
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
                    <div className="text-museum-brown font-bold text-sm mb-2">{paperInfo.title}</div>
                    <div className="text-museum-brown/70 text-xs mb-3">{paperInfo.abstract}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/50 p-2 rounded">
                        <div className="text-museum-brown/60 font-medium">模型名称</div>
                        <div className="text-museum-brown">{paperInfo.model}</div>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <div className="text-museum-brown/60 font-medium">API端点</div>
                        <div className="text-museum-brown text-[10px]">{paperInfo.endpoint}</div>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <div className="text-museum-brown/60 font-medium">输入格式</div>
                        <div className="text-museum-brown">{paperInfo.input}</div>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <div className="text-museum-brown/60 font-medium">输出格式</div>
                        <div className="text-museum-brown">{paperInfo.output}</div>
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
              <div className="rounded-[24px] p-8 w-full max-w-2xl" style={{
                background: 'linear-gradient(135deg, rgba(232,227,209,0.2) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.06) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(232,227,209,0.25)',
                boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
              }}>
                <div className="flex flex-col items-center gap-4">
                  {/* Multi-layer ink animation */}
                  <div className="w-24 h-24 relative">
                    {/* Outer dashed ring */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#7F3222"
                          strokeWidth="2"
                          strokeDasharray="8, 8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </motion.div>

                    {/* Inner gradient ring (reverse rotation) */}
                    <motion.div
                      className="absolute inset-2"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7F3222" />
                            <stop offset="100%" stopColor="#D4A76A" />
                          </linearGradient>
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="url(#ringGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray="120, 251"
                        />
                      </svg>
                    </motion.div>

                    {/* Ink drops in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-3 rounded-full"
                          style={{
                            backgroundColor: '#333333',
                            top: '50%',
                            left: '50%',
                            x: '-50%',
                            y: '-50%',
                          }}
                          animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1, 1, 0.5],
                            y: ['-50%', '-70%', '-70%', '-50%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                            times: [0, 0.3, 0.7, 1],
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <motion.div
                      className="text-museum-brown/80 font-medium text-lg mb-2"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      AI模型处理中...
                    </motion.div>
                    <motion.div
                      key={statusMessageIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-museum-brown/50 text-sm"
                    >
                      {statusMessages[statusMessageIndex]}
                    </motion.div>
                  </div>

                  {pollingProgress > 0 && (
                    <div className="w-full">
                      <div className="w-full h-2 bg-museum-brown/8 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-museum-brown/40"
                          initial={{ width: 0 }}
                          animate={{ width: `${pollingProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="text-center text-museum-brown/50 text-xs mt-2">
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
                className="rounded-[24px] p-8 w-full max-w-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(254,226,226,0.3) 0%, rgba(255,255,255,0.2) 50%, rgba(252,165,165,0.1) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(254,202,202,0.3)',
                  boxShadow: '0 4px 24px rgba(220,38,38,0.08), 0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-red-100/50 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-red-700/80 font-medium text-lg mb-2">处理失败</div>
                    <div className="text-red-600/70 text-sm">{error}</div>
                  </div>
                  <motion.button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-museum-beige hover:bg-museum-gold text-museum-brown rounded-lg font-medium transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    重试
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          {resultUrl && originalUrl && (
            <motion.div
              className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="rounded-[24px] p-6 lg:p-8 w-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(232,227,209,0.2) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.06) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232,227,209,0.25)',
                  boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-4">
                  <h3 className="text-museum-brown/80 text-lg lg:text-xl font-medium">修复结果对比</h3>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <BeforeAfterSlider
                    beforeSrc={originalUrl}
                    afterSrc={resultUrl}
                    beforeLabel="原图"
                    afterLabel="修复结果"
                  />
                </motion.div>
                <motion.a
                  href={resultUrl}
                  download="restored-mural.png"
                  className="block mt-3 text-center text-museum-gold/80 hover:text-museum-gold hover:underline text-sm transition-all"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  下载修复结果
                </motion.a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      }
      actionsSection={
        <ActionButtons
          onSubmit={handleStartRestoration}
          onClear={handleClear}
          isLoading={isLoading}
          submitLabel="开始修复"
          loadingLabel="AI处理中..."
          submitIcon={submitIcon}
          clearIcon={clearIcon}
          onCancel={handleCancel}
        />
      }
    />
  );
}
