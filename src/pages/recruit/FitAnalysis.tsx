import { useMemo, useState } from 'react';
import { INTERNS, MENTORS } from '../../data/users';
import { useData } from '../../store/dataStore';
import { POSITION_COLORS, SKILL_DIMS, STAGES } from '../../constants';
import {
  avgSkill,
  currentStage,
  getInternProgress,
} from '../../utils';
import SkillRadar from '../../components/SkillRadar';
import { chat, hasKey } from '../../api/deepseek';
// (using SkillRadar with `score` prop directly)
import { Sparkles, Loader2, Award, ThumbsUp, AlertTriangle, GraduationCap } from 'lucide-react';
import type { Position } from '../../types';

export default function FitAnalysis() {
  const tasks = useData((s) => s.tasks);
  const skills = useData((s) => s.skills);
  const reports = useData((s) => s.reports);
  const feedbacks = useData((s) => s.feedbacks);

  const [filterPos, setFilterPos] = useState<'all' | Position>('all');
  const [selectedId, setSelectedId] = useState<string>('intern01');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  // 综合评分：技能 60% + 进度 30% + 反馈数 10%
  const ranking = useMemo(() => {
    return INTERNS.filter((i) => (filterPos === 'all' ? true : i.position === filterPos))
      .map((i) => {
        const sk = avgSkill(skills[i.id]);
        const prog = getInternProgress(tasks, i.id);
        const fbCnt = feedbacks.filter((f) => f.internId === i.id).length;
        const score = Math.round(sk * 0.6 + prog * 0.3 + Math.min(fbCnt, 5) * 2);
        let level: 'A' | 'B' | 'C' = 'C';
        if (score >= 80) level = 'A';
        else if (score >= 65) level = 'B';
        return { intern: i, sk, prog, fbCnt, score, level };
      })
      .sort((a, b) => b.score - a.score);
  }, [filterPos, skills, tasks, feedbacks]);

  const selected = INTERNS.find((i) => i.id === selectedId)!;
  const selRank = ranking.find((r) => r.intern.id === selectedId);
  const sel = {
    score: selRank?.score ?? 0,
    level: selRank?.level ?? 'C',
    skill: skills[selectedId],
    progress: getInternProgress(tasks, selectedId),
    stage: currentStage(tasks, selectedId),
    mentor: MENTORS.find((m) => m.id === selected.mentorId),
    reportCnt: reports.filter((r) => r.internId === selectedId).length,
    fbCnt: feedbacks.filter((f) => f.internId === selectedId).length,
  };

  const generateAdvice = async () => {
    setLoading(true);
    setAdvice('');
    try {
      const reply = await chat([
        {
          role: 'system',
          content:
            '你是一名资深 HRBP（同时负责招聘调配），正在为某实习生撰写「适岗度与转正建议」。请输出：综合评分 / 优势 / 待改进 / 转正建议 / 推荐试用岗位，结构清晰，250 字以内。',
        },
        {
          role: 'user',
          content: [
            `候选人：${selected.name}（${selected.position}，${selected.school}）`,
            `导师：${sel.mentor?.name}`,
            `任务完成度：${sel.progress}%；当前阶段：${STAGES.find((s) => s.id === sel.stage)?.name}`,
            `技能：${SKILL_DIMS.map((d) => `${d.label} ${sel.skill[d.key]}`).join('，')}`,
            `周报提交：${sel.reportCnt} 篇；导师反馈：${sel.fbCnt} 条`,
            `综合评分：${sel.score}（等级 ${sel.level}）`,
          ].join('\n'),
        },
      ]);
      setAdvice(reply);
    } finally {
      setLoading(false);
    }
  };

  const aDist = ranking.filter((r) => r.level === 'A').length;
  const bDist = ranking.filter((r) => r.level === 'B').length;
  const cDist = ranking.filter((r) => r.level === 'C').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">适岗度评估</h1>
        <p className="text-sm text-slate-500 mt-1">
          基于技能、进度、反馈三维数据综合打分，并由 AI 输出转正建议。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="评估总人数" value={`${ranking.length}`} icon={<Award size={18} />} tone="blue" />
        <Stat label="A 级·重点留用" value={`${aDist}`} icon={<ThumbsUp size={18} />} tone="emerald" />
        <Stat label="B 级·建议留用" value={`${bDist}`} icon={<GraduationCap size={18} />} tone="amber" />
        <Stat label="C 级·待观察" value={`${cDist}`} icon={<AlertTriangle size={18} />} tone="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左：排名 */}
        <div className="card lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="section-title">综合排名</div>
            <select
              className="input py-1.5 text-xs"
              value={filterPos}
              onChange={(e) => setFilterPos(e.target.value as any)}
            >
              <option value="all">全部岗位</option>
              <option value="研发">研发</option>
              <option value="产品">产品</option>
              <option value="销售">销售</option>
            </select>
          </div>
          <div className="overflow-auto max-h-[520px]">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 sticky top-0 bg-white">
                <tr>
                  <th className="text-left py-2 px-2">#</th>
                  <th className="text-left">姓名</th>
                  <th>岗位</th>
                  <th>进度</th>
                  <th>技能</th>
                  <th>反馈</th>
                  <th>评分</th>
                  <th>等级</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, idx) => (
                  <tr
                    key={r.intern.id}
                    onClick={() => setSelectedId(r.intern.id)}
                    className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50 ${
                      selectedId === r.intern.id ? 'bg-brand-50' : ''
                    }`}
                  >
                    <td className="py-2 px-2 text-slate-400">{idx + 1}</td>
                    <td className="font-medium">{r.intern.avatar} {r.intern.name}</td>
                    <td className="text-center">
                      <span className={`badge ${POSITION_COLORS[r.intern.position!]}`}>
                        {r.intern.position}
                      </span>
                    </td>
                    <td className="text-center text-slate-600">{r.prog}%</td>
                    <td className="text-center text-slate-600">{r.sk}</td>
                    <td className="text-center text-slate-600">{r.fbCnt}</td>
                    <td className="text-center font-semibold text-slate-800">{r.score}</td>
                    <td className="text-center">
                      <LevelBadge level={r.level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右：单人详情 */}
        <div className="card">
          <div className="section-title mb-3">候选人详情</div>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{selected.avatar}</div>
            <div>
              <div className="font-semibold text-slate-800">{selected.name}</div>
              <div className="text-xs text-slate-500">
                {selected.school} · {selected.position} · 导师 {sel.mentor?.name}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-brand-700">{sel.score}</div>
              <LevelBadge level={sel.level} />
            </div>
          </div>

          <div className="mt-4">
            <SkillRadar score={sel.skill} height={220} />
          </div>

          <button onClick={generateAdvice} disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? '正在分析…' : 'AI 生成转正建议'}
            {!hasKey() && (
              <span className="text-[10px] opacity-80 ml-1">(本地模拟)</span>
            )}
          </button>
          <div className="mt-3 min-h-[140px] bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm whitespace-pre-wrap text-slate-700 leading-relaxed">
            {advice || '点击上方按钮，AI 将基于左侧数据自动撰写建议。'}
          </div>
        </div>
      </div>
    </div>
  );
}

function LevelBadge({ level }: { level: 'A' | 'B' | 'C' }) {
  const map = {
    A: 'bg-emerald-100 text-emerald-700',
    B: 'bg-amber-100 text-amber-700',
    C: 'bg-rose-100 text-rose-700',
  } as const;
  return <span className={`badge ${map[level]}`}>{level}</span>;
}

function Stat({ label, value, icon, tone }: any) {
  const map: Record<string, string> = {
    blue: 'bg-brand-50 text-brand-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${map[tone]}`}>{icon}</div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-xl font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}
