import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ message }) => {
  const isAi = message.role === 'ai';
  const [displayedText, setDisplayedText] = useState(isAi && message.isNew ? '' : message.content);

  useEffect(() => {
    if (isAi && message.isNew) {
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedText(message.content.slice(0, i));
        i++;
        if (i > message.content.length) {
          clearInterval(intervalId);
          message.isNew = false; // Prevent re-animating
        }
      }, 10); // typing speed
      return () => clearInterval(intervalId);
    } else {
      setDisplayedText(message.content);
    }
  }, [message.content, isAi, message.isNew]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full mb-6 ${isAi ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${isAi ? 'bg-gradient-to-br from-indigo-500 to-purple-600 mr-3' : 'bg-gradient-to-br from-blue-500 to-cyan-500 ml-3'} shadow-md`}>
          {isAi ? <Bot size={18} className="text-white" /> : <User size={18} className="text-white" />}
        </div>

        {/* Message Bubble */}
        <div
          className={`relative px-5 py-3.5 text-[15px] leading-relaxed shadow-sm
            ${isAi 
              ? 'bg-[#1f2937] text-gray-100 rounded-2xl rounded-tl-sm border border-[#374151]' 
              : 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
            }
          `}
        >
          {isAi ? (
            <div className="w-full break-words leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props}/>,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-4 mb-2" {...props}/>,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-3 mb-2" {...props}/>,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props}/>,
                  ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-3 space-y-1" {...props}/>,
                  ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-3 space-y-1" {...props}/>,
                  li: ({node, ...props}) => <li className="pl-1" {...props}/>,
                  strong: ({node, ...props}) => <strong className="font-semibold text-blue-300" {...props}/>,
                  code: ({node, inline, ...props}) => 
                    inline ? (
                      <code className="bg-[#111827] px-1.5 py-0.5 rounded text-sm text-pink-400" {...props}/>
                    ) : (
                      <pre className="bg-[#111827] p-3 rounded-lg overflow-x-auto my-3 text-sm text-gray-300 border border-[#374151]">
                        <code {...props}/>
                      </pre>
                    ),
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-3 bg-[#111827]/50 rounded-r-lg italic text-gray-400" {...props}/>,
                }}
              >
                {displayedText}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
