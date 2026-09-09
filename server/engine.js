/**
 * StackConnect Competency + Recommendation Engine (server-side)
 * Computes skill gaps, readiness, and course recommendations from SQLite data.
 */
import { SKILLS, ROLES, COURSES } from './seedData.js';

const SKILL_MAP = new Map(SKILLS.map(s => [s.id, s]));
const ROLE_MAP = new Map(ROLES.map(r => [r.id, r]));

export function getSeededRoles() {
  return ROLES.map(r => ({ id: r.id, title: r.title, department: r.department, description: r.description }));
}

export function getSeededCourses() {
  return COURSES;
}

/** Build a full competency profile from DB rows. */
function buildProfile(skillRows, attemptRows) {
  const scores = {};
  for (const s of skillRows) {
    scores[s.skill_id] = { skillId: s.skill_id, level: s.level, lastAssessedAt: s.last_assessed_at, assessedVia: s.assessed_via || 'quiz' };
  }
  // Merge in quiz attempts (learned skill levels drive profile)
  for (const a of attemptRows || []) {
    const sid = a.target_skill_id;
    if (!sid) continue;
    const existing = scores[sid]?.level || 0;
    // Attempt scorePercent → level mapping (0-34:0, 35-59:1, 60-79:2, 80+:3)... use MAX of existing
    const attemptLevel = a.score_percent >= 80 ? 3 : a.score_percent >= 60 ? 2 : a.score_percent >= 35 ? 1 : 0;
    if (attemptLevel > existing) {
      scores[sid] = { skillId: sid, level: attemptLevel, lastAssessedAt: a.created_at, assessedVia: 'ai_quiz' };
    }
  }
  return { scores };
}

/** Compute gaps + readiness + category breakdown. */
export function computeCompetency(skillRows, attemptRows, roleId) {
  const profile = buildProfile(skillRows, attemptRows);
  const role = ROLE_MAP.get(roleId) || ROLES[0];
  if (!role) return { error: 'No role found' };

  const gaps = [];
  Object.entries(role.requiredSkills).forEach(([skillId, requiredLevel]) => {
    const skill = SKILL_MAP.get(skillId);
    if (!skill) return;
    const currentLevel = profile.scores[skillId]?.level || 0;
    const gapDelta = requiredLevel - currentLevel;
    let severity = 'none';
    if (gapDelta === 1) severity = 'low';
    else if (gapDelta === 2) severity = 'medium';
    else if (gapDelta >= 3) severity = 'high';
    gaps.push({
      skillId, skillName: skill.name, category: skill.category,
      currentLevel, requiredLevel, gapDelta, severity,
    });
  });
  gaps.sort((a, b) => b.gapDelta - a.gapDelta);

  // Overall readiness: sum(min(current, required)) / sum(required)
  let totalReq = 0, totalCur = 0;
  gaps.forEach(g => { totalReq += g.requiredLevel; totalCur += Math.min(g.currentLevel, g.requiredLevel); });
  const readiness = totalReq === 0 ? 100 : Math.round((totalCur / totalReq) * 100);

  // Category breakdown
  const categories = ['statistical', 'technical', 'digital_governance', 'behavioural'];
  const breakdown = {};
  categories.forEach(cat => {
    const catGaps = gaps.filter(g => g.category === cat);
    if (!catGaps.length) { breakdown[cat] = { currentAvg: 0, requiredAvg: 0, gapCount: 0 }; return; }
    let cur = 0, req = 0, cnt = 0;
    catGaps.forEach(g => { cur += g.currentLevel; req += g.requiredLevel; if (g.gapDelta > 0) cnt++; });
    breakdown[cat] = {
      currentAvg: Number((cur / catGaps.length).toFixed(1)),
      requiredAvg: Number((req / catGaps.length).toFixed(1)),
      gapCount: cnt,
    };
  });

  return { profile, role, gaps, readiness, breakdown };
}

/**
 * Recommendation engine:
 *  1. Rank gaps by severity (delta desc).
 *  2. For each open gap, pick courses targeting that skill (match priority).
 *  3. Score courses: direct skill match + level match + rating + recency.
 *  4. Also generate a 5-step learning path (weakest-first).
 */
export function recommend(competencyResult, opts = {}) {
  const { gaps, role, profile } = competencyResult;
  const limit = opts.limit || 6;
  const openGaps = gaps.filter(g => g.gapDelta > 0).sort((a, b) => b.gapDelta - a.gapDelta);

  const recommendations = [];
  const usedCourseIds = new Set();

  for (const gap of openGaps) {
    const candidates = COURSES
      .filter(c => c.skillId === gap.skillId)
      .filter(c => !usedCourseIds.has(c.id))
      .map(c => {
        let score = 10;
        // Level proximity: recommending a course too far above current is wasted
        const dist = Math.abs(c.targetLevel - gap.currentLevel);
        score += dist === 1 ? 5 : dist === 0 ? 4 : dist === 2 ? 2 : 0;
        // Prefer courses that close the gap exactly
        if (c.targetLevel >= gap.requiredLevel) score += 3;
        else if (c.targetLevel >= gap.currentLevel + 1) score += 2;
        // Popularity + rating
        score += Math.min(c.rating, 5) * 0.8;
        score += Math.min(c.enrolledCount / 500, 3);
        return { course: c, score, gapDelta: gap.gapDelta };
      })
      .sort((a, b) => b.score - a.score);

    for (const cand of candidates.slice(0, 2)) {
      usedCourseIds.add(cand.course.id);
      recommendations.push({
        courseId: cand.course.id,
        title: cand.course.title,
        skillId: gap.skillId,
        skillName: gap.skillName,
        gapDelta: gap.gapDelta,
        severity: gap.severity,
        targetLevel: cand.course.targetLevel,
        provider: cand.course.provider,
        durationHours: cand.course.durationHours,
        rating: cand.course.rating,
        url: cand.course.url || '',
        reason: `Closes your ${gapLevelLabel(gap.currentLevel)} → ${gapLevelLabel(gap.requiredLevel)} gap in ${gap.skillName}.`,
        score: Math.round(cand.score),
      });
    }
    if (recommendations.length >= limit) break;
  }

  // Learning path: weakest-first sequence of 5 steps
  const path = openGaps.slice(0, 5).map((g, i) => ({
    step: i + 1,
    skillId: g.skillId,
    skillName: g.skillName,
    action: g.gapDelta >= 2 ? 'Complete a certification course' : 'Practice + micro-learning module',
    fromLevel: g.currentLevel,
    toLevel: g.requiredLevel,
    courseCount: COURSES.filter(c => c.skillId === g.skillId).length,
  }));

  return {
    role: role?.title || '',
    readiness: competencyResult.readiness,
    gapsSummary: {
      total: gaps.length,
      open: openGaps.length,
      high: gaps.filter(g => g.severity === 'high').length,
      medium: gaps.filter(g => g.severity === 'medium').length,
      low: gaps.filter(g => g.severity === 'low').length,
    },
    recommendations,
    learningPath: path,
  };
}

function gapLevelLabel(level) {
  return ['None', 'Beginner', 'Intermediate', 'Advanced'][level] || 'None';
}