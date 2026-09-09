import React, { useMemo } from 'react';
import type { UserPersona, CompetencyProfile, RoleRequirement } from '../../types';
import { computeSkillGaps, computeOverallReadiness } from '../../services/gapAnalysisEngine';
import { NSSTA_INFO, NSSTA_TRAINING_PROGRAMMES } from '../../data/mockData';
import { Activity, Users, BookOpen, Award, Clock, MapPin, ArrowRight, Target, Zap } from 'lucide-react';

interface DashboardViewProps {
  persona: UserPersona;
  profile: CompetencyProfile;
  role: RoleRequirement;
  onNavigate: (tab: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  statistical: 'from-indigo-500 to-blue-500',
  technical: 'from-emerald-500 to-teal-500',
  digital_governance: 'from-violet-500 to-purple-500',
  behavioural: 'from-amber-500 to-orange-500',
};

export const DashboardView: React.FC<DashboardViewProps> = ({ persona, profile, role, onNavigate }) => {
  const gaps = useMemo(() => computeSkillGaps(profile, role), [profile, role]);
  const readiness = computeOverallReadiness(gaps);
  const currentCourses = NSSTA_TRAINING_PROGRAMMES.filter(p => p.status === 'upcoming');
  const ongoingCourses = NSSTA_TRAINING_PROGRAMMES.filter(p => p.status === 'ongoing');

  const stats = [
    { label: 'Skill Readiness', value: `${readiness}%`, icon: Target, color: 'from-emerald-500 to-teal-500', note: `vs ${role.title}` },
    { label: 'Gap Found', value: String(gaps.filter(g => g.gapDelta > 0).length), icon: Activity, color: 'from-rose-500 to-orange-500', note: 'skills to upskill' },
    { label: 'Ongoing Courses', value: String(ongoingCourses.length), icon: BookOpen, color: 'from-indigo-500 to-blue-500', note: 'in NSSTA programs' },
    { label: 'Programs Available', value: String(currentCourses.length), icon: Users, color: 'from-violet-500 to-purple-500', note: 'upcoming NSSTA' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero Head */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold animate-float">
              <Zap className="w-3 h-3" /> NSSTA Capability Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Namaste, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{persona.name.split(' ')[0]}</span>
          </h1>
          <p className="text-white/40 text-sm font-medium mt-1">{persona.designation} • {persona.department}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.5)]">
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-2xl group-hover:from-emerald-500/20 transition-all duration-500" />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white/90" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
              <p className="text-xs font-medium text-white/50 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-white/25 mt-1">{s.note}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NSSTA Info */}
        <div className="lg:col-span-1 rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">About NSSTA</h3>
          </div>
          <div className="space-y-3 text-sm text-white/50">
            <p>{NSSTA_INFO.established} • {NSSTA_INFO.campus}</p>
            <p className="leading-relaxed text-[13px]">{NSSTA_INFO.mandate}</p>
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">Partner Institutions</p>
              <div className="flex flex-wrap gap-1.5">
                {NSSTA_INFO.partners.slice(0, 6).map(p => (
                  <span key={p} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50">{p}</span>
                ))}
              </div>
              <p className="text-[10px] text-white/25 mt-2">{NSSTA_INFO.library}</p>
            </div>
          </div>
        </div>

        {/* Ongoing Training */}
        <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white text-sm">Current & Upcoming NSSTA Programmes</h3>
            </div>
            <button onClick={() => onNavigate('courses')} className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 group cursor-pointer transition-all">
              View all <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-2.5">
            {[...ongoingCourses, ...currentCourses].slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group cursor-pointer">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${CATEGORY_COLORS[p.topic] || 'from-emerald-500 to-teal-500'}`}>
                  <BookOpen className="w-4 h-4 text-white/90" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">{p.title}</p>
                  <div className="flex items-center gap-3 text-[10px] text-white/35 mt-0.5">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.durationWeeks} wks</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.venue}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.participants || 'Open'}/{p.maxCapacity}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                    p.status === 'ongoing' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-white/50'
                  }`}>
                    {p.status === 'ongoing' ? 'Live' : 'Upcoming'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;