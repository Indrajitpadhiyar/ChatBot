import AppHeader from './AppHeader';
import GroupChatModal from './GroupChatModal';
import NotificationToast from './NotificationToast';
import Sidebar from './Sidebar';

const AppLayout = ({
  aiModel,
  children,
  chatId,
  chatHistory,
  isGroupModalOpen,
  isSidebarOpen,
  notification,
  onCloseGroupModal,
  onCloseNotification,
  onCreateProject,
  onDeleteChat,
  onDeleteProject,
  onLoadChat,
  onLogout,
  onNewChat,
  onPricingClick,
  onSettingsClick,
  onShareSuccess,
  onStartGroupSession,
  onUpdateChat,
  projects,
  selectedGroupModels,
  setActiveProjectId,
  setAiModel,
  setSelectedGroupModels,
  setGroupModalOpen,
  activeProjectId,
  theme,
  toggleSidebar,
  user,
}) => (
  <div className={`flex h-screen overflow-hidden font-sans selection:bg-blue-500/30 ${theme.bgImage ? 'bg-transparent' : 'bg-[var(--bg-dark)]'} text-[var(--text-main)]`}>
    <Sidebar
      isOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      onNewChat={onNewChat}
      chatHistory={chatHistory}
      projects={projects}
      activeProjectId={activeProjectId}
      setActiveProjectId={setActiveProjectId}
      onCreateProject={onCreateProject}
      onDeleteProject={onDeleteProject}
      onLoadChat={onLoadChat}
      onDeleteChat={onDeleteChat}
      onUpdateChat={onUpdateChat}
      onStartGroupChat={() => setGroupModalOpen(true)}
      onShareSuccess={onShareSuccess}
      activeChatId={chatId}
      onSettingsClick={onSettingsClick}
    />

    <div className={`flex-1 flex flex-col h-full min-w-0 transition-all duration-300 relative bg-[var(--bg-panel)] ${theme.bgImage ? 'backdrop-blur-md' : ''}`}>
      <AppHeader
        aiModel={aiModel}
        setAiModel={setAiModel}
        onLogout={onLogout}
        onPricingClick={onPricingClick}
        toggleSidebar={toggleSidebar}
        user={user}
      />
      {children}
    </div>

    <NotificationToast message={notification} onClose={onCloseNotification} />
    <GroupChatModal
      isOpen={isGroupModalOpen}
      onClose={onCloseGroupModal}
      selectedModels={selectedGroupModels}
      setSelectedModels={setSelectedGroupModels}
      onStart={onStartGroupSession}
    />
  </div>
);

export default AppLayout;
