import React from 'react';
import type { CompetencyProfile, RoleRequirement, UserPersona } from '../../types';
import { computeSkillGaps, computeOverallReadiness, computeCategoryBreakdown } from '../../services/gapAnalysisEngine';

import { SKILL_LEVEL_LABELS, CATEGORY_METADATA } from '../../data/taxonomy';
import { Target, AlertTriangle, CheckCircle2, Award, Zap, ArrowRight, BookOpen, FileQuestion, Sparkles, TrendingUp as TrendingUpIcon } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface SkillGapRadarViewProps {
  profile: CompetencyProfile;
  role: RoleRequirement;
  persona: UserPersona;
  onNavigateToCourses: () => void;
  onNavigateToQuiz: () => void;
  theme?: 'dark' | 'light';
}

const SEVERITY_COLORS = {
  high: { bg: 'rgba(239,68,68,0.15)', text: '#ff6b6b', border: 'rgba(239,68,68,0.35)', glow: 'rgba(239,68,68,0.4)' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#ffb454', border: 'rgba(245,158,11,0.35)', glow: 'rgba(245,158,11,0.4)' },
  low: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.35)', glow: 'rgba(16,185,129,0.4)' },
  none: { bg: 'rgba(62,242,194,0.15)', text: '#3ef2c2', border: 'rgba(62,242,194,0.35)', glow: 'rgba(62,242,194,0.4)' },
};

const CATEGORY_COLORS = {
  statistical: { primary: '#4dd7ff', glow: 'rgba(77,215,255,0.5)' },
  technical: { primary: '#10b981', glow: 'rgba(16,185,129,0.5)' },
  digital_governance: { primary: '#3ef2c2', glow: 'rgba(62,242,194,0.5)' },
  behavioural: { primary: '#ffb454', glow: 'rgba(255,180,84,0.5)' },
};

