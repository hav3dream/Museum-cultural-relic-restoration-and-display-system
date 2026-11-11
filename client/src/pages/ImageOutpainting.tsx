import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import bgImage from '@/assets/2686-142.webp';
import sectionIcon from '@/assets/I2686-122-8899-30891.svg';
import submitIcon from '@/assets/I2647-272;8899-1186.svg';
import clearIcon from '@/assets/I2647-276;2568-128.svg';
import {
  RestorationLayout,
  FileUpload,
  ActionButtons,
  BeforeAfterSlider,
} from '@/components/restoration';
import { restorationService } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorMessages';

const PAPER_INFO = {
  title: 'CLPOTR: Contrastive Learning-based Painting Outpainting with Transformer',
  authors: '刘天飞团队',
  model: 'CLPOTR',
  endpoint: 'http://127.0.0.1:5012/predict',
  input: '任意尺寸图像（JPG/PNG）',
  output: '外推扩展后的图像（PNG）',
  abstract: '基于对比学习与 Transformer 的图像外推模型，能够将输入图像向外自然延伸，生成符合原画风格与场景的扩展画面，适用于古画边缘补全与画幅延伸。',
};

export default function ImageOutpainting() {
  useDocumentTitle('图像外推');

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [showPaperInfo, setShowPaperInfo] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pollingProgress, setPollingProgress] = React.useState(0);
  const [statusMessageIndex, setStatusMessageIndex] = React.useState(0);

  const pollingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingAbortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => () => { pollingTimeoutRef.current && clearTimeout(pollingTimeoutRef.current); pollingAbortRef.current?.abort(); }, []);
  React.useEffect(() => {
    if (isLoading) {
      const iv = setInterval(() => setStatusMessageIndex(p => (p + 1) % 4), 4000);
      return () => clearInterval(iv);
    } else setStatusMessageIndex(0);
  }, [isLoading]);

  const originalUrl = React.useMemo(() => uploadedFile ? URL.createObjectURL(uploadedFile) : null, [uploadedFile]);
  React.useEffect(() => () => { if (originalUrl) URL.revokeObjectURL(originalUrl); }, [originalUrl]);

  const handleSubmit = async () => {
    if (!uploadedFile) { toast.error('请先上传图像'); return; }
    setIsLoading(true); setResultUrl(null); setError(null); setPollingProgress(0);
    try {
      const response = await restorationService.outpaintImage(uploadedFile);
      if (response.success && response.data) {
        toast.info('任务已提交，正在外推中...');
        pollResult(response.data.id);
      } else {
        setIsLoading(false);
        const msg = getErrorMessage(response.error);
        setError(msg); toast.error(msg);
      }
    } catch {
      setIsLoading(false);
      const msg = '网络连接失败，请检查AI服务是否正常运行';
      setError(msg); toast.error(msg);
    }
  };

  const pollResult = (id: string) => {
    pollingAbortRef.current = new AbortController();
    let attempts = 0;
    const poll = async () => {
      attempts++;
      setPollingProgress(Math.min((attempts / 150) * 100, 95));
      try {
        const res = await restorationService.getRestorationStatus(id, pollingAbortRef.current?.signal);
        if (res.success && res.data) {
          if (res.data.status === 'completed' && res.data.resultUrls.length > 0) {
            setResultUrl(res.data.resultUrls[0]);
            setIsLoading(false); setPollingProgress(100);
            toast.success('图像外推完成！'); return;
          } else if (res.data.status === 'failed') {
            setIsLoading(false);
            const msg = getErrorMessage(res.data.errorMessage || '外推失败');
            setError(msg); toast.error(msg); return;
          }
        }
        if (attempts >= 150) { setIsLoading(false); setError('处理超时，请重试'); return; }
        pollingTimeoutRef.current = setTimeout(poll, 2000);
      } catch { setIsLoading(false); setError('获取状态失败'); }
    };
    poll();
  };

  const handleClear = () => {
    setUploadedFile(null); setResultUrl(null); setError(null); setPollingProgress(0);
  };

  const panelStyle: React.CSSProperties = {
    height: '100%', overflowY: 'auto',
    background: 'linear-gradient(135deg,rgba(232,227,209,0.2),rgba(255,255,255,0.15) 50%,rgba(212,167,106,0.06))',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(232,227,209,0.25)',
    boxShadow: '0 4px 24px rgba(127,50,34,0.06)',
  };

  return (
    <RestorationLayout
      backgroundImage={bgImage}
      leftPanel={
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <FileUpload uploadedFile={uploadedFile} onFileUpload={setUploadedFile}
            title="上传图像" uploadIcon={sectionIcon} dropzoneIcon={sectionIcon} sectionIcon={sectionIcon} />
        </motion.div>
      }
      rightPanel={
        <motion.div className="w-full rounded-[24px] p-4 sm:p-6 lg:p-8 relative overflow-hidden" style={panelStyle}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <img src={sectionIcon} alt="" className="w-7 h-7 opacity-80" />
            <span className="text-museum-brown/80 text-[17px] font-medium" style={{ fontFamily: "'LXGW WenKai', serif" }}>图像外推</span>
          </div>
          <div className="text-museum-brown/60 text-sm leading-relaxed mb-6" style={{ fontFamily: "'LXGW WenKai', serif" }}>
            基于对比学习与 Transformer 自动延伸图像边界，生成符合原画风格的扩展画面。<br />
            适用于古画残损边缘补全、画幅延伸等场景。
          </div>

          <div className="border-t border-museum-brown/10 pt-4">
            <button type="button" className="w-full flex items-center justify-between bg-transparent border-none p-0 cursor-pointer"
              onClick={() => setShowPaperInfo(!showPaperInfo)}>
              <span className="text-museum-brown text-[16px] font-medium" style={{ fontFamily: "'LXGW WenKai', serif" }}>论文与模型信息</span>
              <motion.span animate={{ rotate: showPaperInfo ? 90 : 0 }} transition={{ type: 'spring', bounce: 0.4 }}>
                <svg className="w-5 h-5 text-museum-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.span>
            </button>
            <AnimatePresence>
              {showPaperInfo && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="mt-3 p-3 bg-museum-beige/30 rounded-lg">
                    <div className="text-museum-brown font-bold text-sm mb-2">{PAPER_INFO.title}</div>
                    <div className="text-museum-brown/70 text-xs mb-3">{PAPER_INFO.abstract}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[['模型名称', PAPER_INFO.model], ['API端点', PAPER_INFO.endpoint], ['输入格式', PAPER_INFO.input], ['输出格式', PAPER_INFO.output]].map(([k, v]) => (
                        <div key={k} className="bg-white/50 p-2 rounded">
                          <div className="text-museum-brown/60 font-medium">{k}</div>
                          <div className="text-museum-brown text-[10px] break-all">{v}</div>
                        </div>
                      ))}
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
          {isLoading && (
            <motion.div className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="rounded-[24px] p-5 sm:p-8 w-full max-w-2xl" style={{
                background: 'linear-gradient(135deg,rgba(255,255,255,0.8),rgba(232,227,209,0.4))',
                backdropFilter: 'blur(16px)', border: '1px solid rgba(232,227,209,0.3)',
              }}>
                <div className="flex flex-col items-center gap-4">
                  <motion.svg className="w-16 h-16" viewBox="0 0 100 100" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(212,167,106,0.4)" strokeWidth="2" strokeDasharray="60 100" />
                  </motion.svg>
                  <div className="text-museum-brown font-medium flex items-center gap-1">
                    正在外推图像
                    {[0,1,2].map(i => <motion.span key={i} animate={{ opacity: [0,1,0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i*0.3 }}>.</motion.span>)}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div key={statusMessageIndex} className="text-museum-brown/60 text-sm"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {['分析图像边界...','学习画面风格...','生成扩展区域...','融合边缘过渡...'][statusMessageIndex]}
                    </motion.div>
                  </AnimatePresence>
                  {pollingProgress > 0 && (
                    <div className="w-full h-2 bg-museum-brown/10 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(to right,rgba(212,167,106,0.6),rgba(212,167,106,0.8))' }}
                        initial={{ width: 0 }} animate={{ width: `${pollingProgress}%` }} transition={{ duration: 0.5 }} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {error && !isLoading && (
            <motion.div className="mt-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="rounded-[24px] p-6 text-center" style={{
                background: 'linear-gradient(135deg,rgba(254,202,202,0.5),rgba(255,255,255,0.6))',
                border: '1px solid rgba(239,68,68,0.2)',
              }}>
                <div className="text-red-700 font-medium mb-1">外推失败</div>
                <div className="text-red-600 text-sm mb-3">{error}</div>
                <button onClick={() => { setError(null); handleSubmit(); }}
                  className="px-5 py-2 bg-museum-beige hover:bg-museum-gold text-museum-brown rounded-lg text-sm font-medium transition-colors">重试</button>
              </div>
            </motion.div>
          )}
          {resultUrl && originalUrl && (
            <motion.div className="mt-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="rounded-[24px] p-6" style={{
                background: 'linear-gradient(135deg,rgba(255,255,255,0.85),rgba(232,227,209,0.3))',
                backdropFilter: 'blur(16px)', border: '1px solid rgba(232,227,209,0.3)',
              }}>
                <h3 className="text-museum-brown text-lg font-medium mb-4">外推结果对比</h3>
                <BeforeAfterSlider beforeSrc={originalUrl} afterSrc={resultUrl} beforeLabel="原图" afterLabel="外推结果" />
                <a href={resultUrl} download className="block mt-3 text-center text-museum-gold hover:underline text-sm">下载外推图像</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      }
      actionsSection={
        <ActionButtons
          onSubmit={handleSubmit} onClear={handleClear}
          onCancel={() => { pollingTimeoutRef.current && clearTimeout(pollingTimeoutRef.current); setIsLoading(false); }}
          isLoading={isLoading} submitLabel="开始外推" loadingLabel="AI外推中..." submitIcon={submitIcon} clearIcon={clearIcon}
        />
      }
    />
  );
}
