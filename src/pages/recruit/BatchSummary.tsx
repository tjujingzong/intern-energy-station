import { useMemo, useState } from 'react';
import { INTERNS, MENTORS } from '../../data/users';
import { useData } from '../../store/dataStore';
import { POSITION_COLORS, STAGES } from '../../constants';
import {
  avgSkill,
  currentStage,
  getInternProgress,
} from '../../utils';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import type { Position } from '../../types';
import { TrendingUp, Users, Star, MessageSquare } from 'lucide-react';

const WEEK_LABELS = ['W19', 'W20', 'W21', 'W22'];

export default function BatchSummary() {
  const tasks = useData((s) => s.tasks);
  const skills = useData((s) => s.skills);
  const reports = useData((s) => s.reports);
  const feedbacks = useData((s) => s.feedbacks);

  const [hoverIntern, setHoverIntern] = useState<string>('');

  // 趋势数据：每周 = 当前数据 * 进度因子，模拟过去 3 周的累计成长
  const trend = useMemo(() => {
    const finalProg = Math.round(
      INTERNS.reduce((s, i) => s + getInternProgress(tasks, i.id), 0) / INTERNS.length,
    );
    const finalSk = Math.round(
      INTERNS.reduce((s, i) => s + avgSkill(skills[i.id]), 0) / INTERNS.length,
    );
    const factors = [0.25, 0.55, 0.8, 1];
    return WEEK_LABELS.map((w, i) => ({
      周次: w,
      平均进度: Math.round(finalProg * factors[i]),
      平均技能: Math.round(finalSk * factors[i] * 0.85 + 10),
      累计反馈: Math.round(feedbacks.length * factors[i]),
    }));
  }, [tasks, skills, feedbacks]);

  // 岗位横向对比
  const byPos = (['研发', '产品', '销售'] as Position[]).map((p) => {
    const list = INTERNS.filter((i) => i.position === p);
    const prog = Math.round(
      list.reduce((s, i) => s + getInternProgress(tasks, i.id), 0) / list.length,
    );
    const sk = Math.round(list.reduce((s, i) => s + avgSkill(skills[i.id]), 0) / list.length);
    return { 岗位: p, 进度: prog, 技能: sk, 人数: list.length };
  });

  // 阶段分布
  const byStage = STAGES.map((s) => ({
    name: s.name,
    人数: INTERNS.filter((i) => currentStage(tasks, i.id) === s.id).length,
  }));

  // 学校来源
  const schoolDist = useMemo(() => {
    const map: Record<string, number> = {};
    INTERNS.forEach((i) => {
      const k = i.school || '未知';
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map)
      .map(([school, count]) => ({ school, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // KPI
  const totalReports = reports.length;
  const totalFeedbacks = feedbacks.length;
  const avgProg = trend[trend.length - 1].平均进度;
  const avgSk = trend[trend.length - 1].平均技能;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">批次趋势</h1>
        <p className="text-sm text-slate-500 mt-1">
          2026 春季校招实习批次（共 {INTERNS.length} 人）整体表现趋势。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="平均进度" value={`${avgProg}%`} icon={<TrendingUp size={18} />} tone="blue" />
        <Stat label="平均技能分" value={`${avgSk}`} icon={<Star size={18} />} tone="emerald" />
        <Stat label="累计周报" value={`${totalReports}`} icon={<Users size={18} />} tone="amber" />
        <Stat label="累计反馈" value={`${totalFeedbacks}`} icon={<MessageSquare size={18} />} tone="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="section-title mb-2">四周成长趋势</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="周次" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="平均进度" stroke="#1f59f5" strokeWidth={2} />
              <Line type="monotone" dataKey="平均技能" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="累计反馈" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-title mb-2">岗位横向对比</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byPos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="岗位" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="进度" fill="#1f59f5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="技能" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="section-title mb-3">阶段分布</div>
          <div className="space-y-2">
            {byStage.map((s) => (
              <div key={s.name} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">{s.name}</span>
                  <span className="text-slate-500">{s.人数} 人</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-brand-600"
                    style={{ width: `${(s.人数 / INTERNS.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title mb-3">学校来源 Top</div>
          <div className="space-y-1.5 max-h-[220px] overflow-auto">
            {schoolDist.map((s) => (
              <div key={s.school} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{s.school}</span>
                <span className="badge bg-slate-100 text-slate-600">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title mb-3">导师覆盖</div>
          <div className="space-y-2 text-sm">
            {MENTORS.map((m) => {
              const list = INTERNS.filter((i) => i.mentorId === m.id);
              const prog =
                list.length > 0
                  ? Math.round(
                      list.reduce((s, i) => s + getInternProgress(tasks, i.id), 0) / list.length,
                    )
                  : 0;
              return (
                <div key={m.id} className="flex items-center justify-between">
                  <span>
                    {m.avatar} {m.name}
                    <span className="text-xs text-slate-400 ml-1">·{m.team}</span>
                  </span>
                  <span className="badge bg-emerald-50 text-emerald-700">{prog}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title mb-3">全员一图掌握（鼠标悬停查看）</div>
        <div className="flex flex-wrap gap-1.5">
          {INTERNS.map((i) => {
            const p = getInternProgress(tasks, i.id);
            const tone =
              p >= 75
                ? 'bg-emerald-500'
                : p >= 50
                ? 'bg-brand-600'
                : p >= 30
                ? 'bg-amber-500'
                : 'bg-rose-500';
            return (
              <div
                key={i.id}
                onMouseEnter={() => setHoverIntern(i.id)}
                onMouseLeave={() => setHoverIntern('')}
                className={`w-6 h-6 rounded ${tone} cursor-pointer transition hover:scale-125`}
                title={`${i.name} · ${i.position} · ${p}%`}
              />
            );
          })}
        </div>
        {hoverIntern && (
          <div className="mt-3 text-sm text-slate-600">
            {(() => {
              const i = INTERNS.find((x) => x.id === hoverIntern)!;
              return (
                <>
                  <span className="font-medium text-slate-800">{i.avatar} {i.name}</span>
                  <span className={`badge ml-2 ${POSITION_COLORS[i.position!]}`}>{i.position}</span>
                  <span className="ml-2">{i.school}</span>
                  <span className="ml-2">进度 {getInternProgress(tasks, i.id)}%</span>
                  <span className="ml-2">技能 {avgSkill(skills[i.id])}</span>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
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
