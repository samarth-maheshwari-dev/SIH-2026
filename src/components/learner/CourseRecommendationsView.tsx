import React from 'react';
import type { CompetencyProfile, RoleRequirement, Enrollment, SkillLevel } from '../../types';
import { MOCK_COURSES } from '../../data/mockData';
import { computeSkillGaps } from '../../services/gapAnalysisEngine';

import { ExternalLink, CheckCircle2, Star, Clock, BookOpen, Filter, Search, Award } from 'lucide-react';

interface CourseRecommendationsViewProps {
  profile: CompetencyProfile;
  role: RoleRequirement;
  enrollments: Record<string, Enrollment>;
  onUpdateEnrollment: (courseId: string, status: 'in_progress' | 'completed') => void;
  onSkillLevelUp: (skillId: string, customLevel?: SkillLevel) => void;
}

export const CourseRecommendationsView: React.FC<CourseRecommendationsViewProps> = ({
  profile,
  role,
  enrollments,
  onUpdateEnrollment,
  onSkillLevelUp
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const gaps = computeSkillGaps(profile, role);
  const gapsMap = new Map(gaps.map(g => [g.skillId, g]));

  // Prioritize courses matching identified skill gaps
  const sortedCourses = [...MOCK_COURSES].sort((a, b) => {
    const gapA = gapsMap.get(a.skillId);
    const gapB = gapsMap.get(b.skillId);
    const deltaA = gapA ? gapA.gapDelta : 0;
    const deltaB = gapB ? gapB.gapDelta : 0;
    return deltaB - deltaA;
  });

  const filteredCourses = sortedCourses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSimulateCompletion = (courseId: string, skillId: string, targetLevel: SkillLevel) => {
    onUpdateEnrollment(courseId, 'completed');
    onSkillLevelUp(skillId, targetLevel);
  };

  const handleOpenIgotCourse = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="eng-card p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              iGOT Karmayogi Personalized Course Catalog
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              Linked to iGOT Portal
            </span>
          </div>
          <p className="text-xs opacity-75 mt-1 font-medium">
            Clicking any course opens the official iGOT Karmayogi learning portal (<a href="https://igotkarmayogi.gov.in/" target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">igotkarmayogi.gov.in</a>).
          </p>
        </div>
      </div>

      {/* Controls Bar: Filter & Search */}
      <div className="eng-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 opacity-60 shrink-0" />
          {['all', 'statistical', 'technical', 'digital_gov', 'behavioural'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'eng-card opacity-70 hover:opacity-100'
              }`}
            >
              {cat === 'all' ? 'All Domains' : cat.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 opacity-50 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter courses by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full eng-input rounded-xl pl-9 pr-4 py-2 text-xs font-medium"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => {
          const gapInfo = gapsMap.get(course.skillId);
          const enrollment = enrollments[course.id];
          const isCompleted = enrollment?.status === 'completed';

          return (
            <div
              key={course.id}
              className="eng-card eng-card-interactive overflow-hidden flex flex-col justify-between group cursor-pointer"
              onClick={() => handleOpenIgotCourse(course.url)}
            >
              {/* Thumbnail Header */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Provider Badge */}
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900/90 text-white border border-slate-700">
                  {course.provider.toUpperCase()}
                </span>

                {/* Match badge */}
                {gapInfo && gapInfo.gapDelta > 0 && (
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500 text-slate-950 shadow-md">
                    GAP MATCH
                  </span>
                )}

                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                    {course.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
                
                <p className="text-xs opacity-75 line-clamp-2 leading-relaxed font-medium">{course.description}</p>

                {/* Meta Pills */}
                <div className="flex items-center justify-between text-[11px] opacity-80 font-mono border-t border-b border-slate-200 dark:border-slate-800 py-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{course.durationHours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{course.rating}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-500/10 font-bold text-[10px]">
                    L{course.targetLevel}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {course.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-500/10 opacity-80">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => handleOpenIgotCourse(course.url)}
                    className="w-full eng-btn-primary text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open on iGOT Karmayogi</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {isCompleted ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Completed & Synced</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSimulateCompletion(course.id, course.skillId, course.targetLevel)}
                      className="w-full eng-card hover:border-emerald-500/40 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Simulate Completion</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
