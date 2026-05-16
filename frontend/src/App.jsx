import React, { useState, useEffect } from 'react';
import { PanelLeft, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import ModelSelector from './components/ModelSelector';
import Login from './components/Login';
import SettingsPage from './components/SettingsPage';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);        // active session ID
  const [chatHistory, setChatHistory] = useState([]); // sidebar list
  const [aiModel, setAiModel] = useState('idr-ai-v1'); // selected AI model
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'settings'
  const [notification, setNotification] = useState(null);
  
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
      chatMaxWidth: 56, // 56rem = max-w-4xl roughly
      isTransparent: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('app_theme', JSON.stringify(theme));
    const root = document.documentElement;
    root.style.setProperty('--bg-dark', theme.bgDark);
    
    if (theme.isTransparent) {
        root.style.setProperty('--bg-panel', theme.bgPanel + 'AA');
        root.style.setProperty('--bg-sidebar', theme.bgSidebar + 'AA');
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
    // A clean, soft notification pop sound
    const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg');
    audio.volume = 0.6;
    audio.play().catch(err => console.log('Audio play blocked:', err));
  };

  useEffect(() => {
    // Restore session
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
      } else {
        console.error('Backend error:', data.error);
        setNotification(`Failed: ${data.error || 'Please restart your backend server!'}`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error('Save theme error:', err);
      setNotification('Failed to save theme to profile.');
      setTimeout(() => setNotification(null), 4000);
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
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // ── Fetch sidebar chat history ──────────────────────────────────────────────
  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setChatHistory(data.chats);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  // ── Start a new blank chat ──────────────────────────────────────────────────
  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
    setCurrentView('chat');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // ── Load an existing chat from sidebar ─────────────────────────────────────
  const handleLoadChat = async (id) => {
    try {
      const res = await fetch(`${API_URL}/chat/${id}`);
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

  // ── Delete a chat from sidebar ─────────────────────────────────────────────
  const handleDeleteChat = async (id) => {
    try {
      await fetch(`${API_URL}/chat/${id}`, { method: 'DELETE' });
      if (chatId === id) handleNewChat();
      setChatHistory((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  // ── Send a message ─────────────────────────────────────────────────────────
  const handleSendMessage = async (text) => {
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
        body: JSON.stringify({ message: text, chatId, aiModel }),
      });

      const data = await res.json();

      if (data.success) {
        const aiMsg = { role: 'ai', content: data.reply, isNew: true };
        setMessages((prev) => [...prev, aiMsg]);
        // Update chatId if this was a new session
        if (!chatId) {
          setChatId(data.chatId);
          fetchHistory(); // refresh sidebar
        }
        const shortTaskName = text.length > 20 ? text.substring(0, 20) + '...' : text;
        setNotification(`Your task "${shortTaskName}" completed!`);
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
        { role: 'ai', content: '⚠️ Could not reach the server. Is the backend running?' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans selection:bg-blue-500/30 bg-[var(--bg-dark)] text-[var(--text-main)]">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        activeChatId={chatId}
        onSettingsClick={() => {
          setCurrentView('settings');
          if (window.innerWidth < 768) setSidebarOpen(false);
        }}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300 relative bg-[var(--bg-panel)]">
        <header className="flex items-center justify-between px-5 h-[60px] border-b border-[#1f2937]/60 shrink-0 bg-[var(--bg-panel)]/80 backdrop-blur-xl z-10 sticky top-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#1f2937]/80 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Toggle Sidebar"
            >
              <PanelLeft size={22} />
            </button>
            <h1 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 tracking-wide text-lg">IDR AI</h1>
          </div>
          <div className="flex items-center space-x-3">
            <ModelSelector aiModel={aiModel} setAiModel={setAiModel} />
            <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors hidden sm:block px-3">
              Upgrade Plan
            </button>
            <div className="flex items-center space-x-3 bg-[#1f2937]/50 rounded-full pl-3 pr-1 py-1 border border-gray-800/60 shadow-sm">
              <span className="text-sm font-medium text-gray-300 hidden md:block tracking-wide">{user?.name?.split(' ')[0] || 'User'}</span>
              <div className="relative group">
                <img 
                  src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=10b981&color=fff`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-gray-600 shadow-sm" 
                />
              </div>
              <button 
                onClick={handleLogout} 
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors ml-1 focus:outline-none" 
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {currentView === 'settings' ? (
          <SettingsPage user={user} theme={theme} setTheme={setTheme} onSaveTheme={saveThemeToDB} />
        ) : (
          <>
            <ChatWindow messages={messages} isLoading={isLoading} />
            <div className="shrink-0 bg-gradient-to-t from-[var(--bg-panel)] via-[var(--bg-panel)] to-transparent pt-6">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed top-6 right-6 z-[100] flex items-center bg-[#1f2937]/90 backdrop-blur-md border border-[#374151] shadow-2xl rounded-2xl px-4 py-3 text-white max-w-sm"
          >
            <CheckCircle2 size={20} className="text-emerald-400 mr-3 shrink-0" />
            <span className="text-sm font-medium mr-4 leading-snug">{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;