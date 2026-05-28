import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { useData } from '../../store/dataStore';
import { INTERNS } from '../../data/users';
import { STAGES, POSITION_COLORS } from '../../constants';
import {
  getInternProgress,
  currentStage,
  isOverdue,
  avgSkill,
  todayStr,
} from '../../utils';
import { AlertTriangle, ChevronRight, Users, TrendingUp, FileText } from 'lucide-react';

export default function MentorDashboard() {
  const me = useAuth((s) => s.current())!;
  const tasks = useData((s) => s.tasks);
  const reports = useData((s) => s.reports);
  const skills = useData((s) => s.skills);

  const mine = useMemo(() => INTERNS.filter((i) => i.mentorId === me.id), [me.id]);

  const totalOverdue = mine.reduce(
    (sum, i) => sum + tasks.filter((t) => t.internId === i.id && isOverdue(t.dueDate, t.done)).length,
    0,
  );
  const missingThisWeek = mine.filter(
    (i) => !reports.some((r) => r.internId === i.id && r.weekLabel === '2026-W22'),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">导师工作台 · {me.name}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {me.team} · 今日 {todayStr()} · 我带教的实习生共 {mine.length} 人
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="我的实习生" value={`${mine.length}`} icon={<Users size={18} />} tone="blue" />
        <Stat
          label="平均进度"
          value={`${Math.round(mine.reduce((s, i) => s + getInternProgress(tasks, i.id), 0) / Math.max(1, mine.length))}%`}
          icon={<TrendingUp size={18} />}
          tone="emerald"
        />
        <Stat label="本周缺交周报" value={`${missingThisWeek}`} icon={<FileText size={18} />} tone="amber" />
        <Stat label="逾期任务" value={`${totalOverdue}`} icon={<AlertTriangle size={18} />} tone={totalOverdue > 0 ? 'rose' : 'slate'} />
      </div>

      <div className="card">
        <div className="section-title mb-3">我的实习生</div>
        <div className="grid md:grid-cols-2 gap-3">
          {mine.map((i) => {
            const progress = getInternProgress(tasks, i.id);
            const stage = currentStage(tasks, i.id);
            const stageName = STAGES.find((s) => s.id === stage)?.name;
            const overdue = tasks.filter((t) => t.internId === i.id && isOverdue(t.dueDate, t.done)).length;
            const lastWeekly = reports
              .filter((r) => r.internId === i.id)
              .sort((a, b) => b.weekNo - a.weekNo)[0];
            const avg = avgSkill(skills[i.id]);
            return (
              <Link
                key={i.id}
                to={`/mentor/intern/${i.id}`}
                className="block border border-slate-100 rounded-xl p-4 hover:border-brand-300 hover:bg-brand-50/40 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{i.avatar}</span>
                    <div>
                      <div className="font-medium text-slate-800">
                        {i.name}{' '}
                        <span className={`badge ml-1 ${POSITION_COLORS[i.position!]}`}>{i.position}</span>
                      </div>
                      <div className="text-xs text-slate-500">{i.school} · {stageName}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>进度 {progress}%</span>
                    <span>技能均分 {avg}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                  {overdue > 0 && (
                    <span className="badge bg-rose-100 text-rose-700">逾期 {overdue}</span>
                  )}
                  {!lastWeekly && (
                    <span className="badge bg-amber-100 text-amber-700">未交周报</span>
                  )}
                  {lastWeekly && !lastWeekly.feedback && (
                    <span className="badge bg-brand-100 text-brand-700">待批阅</span>
                  )}
                  {overdue === 0 && lastWeekly?.feedback && (
                    <span className="badge bg-emerald-100 text-emerald-700">状态良好</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
}) {
  const map: Record<string, string> = {
    blue: 'bg-brand-50 text-brand-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
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
