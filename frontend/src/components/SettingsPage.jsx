import React, { useState } from 'react';
import { User, Bell, Palette, Globe, Shield, Key, Layout, Type, Droplets, Save, LogOut, Check, Sliders, ChevronRight, Monitor, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = {
  ocean: { bgDark: '#0f172a', bgPanel: '#1e293b', bgSidebar: '#0f172a', chatBubbleAi: '#334155', chatBubbleUser: '#0ea5e9', textMain: '#f8fafc', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: true },
  forest: { bgDark: '#064e3b', bgPanel: '#065f46', bgSidebar: '#064e3b', chatBubbleAi: '#047857', chatBubbleUser: '#10b981', textMain: '#ecfdf5', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: false },
  hacker: { bgDark: '#000000', bgPanel: '#0a0a0a', bgSidebar: '#000000', chatBubbleAi: '#171717', chatBubbleUser: '#22c55e', textMain: '#4ade80', fontFamily: 'monospace', fontSize: 15, chatMaxWidth: 64, isTransparent: false },
  default: { bgDark: '#0b0f19', bgPanel: '#111827', bgSidebar: '#0b0f19', chatBubbleAi: '#1f2937', chatBubbleUser: '#3b82f6', textMain: '#f9fafb', fontFamily: 'Inter', fontSize: 15, chatMaxWidth: 56, isTransparent: false },
  sunset: { bgDark: '#451a03', bgPanel: '#78350f', bgSidebar: '#451a03', chatBubbleAi: '#92400e', chatBubbleUser: '#ea580c', textMain: '#fffbeb', fontFamily: 'Poppins', fontSize: 16, chatMaxWidth: 56, isTransparent: true }
};

const SettingsPage = ({ user, theme, setTheme, onSaveTheme }) => {
  const [activeTab, setActiveTab] = useState('appearance');

  const tabs = [
    { id: 'profile', label: 'Account & Security', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
  ];

  // Modern Switch Component
  const ModernSwitch = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-500' : 'bg-gray-700'}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );

  // Modern Color Input
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
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
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
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  {/* Profile Card */}
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
                          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20">
                            Edit Profile
                          </button>
                          <button className="px-5 py-2 bg-[#374151] hover:bg-[#4b5563] text-white rounded-xl text-sm font-medium transition-all">
                            View Public Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Options */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-5 flex items-center">
                      <Shield size={20} className="mr-2 text-emerald-400" /> Security
                    </h3>
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

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <div className="space-y-10">
                  {/* Presets */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-5 flex items-center">
                      <Palette size={20} className="mr-2 text-blue-400" /> Theme Templates
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Object.entries(PRESETS).map(([key, preset]) => {
                        const isSelected = 
                          theme.bgDark === preset.bgDark && 
                          theme.bgPanel === preset.bgPanel;

                        return (
                          <button 
                            key={key}
                            onClick={() => setTheme(preset)}
                            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center group relative overflow-hidden
                              ${isSelected ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50' : 'border-gray-700/50 hover:border-gray-500 bg-[#111827]/40'}
                            `}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white p-0.5 rounded-full z-10 shadow-md">
                                <Check size={12} />
                              </div>
                            )}
                            <div 
                              className="w-full aspect-[4/3] rounded-xl mb-3 shadow-inner relative overflow-hidden" 
                              style={{ background: preset.bgDark, border: `1px solid ${preset.bgPanel}`}}
                            >
                              <div className="absolute inset-0 flex" style={{ opacity: preset.isTransparent ? 0.7 : 1 }}>
                                <div className="w-1/3 h-full border-r" style={{ borderColor: preset.bgPanel, background: preset.bgSidebar }}></div>
                                <div className="w-2/3 h-full flex flex-col items-start justify-end p-2 space-y-1">
                                  <div className="w-3/4 h-2 rounded-full" style={{ background: preset.chatBubbleAi }}></div>
                                  <div className="w-3/4 h-2 rounded-full self-end" style={{ background: preset.chatBubbleUser }}></div>
                                </div>
                              </div>
                            </div>
                            <span className={`text-xs font-semibold capitalize tracking-wide ${isSelected ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
                              {key === 'default' ? 'Default Dark' : key}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Layout & Typography */}
                  <div className="bg-[#111827]/60 border border-gray-800/60 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                      <Monitor size={18} className="mr-2 text-purple-400" /> Layout & Typography
                    </h3>
                    
                    <div className="space-y-8 relative z-10">
                      {/* Transparent Mode Setting */}
                      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                        <div>
                          <h4 className="text-base font-medium text-white flex items-center">
                            <Droplets size={16} className="mr-2 text-purple-400" /> Glassmorphism Mode
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">Make panels beautifully semi-transparent.</p>
                        </div>
                        <ModernSwitch 
                          checked={theme.isTransparent} 
                          onChange={(val) => setTheme({ ...theme, isTransparent: val })} 
                        />
                      </div>

                      {/* Font Family Setting */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-medium text-white flex items-center">
                            <Type size={16} className="mr-2 text-gray-400" /> Font Style
                          </h4>
                        </div>
                        <select 
                          value={theme.fontFamily}
                          onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                          className="bg-[#1f2937] border border-gray-700 text-white font-medium text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-2 outline-none shadow-sm cursor-pointer"
                        >
                          <option value="Inter">Inter (Clean)</option>
                          <option value="Roboto">Roboto (Classic)</option>
                          <option value="Poppins">Poppins (Modern)</option>
                          <option value="monospace">Monospace (Code)</option>
                        </select>
                      </div>

                      {/* Font Size Setting */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base font-medium text-white flex items-center">
                            <Type size={16} className="mr-2 text-gray-400" /> Interface Scale
                          </h4>
                          <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg">{theme.fontSize}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="12" 
                          max="22" 
                          value={theme.fontSize}
                          onChange={(e) => setTheme({ ...theme, fontSize: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                          <span>Small</span>
                          <span>Default (15px)</span>
                          <span>Large</span>
                        </div>
                      </div>
                      
                      {/* Chat Width Setting */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base font-medium text-white flex items-center">
                            <AlignLeft size={16} className="mr-2 text-gray-400" /> Chat Container Width
                          </h4>
                          <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg">{theme.chatMaxWidth}rem</span>
                        </div>
                        <input 
                          type="range" 
                          min="40" 
                          max="80" 
                          value={theme.chatMaxWidth}
                          onChange={(e) => setTheme({ ...theme, chatMaxWidth: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                          <span>Narrow</span>
                          <span>Optimal</span>
                          <span>Full Width</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Color Controls */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center">
                      <Palette size={18} className="mr-2 text-pink-400" /> Advanced Color Controls
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ColorInput label="App Background" value={theme.bgDark} onChange={(e) => setTheme({...theme, bgDark: e.target.value})} />
                      <ColorInput label="Sidebar Background" value={theme.bgSidebar} onChange={(e) => setTheme({...theme, bgSidebar: e.target.value})} />
                      <ColorInput label="Panel Background" value={theme.bgPanel} onChange={(e) => setTheme({...theme, bgPanel: e.target.value})} />
                      <ColorInput label="Text Color" value={theme.textMain} onChange={(e) => setTheme({...theme, textMain: e.target.value})} />
                      <ColorInput label="AI Bubble Color" value={theme.chatBubbleAi} onChange={(e) => setTheme({...theme, chatBubbleAi: e.target.value})} />
                      <ColorInput label="User Bubble Color" value={theme.chatBubbleUser} onChange={(e) => setTheme({...theme, chatBubbleUser: e.target.value})} />
                    </div>
                  </div>

                  {/* Save Theme Action */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-lg shadow-blue-500/5 mt-8">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-400 mb-1">Save Customized Theme</h3>
                      <p className="text-sm text-gray-400">Save your custom theme to your profile so it persists across all your devices.</p>
                    </div>
                    <button 
                      onClick={onSaveTheme}
                      className="mt-4 md:mt-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap flex items-center"
                    >
                      <Save size={18} className="mr-2" /> Save to Profile
                    </button>
                  </div>
                </div>
              )}

              {/* PREFERENCES TAB */}
              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <div className="bg-[#111827]/60 border border-gray-800/60 rounded-3xl p-6 md:p-8">
                    <h3 className="text-xl font-semibold text-white mb-6">General Preferences</h3>
                    
                    <div className="space-y-6">
                      {/* Notifications Setting */}
                      <div className="flex items-center justify-between pb-6 border-b border-gray-800/60">
                        <div>
                          <h4 className="text-base font-medium text-white flex items-center">
                            <Bell size={18} className="mr-2 text-yellow-400" /> Notifications & Sounds
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">Receive sound alerts when AI finishes generating.</p>
                        </div>
                        <ModernSwitch checked={true} onChange={() => {}} />
                      </div>

                      {/* Language Setting */}
                      <div className="flex items-center justify-between pb-6 border-b border-gray-800/60">
                        <div>
                          <h4 className="text-base font-medium text-white flex items-center">
                            <Globe size={18} className="mr-2 text-blue-400" /> Language
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">Select your preferred app language.</p>
                        </div>
                        <select className="bg-[#1f2937] border border-gray-700 text-white font-medium text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-2.5 outline-none shadow-sm cursor-pointer">
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>Hindi</option>
                        </select>
                      </div>

                      {/* Data Usage */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-medium text-white flex items-center">
                            <Save size={18} className="mr-2 text-emerald-400" /> Save Chat History
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">Store your conversations securely in local storage.</p>
                        </div>
                        <ModernSwitch checked={true} onChange={() => {}} />
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone / Reset */}
                  <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 md:p-8">
                    <h3 className="text-lg font-semibold text-red-400 mb-4">Reset Settings</h3>
                    <p className="text-sm text-gray-400 mb-6">If you want to revert all your theme customizations back to the original default style, click the button below. This action cannot be undone.</p>
                    <button 
                      onClick={() => setTheme(PRESETS.default)}
                      className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-semibold rounded-xl border border-red-500/30 hover:border-transparent transition-all shadow-sm"
                    >
                      Reset Theme to Defaults
                    </button>
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
