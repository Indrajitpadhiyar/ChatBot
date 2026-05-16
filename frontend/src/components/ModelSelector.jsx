import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Zap, Cpu, BrainCircuit } from 'lucide-react';

const models = [
  { id: 'idr-ai-v1', name: 'IDR AI', icon: BrainCircuit, color: 'text-emerald-400', desc: 'Your custom-trained, advanced AI model' },
  { id: 'gpt-4o', name: 'GPT-4o (OpenRouter)', icon: Zap, color: 'text-blue-500', desc: 'OpenAI\'s flagship high-speed model' },
  { id: 'deepseek-chat', name: 'DeepSeek', icon: Cpu, color: 'text-blue-400', desc: 'Advanced DeepSeek reasoning model' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', icon: Zap, color: 'text-yellow-400', desc: 'Fast & efficient everyday model' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', icon: Sparkles, color: 'text-purple-400', desc: 'Most capable for complex tasks' },
];

const ModelSelector = ({ aiModel, setAiModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedModelData = models.find((m) => m.id === aiModel) || models[0];
  const Icon = selectedModelData.icon;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative hidden sm:block z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-[#1f2937]/80 hover:bg-[#374151]/80 text-gray-200 text-sm font-medium px-3.5 py-2 rounded-xl border border-[#374151]/50 shadow-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/30 group"
      >
        <Icon size={16} className={`${selectedModelData.color} transition-colors`} />
        <span>{selectedModelData.name}</span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-64 bg-[var(--bg-panel)] backdrop-blur-xl border border-[#374151]/50 rounded-2xl shadow-xl shadow-black/50 overflow-hidden"
          >
            <div className="p-1.5 space-y-1">
              {models.map((model) => {
                const isSelected = model.id === aiModel;
                const ModelIcon = model.icon;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      setAiModel(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group
                      ${isSelected ? 'bg-blue-500/10' : 'hover:bg-[#1f2937]'}
                    `}
                  >
                    <div className={`mt-0.5 shrink-0 ${isSelected ? model.color : 'text-gray-500 group-hover:text-gray-300'}`}>
                      <ModelIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                        {model.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {model.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="shrink-0 flex items-center justify-center h-full text-blue-400 mt-1">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
