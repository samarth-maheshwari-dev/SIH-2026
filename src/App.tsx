import { useState, useEffect } from 'react';
import type { UserPersona, UserRole, CompetencyProfile, RoleRequirement, Enrollment, SkillLevel, IGotSyncConfig } from './types';
import { MOCK_PERSONAS, MOCK_ROLES, MOCK_PROFILES, MOCK_COURSES } from './data/mockData';

import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/learner/DashboardView';
import { SkillGapRadarView } from './components/learner/SkillGapRadarView';
import { CourseRecommendationsView } from './components/learner/CourseRecommendationsView';
import { AIQuizStudio } from './components/learner/AIQuizStudio';
import { VirtualLab } from './components/learner/VirtualLab';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { IGotSyncModal } from './components/common/IGotSyncModal';
import { LoginPage } from './components/auth/LoginPage';
import { UserSwitchAuthModal } from './components/auth/UserSwitchAuthModal';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('mospi_theme') as 'dark' | 'light') || 'dark';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mospi_auth') === 'true';
  });
  const [personas, setPersonas] = useState<UserPersona[]>(MOCK_PERSONAS);
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(MOCK_PERSONAS[0]);
  const [currentRoleView, setCurrentRoleView] = useState<UserRole>('employee');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [switchUserCandidate, setSwitchUserCandidate] = useState<UserPersona | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleAddEmployee = (newPersona: UserPersona) => {
    setPersonas(prev => [...prev, newPersona]);
    setProfiles(prev => ({
      ...prev,
      [newPersona.id]: {
        userId: newPersona.id,
        roleId: newPersona.roleId,
        scores: {
          sk_national_accounts: { skillId: 'sk_national_accounts', level: 1, lastAssessedAt: new Date().toISOString().split('T')[0], assessedVia: 'self_assessment' },
          sk_sampling_survey: { skillId: 'sk_sampling_survey', level: 1, lastAssessedAt: new Date().toISOString().split('T')[0], assessedVia: 'self_assessment' },
          sk_data_gov: { skillId: 'sk_data_gov', level: 1, lastAssessedAt: new Date().toISOString().split('T')[0], assessedVia: 'self_assessment' }
        }
      }
    }));
  };

  useEffect(() => {
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);
    localStorage.setItem('mospi_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogin = (user: { name: string; email: string; designation?: string; role: UserRole; isAdmin?: boolean }) => {
    // Find matching persona or construct a synthetic one from the authenticated user
    const personaMatch = personas.find(p => p.email === user.email);
    const persona: UserPersona = personaMatch || {
      id: `user_${Date.now()}`,
      name: user.name,
      email: user.email,
      designation: user.designation || 'Government Officer',
      roleId: 'role_jsso',
      userRole: user.role === 'admin' ? 'admin' : 'employee',
      department: 'Ministry of Statistics & Programme Implementation',
      joinedDate: new Date().toISOString().split('T')[0],
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`,
    };
    setCurrentPersona(persona);
    setCurrentRoleView(user.role === 'admin' ? 'admin' : 'employee');
    setActiveTab('dashboard');
    setIsAuthenticated(true);
    localStorage.setItem('mospi_auth', 'true');
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mospi_auth');
    localStorage.removeItem('stackconnect_token');
  };

  const [isIgotModalOpen, setIsIgotModalOpen] = useState(false);
  const [igotSyncConfig, setIgotSyncConfig] = useState<IGotSyncConfig>({
    isConnected: true,
    userIgotId: 'IGOT-RAJESH-2026',
    ssoToken: 'igot_sso_tk_88194a',
    lastSyncedAt: '12:04 PM',
    syncedCoursesCount: 4
  });

  const [profiles, setProfiles] = useState<Record<string, CompetencyProfile>>(MOCK_PROFILES);
  const [roles, setRoles] = useState<RoleRequirement[]>(MOCK_ROLES);
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({});

  const activeRole = roles.find(r => r.id === currentPersona.roleId) || roles[0];
  
  const activeProfile = profiles[currentPersona.id] || {
    userId: currentPersona.id,
    roleId: currentPersona.roleId,
    scores: {}
  };

  const handleConfirmUserSwitch = (persona: UserPersona, role: UserRole) => {
    setCurrentPersona(persona);
    setCurrentRoleView(role);
    setIgotSyncConfig(prev => ({
      ...prev,
      userIgotId: `IGOT-${persona.name.split(' ')[0].toUpperCase()}-2026`
    }));
    setActiveTab('dashboard');
    setSwitchUserCandidate(null);
  };

  const handleToggleRoleView = (role: UserRole) => {
    setCurrentRoleView(role);
    if (role === 'admin') setActiveTab('admin');
    else setActiveTab('dashboard');
  };

  const handleSkillLevelUp = (skillId: string, customLevel?: SkillLevel) => {
    setProfiles(prev => {
      const userProf = prev[currentPersona.id] || {
        userId: currentPersona.id,
        roleId: currentPersona.roleId,
        scores: {}
      };

      const currentScore = userProf.scores[skillId];
      const currentLevel = currentScore ? currentScore.level : 0;
      const targetLevel: SkillLevel = customLevel !== undefined 
        ? customLevel 
        : Math.min(3, currentLevel + 1) as SkillLevel;

      const updatedScores = {
        ...userProf.scores,
        [skillId]: {
          skillId,
          level: targetLevel,
          lastAssessedAt: new Date().toISOString().split('T')[0],
          assessedVia: 'igot_course' as const
        }
      };

      return {
        ...prev,
        [currentPersona.id]: {
          ...userProf,
          scores: updatedScores
        }
      };
    });
  };

  const handleSyncAllCompletedCourses = () => {
    const targetCourses = MOCK_COURSES.slice(0, 3);
    targetCourses.forEach(c => {
      handleUpdateEnrollment(c.id, 'completed');
      handleSkillLevelUp(c.skillId);
    });
  };

  const handleUpdateEnrollment = (courseId: string, status: 'in_progress' | 'completed') => {
    setEnrollments(prev => ({
      ...prev,
      [courseId]: {
        id: `enr_${Date.now()}`,
        userId: currentPersona.id,
        courseId,
        enrolledAt: new Date().toISOString(),
        status,
        progressPercent: status === 'completed' ? 100 : 45,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined
      }
    }));
  };

  const handleUpdateRoleRequirement = (updatedRole: RoleRequirement) => {
    setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen flex font-sans bg-[#06080f] text-white relative">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[#06080f]" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[120px] animate-drift animate-float" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-teal-500/6 blur-[120px] animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/6 blur-[120px] animate-float" style={{ animationDelay: '6s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      </div>

      {/* Sidebar */}
      <Sidebar
        persona={currentPersona}
        role={currentRoleView}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        igotConfig={igotSyncConfig}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-[68px]' : 'ml-[240px]'}`}>
        
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b border-white/5 bg-[#06080f]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white/70 capitalize">
              {activeTab === 'dashboard' && 'Capability Dashboard'}
              {activeTab === 'skills' && 'Skill Intelligence Radar'}
              {activeTab === 'courses' && 'NSSTA Course Catalogue'}
              {activeTab === 'quiz' && 'AI Skill Assessment'}
              {activeTab === 'lab' && 'Virtual Data Science Lab'}
              {activeTab === 'admin' && 'NSSTA Admin Console'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {currentPersona.userRole !== 'admin' && (
              <button onClick={() => handleToggleRoleView('admin')} className="px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer">
                Admin View
              </button>
            )}
            {currentPersona.userRole === 'admin' && (
              <button onClick={() => handleToggleRoleView('employee')} className="px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer">
                Officer View
              </button>
            )}
            <button onClick={toggleTheme} className="px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-6 py-6">
          {currentRoleView === 'admin' && (activeTab === 'dashboard' || activeTab === 'admin') && (
            <AdminDashboard
              roles={roles}
              onUpdateRoleRequirement={handleUpdateRoleRequirement}
              personas={personas}
              onAddEmployee={handleAddEmployee}
            />
          )}
          {currentRoleView === 'admin' && activeTab === 'skills' && (
            <SkillGapRadarView
              profile={activeProfile}
              role={activeRole}
              persona={currentPersona}
              onNavigateToCourses={() => setActiveTab('courses')}
              onNavigateToQuiz={() => setActiveTab('quiz')}
              theme={theme}
            />
          )}
          {currentRoleView === 'admin' && activeTab === 'courses' && (
            <CourseRecommendationsView
              profile={activeProfile}
              role={activeRole}
              enrollments={enrollments}
              onUpdateEnrollment={handleUpdateEnrollment}
              onSkillLevelUp={handleSkillLevelUp}
            />
          )}
          {currentRoleView === 'admin' && activeTab === 'quiz' && (
            <AIQuizStudio
              userId={currentPersona.id}
              onSkillLevelUp={handleSkillLevelUp}
            />
          )}
          {currentRoleView === 'admin' && activeTab === 'lab' && (
            <VirtualLab />
          )}
          {currentRoleView === 'employee' ? (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  persona={currentPersona}
                  profile={activeProfile}
                  role={activeRole}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === 'skills' && (
                <SkillGapRadarView
                  profile={activeProfile}
                  role={activeRole}
                  persona={currentPersona}
                  onNavigateToCourses={() => setActiveTab('courses')}
                  onNavigateToQuiz={() => setActiveTab('quiz')}
                  theme={theme}
                />
              )}
              {activeTab === 'courses' && (
                <CourseRecommendationsView
                  profile={activeProfile}
                  role={activeRole}
                  enrollments={enrollments}
                  onUpdateEnrollment={handleUpdateEnrollment}
                  onSkillLevelUp={handleSkillLevelUp}
                />
              )}
              {activeTab === 'quiz' && (
                <AIQuizStudio
                  userId={currentPersona.id}
                  onSkillLevelUp={handleSkillLevelUp}
                />
              )}
              {activeTab === 'lab' && (
                <VirtualLab />
              )}
            </>
          ) : (
            <AdminDashboard
              roles={roles}
              onUpdateRoleRequirement={handleUpdateRoleRequirement}
              personas={personas}
              onAddEmployee={handleAddEmployee}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center text-[10px] text-white/25 font-mono border-t border-white/5 mt-auto">
          StackConnect | National Statistical Systems Training Academy • Ministry of Statistics & Programme Implementation (MoSPI)
        </footer>
      </div>

      {/* iGOT Sync Modal */}
      <IGotSyncModal
        isOpen={isIgotModalOpen}
        onClose={() => setIsIgotModalOpen(false)}
        persona={currentPersona}
        syncConfig={igotSyncConfig}
        onUpdateSyncConfig={setIgotSyncConfig}
        onSyncAllCompletedCourses={handleSyncAllCompletedCourses}
      />

      {/* User Switch Authentication Popup */}
      <UserSwitchAuthModal
        isOpen={Boolean(switchUserCandidate)}
        candidatePersona={switchUserCandidate}
        onClose={() => setSwitchUserCandidate(null)}
        onConfirmSwitch={handleConfirmUserSwitch}
      />
    </div>
  );
}

export default App;