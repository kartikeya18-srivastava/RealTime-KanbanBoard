import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  const modalVariants = {
    closed: { opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' },
    open: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[8px]"
          />
          <motion.div
            variants={modalVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={`relative w-full ${maxWidth} overflow-hidden rounded-[2rem] bg-surface/80 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl ring-1 ring-white/5`}
          >
            <div className="flex items-center justify-between border-b border-white/5 px-8 py-6 bg-white/5">
              <h3 className="text-xl font-bold text-text-main tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-text-main transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
