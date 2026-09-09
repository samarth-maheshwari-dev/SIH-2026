import type { CompetencyProfile, RoleRequirement, SkillGapItem, GapSeverity, CompetencyCategory } from '../types';
import { SKILL_MAP } from '../data/taxonomy';


export function computeSkillGaps(profile: CompetencyProfile, role: RoleRequirement): SkillGapItem[] {
  const gaps: SkillGapItem[] = [];

  // Iterate over all skills defined in the target role requirement
  Object.entries(role.requiredSkills).forEach(([skillId, requiredLevel]) => {
    const skill = SKILL_MAP.get(skillId);
    if (!skill) return;

    const userScore = profile.scores[skillId];
    const currentLevel = userScore ? userScore.level : 0;
    const gapDelta = requiredLevel - currentLevel;

    let severity: GapSeverity = 'none';
    if (gapDelta === 1) severity = 'low';
    else if (gapDelta === 2) severity = 'medium';
    else if (gapDelta >= 3) severity = 'high';

    gaps.push({
      skillId,
      skillName: skill.name,
      category: skill.category,
      currentLevel,
      requiredLevel,
      gapDelta,
      severity
    });
  });

  // Sort by gap severity (highest delta first)
  return gaps.sort((a, b) => b.gapDelta - a.gapDelta);
}

export function computeOverallReadiness(gaps: SkillGapItem[]): number {
  if (gaps.length === 0) return 100;

  let totalRequired = 0;
  let totalCurrent = 0;

  gaps.forEach(gap => {
    totalRequired += gap.requiredLevel;
    totalCurrent += Math.min(gap.currentLevel, gap.requiredLevel);
  });

  if (totalRequired === 0) return 100;
  return Math.round((totalCurrent / totalRequired) * 100);
}

export function computeCategoryBreakdown(gaps: SkillGapItem[]): Record<CompetencyCategory, { currentAvg: number; requiredAvg: number; gapCount: number }> {
  const categories: CompetencyCategory[] = ['statistical', 'technical', 'digital_governance', 'behavioural'];
  const breakdown: Record<CompetencyCategory, { currentAvg: number; requiredAvg: number; gapCount: number }> = {
    statistical: { currentAvg: 0, requiredAvg: 0, gapCount: 0 },
    technical: { currentAvg: 0, requiredAvg: 0, gapCount: 0 },
    digital_governance: { currentAvg: 0, requiredAvg: 0, gapCount: 0 },
    behavioural: { currentAvg: 0, requiredAvg: 0, gapCount: 0 }
  };

  categories.forEach(cat => {
    const catGaps = gaps.filter(g => g.category === cat);
    if (catGaps.length === 0) return;

    let currentSum = 0;
    let requiredSum = 0;
    let gapsWithDelta = 0;

    catGaps.forEach(g => {
      currentSum += g.currentLevel;
      requiredSum += g.requiredLevel;
      if (g.gapDelta > 0) gapsWithDelta++;
    });

    breakdown[cat] = {
      currentAvg: Number((currentSum / catGaps.length).toFixed(1)),
      requiredAvg: Number((requiredSum / catGaps.length).toFixed(1)),
      gapCount: gapsWithDelta
    };
  });

  return breakdown;
}
