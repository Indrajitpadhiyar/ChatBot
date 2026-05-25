import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Image, Paperclip, Mic, Send, X,
  FolderOpen, Clock, Sparkles, Brain, Search, Globe,
  MoreHorizontal, ChevronRight, Camera, Film, Music,
  Code2, Table2, Presentation, FileJson, Archive, Plus
} from 'lucide-react';

const MAX_FILES = 5;

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── Attachment Menu Data ─────────────────────────────────────────────────────
const PRIMARY_ACTIONS = [
  {
    id: 'photos-files',
    icon: Paperclip,
    label: 'Add photos & files',
    description: 'Upload from device',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    accept: 'image/*,.pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
    trigger: 'file',
  },
  {
    id: 'recent-files',
    icon: Clock,
    label: 'Recent files',
    description: 'Quick access',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 group-hover:bg-violet-500/20',
    hasArrow: true,
  },
];

const AI_ACTIONS = [
  {
    id: 'create-image',
    icon: Sparkles,
    label: 'Create image',
    description: 'AI generation',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 group-hover:bg-pink-500/20',
  },
  {
    id: 'thinking',
    icon: Brain,
    label: 'Thinking',
    description: 'Extended reasoning',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
  },
  {
    id: 'deep-research',
    icon: Search,
    label: 'Deep research',
    description: 'Multi-step search',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
  },
  {
    id: 'web-search',
    icon: Globe,
    label: 'Web search',
    description: 'Live results',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 group-hover:bg-sky-500/20',
  },
  {
    id: 'more',
    icon: MoreHorizontal,
    label: 'More',
    description: 'All tools',
    color: 'text-gray-400',
    bg: 'bg-gray-500/10 group-hover:bg-gray-500/20',
    hasArrow: true,
  },
];

const FILE_TYPE_GROUPS = [
  {
    label: 'Images & Media',
    items: [
      { icon: Image, label: 'Photo / Image', accept: 'image/*', color: 'text-pink-400' },
      { icon: Camera, label: 'Screenshot', accept: 'image/png', color: 'text-rose-400' },
      { icon: Film, label: 'Video', accept: 'video/*', color: 'text-purple-400' },
      { icon: Music, label: 'Audio', accept: 'audio/*', color: 'text-violet-400' },
    ],
  },
  {
    label: 'Documents',
    items: [
      { icon: FileText, label: 'PDF', accept: '.pdf', color: 'text-red-400' },
      { icon: FileText, label: 'Word Doc', accept: '.doc,.docx', color: 'text-blue-400' },
      { icon: Presentation, label: 'PowerPoint', accept: '.ppt,.pptx', color: 'text-orange-400' },
      { icon: Table2, label: 'Spreadsheet', accept: '.xls,.xlsx,.csv', color: 'text-green-400' },
    ],
  },
  {
    label: 'Code & Data',
    items: [
      { icon: Code2, label: 'Code file', accept: '.js,.ts,.py,.java,.c,.cpp,.cs,.go,.rs,.php,.rb,.swift,.kt,.sh', color: 'text-cyan-400' },
      { icon: FileJson, label: 'JSON / XML', accept: '.json,.xml,.yaml,.yml', color: 'text-teal-400' },
      { icon: FileText, label: 'Markdown / Text', accept: '.md,.txt', color: 'text-lime-400' },
      { icon: Archive, label: 'Archive (zip)', accept: '.zip,.tar,.gz', color: 'text-gray-400' },
    ],
  },
];

