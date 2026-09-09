import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Award, Target, ArrowRight, Road, MapPin } from 'lucide-react';

interface TopicScore {
  correct: number;
  total: number;
  scorePercent: number;
}

interface RadarResultProps {
  topicScores: Record<string, TopicScore>;
  overallPercent: number;
  skillLabel: string;
  onPracticeAgain: () => void;
  provider?: string;
}

const STATUS_COLORS: Record<string, string> = {
  strong: '#10b981',
  medium: '#f59e0b',
  weak: '#f43f5e',
};

export const RadarResultView: React.FC<RadarResultProps> = ({
  topicScores,
  overallPercent,
  skillLabel,
  onPracticeAgain,
  provider,
}) => {
  const topics = Object.entries(topicScores);

  const radarData = useMemo(
    () =>
      topics.map(([topic, stat]) => ({
        topic: topic.length > 20 ? topic.substring(0, 18) + '…' : topic,
        score: stat.scorePercent,
      })),
    [topicScores]
  );

  const avgTopic = topics.length
    ? Math.round(topics.reduce((s, [, v]) => s + v.scorePercent, 0) / topics.length)
    : overallPercent;

  const verdict = avgTopic >= 80 ? 'strong' : avgTopic >= 55 ? 'medium' : 'weak';
  const verdictColor = STATUS_COLORS[verdict];

  // Recommendation path — ordered steps from weakest → strongest topic
  const pathSteps = useMemo(() => {
    const sorted = [...topics].sort((a, b) => a[1].scorePercent - b[1].scorePercent);
    return sorted.map(([topic, stat], i) => ({
      step: i + 1,
      topic,
      score: stat.scorePercent,
      action:
        stat.scorePercent < 55
          ? 'Re-study source material & retake'
          : stat.scorePercent < 80
          ? 'Guided module + targeted practice'
          : 'Reinforce & teach peers',
    }));
  }, [topics]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Verdict header */}
      <div
        className="p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ background: `linear-gradient(135deg, ${verdictColor}18, transparent 60%)`, borderColor: `${verdictColor}40` }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
               style={{ background: `${verdictColor}22`, color: verdictColor }}>
            <Award className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold opacity-70">Assessment Radar</p>
            <h3 className="text-xl font-bold">{skillLabel}</h3>
            <p className="text-xs opacity-70 font-medium mt-0.5">
              {verdict === 'strong' ? 'Excellent grasp — competency near role-ready.' :
               verdict === 'medium' ? 'Good foundation, targeted gaps remain.' :
               'Priority gaps detected — follow the learning path below.'}
              {provider === 'llm' ? ' • AI-generated questions' : provider === 'offline' ? ' • Offline question bank' : ''}
            </p>
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-black" style={{ color: verdictColor }}>{overallPercent}%</div>
          <div className="text-[10px] uppercase tracking-wider opacity-60 font-bold mt-0.5">Overall Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar graph */}
        <div className="lg:col-span-6 rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm">Topic-wise Mastery Radar</h4>
          </div>
          {radarData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: '#c7c9d0', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} tick={{ fill: '#7a7f90', fontSize: 9 }} stroke="rgba(255,255,255,0.05)" />
                  <Radar
                    name="Mastery"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="rgba(16,185,129,0.25)"
                    fillOpacity={0.9}
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(5,10,8,0.98)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, color: '#f4f5f7', fontWeight: 600 }}
                    formatter={(value) => [`${value}%`, 'Mastery']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm opacity-60">No topic data available.</p>
          )}
          <div className="flex items-center justify-center gap-5 mt-3 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Strong (≥80%)</span>
            <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium (55–79%)</span>
            <span className="flex items-center gap-1.5 text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Weak ({'{<'}55%)</span>
          </div>
        </div>

        {/* Recommendation path */}
        <div className="lg:col-span-6 rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Road className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm">Your Learning Path</h4>
          </div>
          <div className="space-y-0">
            {pathSteps.map((step, i) => (
              <div key={step.topic} className="relative flex gap-4">
                {/* connector line */}
                {i < pathSteps.length - 1 && (
                  <div className="absolute left-[15px] top-9 bottom-0 w-px bg-white/10" />
                )}
                <div className="relative z-10 flex flex-col items-center shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2"
                    style={{
                      background: statusBg(step.score),
                      borderColor: statusColor(step.score),
                      color: statusColor(step.score),
                    }}
                  >
                    {step.step}
                  </div>
                </div>
                <div className="flex-1 pb-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white/85">{step.topic}</p>
                    <span className="text-xs font-mono font-bold" style={{ color: statusColor(step.score) }}>
                      {step.score}%
                    </span>
                  </div>
                  <p className="text-[11px] opacity-60 font-medium mt-0.5 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> {step.action}
                  </p>
                  <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${step.score}%`, background: statusColor(step.score) }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onPracticeAgain} className="px-5 py-2.5 rounded-xl eng-btn-primary text-white font-bold text-xs cursor-pointer flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Take Another Assessment
        </button>
      </div>
    </div>
  );
};

function statusColor(score: number): string {
  return score >= 80 ? '#10b981' : score >= 55 ? '#f59e0b' : '#f43f5e';
}
function statusBg(score: number): string {
  return score >= 80 ? 'rgba(16,185,129,0.15)' : score >= 55 ? 'rgba(245,158,11,0.12)' : 'rgba(244,63,94,0.12)';
}

export default RadarResultView;
