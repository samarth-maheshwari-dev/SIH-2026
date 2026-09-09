import React from 'react';
import type { UserRole, UserPersona, IGotSyncConfig } from '../../types';
import { Home, Target, BookOpen, FlaskConical, FileText, Shield, LogOut, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface SidebarProps {
  persona: UserPersona;
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  igotConfig?: IGotSyncConfig;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const NAV_ITEMS = {
  employee: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'skills', label: 'Skill Radar', icon: Target },
    { id: 'courses', label: 'NSSTA Courses', icon: BookOpen },
    { id: 'quiz', label: 'Assessment', icon: FileText },
    { id: 'lab', label: 'Virtual Lab', icon: FlaskConical },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'admin', label: 'Admin Panel', icon: Shield },
    { id: 'skills', label: 'Skill Radar', icon: Target },
    { id: 'courses', label: 'All Courses', icon: BookOpen },
    { id: 'quiz', label: 'Assessments', icon: FileText },
    { id: 'lab', label: 'Virtual Lab', icon: FlaskConical },
  ]
};

export const Sidebar: React.FC<SidebarProps> = ({ persona, role, activeTab, onTabChange, onLogout, collapsed = false, onToggleCollapse }) => {
  const items = NAV_ITEMS[role] || NAV_ITEMS.employee;
  return (
    <aside className={`fixed top-0 left-0 h-screen z-50 flex flex-col border-r transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'} bg-[#06080f]/95 backdrop-blur-2xl border-white/5`}>
      
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-white/5 ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
          <img src="/stackconnect.png" alt="" className="w-7 h-7 rounded-lg object-contain bg-white/10 p-1" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-white tracking-tight truncate">StackConnect</h1>
            <p className="text-[10px] text-white/30 font-medium">MoSPI • NSSTA</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group ${
                collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
              } ${
                isActive 
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' 
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* iGOT Sync Badge */}
      {!collapsed && (
        <div className="mx-3 mb-2 px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">iGOT Sync Active</span>
          </div>
          <p className="text-[10px] text-white/30 leading-tight">Last sync: 12:04 PM • 4 courses</p>
        </div>
      )}

      {/* User Section */}
      <div className="border-t border-white/5 p-3 space-y-2">
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <img src={persona.avatarUrl} alt={persona.name} className="w-8 h-8 rounded-full ring-2 ring-emerald-500/30 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{persona.name}</p>
              <p className="text-[10px] text-white/30 truncate">{persona.designation}</p>
            </div>
          )}
        </div>
        <div className={`flex gap-1 ${collapsed ? 'justify-center' : ''}`}>
          <button onClick={onLogout} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer" title="Logout">
            <LogOut className="w-3.5 h-3.5" />
            {!collapsed && <span>Logout</span>}
          </button>
          {onToggleCollapse && (
            <button onClick={onToggleCollapse} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer" title="Toggle sidebar">
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;