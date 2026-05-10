import React, { useState, useEffect } from 'react';
import { PanelLeft } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import ModelSelector from './components/ModelSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);        // active session ID
  const [chatHistory, setChatHistory] = useState([]); // sidebar list
  const [aiModel, setAiModel] = useState('idr-ai-v1'); // selected AI model

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // ── Fetch sidebar chat history ──────────────────────────────────────────────
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/chat/history`);
      const data = await res.json();
      if (data.success) setChatHistory(data.chats);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
        headers: { 'Content-Type': 'application/json' },
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 p-[1.5px] shadow-sm cursor-pointer hover:shadow-emerald-500/20 transition-shadow">
              <div className="w-full h-full bg-[#111827] rounded-full border border-transparent flex items-center justify-center">
                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">IDR</span>
              </div>
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