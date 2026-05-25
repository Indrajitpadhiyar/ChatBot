import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

const NotificationToast = ({ message, onClose }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-6 right-6 z-[100] flex items-center bg-[#1f2937]/90 backdrop-blur-md border border-[#374151] shadow-2xl rounded-2xl px-4 py-3 text-white"
      >
        <CheckCircle2 size={20} className="text-emerald-400 mr-3" />
        <span className="text-sm font-medium mr-4">{message}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close notification">
          <X size={16} />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

export default NotificationToast;
