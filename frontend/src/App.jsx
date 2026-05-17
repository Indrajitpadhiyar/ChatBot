import React, { useState, useEffect } from 'react';
import { PanelLeft, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import ModelSelector from './components/ModelSelector';
import Login from './components/Login';
import SettingsPage from './components/SettingsPage';
import PricingPage from './components/PricingPage';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, BrainCircuit } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);        
  const [chatHistory, setChatHistory] = useState([]); 
  const [projects, setProjects] = useState([]);      
  const [activeProjectId, setActiveProjectId] = useState(null); 
  const [aiModel, setAiModel] = useState('idr-ai-v1'); 
  const [currentView, setCurrentView] = useState('chat'); 
  const [notification, setNotification] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroupModels, setSelectedGroupModels] = useState(['idr-ai-v1', 'gpt-4o']);
  
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return saved ? JSON.parse(saved) : {
      bgDark: '#0b0f19',
      bgPanel: '#111827',
      bgSidebar: '#0b0f19',
      chatBubbleAi: '#1f2937',
      chatBubbleUser: '#3b82f6',
      textMain: '#f9fafb',
      fontFamily: 'Inter',
      fontSize: 15,
      chatMaxWidth: 56, 
      isTransparent: false,
      bgImage: '',
    };
  });

  useEffect(() => {
    localStorage.setItem('app_theme', JSON.stringify(theme));
    const root = document.documentElement;
    root.style.setProperty('--bg-dark', theme.bgDark);
    
    if (theme.bgImage) {
      root.style.setProperty('--bg-image', `url('${theme.bgImage}')`);
    } else {
      root.style.setProperty('--bg-image', 'none');
    }
    
    if (theme.isTransparent || theme.bgImage) {
        root.style.setProperty('--bg-panel', theme.bgPanel + '66');
        root.style.setProperty('--bg-sidebar', theme.bgSidebar + '66');
    } else {
        root.style.setProperty('--bg-panel', theme.bgPanel);
        root.style.setProperty('--bg-sidebar', theme.bgSidebar);
    }
    
    root.style.setProperty('--chat-bubble-ai', theme.chatBubbleAi);
    root.style.setProperty('--chat-bubble-user', theme.chatBubbleUser);
    root.style.setProperty('--text-main', theme.textMain);
    root.style.fontFamily = theme.fontFamily;
    root.style.fontSize = `${theme.fontSize}px`;
    root.style.setProperty('--chat-max-width', `${theme.chatMaxWidth}rem`);
  }, [theme]);

  const playNotificationSound = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg');
    audio.volume = 0.6;
    audio.play().catch(err => console.log('Audio play blocked:', err));
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.theme && Object.keys(parsedUser.theme).length > 0) {
        setTheme(parsedUser.theme);
      }
    }
  }, []);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    if (userData.theme && Object.keys(userData.theme).length > 0) {
      setTheme(userData.theme);
    }
  };

  const saveThemeToDB = async () => {
    if (!user || !token) return;
    try {
      const res = await fetch(`${API_URL}/auth/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email, theme })
      });
      const data = await res.json();
      if (data.success) {
        setNotification('Custom theme saved to profile!');
        playNotificationSound();
        setTimeout(() => setNotification(null), 4000);
        
        const updatedUser = { ...user, theme };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Save theme error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setMessages([]);
    setChatId(null);
    setChatHistory([]);
    setProjects([]);
    setActiveProjectId(null);
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const fetchHistory = async (projectId = activeProjectId) => {
    if (!token) return;
    try {
      const url = projectId 
        ? `${API_URL}/chat/history?projectId=${projectId}` 
        : `${API_URL}/chat/history`;
        
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setChatHistory(data.chats);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const fetchProjects = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setProjects(data.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
      fetchProjects();
    }
  }, [token, activeProjectId]);

  const handleCreateProject = async (name, category) => {
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, category })
      });
      const data = await res.json();
      if (data.success) {
        setProjects([...projects, { ...data.project, count: 0 }]);
        setNotification(`Project "${name}" created!`);
        playNotificationSound();
        setTimeout(() => setNotification(null), 3000);
        return true;
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      return false;
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
        if (activeProjectId === id) setActiveProjectId(null);
        setNotification('Project deleted successfully.');
        playNotificationSound();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
    setCurrentView('chat');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleLoadChat = async (id) => {
    try {
      const res = await fetch(`${API_URL}/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.chat.messages);
        setChatId(id);
        setCurrentView('chat');
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      await fetch(`${API_URL}/chat/${id}`, { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (chatId === id) handleNewChat();
      setChatHistory((prev) => prev.filter((c) => c._id !== id));
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleUpdateChat = async (id, fields) => {
    try {
      const res = await fetch(`${API_URL}/chat/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (data.success) {
        setChatHistory((prev) => 
          prev.map((chat) => (chat._id === id ? { ...chat, ...fields } : chat))
        );
        fetchProjects(); // Refresh counts in projects
        if (fields.title) {
          setNotification('Chat renamed!');
        } else if (fields.isPinned !== undefined) {
          setNotification(fields.isPinned ? 'Chat pinned to top!' : 'Chat unpinned!');
        } else if (fields.isArchived !== undefined) {
          setNotification(fields.isArchived ? 'Chat archived!' : 'Chat restored!');
        } else if (fields.projectId !== undefined) {
          const targetProj = projects.find(p => p._id === fields.projectId);
          setNotification(targetProj ? `Chat moved to ${targetProj.name}!` : 'Chat moved to All Chats!');
        }
        playNotificationSound();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update chat:', err);
    }
  };

  const handleSendMessage = async (text, editIndex = null) => {
    // If it's an edit, truncate the local messages array first
    if (editIndex !== null) {
      setMessages((prev) => prev.slice(0, editIndex));
    }

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          message: text, 
          chatId, 
          aiModel,
          projectId: activeProjectId,
          editIndex // Send to backend to truncate DB history
        }),
      });

      if (res.status === 401) {
        handleLogout();
        setNotification('Session expired. Please log in again.');
        return;
      }

      const data = await res.json();

      if (data.success) {
        if (data.replies && data.replies.length > 0) {
          const aiMsgs = data.replies.map(r => ({ role: 'ai', content: r.reply, model: r.model, isNew: true }));
          setMessages((prev) => [...prev, ...aiMsgs]);
        } else {
          const aiMsg = { role: 'ai', content: data.reply, model: data.model, isNew: true };
          setMessages((prev) => [...prev, aiMsg]);
        }
        if (!chatId) {
          setChatId(data.chatId);
          fetchHistory();
          fetchProjects();
        }
        const shortTaskName = text.length > 20 ? text.substring(0, 20) + '...' : text;
        setNotification(editIndex !== null ? 'Conversation regenerated!' : `Your task "${shortTaskName}" completed!`);
        playNotificationSound();
        setTimeout(() => setNotification(null), 4000);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', content: `⚠️ Error: ${data.error}` },
        ]);
      }
    } catch (err) {
      console.error('Send error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: '⚠️ Could not reach the server.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden font-sans selection:bg-blue-500/30 ${theme.bgImage ? 'bg-transparent' : 'bg-[var(--bg-dark)]'} text-[var(--text-main)]`}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        projects={projects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        onUpdateChat={handleUpdateChat}
        onStartGroupChat={() => setIsGroupModalOpen(true)}
        onShareSuccess={(msg) => {
          setNotification(msg);
          playNotificationSound();
          setTimeout(() => setNotification(null), 4000);
        }}
        activeChatId={chatId}
        onSettingsClick={() => {
          setCurrentView('settings');
          if (window.innerWidth < 768) setSidebarOpen(false);
        }}
      />

      <div className={`flex-1 flex flex-col h-full min-w-0 transition-all duration-300 relative bg-[var(--bg-panel)] ${theme.bgImage ? 'backdrop-blur-md' : ''}`}>
        <header className="flex items-center justify-between px-5 h-[60px] border-b border-[#1f2937]/60 shrink-0 bg-[var(--bg-panel)]/80 backdrop-blur-xl z-10 sticky top-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#1f2937]/80 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <PanelLeft size={22} />
            </button>
            <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
            <h1 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 tracking-wide text-lg">IDR AI</h1>
          </div>
          <div className="flex items-center space-x-3">
            <ModelSelector aiModel={aiModel} setAiModel={setAiModel} />
            <button 
              onClick={() => setCurrentView('pricing')}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors hidden sm:block px-3"
            >
              Upgrade Plan
            </button>
            <div className="flex items-center space-x-3 bg-[#1f2937]/50 rounded-full pl-3 pr-1 py-1 border border-gray-800/60 shadow-sm">
              <span className="text-sm font-medium text-gray-300 hidden md:block tracking-wide">{user?.name?.split(' ')[0] || 'User'}</span>
              <img 
                src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=10b981&color=fff`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-gray-600 shadow-sm" 
              />
              <button 
                onClick={handleLogout} 
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors ml-1" 
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {currentView === 'settings' ? (
          <SettingsPage user={user} theme={theme} setTheme={setTheme} onSaveTheme={saveThemeToDB} />
        ) : currentView === 'pricing' ? (
          <PricingPage 
            user={user} 
            token={token} 
            onBack={() => setCurrentView('chat')} 
            onUpgradeSuccess={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setNotification(`Welcome to ${updatedUser.plan.toUpperCase()}! Your account has been upgraded.`);
              playNotificationSound();
              setTimeout(() => setNotification(null), 5000);
              setCurrentView('chat');
            }}
          />
        ) : (
          <>
            <ChatWindow messages={messages} isLoading={isLoading} onEdit={handleSendMessage} />
            <div className="shrink-0 bg-gradient-to-t from-[var(--bg-panel)] via-[var(--bg-panel)] to-transparent pt-6">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] flex items-center bg-[#1f2937]/90 backdrop-blur-md border border-[#374151] shadow-2xl rounded-2xl px-4 py-3 text-white"
          >
            <CheckCircle2 size={20} className="text-emerald-400 mr-3" />
            <span className="text-sm font-medium mr-4">{notification}</span>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GROUP CHAT SWARM MODAL */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setIsGroupModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#111827] border border-gray-800 p-8 rounded-[2rem] shadow-2xl z-10"
            >
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
                  <BrainCircuit className="text-indigo-400 animate-pulse" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Start AI Swarm Chat</h2>
                <p className="text-gray-400 text-sm mt-1">Select multiple AI models to respond collaboratively in real-time!</p>
              </div>

              <div className="space-y-3 my-6 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {[
                  { id: 'idr-ai-v1', name: '✨ IDR AI', desc: 'Custom trained advanced Gemini model', badgeColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
                  { id: 'gpt-4o', name: '🤖 GPT-4o', desc: 'OpenAI\'s flagship high-intelligence model', badgeColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                  { id: 'deepseek-chat', name: '⚡ DeepSeek V3', desc: 'Advanced DeepSeek reasoning & chat agent', badgeColor: 'text-blue-400 border-blue-500/20 bg-blue-500/5' },
                  { id: 'gemini-2.5-pro', name: '🔮 Gemini 2.5 Pro', desc: 'Google\'s pro-level complex tasks agent', badgeColor: 'text-purple-400 border-purple-500/20 bg-purple-500/5' },
                  { id: 'gemini-2.5-flash', name: '💨 Gemini 2.5 Flash', desc: 'Super fast general-purpose chatbot', badgeColor: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' },
                ].map((model) => {
                  const isChecked = selectedGroupModels.includes(model.id);
                  return (
                    <label
                      key={model.id}
                      className={`flex items-start justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none
                        ${isChecked 
                          ? 'bg-indigo-600/10 border-indigo-500/55 shadow-md shadow-indigo-500/5' 
                          : 'bg-[#0b0f19] border-gray-800/80 hover:border-gray-700/80 hover:bg-[#111827]/40'
                        }`}
                    >
                      <div className="flex items-start space-x-3 min-w-0 pr-3">
                        <input
                          type="checkbox"
                          className="mt-1 accent-indigo-500 cursor-pointer w-4 h-4 rounded"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedGroupModels(prev => prev.filter(id => id !== model.id));
                            } else {
                              setSelectedGroupModels(prev => [...prev, model.id]);
                            }
                          }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-white tracking-wide">{model.name}</span>
                          <span className="text-xs text-gray-500 mt-0.5 leading-relaxed">{model.desc}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase shrink-0 ${model.badgeColor}`}>
                        {model.id === 'idr-ai-v1' ? 'Custom' : 'API'}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  disabled={selectedGroupModels.length < 2}
                  onClick={() => {
                    setAiModel(`group:${selectedGroupModels.join(',')}`);
                    setIsGroupModalOpen(false);
                    setNotification('⚡ Swarm Collaboration activated!');
                    playNotificationSound();
                    setTimeout(() => setNotification(null), 4000);
                  }}
                  className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2
                    ${selectedGroupModels.length >= 2
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/20 active:scale-95 cursor-pointer'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/20'
                    }`}
                >
                  <BrainCircuit size={18} />
                  <span>Start Swarm Session ({selectedGroupModels.length} Models)</span>
                </button>
                <div className="text-[10px] text-gray-500 text-center">
                  *Requires at least 2 models. Swarms run queries in parallel.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;