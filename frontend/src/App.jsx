import React, { useState, useEffect } from 'react';
import { PanelLeft, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import ModelSelector from './components/ModelSelector';
import Login from './components/Login';

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

  useEffect(() => {
    // Restore session
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
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
    <div className="flex h-screen bg-[#0b0f19] text-gray-100 overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        activeChatId={chatId}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300 relative bg-[#111827]">
        <header className="flex items-center justify-between px-5 h-[60px] border-b border-[#1f2937]/60 shrink-0 bg-[#111827]/80 backdrop-blur-xl z-10 sticky top-0 shadow-sm">
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

        <ChatWindow messages={messages} isLoading={isLoading} />

        <div className="shrink-0 bg-gradient-to-t from-[#111827] via-[#111827] to-transparent pt-6">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default App;