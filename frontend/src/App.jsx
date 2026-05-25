import { useEffect, useState } from 'react';
import AppLayout from './layout/AppLayout';
import ChatInput from './components/ChatInput';
import ChatWindow from './components/ChatWindow';
import Login from './components/Login';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_THEME = {
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
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem('app_theme', JSON.stringify(theme));

    const root = document.documentElement;
    root.style.setProperty('--bg-dark', theme.bgDark);
    root.style.setProperty('--bg-image', theme.bgImage ? `url('${theme.bgImage}')` : 'none');
    root.style.setProperty('--bg-panel', theme.isTransparent || theme.bgImage ? `${theme.bgPanel}66` : theme.bgPanel);
    root.style.setProperty('--bg-sidebar', theme.isTransparent || theme.bgImage ? `${theme.bgSidebar}66` : theme.bgSidebar);
    root.style.setProperty('--chat-bubble-ai', theme.chatBubbleAi);
    root.style.setProperty('--chat-bubble-user', theme.chatBubbleUser);
    root.style.setProperty('--text-main', theme.textMain);
    root.style.setProperty('--chat-max-width', `${theme.chatMaxWidth}rem`);
    root.style.fontFamily = theme.fontFamily;
    root.style.fontSize = `${theme.fontSize}px`;
  }, [theme]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);

      if (parsedUser.theme && Object.keys(parsedUser.theme).length > 0) {
        setTheme(parsedUser.theme);
      }
    }
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg');
    audio.volume = 0.6;
    audio.play().catch((err) => console.log('Audio play blocked:', err));
  };

  const showNotification = (message, duration = 4000) => {
    setNotification(message);
    playNotificationSound();
    setTimeout(() => setNotification(null), duration);
  };

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);

    if (userData.theme && Object.keys(userData.theme).length > 0) {
      setTheme(userData.theme);
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

  const toggleSidebar = () => setSidebarOpen((value) => !value);

  const fetchHistory = async (projectId = activeProjectId) => {
    if (!token) return;

    try {
      const url = projectId ? `${API_URL}/chat/history?projectId=${projectId}` : `${API_URL}/chat/history`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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

  const saveThemeToDB = async () => {
    if (!user || !token) return;

    try {
      const res = await fetch(`${API_URL}/auth/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email, theme }),
      });
      const data = await res.json();

      if (data.success) {
        const updatedUser = { ...user, theme };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showNotification('Custom theme saved to profile!');
      }
    } catch (err) {
      console.error('Save theme error:', err);
    }
  };

  const handleCreateProject = async (name, category) => {
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, category }),
      });
      const data = await res.json();

      if (data.success) {
        setProjects((prev) => [...prev, { ...data.project, count: 0 }]);
        showNotification(`Project "${name}" created!`, 3000);
        return true;
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }

    return false;
  };

  const handleDeleteProject = async (id) => {
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setProjects((prev) => prev.filter((project) => project._id !== id));
        if (activeProjectId === id) setActiveProjectId(null);
        showNotification('Project deleted successfully.', 3000);
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (chatId === id) handleNewChat();
      setChatHistory((prev) => prev.filter((chat) => chat._id !== id));
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fields),
      });
      const data = await res.json();

      if (data.success) {
        setChatHistory((prev) => prev.map((chat) => (chat._id === id ? { ...chat, ...fields } : chat)));
        fetchProjects();

        if (fields.title) {
          showNotification('Chat renamed!', 3000);
        } else if (fields.isPinned !== undefined) {
          showNotification(fields.isPinned ? 'Chat pinned to top!' : 'Chat unpinned!', 3000);
        } else if (fields.isArchived !== undefined) {
          showNotification(fields.isArchived ? 'Chat archived!' : 'Chat restored!', 3000);
        } else if (fields.projectId !== undefined) {
          const targetProject = projects.find((project) => project._id === fields.projectId);
          showNotification(targetProject ? `Chat moved to ${targetProject.name}!` : 'Chat moved to All Chats!', 3000);
        }
      }
    } catch (err) {
      console.error('Failed to update chat:', err);
    }
  };

  const handleSendMessage = async (text, editIndex = null, files = []) => {
    if (editIndex !== null) {
      setMessages((prev) => prev.slice(0, editIndex));
    }

    const localAttachments = files.map((file) => ({
      originalName: file.name,
      mimetype: file.type || 'application/octet-stream',
      size: file.size,
    }));

    setMessages((prev) => [...prev, { role: 'user', content: text || 'Attached file(s)', attachments: localAttachments }]);
    setIsLoading(true);

    try {
      const hasFiles = files.length > 0;
      const requestOptions = hasFiles
        ? (() => {
          const formData = new FormData();
          formData.append('message', text);
          formData.append('chatId', chatId || '');
          formData.append('aiModel', aiModel);
          formData.append('projectId', activeProjectId || '');
          if (editIndex !== null) formData.append('editIndex', String(editIndex));
          files.forEach((file) => formData.append('files', file));

          return {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          };
        })()
        : {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text,
            chatId,
            aiModel,
            projectId: activeProjectId,
            editIndex,
          }),
        };

      const res = await fetch(`${API_URL}/chat/send`, requestOptions);

      if (res.status === 401) {
        handleLogout();
        showNotification('Session expired. Please log in again.');
        return;
      }

      const data = await res.json();

      if (data.success) {
        if (data.replies && data.replies.length > 0) {
          const aiMessages = data.replies.map((reply) => ({
            role: 'ai',
            content: reply.reply,
            model: reply.model,
            isNew: true,
          }));
          setMessages((prev) => [...prev, ...aiMessages]);
        } else {
          setMessages((prev) => [...prev, {
            role: 'ai',
            content: data.reply,
            model: data.model,
            isNew: true,
          }]);
        }

        if (!chatId) {
          setChatId(data.chatId);
          fetchHistory();
          fetchProjects();
        }

        const shortTaskName = text.length > 20 ? `${text.substring(0, 20)}...` : text;
        showNotification(editIndex !== null ? 'Conversation regenerated!' : `Your task "${shortTaskName}" completed!`);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: `Warning: ${data.error}` }]);
      }
    } catch (err) {
      console.error('Send error:', err);
      setMessages((prev) => [...prev, { role: 'ai', content: 'Could not reach the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGroupSession = () => {
    setAiModel(`group:${selectedGroupModels.join(',')}`);
    setIsGroupModalOpen(false);
    showNotification('Swarm collaboration activated!');
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppLayout
      aiModel={aiModel}
      chatId={chatId}
      chatHistory={chatHistory}
      isGroupModalOpen={isGroupModalOpen}
      isSidebarOpen={isSidebarOpen}
      notification={notification}
      onCloseGroupModal={() => setIsGroupModalOpen(false)}
      onCloseNotification={() => setNotification(null)}
      onCreateProject={handleCreateProject}
      onDeleteChat={handleDeleteChat}
      onDeleteProject={handleDeleteProject}
      onLoadChat={handleLoadChat}
      onLogout={handleLogout}
      onNewChat={handleNewChat}
      onPricingClick={() => setCurrentView('pricing')}
      onSettingsClick={() => {
        setCurrentView('settings');
        if (window.innerWidth < 768) setSidebarOpen(false);
      }}
      onShareSuccess={(message) => showNotification(message)}
      onStartGroupSession={handleStartGroupSession}
      onUpdateChat={handleUpdateChat}
      projects={projects}
      selectedGroupModels={selectedGroupModels}
      setActiveProjectId={setActiveProjectId}
      setAiModel={setAiModel}
      setGroupModalOpen={setIsGroupModalOpen}
      setSelectedGroupModels={setSelectedGroupModels}
      activeProjectId={activeProjectId}
      theme={theme}
      toggleSidebar={toggleSidebar}
      user={user}
    >
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
            showNotification(`Welcome to ${updatedUser.plan.toUpperCase()}! Your account has been upgraded.`, 5000);
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
    </AppLayout>
  );
}

export default App;
