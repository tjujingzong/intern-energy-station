import { useMemo } from 'react';
import { INTERNS, MENTORS } from '../../data/users';
import { useData } from '../../store/dataStore';
import { avgSkill, isOverdue, getInternProgress, currentStage } from '../../utils';
import { POSITION_COLORS, STAGES } from '../../constants';
import { AlertTriangle, FileWarning, Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Risk = {
  intern: typeof INTERNS[number];
  reasons: string[];
  severity: 'high' | 'mid' | 'low';
};

export default function RiskAlerts() {
  const tasks = useData((s) => s.tasks);
  const reports = useData((s) => s.reports);
  const skills = useData((s) => s.skills);

  const risks: Risk[] = useMemo(() => {
    return INTERNS.map((i) => {
      const reasons: string[] = [];
      const overdueCount = tasks.filter((t) => t.internId === i.id && isOverdue(t.dueDate, t.done)).length;
      if (overdueCount > 0) reasons.push(`${overdueCount} 项任务已逾期`);

      const missing = !reports.some((r) => r.internId === i.id && r.weekLabel === '2026-W22');
      if (missing) reasons.push('本周周报未提交');

      const progress = getInternProgress(tasks, i.id);
      if (progress < 30) reasons.push(`整体进度仅 ${progress}%`);

      const avg = avgSkill(skills[i.id]);
      if (avg < 60) reasons.push(`技能均分偏低（${avg} 分）`);

      const lastReport = reports
        .filter((r) => r.internId === i.id)
        .sort((a, b) => b.weekNo - a.weekNo)[0];
      if (lastReport && !lastReport.feedback) {
        reasons.push('近一次周报未获得导师反馈');
      }

      const severity: Risk['severity'] = reasons.length >= 3 ? 'high' : reasons.length === 2 ? 'mid' : 'low';
      return { intern: i, reasons, severity };
    }).filter((r) => r.reasons.length > 0);
  }, [tasks, reports, skills]);

  const high = risks.filter((r) => r.severity === 'high');
  const mid = risks.filter((r) => r.severity === 'mid');
  const low = risks.filter((r) => r.severity === 'low');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">风险预警</h1>
        <p className="text-sm text-slate-500 mt-1">
          自动识别周报缺交、任务逾期、进度滞后、技能偏低、反馈空缺等风险，按严重程度排序。
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="高风险" value={`${high.length}`} tone="rose" />
        <Stat label="中风险" value={`${mid.length}`} tone="amber" />
        <Stat label="低风险" value={`${low.length}`} tone="emerald" />
      </div>

      {[
        { title: '高风险（≥3 个信号）', list: high, icon: <AlertTriangle size={16} />, tone: 'text-rose-600' },
        { title: '中风险（2 个信号）', list: mid, icon: <FileWarning size={16} />, tone: 'text-amber-600' },
        { title: '低风险（1 个信号）', list: low, icon: <Activity size={16} />, tone: 'text-emerald-600' },
      ].map((g) => (
        <div className="card" key={g.title}>
          <div className={`section-title mb-3 ${g.tone}`}>
            {g.icon} {g.title}
          </div>
          {g.list.length === 0 && <div className="text-sm text-slate-400">暂无</div>}
          <ul className="space-y-2">
            {g.list.map((r) => {
              const mentor = MENTORS.find((m) => m.id === r.intern.mentorId);
              const stageName = STAGES.find((s) => s.id === currentStage(tasks, r.intern.id))?.name;
              return (
                <li
                  key={r.intern.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.intern.avatar}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-800">
                        {r.intern.name}{' '}
                        <span className={`badge ml-1 ${POSITION_COLORS[r.intern.position!]}`}>
                          {r.intern.position}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {stageName} · 导师 {mentor?.name}
                      </div>
                      <div className="text-xs text-rose-600 mt-1">{r.reasons.join(' · ')}</div>
                    </div>
                  </div>
                  <Link
                    to="/hr/report"
                    className="text-xs text-brand-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    生成跟进建议 <ChevronRight size={12} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'rose' | 'amber' | 'emerald' }) {
  const map: Record<string, string> = {
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <div className={`card flex items-center justify-between ${map[tone]}`}>
      <div className="text-sm">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
