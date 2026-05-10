import React from 'react';
import { MessageSquarePlus, MessageSquare, Settings, PanelLeftClose, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({
  isOpen,
  toggleSidebar,
  onNewChat,
  chatHistory = [],
  onLoadChat,
  onDeleteChat,
  activeChatId,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-30 bg-[#0b0f19] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-2xl md:shadow-none h-full overflow-hidden flex flex-col
          ${isOpen ? 'w-[280px] translate-x-0 border-r border-[#1f2937]' : 'w-[280px] -translate-x-full md:translate-x-0 md:w-0 border-r border-transparent md:border-none'}`}
      >
        <div className="w-[280px] h-full flex flex-col shrink-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              <MessageSquarePlus size={18} />
              <span className="font-medium text-sm">New Chat</span>
            </button>

            <button
              onClick={toggleSidebar}
              className="md:hidden ml-3 p-2.5 text-gray-400 hover:text-gray-200 hover:bg-[#1f2937] rounded-xl transition-colors"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>

          {/* Chat history list */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 mt-2">
            <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-widest">
              Recent
            </div>

            {chatHistory.length === 0 ? (
              <p className="text-xs text-gray-600 px-3 py-2">No chats yet. Start a conversation!</p>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat._id}
                  className={`group flex items-center w-full px-3 py-3 rounded-xl transition-colors cursor-pointer
                    ${activeChatId === chat._id
                      ? 'bg-blue-600/20 text-white border border-blue-500/30'
                      : 'text-gray-300 hover:bg-[#1f2937]/80 hover:text-white'}`}
                >
                  <button
                    onClick={() => onLoadChat(chat._id)}
                    className="flex items-center space-x-3 flex-1 min-w-0 text-left"
                  >
                    <MessageSquare
                      size={16}
                      className={`shrink-0 transition-colors ${activeChatId === chat._id ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`}
                    />
                    <span className="text-sm truncate">{chat.title}</span>
                  </button>

                  {/* Delete button — shows on hover */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat._id); }}
                    className="shrink-0 ml-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    aria-label="Delete chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1f2937]/50 mt-auto">
            <button className="w-full flex items-center space-x-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-[#1f2937]/80 rounded-xl transition-colors group">
              <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
