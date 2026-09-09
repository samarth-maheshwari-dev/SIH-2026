export type CompetencyCategory = 'statistical' | 'technical' | 'digital_governance' | 'behavioural';

export type SkillLevel = 0 | 1 | 2 | 3; // 0=None, 1=Beginner, 2=Intermediate, 3=Advanced

export type GapSeverity = 'none' | 'low' | 'medium' | 'high';

export type UserRole = 'employee' | 'admin';

export interface Skill {
  id: string;
  name: string;
  category: CompetencyCategory;
  description: string;
}

export interface CompetencyScore {
  skillId: string;
  level: SkillLevel;
  lastAssessedAt: string;
  assessedVia: 'self_assessment' | 'admin_evaluation' | 'ai_quiz' | 'igot_course';
}

export interface CompetencyProfile {
  userId: string;
  roleId: string;
  scores: Record<string, CompetencyScore>;
}

export interface RoleRequirement {
  id: string;
  title: string;
  department: string;
  description: string;
  requiredSkills: Record<string, SkillLevel>;
}

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: CompetencyCategory;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gapDelta: number; // requiredLevel - currentLevel
  severity: GapSeverity;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  provider: 'igot_karmayogi' | 'nssta' | 'mospi_internal';
  skillId: string;
  category: CompetencyCategory;
  targetLevel: SkillLevel;
  durationHours: number;
  url: string;
  modulesCount: number;
  rating: number;
  enrolledCount: number;
  thumbnailUrl: string;
  tags: string[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercent: number;
  completedAt?: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctOptionIndex: number; // 0, 1, 2, 3
  explanation: string;
  subtopic: string;
  mappedSkillId: string;
}

export interface Quiz {
  id: string;
  documentTitle: string;
  documentId?: string;
  targetSkillId: string;
  createdAt: string;
  questions: MCQQuestion[];
  totalQuestions: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  takenAt: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  scorePercent: number;
  passed: boolean;
  topicScores: Record<string, { correct: number; total: number; scorePercent: number }>;
}

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  userRole: UserRole;
  designation: string;
  department: string;
  avatarUrl: string;
  roleId: string;
  joinedDate: string;
}

export interface IGotSyncConfig {
  isConnected: boolean;
  userIgotId: string;
  ssoToken: string;
  lastSyncedAt?: string;
  syncedCoursesCount: number;
}

export interface LabSnippet {
  id: string;
  title: string;
  skillId: string;
  description: string;
  starterCode?: string;
  code: string;
  language?: string;
  packages?: string[];
}

export interface DashboardStats {
  totalOfficers: number;
  activeCourses: number;
  avgReadiness: number;
  completedAssessments: number;
  departmentsActive: number;
  trendData: { month: string; completions: number; assessments: number }[];
}

export interface TrainingProgramme {
  id: string;
  title: string;
  provider: string;
  topic: string;
  durationWeeks: number;
  targetGroup: string;
  venue: string;
  startedDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: number;
  maxCapacity: number;
}

