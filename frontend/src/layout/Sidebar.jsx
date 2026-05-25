import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
  MoreHorizontal,
  Share,
  UserPlus,
  Pencil,
  ChevronRight,
  ChevronDown,
  Pin,
  Archive
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
  onUpdateChat,
  onStartGroupChat,
  onShareSuccess,
  activeChatId,
  onSettingsClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');

  // 3-dot Dropdown & Renaming States
  const [activeDropdownChatId, setActiveDropdownChatId] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renamingTitle, setRenamingTitle] = useState('');
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const dropdownRef = useRef(null);

  // Click-outside listener to dismiss dropdown (replaces z-index overlay)
  useEffect(() => {
    if (!activeDropdownChatId) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      if (e.target.closest('.dropdown-box')) return;
      setActiveDropdownChatId(null);
      setOpenSubmenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownChatId]);

  const categories = ['Work', 'Personal', 'Education', 'Coding', 'Marketing', 'Other'];

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

  // Filter and Partition Chats
  const searchedHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pinnedChats = searchedHistory.filter(c => c.isPinned && !c.isArchived);
  const normalChats = searchedHistory.filter(c => !c.isPinned && !c.isArchived);
  const archivedChats = searchedHistory.filter(c => c.isArchived);

  // Render a Single Chat Item
  const renderChatItem = (chat) => {
    const isRenaming = renamingChatId === chat._id;
    const isDropdownOpen = activeDropdownChatId === chat._id;

    return (
      <div
        key={chat._id}
        className={`group relative flex items-center w-full px-3 py-2.5 rounded-xl transition-all cursor-pointer border border-transparent select-none
          ${activeChatId === chat._id
            ? 'bg-blue-600/10 text-white border-blue-500/20'
            : 'text-gray-400 hover:bg-[#1f2937]/80 hover:text-white'}`}
      >
        {isRenaming ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (renamingTitle.trim() && renamingTitle.trim() !== chat.title) {
                onUpdateChat(chat._id, { title: renamingTitle.trim() });
              }
              setRenamingChatId(null);
            }}
            className="flex-1 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              className="w-full bg-[#0b0f19] border border-blue-500/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={renamingTitle}
              onChange={(e) => setRenamingTitle(e.target.value)}
              onBlur={() => {
                if (renamingTitle.trim() && renamingTitle.trim() !== chat.title) {
                  onUpdateChat(chat._id, { title: renamingTitle.trim() });
                }
                setRenamingChatId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setRenamingChatId(null);
              }}
              autoFocus
            />
          </form>
        ) : (
          <>
            <button
              onClick={() => onLoadChat(chat._id)}
              className="flex items-center space-x-3 flex-1 min-w-0 text-left"
            >
              <MessageSquare
                size={14}
                className={`shrink-0 transition-colors ${activeChatId === chat._id ? 'text-blue-400' : 'text-gray-600 group-hover:text-blue-400'} ${chat.isPinned ? 'text-blue-400' : ''}`}
              />
              <span className="text-sm truncate font-medium">{chat.title}</span>
            </button>

            {chat.isPinned && !isDropdownOpen && (
              <Pin size={11} className="shrink-0 ml-1 text-blue-400 rotate-45 opacity-60 group-hover:opacity-0 transition-opacity" />
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdownChatId(isDropdownOpen ? null : chat._id);
                setOpenSubmenu(false);
              }}
              className={`shrink-0 ml-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer ${isDropdownOpen ? 'opacity-100 bg-gray-800/80 text-white' : ''}`}
            >
              <MoreHorizontal size={14} />
            </button>

            {/* Float Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-2 top-11 w-52 z-50 dropdown-box"
                  ref={dropdownRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Share */}
                  <button
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        navigator.clipboard.writeText(`${window.location.origin}/chat/${chat._id}`);
                      } catch (err) {
                        const el = document.createElement('textarea');
                        el.value = `${window.location.origin}/chat/${chat._id}`;
                        document.body.appendChild(el);
                        el.select();
                        document.execCommand('copy');
                        document.body.removeChild(el);
                      }
                      if (onShareSuccess) onShareSuccess("🔗 Share link copied!");
                      setActiveDropdownChatId(null);
                    }}
                  >
                    <Share size={15} />
                    <span>Share</span>
                  </button>

                  {/* Start a group chat */}
                  <button
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onStartGroupChat) onStartGroupChat();
                      setActiveDropdownChatId(null);
                    }}
                  >
                    <UserPlus size={15} />
                    <span>Start a group chat</span>
                  </button>

                  {/* Rename */}
                  <button
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingChatId(chat._id);
                      setRenamingTitle(chat.title);
                      setActiveDropdownChatId(null);
                    }}
                  >
                    <Pencil size={15} />
                    <span>Rename</span>
                  </button>

                  {/* Move to project */}
                  <div className="relative">
                    <button
                      className="dropdown-item"
                      onClick={(e) => { e.stopPropagation(); setOpenSubmenu(!openSubmenu); }}
                      style={{ justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Folder size={15} />
                        <span>Move to project</span>
                      </div>
                      <ChevronRight size={12} style={{ color: '#6b7280', transition: 'transform 0.2s', transform: openSubmenu ? 'rotate(90deg)' : 'none' }} />
                    </button>

                    {/* Submenu */}
                    <AnimatePresence>
                      {openSubmenu && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute left-[-13.5rem] top-0 w-52 z-[60] dropdown-box"
                        >
                          <div style={{ padding: '4px 12px 6px', fontSize: 9, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(55,65,81,0.4)', marginBottom: 4 }}>
                            Select Destination
                          </div>
                          <button
                            className="dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateChat(chat._id, { projectId: null });
                              setActiveDropdownChatId(null);
                              setOpenSubmenu(false);
                            }}
                          >
                            <Folder size={13} />
                            <span>All Chats (No Project)</span>
                          </button>
                          {projects.map(proj => (
                            <button
                              key={proj._id}
                              className="dropdown-item"
                              style={chat.projectId === proj._id ? { color: '#60a5fa', background: 'rgba(59,130,246,0.08)' } : {}}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateChat(chat._id, { projectId: proj._id });
                                setActiveDropdownChatId(null);
                                setOpenSubmenu(false);
                              }}
                            >
                              <Folder size={13} style={chat.projectId === proj._id ? { color: '#60a5fa' } : {}} />
                              <span style={{ flex: 1 }}>{proj.name}</span>
                              {chat.projectId === proj._id && (
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="dropdown-divider" />

                  {/* Pin chat */}
                  <button
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateChat(chat._id, { isPinned: !chat.isPinned });
                      setActiveDropdownChatId(null);
                    }}
                  >
                    <Pin size={15} style={chat.isPinned ? { color: '#60a5fa' } : {}} />
                    <span>{chat.isPinned ? 'Unpin chat' : 'Pin chat'}</span>
                  </button>

                  {/* Archive */}
                  <button
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateChat(chat._id, { isArchived: !chat.isArchived });
                      setActiveDropdownChatId(null);
                    }}
                  >
                    <Archive size={15} />
                    <span>{chat.isArchived ? 'Restore chat' : 'Archive'}</span>
                  </button>

                  {/* Delete */}
                  <button
                    className="dropdown-item dropdown-item-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToDelete(chat);
                      setActiveDropdownChatId(null);
                    }}
                  >
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    );
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
              {/* Pinned Chats */}
              {pinnedChats.length > 0 && (
                <div className="mb-4">
                  <div className="text-[10px] font-bold text-blue-400 px-3 py-1.5 uppercase tracking-[0.2em] flex items-center space-x-1.5">
                    <Pin size={10} className="rotate-45" />
                    <span>Pinned</span>
                  </div>
                  <div className="space-y-0.5">
                    {pinnedChats.map((chat) => renderChatItem(chat))}
                  </div>
                </div>
              )}

              {/* Recent Chats Section Header */}
              <div className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-[0.2em] mb-1">
                {activeProjectId ? 'Project Chats' : 'Recent Chats'}
              </div>

              {normalChats.length === 0 && pinnedChats.length === 0 ? (
                <p className="text-[11px] text-gray-600 px-3 py-2 italic">
                  {searchQuery ? 'No matching chats' : 'No chats found'}
                </p>
              ) : (
                <div className="space-y-0.5">
                  {normalChats.map((chat) => renderChatItem(chat))}
                </div>
              )}

              {/* Archived Chats */}
              {archivedChats.length > 0 && (
                <div className="mt-5 border-t border-gray-800/40 pt-4">
                  <button
                    onClick={() => setIsArchivedExpanded(!isArchivedExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 text-gray-500 hover:text-gray-300 text-xs font-semibold tracking-wide transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Archive size={12} />
                      <span>Archived ({archivedChats.length})</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isArchivedExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isArchivedExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-0.5 mt-2 pl-0.5"
                      >
                        {archivedChats.map((chat) => renderChatItem(chat))}
                      </motion.div>
                    )}
                  </AnimatePresence>
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

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {chatToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setChatToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-[var(--bg-panel)] text-[var(--text-main)] p-7 rounded-[2rem] shadow-2xl z-10 select-none border border-[var(--text-main)]/10"
            >
              <h3 className="text-xl font-bold tracking-tight mb-2">Delete chat?</h3>
              <p className="text-[14px] opacity-80 mb-1 leading-relaxed">
                This will delete <strong className="font-bold text-[var(--text-main)]">{chatToDelete.title}</strong>.
              </p>
              <p className="text-[12px] opacity-40 mb-6 leading-relaxed">
                Visit <span className="underline cursor-pointer hover:opacity-80">settings</span> to delete any memories saved during this chat.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setChatToDelete(null)}
                  className="px-5 py-2.5 rounded-full border border-[var(--text-main)]/20 text-[var(--text-main)] hover:bg-[var(--text-main)]/5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95 outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteChat(chatToDelete._id);
                    setChatToDelete(null);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#d92d20] hover:bg-[#b42318] text-white text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shadow-md shadow-red-500/10 outline-none"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
