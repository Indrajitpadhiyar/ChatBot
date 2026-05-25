import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, X } from 'lucide-react';
import { AI_MODELS } from '../constants/aiModels';

const GroupChatModal = ({
  isOpen,
  onClose,
  selectedModels,
  setSelectedModels,
  onStart,
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#111827] border border-gray-800 p-8 rounded-[2rem] shadow-2xl z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            aria-label="Close group chat modal"
          >
            <X size={20} />
          </button>

          <div className="mb-6">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
              <BrainCircuit className="text-indigo-400 animate-pulse" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Start AI Swarm Chat</h2>
            <p className="text-gray-400 text-sm mt-1">Select multiple AI models to respond collaboratively in real time.</p>
          </div>

          <div className="space-y-3 my-6 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
            {AI_MODELS.map((model) => {
              const isChecked = selectedModels.includes(model.id);
              return (
                <label
                  key={model.id}
                  className={`flex items-start justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-indigo-600/10 border-indigo-500/55 shadow-md shadow-indigo-500/5'
                      : 'bg-[#0b0f19] border-gray-800/80 hover:border-gray-700/80 hover:bg-[#111827]/40'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-3">
                    <input
                      type="checkbox"
                      className="mt-1 accent-indigo-500 cursor-pointer w-4 h-4 rounded"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedModels((prev) => prev.filter((id) => id !== model.id));
                        } else {
                          setSelectedModels((prev) => [...prev, model.id]);
                        }
                      }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white tracking-wide">{model.name}</span>
                      <span className="text-xs text-gray-500 mt-0.5 leading-relaxed">{model.desc}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase shrink-0 ${model.badgeColor}`}>
                    {model.badge}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="button"
              disabled={selectedModels.length < 2}
              onClick={onStart}
              className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 ${
                selectedModels.length >= 2
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/20 active:scale-95 cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/20'
              }`}
            >
              <BrainCircuit size={18} />
              <span>Start Swarm Session ({selectedModels.length} Models)</span>
            </button>
            <div className="text-[10px] text-gray-500 text-center">
              Requires at least 2 models. Swarms run queries in parallel.
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default GroupChatModal;
