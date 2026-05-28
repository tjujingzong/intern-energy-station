import { useMemo } from 'react';
import { useAuth } from '../../store/authStore';
import { useData } from '../../store/dataStore';
import { STAGES, POSITION_COLORS } from '../../constants';
import {
  currentStage,
  getInternProgress,
  getStageProgress,
  todayStr,
  isOverdue,
  fmtDate,
  avgSkill,
} from '../../utils';
import GrowthPath from '../../components/GrowthPath';
import SkillRadar from '../../components/SkillRadar';
import type { StageId } from '../../types';
import { CheckCircle2, Circle, AlertTriangle, Calendar, TrendingUp, Target } from 'lucide-react';

export default function InternDashboard() {
  const me = useAuth((s) => s.current())!;
  const tasks = useData((s) => s.tasks);
  const skills = useData((s) => s.skills);
  const toggleTask = useData((s) => s.toggleTask);
  const reports = useData((s) => s.reports);

  const myTasks = useMemo(() => tasks.filter((t) => t.internId === me.id), [tasks, me.id]);
  const stage = currentStage(tasks, me.id);
  const overall = getInternProgress(tasks, me.id);
  const skill = skills[me.id];

  const stageProgress = STAGES.reduce(
    (acc, s) => ({ ...acc, [s.id]: getStageProgress(tasks, me.id, s.id) }),
    {} as Record<StageId, number>,
  );

  const today = todayStr();
  const todayTasks = myTasks.filter(
    (t) => !t.done && new Date(t.dueDate) <= new Date(today),
  );
  const stageTasks = myTasks.filter((t) => t.stage === stage);
  const overdueCount = myTasks.filter((t) => isOverdue(t.dueDate, t.done)).length;
  const submittedReports = reports.filter((r) => r.internId === me.id).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">你好，{me.name} 👋</h1>
          <p className="text-sm text-slate-500 mt-1">
            <span className={`badge mr-2 ${POSITION_COLORS[me.position!]}`}>{me.position}</span>
            {me.team} · 入职日期 {me.joinDate} · 当前阶段：
            <b className="text-brand-700">{STAGES.find((s) => s.id === stage)?.name}</b>
          </p>
        </div>
        <div className="text-sm text-slate-500">{fmtDate(today)}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="总体进度" value={`${overall}%`} icon={<TrendingUp size={18} />} tone="blue" />
        <StatCard label="今日待办" value={`${todayTasks.length}`} icon={<Calendar size={18} />} tone="amber" />
        <StatCard label="已交周报" value={`${submittedReports}`} icon={<Target size={18} />} tone="emerald" />
        <StatCard
          label="逾期任务"
          value={`${overdueCount}`}
          icon={<AlertTriangle size={18} />}
          tone={overdueCount > 0 ? 'rose' : 'slate'}
        />
      </div>

      <div className="card">
        <div className="section-title mb-3">成长地图</div>
        <GrowthPath current={stage} stageProgress={stageProgress} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="section-title mb-3">当前阶段任务</div>
          {stageTasks.length === 0 && <div className="text-sm text-slate-500">暂无任务</div>}
          <ul className="space-y-2">
            {stageTasks.map((t) => {
              const overdue = isOverdue(t.dueDate, t.done);
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 group"
                >
                  <button onClick={() => toggleTask(t.id)} className="shrink-0">
                    {t.done ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <Circle size={18} className="text-slate-300 group-hover:text-brand-500" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className={`text-sm ${t.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      截止 {fmtDate(t.dueDate)}
                      {overdue && <span className="ml-2 text-rose-500">· 已逾期</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card">
          <div className="section-title mb-2">技能雷达</div>
          <div className="text-xs text-slate-500 mb-2">
            平均分 <b className="text-brand-700">{avgSkill(skill)}</b> / 100
          </div>
          <SkillRadar score={skill} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
}) {
  const map: Record<string, string> = {
    blue: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
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