// ── Attachment Popup ─────────────────────────────────────────────────────────
const AttachmentPopup = ({ onClose, onFileSelect, onAction, fileInputRef }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [showFileTypes, setShowFileTypes] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const triggerFile = (accept) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
    onClose();
  };

  return (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="absolute bottom-full left-0 mb-3 w-[260px] z-50"
      style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))' }}
    >
      <div className="rounded-2xl border border-white/[0.07] bg-[#0f1117]/95 backdrop-blur-xl overflow-hidden">

        {!showFileTypes ? (
          <>
            {/* Primary upload actions */}
            <div className="p-2 border-b border-white/[0.05]">
              {PRIMARY_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onMouseEnter={() => setHoveredId(action.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => {
                    if (action.id === 'photos-files') setShowFileTypes(true);
                    else if (action.trigger === 'file') triggerFile(action.accept);
                    else onAction(action.id);
                  }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.bg} transition-all flex-shrink-0`}>
                    <action.icon size={16} className={action.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-200 leading-none mb-0.5">{action.label}</p>
                    <p className="text-[10px] text-gray-600">{action.description}</p>
                  </div>
                  {action.hasArrow && (
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* AI capability actions */}
            <div className="p-2">
              <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-widest px-3 pb-1.5 pt-0.5">AI Tools</p>
              {AI_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (PRIMARY_ACTIONS.length + i) * 0.04 }}
                  onMouseEnter={() => setHoveredId(action.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => { onAction(action.id); onClose(); }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.bg} transition-all flex-shrink-0`}>
                    <action.icon size={16} className={action.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-200 leading-none mb-0.5">{action.label}</p>
                    <p className="text-[10px] text-gray-600">{action.description}</p>
                  </div>
                  {action.hasArrow && (
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                  )}
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          /* File type sub-menu */
          <>
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.05]">
              <button
                onClick={() => setShowFileTypes(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-all text-gray-500 hover:text-gray-300"
              >
                <ChevronRight size={14} className="rotate-180" />
              </button>
              <p className="text-[12px] font-semibold text-gray-300">Choose file type</p>
            </div>

            <div className="p-2 max-h-[360px] overflow-y-auto custom-scroll">
              {FILE_TYPE_GROUPS.map((group, gi) => (
                <div key={gi} className={gi > 0 ? 'mt-1 pt-1 border-t border-white/[0.04]' : ''}>
                  <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-widest px-3 py-1.5">{group.label}</p>
                  {group.items.map((item, ii) => (
                    <motion.button
                      key={ii}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ii * 0.03 }}
                      onClick={() => triggerFile(item.accept)}
                      className="group w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all text-left"
                    >
                      <item.icon size={15} className={`${item.color} flex-shrink-0`} />
                      <span className="text-[13px] text-gray-300 group-hover:text-gray-100 transition-colors">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bottom tip */}
        <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-blue-500/60 animate-pulse" />
          <p className="text-[9px] text-gray-700 font-medium">Up to {MAX_FILES} files per message</p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main ChatInput ────────────────────────────────────────────────────────────
const ChatInput = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [caretCoords, setCaretCoords] = useState({ x: 12, y: 14 });
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [activeTools, setActiveTools] = useState(new Set());

  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const ghostRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        let t = '';
        for (let i = 0; i < event.results.length; i++) t += event.results[i][0].transcript;
        setText(t);
      };
      recognition.onerror = () => stopListening();
      recognition.onend = () => { if (isListening) recognition.start(); };
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = async () => {
    if (!recognitionRef.current) { alert('Use Chrome for speech recognition.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AC = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AC();
      analyserRef.current = audioContextRef.current.createAnalyser();
      audioContextRef.current.createMediaStreamSource(stream).connect(analyserRef.current);
      analyserRef.current.fftSize = 64;
      const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buf);
        setVolume(buf.reduce((s, v) => s + v, 0) / buf.length);
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) { console.error(e); }
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    cancelAnimationFrame(animationFrameRef.current);
    setVolume(0);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
    updateCaretPosition();
  }, [text]);

  const updateCaretPosition = () => {
    if (!textareaRef.current || !ghostRef.current) return;
    const pos = textareaRef.current.selectionEnd || 0;
    const before = textareaRef.current.value.substring(0, pos);
    ghostRef.current.textContent = before.endsWith('\n') ? before + ' ' : before;
    const span = document.createElement('span');
    span.textContent = '\u200b';
    ghostRef.current.appendChild(span);
    setCaretCoords({ x: span.offsetLeft, y: span.offsetTop });
    ghostRef.current.removeChild(span);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    setIsTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 500);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if ((text.trim() || selectedFiles.length > 0) && !isLoading) {
      onSendMessage?.(text.trim(), null, selectedFiles);
      setText('');
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (isListening) stopListening();
    }
  };

  const handleFileSelect = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;
    setSelectedFiles(prev => {
      const keys = new Set(prev.map(f => `${f.name}-${f.size}-${f.lastModified}`));
      return [...prev, ...incoming.filter(f => !keys.has(`${f.name}-${f.size}-${f.lastModified}`))].slice(0, MAX_FILES);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (i) => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleAction = (id) => {
    const toggle = new Set(activeTools);
    const toggleable = ['thinking', 'deep-research', 'web-search'];
    if (toggleable.includes(id)) {
      toggle.has(id) ? toggle.delete(id) : toggle.add(id);
      setActiveTools(toggle);
    }
  };

  const TOOL_LABELS = {
    'thinking': { label: 'Thinking', color: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
    'deep-research': { label: 'Deep Research', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
    'web-search': { label: 'Web Search', color: 'bg-sky-500/15 text-sky-300 border-sky-500/20' },
  };

  return (
    <div className="relative w-full max-w-[var(--chat-max-width,760px)] mx-auto px-4 pb-6 pt-2">

      {/* Active tool pills */}
      <AnimatePresence>
        {activeTools.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex flex-wrap gap-1.5"
          >
            {[...activeTools].map(id => (
              <motion.span
                key={id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${TOOL_LABELS[id]?.color}`}
              >
                {TOOL_LABELS[id]?.label}
                <button onClick={() => handleAction(id)} className="opacity-60 hover:opacity-100">
                  <X size={10} />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File chips */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {selectedFiles.map((file, index) => {
              const isImage = file.type.startsWith('image/');
              const isVideo = file.type.startsWith('video/');
              const isAudio = file.type.startsWith('audio/');
              const Icon = isImage ? Image : isVideo ? Film : isAudio ? Music : FileText;
              const color = isImage
                ? 'text-pink-400 bg-pink-500/10'
                : isVideo ? 'text-purple-400 bg-purple-500/10'
                  : isAudio ? 'text-violet-400 bg-violet-500/10'
                    : 'text-blue-400 bg-blue-500/10';

              return (
                <motion.div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  className="flex items-center gap-2 max-w-full rounded-2xl border border-gray-800/70 bg-[#111827]/80 px-3 py-2 shadow-lg"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="max-w-[160px] truncate text-xs font-bold text-gray-200">{file.name}</p>
                    <p className="text-[10px] font-medium text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-1 rounded-full p-1 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,.pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        onChange={handleFileSelect}
      />

      {/* Input form */}
      <div className="relative">

        {/* Attachment popup */}
        <AnimatePresence>
          {showAttachMenu && (
            <AttachmentPopup
              onClose={() => setShowAttachMenu(false)}
              onFileSelect={handleFileSelect}
              onAction={handleAction}
              fileInputRef={fileInputRef}
            />
          )}
        </AnimatePresence>

        <form
          onSubmit={handleSubmit}
          className="relative flex items-end bg-[#0d1117] border border-gray-800/60 rounded-[2rem] p-2 shadow-2xl transition-all focus-within:border-blue-500/40 focus-within:ring-4 focus-within:ring-blue-500/8"
        >
          {/* Plus / Attach button */}
          <button
            type="button"
            onClick={() => setShowAttachMenu(v => !v)}
            className={`relative p-3.5 transition-all rounded-2xl shrink-0 group ${showAttachMenu
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            title="Attach / Tools"
          >
            <motion.div
              animate={{ rotate: showAttachMenu ? 45 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Plus size={20} />
            </motion.div>
            {/* Subtle glow when active */}
            {showAttachMenu && (
              <motion.span
                layoutId="attach-glow"
                className="absolute inset-0 rounded-2xl ring-1 ring-blue-500/30"
              />
            )}
          </button>

          {/* Ghost div for caret */}
          <div className="relative w-full flex-1 overflow-hidden">
            <div
              ref={ghostRef}
              className="absolute top-0 left-0 w-full px-3 py-4 text-[15px] whitespace-pre-wrap break-words opacity-0 pointer-events-none z-[-1]"
              style={{ fontFamily: 'inherit', lineHeight: '1.6' }}
              aria-hidden="true"
            />

            {isFocused && !isListening && (
              <motion.div
                animate={{
                  x: caretCoords.x,
                  y: caretCoords.y,
                  opacity: isTyping ? 1 : [1, 0, 1],
                }}
                transition={{
                  x: { type: 'spring', stiffness: 1000, damping: 40 },
                  opacity: { repeat: Infinity, duration: 1 },
                }}
                className="absolute w-[2px] h-[22px] bg-blue-500 rounded-full pointer-events-none z-10 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                style={{ left: 0, top: 0 }}
              />
            )}

            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSelect={updateCaretPosition}
              placeholder={isListening ? 'Listening…' : 'Ask anything'}
              className="w-full max-h-[150px] bg-transparent text-gray-100 placeholder-gray-600 px-3 py-4 resize-none focus:outline-none text-[15px] caret-transparent relative z-20 scroll-smooth leading-[1.6]"
              rows={1}
            />

            {isListening && (
              <div className="absolute inset-x-3 bottom-1.5 flex items-end justify-start space-x-[3px] pointer-events-none z-10 h-8">
                {[...Array(14)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: Math.max(4, (volume / 100) * (Math.random() * 20 + 8)) }}
                    transition={{ duration: 0.1 }}
                    className="w-1 bg-blue-500/60 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex-shrink-0 mb-1 mr-1 ml-2 flex items-center gap-1.5">
            {isListening ? (
              <button
                type="button"
                onClick={stopListening}
                className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-full shadow-lg shadow-red-500/20 active:scale-90 transition-all"
              >
                <X size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={startListening}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all"
              >
                <Mic size={20} />
              </button>
            )}

            <AnimatePresence>
              {(text.trim() || selectedFiles.length > 0 || isListening) && (
                <motion.button
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all shadow-xl shadow-blue-600/20 active:scale-90 disabled:opacity-50"
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send size={18} className="translate-x-[1px]" />
                  }
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>

      <p className="text-center text-[10px] text-gray-700 mt-3 font-medium tracking-wide uppercase">
        AI Assistant can make mistakes. Verify important information.
      </p>
    </div>
  );
};

export default ChatInput;