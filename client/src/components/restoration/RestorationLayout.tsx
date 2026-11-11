import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MobileMenu from '@/components/MobileMenu';
import StickyHeader from '@/components/StickyHeader';
import { CloudDrift, MistEffect } from '@/components/decorative';

interface RestorationLayoutProps {
  backgroundImage: string;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  resultsSection?: React.ReactNode;
  actionsSection: React.ReactNode;
}

export default function RestorationLayout({
  backgroundImage,
  leftPanel,
  rightPanel,
  resultsSection,
  actionsSection,
}: RestorationLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 100]);

  return (
    <div className="w-full bg-white overflow-hidden font-sans min-h-screen relative">
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Fixed Background with Parallax */}
      <motion.div className="fixed inset-0 z-0" style={{ y: backgroundY }}>
        <img
          className="w-full h-full object-cover"
          src={backgroundImage}
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#7F3222]/3 via-transparent to-[#E8E3D1]/15" />
      </motion.div>

      {/* Semi-transparent content backdrop - soft gradient */}
      <div className="fixed inset-0 z-1 bg-gradient-to-br from-[#E8E3D1]/8 via-white/5 to-[#D4A76A]/6 backdrop-blur-[0.5px]" />

      {/* CloudDrift Decoration */}
      <div className="fixed inset-0 pointer-events-none z-1 opacity-20">
        <CloudDrift />
      </div>

      {/* MistEffect at bottom */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-1">
        <MistEffect position="bottom" />
      </div>

      {/* Header */}
      <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="light" />

      {/* Main Content */}
      <div className="relative z-5 pt-24 pb-12 px-4 sm:px-5 md:px-6 lg:px-10 xl:px-14">
        <div className="max-w-[1600px] mx-auto">
          {/* Two-column layout with breathing room */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">
            {/* Left Panel - Upload area */}
            <motion.div
              className="w-full lg:w-[40%] xl:w-[38%]"
              initial={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1], delay: 0.1 }}
            >
              {leftPanel}
            </motion.div>

            {/* Right Panel - Settings */}
            <motion.div
              className="w-full lg:w-[60%] xl:w-[62%]"
              initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: [0.5, 0, 0.3, 1], delay: 0.3 }}
            >
              {rightPanel}
            </motion.div>
          </div>

          {/* Actions row - full width, compact */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {actionsSection}
          </motion.div>

          {/* Results Section */}
          <div aria-live="polite" aria-atomic="true">
            {resultsSection && (
              <motion.div
                className="mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {resultsSection}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
