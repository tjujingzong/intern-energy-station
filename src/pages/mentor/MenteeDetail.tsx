import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useData } from '../../store/dataStore';
import { INTERNS } from '../../data/users';
import { STAGES, POSITION_COLORS, SKILL_DIMS } from '../../constants';
import { currentStage, fmtDate, getStageProgress, isOverdue, avgSkill } from '../../utils';
import SkillRadar from '../../components/SkillRadar';
import GrowthPath from '../../components/GrowthPath';
import { ArrowLeft, MessageSquare, Save, Sparkles, Loader2 } from 'lucide-react';
import type { StageId, SkillScore } from '../../types';
import { chat } from '../../api/deepseek';
import { useAuth } from '../../store/authStore';

export default function MenteeDetail() {
  const { id } = useParams();
  const me = useAuth((s) => s.current())!;
  const tasks = useData((s) => s.tasks);
  const reports = useData((s) => s.reports);
  const skills = useData((s) => s.skills);
  const updateSkill = useData((s) => s.updateSkill);
  const setReportFeedback = useData((s) => s.setReportFeedback);

  const intern = INTERNS.find((i) => i.id === id);
  if (!intern) return <div className="text-slate-500">未找到该实习生</div>;

  const stage = currentStage(tasks, intern.id);
  const stageProgress = STAGES.reduce(
    (acc, s) => ({ ...acc, [s.id]: getStageProgress(tasks, intern.id, s.id) }),
    {} as Record<StageId, number>,
  );
  const myReports = reports.filter((r) => r.internId === intern.id).sort((a, b) => b.weekNo - a.weekNo);
  const skill = skills[intern.id];

  return (
    <div className="space-y-6">
      <Link to="/mentor" className="text-sm text-slate-500 hover:text-brand-700 inline-flex items-center gap-1">
        <ArrowLeft size={14} /> 返回带教看板
      </Link>

      <div className="card flex flex-wrap items-center gap-4">
        <span className="text-4xl">{intern.avatar}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">{intern.name}</h1>
            <span className={`badge ${POSITION_COLORS[intern.position!]}`}>{intern.position}</span>
            <span className="badge bg-slate-100 text-slate-600">{STAGES.find((s) => s.id === stage)?.name}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {intern.school} · {intern.team} · 入职 {intern.joinDate}
          </div>
        </div>
        <Link to="/mentor/feedback" className="btn-outline">
          <MessageSquare size={14} /> 写反馈
        </Link>
      </div>

      <div className="card">
        <div className="section-title mb-3">成长地图</div>
        <GrowthPath current={stage} stageProgress={stageProgress} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="section-title mb-3">待批阅 / 历史周报</div>
            {myReports.length === 0 && <div className="text-sm text-slate-500">暂无周报</div>}
            <div className="space-y-3">
              {myReports.map((r) => (
                <ReportItem
                  key={r.id}
                  report={r}
                  internName={intern.name}
                  onSubmitFeedback={(fb) => setReportFeedback(r.id, fb, me.id)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card">
            <div className="section-title mb-2">技能雷达</div>
            <div className="text-xs text-slate-500 mb-2">
              均分 <b className="text-brand-700">{avgSkill(skill)}</b> / 100
            </div>
            <SkillRadar score={skill} />
            <ScoreEditor score={skill} onChange={(s) => updateSkill(intern.id, s)} />
          </div>

          <div className="card">
            <div className="section-title mb-2">当前阶段任务</div>
            <ul className="space-y-2 max-h-72 overflow-auto pr-1">
              {tasks
                .filter((t) => t.internId === intern.id && t.stage === stage)
                .map((t) => (
                  <li key={t.id} className="text-xs flex items-start justify-between gap-2">
                    <div className={t.done ? 'line-through text-slate-400' : 'text-slate-700'}>
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-400 shrink-0">
                      {fmtDate(t.dueDate)}
                      {isOverdue(t.dueDate, t.done) && <span className="text-rose-500 ml-1">逾期</span>}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportItem({
  report,
  internName,
  onSubmitFeedback,
}: {
  report: import('../../types').WeeklyReport;
  internName: string;
  onSubmitFeedback: (fb: string) => void;
}) {
  const [fb, setFb] = useState(report.feedback || '');
  const [loading, setLoading] = useState(false);

  const aiGenerate = async () => {
    setLoading(true);
    try {
      const reply = await chat([
        {
          role: 'system',
          content: `你是新人导师，请基于实习生的周报内容撰写一段简短而具体的反馈（150 字以内），按 STAR 思路要点提炼，包含一句鼓励 + 一句改进建议，最后给出下周可尝试的一件小事。`,
        },
        {
          role: 'user',
          content: `实习生：${internName}\n本周成果：${report.achievements}\n问题：${report.problems}\n下周计划：${report.nextWeek}`,
        },
      ]);
      setFb(reply);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-100 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="font-medium text-slate-800 text-sm">{report.weekLabel}（第 {report.weekNo} 周）</div>
        <div className="text-[11px] text-slate-400">提交于 {fmtDate(report.submittedAt)}</div>
      </div>
      <div className="grid md:grid-cols-3 gap-3 mt-2 text-xs">
        <Field title="本周成果" v={report.achievements} />
        <Field title="问题" v={report.problems} />
        <Field title="下周" v={report.nextWeek} />
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-slate-500">导师反馈</div>
          <button
            className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1"
            onClick={aiGenerate}
            disabled={loading}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI 起草
          </button>
        </div>
        <textarea className="input min-h-[80px]" value={fb} onChange={(e) => setFb(e.target.value)} />
        <button className="btn-primary mt-2" onClick={() => onSubmitFeedback(fb)}>
          <Save size={14} /> 保存反馈
        </button>
      </div>
    </div>
  );
}

function Field({ title, v }: { title: string; v: string }) {
  return (
    <div>
      <div className="text-slate-500">{title}</div>
      <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{v || '-'}</div>
    </div>
  );
}

function ScoreEditor({ score, onChange }: { score: SkillScore; onChange: (s: SkillScore) => void }) {
  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs text-slate-500">技能评分（导师调整）</div>
      {SKILL_DIMS.map((d) => (
        <div key={d.key} className="flex items-center gap-2 text-xs">
          <div className="w-16 text-slate-600">{d.label}</div>
          <input
            type="range"
            min={0}
            max={100}
            value={score[d.key]}
            onChange={(e) => onChange({ ...score, [d.key]: Number(e.target.value) })}
            className="flex-1 accent-brand-600"
          />
          <div className="w-8 text-right text-slate-700">{score[d.key]}</div>
        </div>
      ))}
    </div>
  );
}
