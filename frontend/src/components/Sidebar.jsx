import React, { useState } from 'react';
import {
  MessageSquarePlus,
  MessageSquare,
  Settings,
  PanelLeftClose,
  Trash2,
  Search,
  FolderPlus,
  Folder,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({
  isOpen,
  toggleSidebar,
  onNewChat,
  chatHistory = [],
  projects = [],
  activeProjectId,
  setActiveProjectId,
  onCreateProject,
  onDeleteProject,
  onLoadChat,
  onDeleteChat,
  activeChatId,
  onSettingsClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');

  const categories = ['Work', 'Personal', 'Education', 'Coding', 'Marketing', 'Other'];

  const filteredHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const finalCategory = category === 'Other' ? customCategory : category;
    const success = await onCreateProject(newProjectName, finalCategory || 'General');

    if (success) {
      setNewProjectName('');
      setCategory('Work');
      setCustomCategory('');
      setIsModalOpen(false);
    }
  };

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

      <div
        className={`fixed md:static inset-y-0 left-0 z-30 bg-[var(--bg-sidebar)] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-2xl md:shadow-none h-full overflow-hidden flex flex-col
          ${isOpen ? 'w-[280px] translate-x-0 border-r border-[#1f2937]' : 'w-[280px] -translate-x-full md:translate-x-0 md:w-0 border-r border-transparent md:border-none'}`}
      >
        <div className="w-[280px] h-full flex flex-col shrink-0">
          {/* Header */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onNewChat}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
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

            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full bg-[var(--text-main)]/5 border border-[var(--text-main)]/10 text-xs text-[var(--text-main)] pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-gray-500/60 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">

            {/* Projects Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between px-3 py-2 mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Projects</span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-[#1f2937] rounded-lg"
                >
                  <FolderPlus size={16} />
                </button>
              </div>
              <div className="space-y-0.5">
                <div
                  onClick={() => setActiveProjectId(null)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group cursor-pointer
                    ${activeProjectId === null ? 'bg-blue-500/10 text-white' : 'text-gray-400 hover:bg-[#1f2937]/50 hover:text-white'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Folder size={14} className={activeProjectId === null ? 'text-blue-400' : 'text-gray-600'} />
                    <span className="text-sm font-medium">All Chats</span>
                  </div>
                </div>

                {projects.map(project => (
                  <div 
                    key={project._id}
                    onClick={() => setActiveProjectId(project._id)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer
                      ${activeProjectId === project._id ? 'bg-blue-500/10 text-white' : 'text-gray-400 hover:bg-[#1f2937]/50 hover:text-white'}`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Folder size={14} className={activeProjectId === project._id ? 'text-blue-400' : 'text-gray-600 group-hover:text-blue-500'} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate max-w-[120px]">{project.name}</span>
                        <span className="text-[9px] text-gray-500 truncate">{project.category || 'General'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md transition-colors group-hover:hidden
                        ${activeProjectId === project._id ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800/50'}`}>
                        {project.count}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete project "${project.name}"? Chats will be moved to "All Chats".`)) {
                            onDeleteProject(project._id);
                          }
                        }}
                        className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat History Section */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-[0.2em] mb-1">
                {activeProjectId ? 'Project Chats' : 'Recent Chats'}
              </div>

              {filteredHistory.length === 0 ? (
                <p className="text-[11px] text-gray-600 px-3 py-2 italic">
                  {searchQuery ? 'No matching chats' : 'No chats found'}
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredHistory.map((chat) => (
                    <div
                      key={chat._id}
                      className={`group relative flex items-center w-full px-3 py-3 rounded-xl transition-all cursor-pointer border border-transparent
                        ${activeChatId === chat._id
                          ? 'bg-blue-600/10 text-white border-blue-500/20'
                          : 'text-gray-400 hover:bg-[#1f2937]/80 hover:text-white'}`}
                    >
                      <button
                        onClick={() => onLoadChat(chat._id)}
                        className="flex items-center space-x-3 flex-1 min-w-0 text-left"
                      >
                        <MessageSquare
                          size={14}
                          className={`shrink-0 transition-colors ${activeChatId === chat._id ? 'text-blue-400' : 'text-gray-600 group-hover:text-blue-400'}`}
                        />
                        <span className="text-sm truncate font-medium">{chat.title}</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteChat(chat._id); }}
                        className="shrink-0 ml-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800/40 bg-[var(--bg-sidebar)]/80 backdrop-blur-xl">
            <button
              onClick={onSettingsClick}
              className="w-full flex items-center space-x-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-[#1f2937]/80 rounded-xl transition-all group"
            >
              <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-sm font-semibold tracking-wide">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* CREATE PROJECT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#111827] border border-gray-800 p-8 rounded-[2rem] shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <FolderPlus className="text-blue-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Create New Project</h2>
                <p className="text-gray-400 text-sm mt-1">Organize your AI chats into folders.</p>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Project Name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Work Research..."
                    className="w-full bg-[#0b0f19] border border-gray-800 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all placeholder-gray-700"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select
                    className="w-full bg-[#0b0f19] border border-gray-800 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {category === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Enter Category Name</label>
                    <input
                      type="text"
                      placeholder="Custom category..."
                      className="w-full bg-[#0b0f19] border border-gray-800 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all placeholder-gray-700"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 mt-4"
                >
                  <Plus size={18} />
                  <span>Create Project</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
