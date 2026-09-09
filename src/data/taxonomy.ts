import type { Skill, CompetencyCategory, SkillLevel } from '../types';
import { MOCK_SKILLS } from './mockData';

export const CATEGORY_METADATA: Record<CompetencyCategory, { name: string; color: string; bgClass: string; borderClass: string; textClass: string; icon: string }> = {
  statistical: {
    name: 'Statistical Competencies',
    color: '#0284c7', // Sky Blue
    bgClass: 'bg-sky-500/10',
    borderClass: 'border-sky-500/30',
    textClass: 'text-sky-400',
    icon: 'BarChart3'
  },
  technical: {
    name: 'Technical & Data Science',
    color: '#10b981', // Emerald
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    textClass: 'text-emerald-400',
    icon: 'Code2'
  },
  digital_governance: {
    name: 'Digital Governance & Security',
    color: '#8b5cf6', // Violet
    bgClass: 'bg-violet-500/10',
    borderClass: 'border-violet-500/30',
    textClass: 'text-violet-400',
    icon: 'ShieldCheck'
  },
  behavioural: {
    name: 'Behavioural & Management',
    color: '#f59e0b', // Amber/Gold
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400',
    icon: 'Users'
  }
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, { label: string; badgeClass: string; color: string }> = {
  0: { label: 'None', badgeClass: 'badge-none', color: '#64748b' },
  1: { label: 'Beginner', badgeClass: 'badge-beginner', color: '#38bdf8' },
  2: { label: 'Intermediate', badgeClass: 'badge-intermediate', color: '#818cf8' },
  3: { label: 'Advanced', badgeClass: 'badge-advanced', color: '#34d399' }
};

/* Skills sourced from NSSTA real training areas (shared with mockData) */
export const MOSPI_SKILLS: Skill[] = MOCK_SKILLS;

export const SKILL_MAP = new Map<string, Skill>(MOSPI_SKILLS.map(s => [s.id, s]));
