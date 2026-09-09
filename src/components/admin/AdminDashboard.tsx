import React from 'react';
import type { RoleRequirement, SkillLevel, UserPersona } from '../../types';
import { MOCK_PROFILES } from '../../data/mockData';

import { MOSPI_SKILLS } from '../../data/taxonomy';
import { computeSkillGaps, computeOverallReadiness } from '../../services/gapAnalysisEngine';
import { Users, BarChart2, Shield, Sliders, TrendingUp, Search, Save, CheckCircle2, UserPlus, X } from 'lucide-react';

interface AdminDashboardProps {
  roles: RoleRequirement[];
  onUpdateRoleRequirement: (updatedRole: RoleRequirement) => void;
  personas: UserPersona[];
  onAddEmployee: (newPersona: UserPersona) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  roles,
  onUpdateRoleRequirement,
  personas,
  onAddEmployee
}) => {
  const [activeAdminTab, setActiveAdminTab] = React.useState<'heatmap' | 'roles' | 'employees'>('heatmap');
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>(roles[0].id);
  const [editingRole, setEditingRole] = React.useState<RoleRequirement>(roles[0]);
  const [saveSuccessMsg, setSaveSuccessMsg] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Add Employee Form State
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = React.useState(false);
  const [empName, setEmpName] = React.useState('');
  const [empEmail, setEmpEmail] = React.useState('');
  const [empDesignation, setEmpDesignation] = React.useState('Junior Statistical Officer (JSO)');
  const [empDepartment, setEmpDepartment] = React.useState('Field Operations Division (FOD)');
  const [empRoleId, setEmpRoleId] = React.useState(roles[0]?.id || 'role_jso');
  const [empAvatarUrl, setEmpAvatarUrl] = React.useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [addEmpSuccessMsg, setAddEmpSuccessMsg] = React.useState(false);

  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim()) return;

    const newEmp: UserPersona = {
      id: `usr_${Date.now()}`,
      name: empName.trim(),
      email: empEmail.trim(),
      userRole: 'employee',
      designation: empDesignation,
      department: empDepartment,
      avatarUrl: empAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roleId: empRoleId,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    onAddEmployee(newEmp);
    setIsAddEmployeeModalOpen(false);
    setAddEmpSuccessMsg(true);
    setEmpName('');
    setEmpEmail('');
    setTimeout(() => setAddEmpSuccessMsg(false), 4000);
  };

  React.useEffect(() => {
    const found = roles.find(r => r.id === selectedRoleId);
    if (found) setEditingRole({ ...found, requiredSkills: { ...found.requiredSkills } });
  }, [selectedRoleId, roles]);

  const handleRequiredLevelChange = (skillId: string, level: SkillLevel) => {
    setEditingRole(prev => ({
      ...prev,
      requiredSkills: {
        ...prev.requiredSkills,
        [skillId]: level
      }
    }));
  };

  const handleSaveRole = () => {
    onUpdateRoleRequirement(editingRole);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // Mock Org Departments & Gap Heatmap Data
  const orgHeatmapData = [
    { department: 'Field Operations Division (FOD)', statistical: 85, technical: 42, digital_gov: 60, behavioural: 78 },
    { department: 'National Accounts Division (NAD)', statistical: 92, technical: 65, digital_gov: 70, behavioural: 85 },
    { department: 'Economic Statistics Division (ESD)', statistical: 88, technical: 58, digital_gov: 62, behavioural: 80 },
    { department: 'Computer Centre & IT (CC)', statistical: 60, technical: 95, digital_gov: 90, behavioural: 75 },
    { department: 'Price Statistics Division (PSD)', statistical: 90, technical: 50, digital_gov: 55, behavioural: 72 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="eng-card p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              MoSPI Training & Skill Tracking (NSSTA)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              Admin Panel
            </span>
          </div>
          <p className="text-xs opacity-75 mt-1 font-medium">
            Departmental gap heatmap, role requirement vector manager, and officer directory.
          </p>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/10 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveAdminTab('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeAdminTab === 'heatmap' ? 'bg-emerald-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Org Heatmap & Impact
          </button>
          <button
            onClick={() => setActiveAdminTab('roles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeAdminTab === 'roles' ? 'bg-emerald-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Role Requirement Vectors
          </button>
          <button
            onClick={() => setActiveAdminTab('employees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeAdminTab === 'employees' ? 'bg-emerald-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Officer Directory
          </button>
        </div>
      </div>

      {activeAdminTab === 'heatmap' && (
        <div className="space-y-6">
          
          {/* Org Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="eng-card p-5">
              <span className="text-xs opacity-70 block font-mono font-bold">TOTAL ASSESSED OFFICERS</span>
              <div className="text-2xl font-bold mt-1">1,480 Officers</div>
              <span className="text-[10px] text-emerald-500 font-mono font-bold mt-1 block">94% Profile Completion</span>
            </div>
            <div className="eng-card p-5">
              <span className="text-xs opacity-70 block font-mono font-bold">TRAINING READINESS DELTA</span>
              <div className="text-2xl font-bold text-emerald-500 mt-1 flex items-center gap-1">
                +34.2%
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] opacity-70 font-medium mt-1 block">Post-iGOT assessment scores</span>
            </div>
            <div className="eng-card p-5">
              <span className="text-xs opacity-70 block font-mono font-bold">iGOT CERTIFICATIONS</span>
              <div className="text-2xl font-bold text-emerald-500 mt-1">3,120 Courses</div>
              <span className="text-[10px] opacity-70 font-medium mt-1 block">Avg 14.5 hours per officer</span>
            </div>
            <div className="eng-card p-5">
              <span className="text-xs opacity-70 block font-mono font-bold">CRITICAL TECHNICAL GAPS</span>
              <div className="text-2xl font-bold text-amber-500 mt-1">Python & Pandas</div>
              <span className="text-[10px] text-amber-500 font-mono font-bold mt-1 block">High priority in FOD & ESD</span>
            </div>
          </div>

          {/* Org Gap Heatmap Table */}
          <div className="eng-card p-6 lg:p-8 space-y-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
                Departmental Competency Readiness Heatmap
              </h2>
              <p className="text-xs opacity-70 font-medium">Aggregated proficiency scores across official MoSPI divisions</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="opacity-70 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <th className="py-2.5 px-3 font-bold">Department / Division</th>
                    <th className="py-2.5 px-3 text-center font-bold">Statistical Competencies</th>
                    <th className="py-2.5 px-3 text-center font-bold">Technical & Analytics</th>
                    <th className="py-2.5 px-3 text-center font-bold">Digital Governance</th>
                    <th className="py-2.5 px-3 text-center font-bold">Behavioural</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {orgHeatmapData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-3 px-3 font-semibold">{row.department}</td>
                      
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-3 py-0.5 rounded font-mono font-bold text-xs ${
                          row.statistical >= 80 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        }`}>
                          {row.statistical}% Match
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-3 py-0.5 rounded font-mono font-bold text-xs ${
                          row.technical >= 80 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : row.technical >= 60 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                        }`}>
                          {row.technical}% Match
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-3 py-0.5 rounded font-mono font-bold text-xs ${
                          row.digital_gov >= 80 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        }`}>
                          {row.digital_gov}% Match
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-3 py-0.5 rounded font-mono font-bold text-xs ${
                          row.behavioural >= 80 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        }`}>
                          {row.behavioural}% Match
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeAdminTab === 'roles' && (
        /* Role Requirement Manager */
        <div className="eng-card p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                Role Skill Level Settings
              </h2>
              <p className="text-xs opacity-70 font-medium">Set the required skill levels for each MoSPI role designation</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="eng-input rounded-xl px-3 py-2 text-xs font-semibold"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">{r.title}</option>
                ))}
              </select>

              <button
                onClick={handleSaveRole}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-500 font-bold flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Role requirements saved successfully!
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase opacity-70">Requirement Levels for {editingRole.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOSPI_SKILLS.map(skill => {
                const currentReq = editingRole.requiredSkills[skill.id] || 0;
                return (
                  <div key={skill.id} className="p-3.5 rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs block">{skill.name}</span>
                      <span className="text-[10px] font-mono opacity-70 uppercase">{skill.category}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => handleRequiredLevelChange(skill.id, lvl as SkillLevel)}
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            currentReq === lvl
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'eng-card opacity-70 hover:opacity-100'
                          }`}
                        >
                          L{lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'employees' && (
        /* Officer Directory */
        <div className="eng-card p-6 lg:p-8 space-y-4">
          
          {addEmpSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-500 font-bold flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              New officer added successfully!
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                MoSPI Officer Competency Directory
              </h2>
              <p className="text-xs opacity-70 font-medium">Search officers, add new personnel, and inspect individual role readiness</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 opacity-50 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search officer or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="eng-input rounded-xl pl-9 pr-4 py-2 text-xs font-medium w-full"
                />
              </div>

              <button
                onClick={() => setIsAddEmployeeModalOpen(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                Add New Officer
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="opacity-70 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <th className="py-2.5 px-3 font-bold">Officer Name</th>
                  <th className="py-2.5 px-3 font-bold">Designation</th>
                  <th className="py-2.5 px-3 font-bold">Department</th>
                  <th className="py-2.5 px-3 font-bold">Target Vector</th>
                  <th className="py-2.5 px-3 text-center font-bold">Role Match %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {personas
                  .filter(p => p.userRole === 'employee' && (
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.designation.toLowerCase().includes(searchTerm.toLowerCase())
                  ))
                  .map(persona => {
                    const role = roles.find(r => r.id === persona.roleId) || roles[0];
                    const profile = MOCK_PROFILES[persona.id] || {
                      userId: persona.id,
                      roleId: persona.roleId,
                      scores: {}
                    };
                    const gaps = computeSkillGaps(profile, role);
                    const readiness = computeOverallReadiness(gaps);

                    return (
                      <tr key={persona.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-3 px-3 font-bold flex items-center gap-2.5">
                          <img src={persona.avatarUrl} alt={persona.name} className="w-7 h-7 rounded-full object-cover border border-emerald-500/40" />
                          <div>
                            <span>{persona.name}</span>
                            <span className="block text-[10px] opacity-60 font-mono font-normal">{persona.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium">{persona.designation}</td>
                        <td className="py-3 px-3 opacity-80 font-medium">{persona.department}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded font-mono text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {role.title}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-0.5 rounded border border-emerald-500/30">
                            {readiness}% Match
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Officer Modal */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="eng-card max-w-lg w-full p-6 sm:p-8 space-y-6 relative border border-emerald-500/30 shadow-2xl">
            <button
              onClick={() => setIsAddEmployeeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg opacity-70 hover:opacity-100 eng-card cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Add New MoSPI Officer</h3>
                <p className="text-xs opacity-70">Add a new statistical officer to the employee database</p>
              </div>
            </div>

            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold block opacity-90">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sunita Sharma"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="eng-input w-full px-3 py-2 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block opacity-90">Official Email ID *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sunita.sharma@mospi.gov.in"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  className="eng-input w-full px-3 py-2 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold block opacity-90">Designation</label>
                  <select
                    value={empDesignation}
                    onChange={(e) => setEmpDesignation(e.target.value)}
                    className="eng-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
                  >
                    <option value="Junior Statistical Officer (JSO)" className="bg-slate-900">Junior Statistical Officer (JSO)</option>
                    <option value="Senior Statistical Officer (SSO)" className="bg-slate-900">Senior Statistical Officer (SSO)</option>
                    <option value="Senior System Analyst (SSA)" className="bg-slate-900">Senior System Analyst (SSA)</option>
                    <option value="Assistant Director (AD)" className="bg-slate-900">Assistant Director (AD)</option>
                    <option value="Deputy Director General (DDG)" className="bg-slate-900">Deputy Director General (DDG)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold block opacity-90">Department / Division</label>
                  <select
                    value={empDepartment}
                    onChange={(e) => setEmpDepartment(e.target.value)}
                    className="eng-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
                  >
                    <option value="Field Operations Division (FOD)" className="bg-slate-900">Field Operations Division (FOD)</option>
                    <option value="National Accounts Division (NAD)" className="bg-slate-900">National Accounts Division (NAD)</option>
                    <option value="Economic Statistics Division (ESD)" className="bg-slate-900">Economic Statistics Division (ESD)</option>
                    <option value="Price Statistics Division (PSD)" className="bg-slate-900">Price Statistics Division (PSD)</option>
                    <option value="Computer Centre & IT (CC)" className="bg-slate-900">Computer Centre & IT (CC)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold block opacity-90">Target Role</label>
                <select
                  value={empRoleId}
                  onChange={(e) => setEmpRoleId(e.target.value)}
                  className="eng-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id} className="bg-slate-900">{r.title} ({r.department})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold block opacity-90">Avatar Profile Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={empAvatarUrl}
                  onChange={(e) => setEmpAvatarUrl(e.target.value)}
                  className="eng-input w-full px-3 py-2 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl eng-card opacity-70 hover:opacity-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Register Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
