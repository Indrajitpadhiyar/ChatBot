import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Mic } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [caretCoords, setCaretCoords] = useState({ x: 12, y: 14 });
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const ghostRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const updateCaretPosition = () => {
    if (!textareaRef.current || !ghostRef.current) return;

    const textarea = textareaRef.current;
    const selectionEnd = textarea.selectionEnd || 0;
    const textBefore = textarea.value.substring(0, selectionEnd);

    const formattedText = textBefore.endsWith('\n') ? textBefore + ' ' : textBefore;
    ghostRef.current.textContent = formattedText;

    const span = document.createElement('span');
    span.textContent = '\u200b';
    ghostRef.current.appendChild(span);

    setCaretCoords({
      x: span.offsetLeft,
      y: span.offsetTop
    });

    ghostRef.current.removeChild(span);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    setIsTyping(true);

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 500);
  };

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const handleInteraction = () => {
    setTimeout(updateCaretPosition, 10);
  };

  useEffect(() => {
    updateCaretPosition();
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    handleInteraction();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative w-full max-w-[var(--chat-max-width)] mx-auto px-4 pb-6 pt-2 transition-all duration-300">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end bg-[var(--bg-panel)] border border-[#374151] rounded-3xl p-2 shadow-lg transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20"
      >
        <button
          type="button"
          className="p-3 text-gray-400 hover:text-gray-200 transition-colors rounded-full hover:bg-[#1f2937] shrink-0"
        >
          <Paperclip size={20} />
        </button>

        <div className="relative w-full flex-1 overflow-hidden rounded-xl">
          <div
            ref={ghostRef}
            className="absolute top-0 left-0 w-full px-3 py-3.5 text-[15px] whitespace-pre-wrap break-words opacity-0 pointer-events-none z-[-1]"
            style={{
              fontFamily: 'inherit',
              lineHeight: '1.5',
            }}
            aria-hidden="true"
          />

          {isFocused && (
            <motion.div
              initial={false}
              animate={{
                x: caretCoords.x,
                y: caretCoords.y - scrollTop,
                opacity: isTyping ? 1 : [1, 0, 1]
              }}
              transition={{
                x: { type: "spring", stiffness: 1000, damping: 40 },
                y: { type: "spring", stiffness: 1000, damping: 40 },
                opacity: isTyping ? { duration: 0.1 } : { repeat: Infinity, duration: 1, ease: "easeInOut" }
              }}
              className="absolute w-[2px] h-[22px] bg-blue-500 rounded-full pointer-events-none z-10 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              style={{ left: 0, top: 0 }}
            />
          )}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleInteraction}
            onClick={handleInteraction}
            onScroll={handleScroll}
            onFocus={() => { setIsFocused(true); handleInteraction(); }}
            onBlur={() => setIsFocused(false)}
            placeholder="Message AI Assistant..."
            className="w-full max-h-[150px] bg-transparent text-gray-100 placeholder-gray-500 px-3 py-3.5 resize-none focus:outline-none text-[15px] caret-transparent relative z-20 scroll-smooth"
            style={{ lineHeight: '1.5' }}
            rows={1}
          />
        </div>

        <div className="flex-shrink-0 mb-0.5 mr-0.5 ml-2 h-11 flex items-center justify-center">
          {text.trim() ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              type="submit"
              disabled={isLoading}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors shadow-md disabled:opacity-50"
            >
              <Send size={18} className="translate-x-[1px]" />
            </motion.button>
          ) : (
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors rounded-full hover:bg-[#1f2937]"
            >
              <Mic size={20} />
            </button>
          )}
        </div>
      </form>
      <div className="text-center mt-3">
        <p className="text-xs text-gray-500 font-medium tracking-wide">AI Assistant can make mistakes. Verify important information.</p>
      </div>
    </div>
  );
};

export default ChatInput;