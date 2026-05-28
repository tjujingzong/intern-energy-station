import { useMemo, useState } from 'react';
import { INTERNS, MENTORS } from '../../data/users';
import { useData } from '../../store/dataStore';
import { STAGES, POSITION_COLORS } from '../../constants';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { getInternProgress, currentStage, avgSkill, isOverdue } from '../../utils';
import type { Position, StageId } from '../../types';
import { Users, AlertTriangle, FileText, TrendingUp } from 'lucide-react';

const POSITION_COLOR_HEX: Record<string, string> = {
  研发: '#3b82f6',
  产品: '#a855f7',
  销售: '#f59e0b',
};

export default function HROverview() {
  const tasks = useData((s) => s.tasks);
  const reports = useData((s) => s.reports);
  const skills = useData((s) => s.skills);

  const [filterPos, setFilterPos] = useState<'all' | Position>('all');
  const [filterStage, setFilterStage] = useState<'all' | StageId>('all');

  const filtered = useMemo(
    () =>
      INTERNS.filter((i) => (filterPos === 'all' ? true : i.position === filterPos)).filter((i) => {
        if (filterStage === 'all') return true;
        return currentStage(tasks, i.id) === filterStage;
      }),
    [filterPos, filterStage, tasks],
  );

  // 分布
  const posDist = (['研发', '产品', '销售'] as Position[]).map((p) => ({
    name: p,
    value: INTERNS.filter((i) => i.position === p).length,
  }));
  // 阶段分布
  const stageDist = STAGES.map((s) => ({
    name: s.name,
    人数: INTERNS.filter((i) => currentStage(tasks, i.id) === s.id).length,
  }));

  const total = INTERNS.length;
  const overdueCount = INTERNS.filter((i) =>
    tasks.some((t) => t.internId === i.id && isOverdue(t.dueDate, t.done)),
  ).length;
  const missingWeekly = INTERNS.filter(
    (i) => !reports.some((r) => r.internId === i.id && r.weekLabel === '2026-W22'),
  ).length;
  const avgProg = Math.round(INTERNS.reduce((s, i) => s + getInternProgress(tasks, i.id), 0) / total);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">HR 全景看板</h1>
        <p className="text-sm text-slate-500 mt-1">20 名实习生分布、进度与风险一图掌握。</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="实习生总数" value={`${total}`} icon={<Users size={18} />} tone="blue" />
        <Stat label="平均进度" value={`${avgProg}%`} icon={<TrendingUp size={18} />} tone="emerald" />
        <Stat label="本周缺交周报" value={`${missingWeekly}`} icon={<FileText size={18} />} tone="amber" />
        <Stat label="有逾期任务" value={`${overdueCount}`} icon={<AlertTriangle size={18} />} tone="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="section-title mb-2">岗位分布</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={posDist} dataKey="value" nameKey="name" outerRadius={80} label>
                {posDist.map((p) => (
                  <Cell key={p.name} fill={POSITION_COLOR_HEX[p.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card lg:col-span-2">
          <div className="section-title mb-2">阶段分布</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageDist}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="人数" fill="#1f59f5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="section-title">实习生进度热力</div>
          <div className="flex items-center gap-2 text-xs">
            <select className="input py-1.5 text-xs" value={filterPos} onChange={(e) => setFilterPos(e.target.value as any)}>
              <option value="all">全部岗位</option>
              <option value="研发">研发</option>
              <option value="产品">产品</option>
              <option value="销售">销售</option>
            </select>
            <select className="input py-1.5 text-xs" value={filterStage} onChange={(e) => setFilterStage(e.target.value as any)}>
              <option value="all">全部阶段</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {filtered.map((i) => {
            const p = getInternProgress(tasks, i.id);
            const overdue = tasks.some((t) => t.internId === i.id && isOverdue(t.dueDate, t.done));
            const missing = !reports.some((r) => r.internId === i.id && r.weekLabel === '2026-W22');
            const stage = currentStage(tasks, i.id);
            const mentor = MENTORS.find((m) => m.id === i.mentorId);
            const bg = progressBg(p);
            return (
              <div
                key={i.id}
                className={`rounded-xl p-3 border ${bg.border} ${bg.bg} relative`}
                title={`${i.name} · ${mentor?.name}`}
              >
                <div className="text-2xl">{i.avatar}</div>
                <div className="text-sm font-medium mt-1">{i.name}</div>
                <div className="text-[11px] text-slate-500">
                  <span className={`badge ${POSITION_COLORS[i.position!]} mr-1`}>{i.position}</span>
                  {STAGES.find((s) => s.id === stage)?.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">导师：{mentor?.name}</div>
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
                    <div className="h-full bg-brand-600" style={{ width: `${p}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{p}%</div>
                </div>
                <div className="absolute top-2 right-2 flex flex-col items-end gap-0.5">
                  {overdue && <span className="badge bg-rose-100 text-rose-700 text-[10px]">逾期</span>}
                  {missing && <span className="badge bg-amber-100 text-amber-700 text-[10px]">未交</span>}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  技能 {avgSkill(skills[i.id])}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function progressBg(p: number) {
  if (p >= 75) return { bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (p >= 50) return { bg: 'bg-brand-50', border: 'border-brand-200' };
  if (p >= 30) return { bg: 'bg-amber-50', border: 'border-amber-200' };
  return { bg: 'bg-rose-50', border: 'border-rose-200' };
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
