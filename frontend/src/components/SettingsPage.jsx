import React, { useState } from 'react';
import { User, Bell, Palette, Globe, Shield, Key, Layout, Type, Droplets, Save, LogOut, Check, Sliders, ChevronRight, Monitor, AlignLeft, Moon, Sun, Search, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DARK_PRESETS = {
  default: { name: 'Default Dark', bgDark: '#0b0f19', bgPanel: '#111827', bgSidebar: '#0b0f19', chatBubbleAi: '#1f2937', chatBubbleUser: '#3b82f6', textMain: '#f9fafb', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: false },
  ocean: { name: 'Oceanic', bgDark: '#0f172a', bgPanel: '#1e293b', bgSidebar: '#0f172a', chatBubbleAi: '#334155', chatBubbleUser: '#0ea5e9', textMain: '#f8fafc', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: true },
  midnight: { name: 'Midnight', bgDark: '#020617', bgPanel: '#0f172a', bgSidebar: '#020617', chatBubbleAi: '#1e293b', chatBubbleUser: '#6366f1', textMain: '#f1f5f9', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: false },
  forest: { name: 'Forest', bgDark: '#064e3b', bgPanel: '#065f46', bgSidebar: '#064e3b', chatBubbleAi: '#047857', chatBubbleUser: '#10b981', textMain: '#ecfdf5', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: false },
  sunset: { name: 'Sunset', bgDark: '#451a03', bgPanel: '#78350f', bgSidebar: '#451a03', chatBubbleAi: '#92400e', chatBubbleUser: '#ea580c', textMain: '#fffbeb', fontFamily: 'Poppins', fontSize: 16, chatMaxWidth: 56, isTransparent: true },
  hacker: { name: 'Matrix', bgDark: '#000000', bgPanel: '#0a0a0a', bgSidebar: '#000000', chatBubbleAi: '#171717', chatBubbleUser: '#22c55e', textMain: '#4ade80', fontFamily: 'monospace', fontSize: 15, chatMaxWidth: 64, isTransparent: false }
};

const LIGHT_PRESETS = {
  classic: { name: 'Pure White', bgDark: '#ffffff', bgPanel: '#f8fafc', bgSidebar: '#f1f5f9', chatBubbleAi: '#f1f5f9', chatBubbleUser: '#3b82f6', textMain: '#0f172a', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: false },
  minimal: { name: 'Minimal Grey', bgDark: '#f1f5f9', bgPanel: '#ffffff', bgSidebar: '#f8fafc', chatBubbleAi: '#f8fafc', chatBubbleUser: '#000000', textMain: '#1e293b', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: false },
  sky: { name: 'Daylight', bgDark: '#f0f9ff', bgPanel: '#ffffff', bgSidebar: '#e0f2fe', chatBubbleAi: '#e0f2fe', chatBubbleUser: '#0ea5e9', textMain: '#0c4a6e', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: false },
  softMint: { name: 'Spring', bgDark: '#f0fdf4', bgPanel: '#ffffff', bgSidebar: '#dcfce7', chatBubbleAi: '#dcfce7', chatBubbleUser: '#10b981', textMain: '#064e3b', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: false },
  lavender: { name: 'Lavender', bgDark: '#f5f3ff', bgPanel: '#ffffff', bgSidebar: '#ede9fe', chatBubbleAi: '#ede9fe', chatBubbleUser: '#8b5cf6', textMain: '#4c1d95', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: false },
  rose: { name: 'Blush', bgDark: '#fff1f2', bgPanel: '#ffffff', bgSidebar: '#ffe4e6', chatBubbleAi: '#ffe4e6', chatBubbleUser: '#f43f5e', textMain: '#881337', fontFamily: 'Poppins', fontSize: 15, chatMaxWidth: 56, isTransparent: false }
};

const SettingsPage = ({ user, theme, setTheme, onSaveTheme }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [themeMode, setThemeMode] = useState('dark');
  const [themeSearch, setThemeSearch] = useState('');

  const tabs = [
    { id: 'profile', label: 'Account & Security', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
  ];

  const rawPresets = themeMode === 'dark' ? DARK_PRESETS : LIGHT_PRESETS;
  const filteredPresets = Object.entries(rawPresets).filter(([key, preset]) => 
    preset.name.toLowerCase().includes(themeSearch.toLowerCase()) || 
    key.toLowerCase().includes(themeSearch.toLowerCase())
  );

  const ModernSwitch = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-500' : 'bg-gray-700'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );

  const ColorInput = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#111827]/40 border border-gray-800/60 hover:border-blue-500/30 transition-colors shadow-sm">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-inner ring-2 ring-[#374151]">
        <input 
          type="color" 
          value={value}
          onChange={onChange}
          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
        />
      </div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-transparent">
      {/* Top Header */}
      <div className="shrink-0 px-8 py-8 border-b border-gray-800/60 bg-[#111827]/40 backdrop-blur-xl z-10 sticky top-0">
        <h2 className="text-3xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-gray-400 mt-1">Manage your account and customize your experience.</p>
      </div>

      <div className="flex flex-1 overflow-hidden w-full max-w-7xl mx-auto">
        {/* Sidebar Tabs */}
        <div className="w-72 shrink-0 border-r border-gray-800/60 p-6 overflow-y-auto bg-[#111827]/10 hidden md:block">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-gray-400 hover:bg-[#1f2937]/60 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon size={18} className={`mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium text-[15px]">{tab.label}</span>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-white/70" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-4xl"
            >
              
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="bg-[#1f2937]/40 backdrop-blur-md rounded-3xl p-8 border border-gray-800/60 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-blue-500/10"></div>
                    <div className="flex items-center space-x-6 relative z-10">
                      <div className="relative">
                        <img
                          src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3b82f6&color=fff`}
                          alt="Profile"
                          className="w-24 h-24 rounded-2xl border border-gray-700 shadow-xl object-cover"
                        />
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 border-[3px] border-[#111827] rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{user?.name || 'IDR User'}</h3>
                        <p className="text-gray-400 font-medium">{user?.email || 'user@idrtech.com'}</p>
                        <div className="mt-4 flex space-x-3">
                          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20">Edit Profile</button>
                          <button className="px-5 py-2 bg-[#374151] hover:bg-[#4b5563] text-white rounded-xl text-sm font-medium transition-all">View Public Profile</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-5 flex items-center"><Shield size={20} className="mr-2 text-emerald-400" /> Security</h3>
                    <div className="bg-[#111827]/60 border border-gray-800/60 rounded-3xl overflow-hidden divide-y divide-gray-800/60">
                      <div className="flex items-center justify-between p-6 hover:bg-[#1f2937]/40 transition-colors cursor-pointer group">
                        <div className="flex items-center">
                          <div className="p-3 bg-gray-800/50 rounded-xl mr-4 group-hover:bg-gray-700/50 transition-colors">
                            <Key size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-white">Change Password</h4>
                            <p className="text-sm text-gray-500">Update your account password</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex items-center justify-between p-6 hover:bg-[#1f2937]/40 transition-colors cursor-pointer group">
                        <div className="flex items-center">
                          <div className="p-3 bg-gray-800/50 rounded-xl mr-4 group-hover:bg-gray-700/50 transition-colors">
                            <Shield size={18} className="text-gray-400 group-hover:text-emerald-400 transition-colors" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-white">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-500">Add an extra layer of security</p>
                          </div>
                        </div>
                        <span className="text-emerald-500 text-xs font-semibold tracking-wide uppercase bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-10">
                  <div>
                    <div className="flex flex-col space-y-6 mb-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                        <h3 className="text-xl font-bold text-white flex items-center">
                          <Palette size={20} className="mr-2 text-blue-400" /> Theme Templates
                        </h3>
                        
                        <div className="flex bg-[#111827] p-1.5 rounded-2xl border border-gray-800 shadow-inner self-start">
                          <button 
                            onClick={() => setThemeMode('dark')}
                            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${themeMode === 'dark' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            <Moon size={14} />
                            <span>Dark Mode</span>
                          </button>
                          <button 
                            onClick={() => setThemeMode('light')}
                            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${themeMode === 'light' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            <Sun size={14} />
                            <span>Light Mode</span>
                          </button>
                        </div>
                      </div>

                      {/* Theme Search Bar */}
                      <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                          <Search size={16} />
                        </div>
                        <input
                          type="text"
                          placeholder="Search themes (e.g. Midnight, Spring...)"
                          className="w-full bg-[#111827]/40 border border-gray-800 text-sm text-white pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-gray-600"
                          value={themeSearch}
                          onChange={(e) => setThemeSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    {filteredPresets.length === 0 ? (
                      <div className="text-center py-20 bg-[#111827]/20 rounded-[2.5rem] border border-dashed border-gray-800">
                        <Palette size={40} className="mx-auto text-gray-700 mb-4" />
                        <p className="text-gray-500 font-medium">No themes found matching "{themeSearch}"</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredPresets.map(([key, preset]) => {
                          const isSelected = theme.bgDark === preset.bgDark && theme.bgPanel === preset.bgPanel;
                          return (
                            <button 
                              key={key}
                              onClick={() => setTheme(preset)}
                              className={`p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center group relative overflow-hidden
                                ${isSelected ? 'border-blue-500 bg-blue-500/5 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20' : 'border-gray-800/60 hover:border-blue-500/30 bg-[#111827]/40'}
                              `}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full z-10 shadow-lg">
                                  <Check size={12} />
                                </div>
                              )}
                              <div 
                                className="w-full aspect-[4/3] rounded-2xl mb-4 shadow-2xl relative overflow-hidden transition-transform duration-700 group-hover:scale-110" 
                                style={{ background: preset.bgDark, border: `1px solid ${preset.bgPanel}`}}
                              >
                                <div className="absolute inset-0 flex" style={{ opacity: preset.isTransparent ? 0.7 : 1 }}>
                                  <div className="w-1/4 h-full border-r" style={{ borderColor: preset.bgPanel, background: preset.bgSidebar }}></div>
                                  <div className="w-3/4 h-full flex flex-col items-start justify-end p-3 space-y-1.5">
                                    <div className="w-2/3 h-1.5 rounded-full" style={{ background: preset.chatBubbleAi }}></div>
                                    <div className="w-1/2 h-1.5 rounded-full self-end" style={{ background: preset.chatBubbleUser }}></div>
                                  </div>
                                </div>
                              </div>
                              <span className={`text-[11px] font-bold capitalize tracking-[0.1em] ${isSelected ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                {preset.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#111827]/60 border border-gray-800/60 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
                    <h3 className="text-lg font-semibold text-white mb-8 flex items-center"><Monitor size={18} className="mr-2 text-purple-400" /> Layout & Typography</h3>
                    <div className="space-y-10 relative z-10">
                      <div className="flex items-center justify-between p-5 bg-gray-800/20 rounded-3xl border border-gray-800/60 hover:border-blue-500/30 transition-all">
                        <div>
                          <h4 className="text-base font-bold text-white flex items-center"><Droplets size={16} className="mr-2 text-purple-400" /> Glassmorphism Mode</h4>
                          <p className="text-sm text-gray-500 mt-1">Make panels beautifully semi-transparent.</p>
                        </div>
                        <ModernSwitch checked={theme.isTransparent} onChange={(val) => setTheme({ ...theme, isTransparent: val })} />
                      </div>

                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white flex items-center"><Type size={16} className="mr-2 text-gray-400" /> Font Style</h4>
                        <select 
                          value={theme.fontFamily}
                          onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                          className="bg-[#1f2937] border border-gray-800 text-white font-bold text-xs rounded-xl px-5 py-3 outline-none cursor-pointer focus:border-blue-500 transition-all"
                        >
                          <option value="Inter">Inter (Clean)</option>
                          <option value="Roboto">Roboto (Classic)</option>
                          <option value="Poppins">Poppins (Modern)</option>
                          <option value="monospace">Monospace (Code)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-bold text-white flex items-center"><Type size={16} className="mr-2 text-gray-400" /> Interface Scale</h4>
                          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">{theme.fontSize}px</span>
                        </div>
                        <input type="range" min="12" max="22" value={theme.fontSize} onChange={(e) => setTheme({ ...theme, fontSize: parseInt(e.target.value) })} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-bold text-white flex items-center"><AlignLeft size={16} className="mr-2 text-gray-400" /> Chat Width</h4>
                          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">{theme.chatMaxWidth}rem</span>
                        </div>
                        <input type="range" min="40" max="80" value={theme.chatMaxWidth} onChange={(e) => setTheme({ ...theme, chatMaxWidth: parseInt(e.target.value) })} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center"><Globe size={18} className="mr-2 text-blue-400" /> Background Image</h3>
                    <div className="space-y-6 bg-[#111827]/60 border border-gray-800/60 rounded-[2rem] p-8">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                          <Layout size={16} />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter Background Image URL (e.g. https://...)"
                          className="w-full bg-[#111827]/40 border border-gray-800 text-sm text-white pl-11 pr-24 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all placeholder-gray-600"
                          value={theme.bgImage || ''}
                          onChange={(e) => setTheme({...theme, bgImage: e.target.value})}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                          {theme.bgImage && (
                            <button 
                              onClick={() => setTheme({...theme, bgImage: ''})}
                              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                          <label className="p-2 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer bg-blue-400/5 rounded-xl hover:bg-blue-400/10">
                            <Upload size={18} />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                
                                const formData = new FormData();
                                formData.append('image', file);
                                
                                try {
                                  const res = await fetch('http://localhost:5000/api/auth/upload-bg', {
                                    method: 'POST',
                                    body: formData
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    setTheme({...theme, bgImage: data.url});
                                  }
                                } catch (err) {
                                  console.error('Upload failed:', err);
                                  alert('Failed to upload image.');
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { name: 'None', url: '' },
                          { name: 'Cyber City', url: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=1000' },
                          { name: 'Deep Space', url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=1000' },
                          { name: 'Morning Mist', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1000' },
                          { name: 'Abstract Flow', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000' },
                        ].map((bg) => (
                          <button
                            key={bg.name}
                            onClick={() => setTheme({...theme, bgImage: bg.url})}
                            className={`group relative h-20 rounded-2xl overflow-hidden border transition-all ${theme.bgImage === bg.url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-800 hover:border-gray-600'}`}
                          >
                            {!bg.url ? (
                              <div className="w-full h-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">None</div>
                            ) : (
                              <>
                                <img src={bg.url} alt={bg.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{bg.name}</span>
                                </div>
                              </>
                            )}
                            {theme.bgImage === bg.url && (
                              <div className="absolute top-1 right-1 bg-blue-500 text-white p-0.5 rounded-full z-10">
                                <Check size={10} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center"><Palette size={18} className="mr-2 text-pink-400" /> Advanced Color Controls</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <ColorInput label="App Background" value={theme.bgDark} onChange={(e) => setTheme({...theme, bgDark: e.target.value})} />
                      <ColorInput label="Sidebar Background" value={theme.bgSidebar} onChange={(e) => setTheme({...theme, bgSidebar: e.target.value})} />
                      <ColorInput label="Panel Background" value={theme.bgPanel} onChange={(e) => setTheme({...theme, bgPanel: e.target.value})} />
                      <ColorInput label="Text Color" value={theme.textMain} onChange={(e) => setTheme({...theme, textMain: e.target.value})} />
                      <ColorInput label="AI Bubble Color" value={theme.chatBubbleAi} onChange={(e) => setTheme({...theme, chatBubbleAi: e.target.value})} />
                      <ColorInput label="User Bubble Color" value={theme.chatBubbleUser} onChange={(e) => setTheme({...theme, chatBubbleUser: e.target.value})} />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl mt-12">
                    <div className="mb-6 md:mb-0 md:mr-8 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-white mb-2">Save Customized Theme</h3>
                      <p className="text-sm text-gray-400 max-w-md">Persist your custom styles across all devices by saving them to your cloud profile.</p>
                    </div>
                    <button onClick={onSaveTheme} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center active:scale-95"><Save size={20} className="mr-3" /> Save Changes</button>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <div className="bg-[#111827]/60 border border-gray-800/60 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-white mb-8">General Preferences</h3>
                    <div className="space-y-8">
                      <div className="flex items-center justify-between pb-8 border-b border-gray-800/60">
                        <div>
                          <h4 className="text-base font-bold text-white flex items-center"><Bell size={18} className="mr-2 text-yellow-400" /> Notifications & Sounds</h4>
                          <p className="text-sm text-gray-500 mt-1">Receive sound alerts when AI finishes generating.</p>
                        </div>
                        <ModernSwitch checked={true} onChange={() => {}} />
                      </div>
                      <div className="flex items-center justify-between pb-8 border-b border-gray-800/60">
                        <div>
                          <h4 className="text-base font-bold text-white flex items-center"><Globe size={18} className="mr-2 text-blue-400" /> Language</h4>
                          <p className="text-sm text-gray-500 mt-1">Select your preferred app language.</p>
                        </div>
                        <select className="bg-[#1f2937] border border-gray-800 text-white font-bold text-xs rounded-xl px-5 py-3 outline-none cursor-pointer">
                          <option>English (US)</option>
                          <option>Hindi</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
