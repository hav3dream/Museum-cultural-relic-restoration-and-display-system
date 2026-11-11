import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function validateFile(file: File, acceptedFormats: string): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `文件大小 ${(file.size / 1024 / 1024).toFixed(1)}MB 超过限制（最大50MB）`;
  }
  // If acceptedFormats is "image/*", check file type starts with "image/"
  if (acceptedFormats === 'image/*' && !file.type.startsWith('image/')) {
    return '请上传图片文件（JPG、PNG、TIFF等格式）';
  }
  return null;
}

interface FileUploadProps {
  uploadedFile: File | null;
  onFileUpload: (file: File) => void;
  title: string;
  uploadIcon: string;
  dropzoneIcon: string;
  acceptedFormats?: string;
  formatHint?: string;
  sectionIcon?: string;
}

export default function FileUpload({
  uploadedFile,
  onFileUpload,
  title,
  uploadIcon,
  dropzoneIcon,
  acceptedFormats = 'image/*',
  formatHint = '支持JPG、PNG、TIFF等格式，文件大小不超过50MB',
  sectionIcon,
}: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [showRipple, setShowRipple] = React.useState(false);
  const [showSuccessFlash, setShowSuccessFlash] = React.useState(false);
  const [previousFile, setPreviousFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (uploadedFile && uploadedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(uploadedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [uploadedFile]);

  // Trigger success flash when file is uploaded (transition from no file to file)
  React.useEffect(() => {
    if (uploadedFile && !previousFile) {
      setShowSuccessFlash(true);
      setTimeout(() => setShowSuccessFlash(false), 300);
    }
    setPreviousFile(uploadedFile);
  }, [uploadedFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const error = validateFile(files[0], acceptedFormats);
      if (error) {
        toast.error(error);
        return;
      }
      // Trigger ripple effect
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 800);
      onFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full rounded-[24px] p-7" style={{
      height: '100%', maxHeight: '500px',
      background: 'linear-gradient(135deg, rgba(232,227,209,0.25) 0%, rgba(255,255,255,0.15) 50%, rgba(212,167,106,0.08) 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(232,227,209,0.3)',
      boxShadow: '0 4px 24px rgba(127,50,34,0.06), 0 2px 8px rgba(0,0,0,0.03)',
    }}>
      <div className="flex items-center gap-2.5 mb-5">
        {sectionIcon && <img src={sectionIcon} alt="" className="w-7 h-7 opacity-80 object-contain" />}
        <div className="text-museum-brown/85 text-[17px] font-semibold tracking-wide" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>{title}</div>
      </div>

      <motion.div
        className={`w-full rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
          isDragOver
            ? 'bg-museum-brown/5'
            : 'hover:bg-white/10'
        }`}
        style={{
          flex: 1,
          backgroundImage: 'radial-gradient(circle, rgba(127,50,34,0.02) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          border: uploadedFile ? '1px solid rgba(212,167,106,0.25)' : 'none',
          boxShadow: uploadedFile ? '0 0 24px rgba(212,167,106,0.12), inset 0 1px 2px rgba(255,255,255,0.1)' : 'none',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${title}. ${formatHint}`}
        whileTap={{ scale: 0.98 }}
        animate={isDragOver ? {
          scale: [1, 1.02, 1],
        } : {
          scale: 1,
        }}
        transition={isDragOver ? {
          scale: { duration: 0.6, ease: 'easeInOut' }
        } : { duration: 0.2 }}
      >
        {/* Animated Dashed Border (Empty State) */}
        {!uploadedFile && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ borderRadius: '24px' }}>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="none"
              stroke="rgba(127, 50, 34, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="8 6"
              strokeDashoffset="0"
              rx="24"
              ry="24"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="300"
                dur="20s"
                repeatCount="indefinite"
              />
            </rect>
          </svg>
        )}

        {/* Background Shimmer (Empty State) */}
        {!uploadedFile && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 200%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Success Flash Overlay */}
        <AnimatePresence>
          {showSuccessFlash && (
            <motion.div
              className="absolute inset-0 bg-museum-gold pointer-events-none rounded-[20px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Sparkle/Star Decoration (Success) */}
        <AnimatePresence>
          {showSuccessFlash && (
            <motion.div
              className="absolute top-4 right-4 text-museum-gold text-2xl pointer-events-none"
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
            >
              ✦
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const error = validateFile(e.target.files[0], acceptedFormats);
              if (error) {
                toast.error(error);
                e.target.value = '';
                return;
              }
              onFileUpload(e.target.files[0]);
            }
          }}
        />
        {/* Drop Ripple Effect */}
        <AnimatePresence>
          {showRipple && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="rounded-full border-2 border-museum-gold"
                style={{ width: '50px', height: '50px' }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 8, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {uploadedFile ? (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="text-center p-4"
            >
              {previewUrl ? (
                <motion.img
                  src={previewUrl}
                  alt="上传图片预览"
                  className="max-h-[200px] max-w-full rounded-lg mb-3 shadow-md"
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              ) : (
                <div className="text-museum-brown text-lg font-semibold mb-2">✓ 已上传</div>
              )}
              <motion.div
                className="inline-flex items-center gap-2 bg-museum-gold/20 px-3 py-1.5 rounded-full border border-museum-gold/30"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 400,
                  damping: 15
                }}
              >
                <div className="text-museum-brown text-sm font-normal">{uploadedFile.name}</div>
                <div className="text-museum-gold text-xs font-semibold">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <motion.img
                src={dropzoneIcon}
                alt=""
                className="w-[60px] h-[60px] mb-4"
                animate={{
                  y: isDragOver ? [0, -12, 0] : [0, -8, 0]
                }}
                transition={{
                  duration: isDragOver ? 1.5 : 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <div className="text-museum-brown/70 text-base font-light text-center mb-2" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif", letterSpacing: '0.03em' }}>
                选择一张图片，或拖拽到这里
              </div>
              <AnimatePresence>
                {isDragOver && (
                  <motion.div
                    className="text-museum-gold text-base font-semibold text-center mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    松开上传
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="text-museum-brown text-sm font-light text-center">{formatHint}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
