import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { motion } from 'framer-motion';

const ChatWindow = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto w-full scroll-smooth relative">
      {messages.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="relative z-10 pointer-events-none px-4">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
            >
              How can I help you today?
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="text-gray-300 text-base md:text-lg max-w-md mx-auto leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-medium"
            >
              I'm your AI assistant. Ask me anything!
            </motion.p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-2 pb-4 px-4 md:px-8 max-w-4xl mx-auto pt-6">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={endOfMessagesRef} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;