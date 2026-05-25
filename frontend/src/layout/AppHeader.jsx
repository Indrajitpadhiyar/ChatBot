import { LogOut, PanelLeft } from 'lucide-react';
import ModelSelector from '../components/ModelSelector';

const AppHeader = ({
  aiModel,
  setAiModel,
  onLogout,
  onPricingClick,
  toggleSidebar,
  user,
}) => (
  <header className="flex items-center justify-between px-5 h-[60px] border-b border-[#1f2937]/60 shrink-0 bg-[var(--bg-panel)]/80 backdrop-blur-xl z-10 sticky top-0 shadow-sm">
    <div className="flex items-center space-x-3">
      <button
        onClick={toggleSidebar}
        className="p-2 text-gray-400 hover:text-white hover:bg-[#1f2937]/80 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        aria-label="Toggle sidebar"
      >
        <PanelLeft size={22} />
      </button>
      <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
      <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-t from-white to-blue-400 tracking-wide text-lg">
        IDR AI
      </h1>
    </div>

    <div className="flex items-center space-x-3">
      <ModelSelector aiModel={aiModel} setAiModel={setAiModel} />
      <button
        onClick={onPricingClick}
        className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors hidden sm:block px-3"
      >
        Upgrade Plan
      </button>
      <div className="flex items-center space-x-3 bg-[#1f2937]/50 rounded-full pl-3 pr-1 py-1 border border-gray-800/60 shadow-sm">
        <span className="text-sm font-medium text-gray-300 hidden md:block tracking-wide">
          {user?.name?.split(' ')[0] || 'User'}
        </span>
        <img
          src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=10b981&color=fff`}
          alt="Profile"
          className="w-8 h-8 rounded-full border border-gray-600 shadow-sm"
        />
        <button
          onClick={onLogout}
          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors ml-1"
          aria-label="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  </header>
);

export default AppHeader;
