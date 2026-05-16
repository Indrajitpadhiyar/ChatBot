import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, X } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [caretCoords, setCaretCoords] = useState({ x: 12, y: 14 });
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const ghostRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setText(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopListening();
      };

      recognition.onend = () => {
        if (isListening) recognition.start();
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 64;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const analyze = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        setVolume(sum / bufferLength);
        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Mic access error:', err);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
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
    const textarea = textareaRef.current;
    const selectionEnd = textarea.selectionEnd || 0;
    const textBefore = textarea.value.substring(0, selectionEnd);
    const formattedText = textBefore.endsWith('\n') ? textBefore + ' ' : textBefore;
    ghostRef.current.textContent = formattedText;
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
    if (e) e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
      if (isListening) stopListening();
    }
  };

  return (
    <div className="relative w-full max-w-[var(--chat-max-width)] mx-auto px-4 pb-6 pt-2">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end bg-[var(--bg-panel)] border border-gray-800/60 rounded-[2rem] p-2 shadow-2xl transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10"
      >
        <button
          type="button"
          className="p-3.5 text-gray-500 hover:text-gray-300 transition-colors rounded-2xl hover:bg-gray-800/50 shrink-0"
        >
          <Paperclip size={20} />
        </button>

        <div className="relative w-full flex-1 overflow-hidden">
          <div
            ref={ghostRef}
            className="absolute top-0 left-0 w-full px-3 py-4 text-[15px] whitespace-pre-wrap break-words opacity-0 pointer-events-none z-[-1]"
            style={{ fontFamily: 'inherit', lineHeight: '1.6' }}
            aria-hidden="true"
          />

          {isFocused && !isListening && (
            <motion.div
              animate={{ x: caretCoords.x, y: caretCoords.y - scrollTop, opacity: isTyping ? 1 : [1, 0, 1] }}
              transition={{ x: { type: "spring", stiffness: 1000, damping: 40 }, opacity: { repeat: Infinity, duration: 1 } }}
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
            placeholder={isListening ? "Listening..." : "Message AI Assistant..."}
            className="w-full max-h-[150px] bg-transparent text-[var(--text-main)] placeholder-gray-600 px-3 py-4 resize-none focus:outline-none text-[15px] caret-transparent relative z-20 scroll-smooth leading-[1.6]"
            rows={1}
          />

          {isListening && (
            <div className="absolute inset-x-3 bottom-1.5 flex items-end justify-start space-x-1 pointer-events-none z-10 h-8">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: Math.max(4, (volume / 100) * (Math.random() * 20 + 10)) }}
                  className="w-1 bg-blue-500/60 rounded-full"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 mb-1 mr-1 ml-2 flex items-center space-x-2">
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

          {(text.trim() || isListening) && (
            <motion.button
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              type="submit"
              disabled={isLoading}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all shadow-xl shadow-blue-600/20 active:scale-90"
            >
              <Send size={18} className="translate-x-[1px]" />
            </motion.button>
          )}
        </div>
      </form>
      <p className="text-center text-[10px] text-gray-600 mt-3 font-medium tracking-wide uppercase">AI Assistant can make mistakes. Verify important information.</p>
    </div>
  );
};

export default ChatInput;