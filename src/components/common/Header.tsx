import React from 'react';
import type { UserPersona, UserRole, IGotSyncConfig } from '../../types';
import { MOCK_PERSONAS } from '../../data/mockData';
import { Shield, Award, BookOpen, ChevronDown, CheckCircle2, Zap, Sun, Moon, LogOut, FlaskConical } from 'lucide-react';

interface HeaderProps {
  currentPersona: UserPersona;
  onPromptUserSwitch: (candidate: UserPersona) => void;
  currentRoleView: UserRole;
  onToggleRoleView: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  igotSyncConfig: IGotSyncConfig;
  onOpenIgotSync: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout?: () => void;
  onNavigateHome?: () => void;
  personas?: UserPersona[];
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  onPromptUserSwitch,
  currentRoleView,
  onToggleRoleView,
  activeTab,
  onTabChange,
  igotSyncConfig,
  onOpenIgotSync,
  theme,
  onToggleTheme,
  onLogout,
  onNavigateHome,
  personas
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = React.useState(false);
  const personasList = personas || MOCK_PERSONAS;

  return (
    <header className="sticky top-0 z-50 eng-header px-4 lg:px-8 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Logo & Hackathon Team Title */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (onLogout) {
              onLogout();
            } else if (onNavigateHome) {
              onNavigateHome();
            }
          }}
          className="flex items-center gap-3 cursor-pointer group focus:outline-none select-none"
          title="StackConnect | Redirect to Login Page"
        >
          <img
            src="/stackconnect.png"
            alt="StackConnect Logo"
            className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">StackConnect</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                AI Skill Intelligence Platform
              </span>
            </div>
            <p className="text-[11px] opacity-70 font-medium">Ministry of Statistics & Programme Implementation</p>
          </div>
        </a>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
          {currentRoleView === 'employee' ? (
            <>
              <button
                onClick={() => onTabChange('overview')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white shadow-[0_0_18px_-2px_rgba(16,185,129,0.6)]'
                    : 'text-white/55 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Competency & Radar</span>
                </div>
              </button>
              <button
                onClick={() => onTabChange('courses')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  activeTab === 'courses'
                    ? 'bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white shadow-[0_0_18px_-2px_rgba(16,185,129,0.6)]'
                    : 'text-white/55 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>iGOT Catalog</span>
                </div>
              </button>
              <button
                onClick={() => onTabChange('quiz')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  activeTab === 'quiz'
                    ? 'bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white shadow-[0_0_18px_-2px_rgba(16,185,129,0.6)]'
                    : 'text-white/55 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Quiz &amp; Assessment</span>
                </div>
              </button>
                            <button
                              onClick={() => onTabChange('lab')}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                                activeTab === 'lab'
                                  ? 'bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white shadow-[0_0_18px_-2px_rgba(16,185,129,0.6)]'
                                  : 'text-white/55 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
                                <span>Virtual Lab</span>
                              </div>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onTabChange('admin')}
                            className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500/80 to-cyan-500/80 text-white shadow-[0_0_18px_-2px_rgba(62,242,194,0.6)]"
                          >
                            Admin Governance & Skill Matrix
                          </button>
                        )}
                      </nav>

                      {/* Right Section Controls */}
                      <div className="flex items-center gap-2">

                        {/* Theme Switcher */}
                        <button
                          onClick={onToggleTheme}
                          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                          className="p-2 rounded-xl eng-card-interactive flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                        >
                          {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>

                        {/* iGOT Sync Button */}
                        <button
                          onClick={onOpenIgotSync}
                          title="Sync with iGOT Karmayogi Portal API"
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{igotSyncConfig.isConnected ? 'iGOT Sync Active' : 'Connect iGOT'}</span>
                        </button>

                        {/* Role Switcher */}
                        <button
                          onClick={() => onToggleRoleView(currentRoleView === 'employee' ? 'admin' : 'employee')}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold eng-card-interactive cursor-pointer"
                        >
                          {currentRoleView === 'employee' ? 'Switch to Admin' : 'Switch to Learner'}
                        </button>

                        {/* Persona Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                            className="flex items-center gap-2 eng-card-interactive rounded-full px-3 py-1.5 cursor-pointer"
                          >
                            <img
                              src={currentPersona.avatarUrl}
                              alt={currentPersona.name}
                              className="w-6 h-6 rounded-full object-cover border border-white/15"
                            />
                            <div className="hidden lg:block text-left text-xs">
                              <p className="font-semibold leading-tight">{currentPersona.name}</p>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                          </button>

                          {showPersonaMenu && (
                            <div className="absolute right-0 mt-2 w-64 eng-card p-2 z-50 space-y-1 shadow-2xl animate-fade-up">
                              <p className="text-[10px] font-mono font-bold opacity-60 uppercase px-2 py-1 border-b border-white/10">
                                Switch Persona (Requires Auth)
                              </p>
                              <div className="space-y-1 pt-1">
                                {personasList.map(persona => (
                                  <button
                                    key={persona.id}
                                    onClick={() => {
                                      setShowPersonaMenu(false);
                                      onPromptUserSwitch(persona);
                                    }}
                                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer ${
                                      currentPersona.id === persona.id
                                        ? 'bg-emerald-500/15 border border-emerald-500/30 font-semibold'
                                        : 'hover:bg-white/5'
                                    }`}
                                  >
                                    <img
                                      src={persona.avatarUrl}
                                      alt={persona.name}
                                      className="w-7 h-7 rounded-full object-cover"
                                    />
                                    <div className="flex-1 text-xs">
                                      <div className="flex items-center justify-between">
                                        <span>{persona.name}</span>
                                        {currentPersona.id === persona.id && (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        )}
                                      </div>
                                      <span className="text-[10px] opacity-70 block truncate">{persona.designation}</span>
                                    </div>
                                  </button>
                                ))}

                                {onLogout && (
                                  <div className="pt-1.5 border-t border-white/10">
                                    <button
                                      onClick={() => {
                                        setShowPersonaMenu(false);
                                        onLogout();
                                      }}
                                      className="w-full p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                    >
                                      <LogOut className="w-3.5 h-3.5" />
                                      <span>Log Out Session</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

      </div>
    </header>
  );
};
