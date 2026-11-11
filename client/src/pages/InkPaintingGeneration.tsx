import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import bgImage from '@/assets/2661-583.webp';
import sectionIcon from '@/assets/I2661-571-8899-43674.svg';
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

type Mode = 'fhs' | 'fda';

const PAPER_FHS = {
  title: 'FHS-Adapter: Fine-grained Historical Style Landscape Painting Generation',
  authors: '冯浮潜团队',
  venue: '学术会议/期刊',
  year: 2024,
  abstract: '基于 Stable Diffusion + ControlNet 的文本引导山水画生成模型，通过历史背景、画面内容、意境情绪、诗句四维文本描述精准生成高质量传统山水画。',
  model: 'FHSAdapter',
  endpoint: 'http://127.0.0.1:5009/generate-fhs',
  input: '四组文本描述（纯文字）',
  output: '传统山水画（PNG）',
};

const PAPER_FDA = {
  title: 'FDA-Chi: Fine-grained Diffusion Alignment for Chinese Painting Generation',
  authors: '冯浮潜团队',
  venue: '学术会议/期刊',
  year: 2024,
  abstract: '在 FHS-adapter 基础上引入图像引导，将用户提供的参考图与四维文本融合，生成风格更贴近参考图的中国画作品。',
  model: 'FDAChi',
  endpoint: 'http://127.0.0.1:5011/generate',
  input: '四组文本 + 引导图像',
  output: '中国画（PNG）',
};

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg bg-white/60 border border-museum-brown/20 text-museum-brown placeholder-museum-brown/40 focus:outline-none focus:border-museum-brown/50 focus:bg-white/80 transition-all resize-none';

