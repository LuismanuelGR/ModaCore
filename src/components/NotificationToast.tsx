import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const NotificationToast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-[#1A1A1A] shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-white border-[#EEEEEE] text-[#1A1A1A]',
    warning: 'bg-white border-[#EEEEEE] text-[#1A1A1A]',
    error: 'bg-white border-rose-200 text-[#1A1A1A]',
    info: 'bg-white border-[#EEEEEE] text-[#1A1A1A]',
  };

  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        id="toast-notification"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg max-w-sm ${bgStyles[toast.type]}`}
      >
        {icons[toast.type]}
        <p className="text-xs font-medium leading-snug">{toast.message}</p>
      </motion.div>
    </AnimatePresence>
  );
};