export const SkillGapRadarView: React.FC<SkillGapRadarViewProps> = ({
  profile,
  role,
  persona,
  onNavigateToCourses,
  onNavigateToQuiz,
}) => {
  const gaps = computeSkillGaps(profile, role);
  const readinessPercent = computeOverallReadiness(gaps);
  const categoryBreakdown = computeCategoryBreakdown(gaps);

  const highGapsCount = gaps.filter(g => g.severity === 'high').length;
  const mediumGapsCount = gaps.filter(g => g.severity === 'medium').length;

  // Radar data with full precision
  const radarData = gaps.map(g => ({
    skill: g.skillName.length > 22 ? g.skillName.substring(0, 20) + '…' : g.skillName,
    fullName: g.skillName,
    Current: g.currentLevel,
    Required: g.requiredLevel,
    category: g.category
  }));

  const barData = gaps
    .filter(g => g.gapDelta > 0)
    .map(g => ({
      name: g.skillName,
      delta: g.gapDelta,
      current: g.currentLevel,
      required: g.requiredLevel,
      severity: g.severity
    }));

  return (
    <div className="space-y-8 animate-fade-up">
      
      {/* ===== OFFICER SUMMARY — Double-bezel hero card ===== */}
      <div className="relative eng-card overflow-hidden group">
        {/* Subtle animated glow ring behind avatar */}
        <div className="absolute -top-4 -right-4 w-72 h-72 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }} />
        
        <div className="relative p-6 lg:p-8 z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar with double-bezel */}
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                     style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(77,215,255,0.3))' }} />
                <img
                  src={persona.avatarUrl}
                  alt={persona.name}
                  className="w-18 h-18 rounded-[1.25rem] object-cover border-2 border-white/15 shadow-[0_0_30px_-6px_rgba(16,185,129,0.4)] relative z-10"
                />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-display text-xl lg:text-2xl font-bold tracking-tight h-gradient">{persona.name}</h1>
                  <span className="glass-pill px-3 py-1 text-xs font-mono font-semibold textemerald-300">
                    {persona.designation}
                  </span>
                </div>
                <p className="text-xs opacity-60 mt-0.5 font-medium">{persona.department}</p>
                <p className="text-[11px] opacity-50 mt-1 font-mono">Target Role: <strong className="text-cyan-300 font-bold">{role.title}</strong></p>
              </div>
            </div>

            {/* Readiness Score — magnetic button feel */}
            <div className="relative eng-card px-6 py-4 borderemerald-500/30 bgemerald-500/5 min-w-[180px]">
              <span className="eyebrow opacity-60">Role Match Readiness</span>
              <div className="flex items-center justify-end gap-2 mt-1">
                <div className="text-3xl lg:text-4xl font-black font-mono text-white stat-glow">{readinessPercent}%</div>
                <TrendingUpIcon className="w-6 h-6 text-emerald-300 animate-float" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-r fromemerald-500/30 to-cyan-500/30 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-700">
                <Target className="w-7 h-7 text-white/90" />
              </div>
            </div>
          </div>

          {/* Quick Stats — pill grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
            {[
                          { label: 'Required Competencies', value: gaps.length, color: 'textemerald-300', bg: 'bgemerald-500/10', border: 'borderemerald-500/20', icon: <Award className="w-3.5 h-3.5" /> },
                          { label: 'High Priority Gaps', value: highGapsCount, color: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
                          { label: 'Medium Priority', value: mediumGapsCount, color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <TrendingUpIcon className="w-3.5 h-3.5" /> },
                          { label: 'Aligned', value: gaps.length - highGapsCount - mediumGapsCount, color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                        ].map((stat, i) => (
                          <div key={i} className={`eng-card-interactive ${stat.bg} ${stat.border} p-4 text-center`}>
                            <div className="flex items-center justify-center gap-1 mb-1.5">
                              <span className={`text-[10px] font-mono font-bold uppercase ${stat.color}`}>{stat.label}</span>
                            </div>
                            <p className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</p>
                          </div>
                        ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN GRID: RADAR + CATEGORY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Chart Panel */}
        <div className="lg:col-span-7 eng-card p-6 lg:p-8 relative">
          {/* Subtle corner glow */}
          <div className="absolute inset-0 rounded-[1.25rem] pointer-events-none opacity-30"
               style={{ background: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
          
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-base font-bold flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-gradient-to-r fromemerald-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Award className="w-4.5 h-4.5 textemerald-300" />
                </span>
                <span className="h-gradient">Competency Radar</span>
              </h2>
              <p className="text-xs opacity-60 font-medium mt-1">Assessed competencies vs. role target levels</p>
            </div>
            <div className="flex items-center gap-5 text-[10px] font-mono font-medium">
              <div className="flex items-center gap-1.5 text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1.5 textemerald-300">
                <span className="w-2.5 h-2.5 rounded-full bgemerald-400" />
                <span>Target</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="78%" data={radarData}>
                <PolarGrid
                  stroke="rgba(255,255,255,0.06)"
                  gridType="polygon"
                  radialLines={false}
                />
                <PolarAngleAxis
                  dataKey="skill"
                  stroke="rgba(255,255,255,0.06)"
                  tick={{
                    fill: '#e8e9ec',
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans Variable', sans-serif"
                  }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 3]}
                  stroke="rgba(255,255,255,0.06)"
                  tickCount={3}
                  tick={{ fill: '#7a7f90', fontSize: 9, fontFamily: "'JetBrains Mono Variable', monospace" }}
                  axisLine={false}
                />
                
                {/* Target Required — back layer with glow */}
                <Radar
                  name="Target Required"
                  dataKey="Required"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="rgba(16,185,129,0.12)"
                  fillOpacity={0.8}
                  dot={false}
                />
                {/* Current Level — front layer with strong glow */}
                <Radar
                  name="Current Level"
                  dataKey="Current"
                  stroke="#3ef2c2"
                  strokeWidth={2.5}
                  fill="rgba(62,242,194,0.18)"
                  fillOpacity={0.9}
                  dot={false}
                />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(5,6,10,0.98)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '14px',
                    color: '#f4f5f7',
                    fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 50px -15px rgba(0,0,0,0.6)'
                  }}
                  labelStyle={{ color: '#34d399', fontSize: '11px', fontFamily: "'JetBrains Mono Variable', monospace" }}
                  formatter={(value, name) => [value, name]}
                  itemStyle={{ fontSize: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Panel */}
        <div className="lg:col-span-5 eng-card p-6 lg:p-8 space-y-5 relative">
          <div className="relative z-10">
            <h2 className="font-display text-base font-bold flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-emerald-300" />
              </span>
              <span className="h-gradient">Gap Distribution</span>
            </h2>
            <p className="text-xs opacity-60 font-medium mt-1">Aggregated across 4 core statistical & IT domains</p>
          </div>

          <div className="relative z-10 space-y-3">
            {Object.entries(categoryBreakdown).map(([catKey, data]) => {
              const meta = CATEGORY_METADATA[catKey as keyof typeof CATEGORY_METADATA];
              const colors = CATEGORY_COLORS[catKey as keyof typeof CATEGORY_COLORS];
              const pct = data.requiredAvg > 0 ? Math.round((data.currentAvg / data.requiredAvg) * 100) : 100;

              return (
                <div
                  key={catKey}
                  className="relative eng-card-interactive group p-4 overflow-hidden"
                >
                  {/* Glow edge on hover */}
                  <div className="absolute inset-0 rounded-[1rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       style={{ background: `linear-gradient(90deg, ${colors.glow}, transparent)` }} />
                  
                  <div className="relative z-10 flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="font-display text-white">{meta.name}</span>
                    <span className="font-mono text-cyan-300">Avg: <strong>{data.currentAvg.toFixed(1)}</strong> / {data.requiredAvg.toFixed(1)}</span>
                  </div>
                  
                  {/* Premium progress bar */}
                  <div className="relative w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        background: `linear-gradient(90deg, ${colors.primary}80, ${colors.primary})`,
                        boxShadow: `0 0 12px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-medium opacity-70 mt-2">
                    <span>{data.gapCount > 0 ? `${data.gapCount} skill gaps` : 'Fully aligned'}</span>
                    <span className="font-black font-mono text-white">{pct}% match</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="relative z-10 pt-2 flex gap-3">
            <button
              onClick={onNavigateToCourses}
              className="flex-1 eng-btn-primary font-semibold text-xs py-3 cursor-pointer flex items-center justify-center gap-1.5 group"
            >
              <BookOpen className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-transform duration-300" />
              <span>Recommended Courses</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button
              onClick={onNavigateToQuiz}
              className="px-5 eng-card-interactive font-semibold text-xs py-3 cursor-pointer flex items-center gap-1.5 rounded-full"
            >
              <FileQuestion className="w-4 h-4 textemerald-300" />
              <span>Take Quiz</span>
            </button>
          </div>
        </div>

      </div>

      {/* ===== GAP DELTA BAR CHART & TABLE ===== */}
      <div className="eng-card p-6 lg:p-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-base font-bold h-gradient">Skill Delta Breakdown</h2>
            <p className="text-xs opacity-60 font-medium mt-1">Ranked gap severity deltas requiring iGOT course enrollment</p>
          </div>
          <Sparkles className="w-5 h-5 textemerald-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>

        {barData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Horizontal Bar Chart */}
            <div className="lg:col-span-6 h-72 eng-card-interactive p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <XAxis
                    type="number"
                    domain={[0, 3]}
                    stroke="rgba(255,255,255,0.08)"
                    tickCount={3}
                    tick={{ fill: '#7a7f90', fontSize: 9, fontFamily: "'JetBrains Mono Variable', monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="rgba(255,255,255,0.08)"
                    width={180}
                    tick={{ fill: '#c7c9d0', fontSize: 10, fontWeight: 500, fontFamily: "'Plus Jakarta Sans Variable', sans-serif" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(5,6,10,0.98)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: '12px',
                      color: '#f4f5f7',
                      fontWeight: 600,
                      fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
                      backdropFilter: 'blur(20px)'
                    }}
                    labelStyle={{ color: '#34d399', fontSize: '10px', fontFamily: "'JetBrains Mono Variable', monospace" }}
                    formatter={(value) => [`Δ${value}`, 'Gap Delta']}
                  />
                  <Bar dataKey="delta" name="Skill Gap Delta" radius={[0, 8, 8, 0]} minPointSize={8}>
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.severity === 'high' 
                            ? 'linear-gradient(90deg, #ff6b6b, #ff3355)'
                            : entry.severity === 'medium'
                              ? 'linear-gradient(90deg, #ffb454, #ff8c2a)'
                              : 'linear-gradient(90deg, #10b981, #4dd7ff)'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Table */}
            <div className="lg:col-span-6 overflow-x-auto eng-card p-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="opacity-50 border-b border-white/10 pb-2">
                    <th className="py-2.5 px-3 font-bold font-display text-white">Skill</th>
                    <th className="py-2.5 px-3 font-bold font-mono textemerald-300">Current</th>
                    <th className="py-2.5 px-3 font-bold font-mono text-cyan-300">Target</th>
                    <th className="py-2.5 px-3 font-bold text-white/70">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {gaps.map(gap => {
                    const sev = SEVERITY_COLORS[gap.severity];
                    return (
                      <tr key={gap.skillId} className="hover:bg-white/3 transition-colors duration-200 group">
                        <td className="py-3 px-3 font-medium text-white group-hover:textemerald-200 transition-colors">{gap.skillName}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-white/70">{SKILL_LEVEL_LABELS[gap.currentLevel].label}</td>
                        <td className="py-3 px-3 font-mono text-[11px] font-semibold text-cyan-300">{SKILL_LEVEL_LABELS[gap.requiredLevel].label}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono font-bold text-[9px] uppercase tracking-wider"
                                style={{ background: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}>
                            {gap.severity.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        ) : (
          <div className="py-12 text-center opacity-60">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mx-auto mb-3 animate-float">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="font-bold text-white">All competencies fully aligned!</p>
            <p className="text-xs font-medium mt-1">No skill gaps detected for this role profile.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SkillGapRadarView;