export default function InkPaintingGeneration() {
  useDocumentTitle('山水画生成');

  const [mode, setMode] = React.useState<Mode>('fhs');
  const [prompt1, setPrompt1] = React.useState('');
  const [prompt2, setPrompt2] = React.useState('');
  const [prompt3, setPrompt3] = React.useState('');
  const [prompt4, setPrompt4] = React.useState('');
  const [guideFile, setGuideFile] = React.useState<File | null>(null);

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
    } else { setStatusMessageIndex(0); }
  }, [isLoading]);

  const paperInfo = mode === 'fhs' ? PAPER_FHS : PAPER_FDA;

  const handleSubmit = async () => {
    if (!prompt1.trim() || !prompt2.trim() || !prompt3.trim() || !prompt4.trim()) {
      toast.error('请填写全部四组文字描述');
      return;
    }
    if (mode === 'fda' && !guideFile) {
      toast.error('图文融合模式需要上传引导图像');
      return;
    }
    setIsLoading(true);
    setResultUrl(null);
    setError(null);
    setPollingProgress(0);

    try {
      const response = mode === 'fhs'
        ? await restorationService.submitInkPainting(prompt1, prompt2, prompt3, prompt4)
        : await restorationService.submitFDAChi(guideFile!, prompt1, prompt2, prompt3, prompt4);

      if (response.success && response.data) {
        toast.info('任务已提交，正在生成中...');
        pollResult(response.data.id);
      } else {
        setIsLoading(false);
        const msg = getErrorMessage(response.error);
        setError(msg);
        toast.error(msg);
      }
    } catch {
      setIsLoading(false);
      const msg = '网络连接失败，请检查AI服务是否正常运行';
      setError(msg);
      toast.error(msg);
    }
  };

  const pollResult = (id: string) => {
    pollingAbortRef.current = new AbortController();
    let attempts = 0;
    const max = 150;
    const poll = async () => {
      attempts++;
      setPollingProgress(Math.min((attempts / max) * 100, 95));
      try {
        const res = await restorationService.getRestorationStatus(id, pollingAbortRef.current?.signal);
        if (res.success && res.data) {
          if (res.data.status === 'completed' && res.data.resultUrls.length > 0) {
            setResultUrl(res.data.resultUrls[0]);
            setIsLoading(false);
            setPollingProgress(100);
            toast.success('山水画生成完成！');
            return;
          } else if (res.data.status === 'failed') {
            setIsLoading(false);
            const msg = getErrorMessage(res.data.errorMessage || '生成失败');
            setError(msg);
            toast.error(msg);
            return;
          }
        }
        if (attempts >= max) {
          setIsLoading(false);
          setError('处理超时，请重试');
          return;
        }
        pollingTimeoutRef.current = setTimeout(poll, 2000);
      } catch { setIsLoading(false); setError('获取状态失败'); }
    };
    poll();
  };

  const handleClear = () => {
    setPrompt1(''); setPrompt2(''); setPrompt3(''); setPrompt4('');
    setGuideFile(null);
    setResultUrl(null); setError(null); setPollingProgress(0);
  };

  const panelStyle: React.CSSProperties = {
    height: '100%', overflowY: 'auto',
    background: 'linear-gradient(135deg, rgba(232,227,209,0.2) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.06) 100%)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(232,227,209,0.25)',
    boxShadow: '0 4px 24px rgba(127,50,34,0.06)',
  };

  return (
    <RestorationLayout
      backgroundImage={bgImage}
      leftPanel={
        <motion.div className="w-full rounded-[24px] p-4 sm:p-6 relative overflow-hidden"
          style={panelStyle}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 mb-5">
            <img src={sectionIcon} alt="" className="w-6 h-6 opacity-80" />
            <span className="text-museum-brown/80 text-[15px] font-medium" style={{ fontFamily: "'LXGW WenKai', serif" }}>生成模式</span>
          </div>
          <div className="flex rounded-xl overflow-hidden border border-museum-brown/20 mb-6">
            {(['fhs', 'fda'] as Mode[]).map(m => (
              <button key={m} type="button"
                className={`flex-1 py-2 text-sm font-medium transition-all ${mode === m ? 'bg-museum-brown text-white' : 'bg-white/40 text-museum-brown/70 hover:bg-white/60'}`}
                onClick={() => setMode(m)}
              >
                {m === 'fhs' ? '文字驱动' : '图文融合'}
              </button>
            ))}
          </div>

          {/* Guide image (FDA only) */}
          <AnimatePresence>
            {mode === 'fda' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5">
                <FileUpload uploadedFile={guideFile} onFileUpload={setGuideFile}
                  title="上传引导图像" uploadIcon={sectionIcon} dropzoneIcon={sectionIcon} sectionIcon={sectionIcon} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4 Prompt Inputs */}
          <div className="space-y-3">
            {[
              { label: '历史背景', value: prompt1, set: setPrompt1, placeholder: '如：唐代山水，王维诗意境...' },
              { label: '画面内容', value: prompt2, set: setPrompt2, placeholder: '如：远山叠嶂，飞瀑流泉...' },
              { label: '意境情绪', value: prompt3, set: setPrompt3, placeholder: '如：空灵幽静，超然物外...' },
              { label: '诗句', value: prompt4, set: setPrompt4, placeholder: '如：独坐幽篁里，弹琴复长啸...' },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <div className="text-museum-brown/70 text-xs mb-1 font-medium">{label}</div>
                <textarea rows={2} value={value} onChange={e => set(e.target.value)}
                  placeholder={placeholder} className={inputClass} />
              </div>
            ))}
          </div>
        </motion.div>
      }
      rightPanel={
        <motion.div className="w-full rounded-[24px] p-4 sm:p-6 lg:p-8 relative overflow-hidden"
          style={panelStyle}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2.5 mb-6">
            <img src={sectionIcon} alt="" className="w-7 h-7 opacity-80" />
            <span className="text-museum-brown/80 text-[17px] font-medium" style={{ fontFamily: "'LXGW WenKai', serif" }}>
              {mode === 'fhs' ? '文字驱动山水画' : '图文融合中国画'}
            </span>
          </div>

          <div className="text-museum-brown/60 text-sm leading-relaxed mb-6" style={{ fontFamily: "'LXGW WenKai', serif" }}>
            {mode === 'fhs'
              ? '通过四组文字描述（历史背景、画面内容、意境情绪、诗句）生成高质量传统山水画。'
              : '在文字描述基础上，结合上传的引导图，生成与参考风格更贴近的中国画作品。'}
          </div>

          <div className="mt-4 border-t border-museum-brown/10 pt-4">
            <button type="button"
              className="w-full flex items-center justify-between bg-transparent border-none p-0 cursor-pointer"
              onClick={() => setShowPaperInfo(!showPaperInfo)}
            >
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
                    <div className="text-museum-brown font-bold text-sm mb-2">{paperInfo.title}</div>
                    <div className="text-museum-brown/70 text-xs mb-3">{paperInfo.abstract}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[['模型名称', paperInfo.model], ['API端点', paperInfo.endpoint], ['输入格式', paperInfo.input], ['输出格式', paperInfo.output]].map(([k, v]) => (
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
                  <div className="text-museum-brown font-medium text-base flex items-center gap-1">
                    AI生成中
                    {[0,1,2].map(i => <motion.span key={i} animate={{ opacity: [0,1,0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i*0.3 }}>.</motion.span>)}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div key={statusMessageIndex} className="text-museum-brown/60 text-sm"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {['分析文字描述...','构建画面构图...','渲染笔墨效果...','生成最终画作...'][statusMessageIndex]}
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
            <motion.div className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="rounded-[24px] p-4 sm:p-6 w-full max-w-2xl text-center" style={{
                background: 'linear-gradient(135deg,rgba(254,202,202,0.5),rgba(255,255,255,0.6))',
                border: '1px solid rgba(239,68,68,0.2)',
              }}>
                <div className="text-red-700 font-medium mb-1">生成失败</div>
                <div className="text-red-600 text-sm mb-3">{error}</div>
                <button onClick={() => { setError(null); handleSubmit(); }}
                  className="px-5 py-2 bg-museum-beige hover:bg-museum-gold text-museum-brown rounded-lg text-sm font-medium transition-colors">重试</button>
              </div>
            </motion.div>
          )}
          {resultUrl && (
            <motion.div className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <div className="rounded-[24px] p-4 sm:p-6 w-full" style={{
                background: 'linear-gradient(135deg,rgba(255,255,255,0.85),rgba(232,227,209,0.3))',
                backdropFilter: 'blur(16px)', border: '1px solid rgba(232,227,209,0.3)',
              }}>
                <h3 className="text-museum-brown text-lg font-medium mb-4">生成结果</h3>
                <img src={resultUrl} alt="生成结果" className="w-full rounded-xl object-contain max-h-[600px]" />
                <a href={resultUrl} download className="block mt-3 text-center text-museum-gold hover:underline text-sm">下载山水画</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      }
      actionsSection={
        <ActionButtons
          onSubmit={handleSubmit} onClear={handleClear}
          onCancel={() => { pollingTimeoutRef.current && clearTimeout(pollingTimeoutRef.current); setIsLoading(false); }}
          isLoading={isLoading} submitLabel="开始生成" loadingLabel="AI生成中..." submitIcon={submitIcon} clearIcon={clearIcon}
        />
      }
    />
  );
}
