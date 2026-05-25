import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Edit2, CheckCircle2, X, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getModelById } from '../constants/aiModels';

const ChatMessage = ({ message, index, onEdit }) => {
  const isAi = message.role === 'ai';
  const modelData = getModelById(message.model);
  
  const [editedContent, setEditedContent] = useState(message.content);
  const [displayedText, setDisplayedText] = useState(isAi && message.isNew ? '' : editedContent);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(editedContent);

  useEffect(() => {
    setEditedContent(message.content);
    setTempText(message.content);
  }, [message.content]);

  useEffect(() => {
    if (isAi && message.isNew) {
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedText(editedContent.slice(0, i));
        i++;
        if (i > editedContent.length) {
          clearInterval(intervalId);
          message.isNew = false; 
        }
      }, 10);
      return () => clearInterval(intervalId);
    } else {
      setDisplayedText(editedContent);
    }
  }, [editedContent, isAi, message.isNew]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (!isAi && onEdit) {
      // For User messages: Trigger regeneration
      onEdit(tempText, index);
      setIsEditing(false);
    } else {
      // For AI messages: Local only update
      setEditedContent(tempText);
      message.content = tempText; 
      setIsEditing(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex w-full mb-6 group ${isAi ? 'justify-start' : 'justify-end'}`}
      >
        <div className={`flex max-w-[85%] md:max-w-[75%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* Message Bubble Container */}
          <div className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} w-auto`}>
            <div
              className={`relative px-5 py-4 text-[15px] leading-relaxed shadow-sm transition-all duration-300
                ${isAi 
                  ? 'bg-[var(--chat-bubble-ai)] text-gray-100 rounded-2xl rounded-tl-sm border border-[#374151]' 
                  : 'bg-[var(--chat-bubble-user)] text-white rounded-2xl rounded-tr-sm'
                }
              `}
            >
              {isAi ? (
                <div className="w-full break-words leading-relaxed text-[var(--text-main)]/90">
                  {message.model && (
                    <div className="inline-flex items-center space-x-1 mb-2">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md tracking-wider uppercase border
                        ${message.model === 'gpt-4o' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : message.model === 'deepseek-chat'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : message.model === 'gemini-2.5-pro'
                          ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                          : message.model === 'idr-ai-v1'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}
                      >
                        {modelData?.name || message.model}
                      </span>
                    </div>
                  )}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-extrabold mt-8 mb-4 text-[var(--text-main)] tracking-tight" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3 text-[var(--text-main)] tracking-tight" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-5 mb-2 text-[var(--text-main)]" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-[1.7]" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-[var(--text-main)]/80" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-[var(--text-main)]/80" {...props} />,
                      li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-[var(--text-main)]" {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code className="bg-[var(--bg-panel)] px-1.5 py-0.5 rounded-md text-sm text-pink-500 font-mono" {...props} />
                        ) : (
                          <div className="relative my-6 group/code">
                            <div className="absolute -top-3 right-4 px-2 py-1 bg-gray-800 text-[10px] font-bold text-gray-400 rounded-md border border-gray-700 uppercase tracking-widest opacity-0 group-hover/code:opacity-100 transition-opacity">Code</div>
                            <pre className="bg-[#0b0f19] p-5 rounded-2xl overflow-x-auto text-sm text-gray-300 border border-gray-800/50 shadow-inner custom-scrollbar">
                              <code {...props} className="font-mono" />
                            </pre>
                          </div>
                        ),
                      blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500/50 pl-6 py-2 my-5 bg-blue-500/5 rounded-r-2xl italic text-gray-400 leading-relaxed" {...props} />,
                      hr: ({ node, ...props }) => <hr className="my-8 border-gray-800/50" {...props} />,
                    }}
                  >
                    {displayedText}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>

            {/* Action Bar (Show for both AI and User) */}
            {!isEditing && !message.isNew && (
              <div className={`flex items-center space-x-3 mt-2 ${isAi ? 'ml-1' : 'mr-1 flex-row-reverse space-x-reverse'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                <button 
                  onClick={handleCopy} 
                  className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1.5 text-[10px] font-bold bg-[#1f2937]/40 hover:bg-[#374151] px-2.5 py-1.5 rounded-lg border border-gray-800/40"
                >
                  {isCopied ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{isCopied ? 'COPIED' : 'COPY'}</span>
                </button>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1.5 text-[10px] font-bold bg-[#1f2937]/40 hover:bg-[#374151] px-2.5 py-1.5 rounded-lg border border-gray-800/40"
                >
                  <Edit2 size={12} />
                  <span>EDIT</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Full Screen Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-[#0b0f19]/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#111827] border border-gray-800 w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative"
            >
               {/* Decorative Gradient */}
               <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
               
               {/* Header */}
               <div className="px-10 py-8 border-b border-gray-800 flex items-center justify-between bg-[#1f2937]/20 backdrop-blur-md">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                       <Sparkles size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Advanced Message Editor</h3>
                      <p className="text-sm text-gray-400 mt-0.5">Customize the AI's output with markdown support</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsEditing(false); setTempText(editedContent); }} 
                    className="p-3 hover:bg-red-500/10 rounded-2xl text-gray-400 hover:text-red-400 transition-all duration-300 group"
                  >
                    <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
               </div>

               {/* Editor Body */}
               <div className="flex-1 p-10 bg-[#0b0f19]/30">
                  <textarea 
                    className="w-full h-full bg-transparent text-gray-100 text-xl font-sans leading-[1.8] outline-none resize-none placeholder-gray-700 custom-scrollbar"
                    placeholder="Refine the AI response here..."
                    value={tempText}
                    onChange={(e) => setTempText(e.target.value)}
                    autoFocus
                  />
               </div>

               {/* Footer */}
               <div className="px-10 py-8 border-t border-gray-800 bg-[#1f2937]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center text-xs text-gray-500 font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
                    Your changes will be saved to this chat session locally.
                  </div>
                  <div className="flex space-x-4 w-full sm:w-auto">
                    <button 
                      onClick={() => { setIsEditing(false); setTempText(editedContent); }}
                      className="flex-1 sm:flex-none px-8 py-3.5 text-[15px] font-bold text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-2xl transition-all border border-transparent hover:border-gray-700"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={handleSaveEdit}
                      className="flex-1 sm:flex-none px-10 py-3.5 text-[15px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center border border-blue-500/50"
                    >
                      <CheckCircle2 size={20} className="mr-2" /> Update Message
                    </button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatMessage;
