import { useMemo, useState } from 'react';
import { INTERNS, MENTORS } from '../../data/users';
import { useData } from '../../store/dataStore';
import { STAGES } from '../../constants';
import { chat, hasKey } from '../../api/deepseek';
import {
  avgSkill,
  currentStage,
  getInternProgress,
  isOverdue,
} from '../../utils';
import { Sparkles, Loader2, Copy, Check, FileDown } from 'lucide-react';

type Period = 'week' | 'month';

export default function HRReport() {
  const tasks = useData((s) => s.tasks);
  const reports = useData((s) => s.reports);
  const skills = useData((s) => s.skills);
  const feedbacks = useData((s) => s.feedbacks);

  const [period, setPeriod] = useState<Period>('week');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const total = INTERNS.length;
    const avgProg = Math.round(
      INTERNS.reduce((s, i) => s + getInternProgress(tasks, i.id), 0) / total,
    );
    const overdue = INTERNS.filter((i) =>
      tasks.some((t) => t.internId === i.id && isOverdue(t.dueDate, t.done)),
    );
    const missing = INTERNS.filter(
      (i) => !reports.some((r) => r.internId === i.id && r.weekLabel === '2026-W22'),
    );
    const byPos = (['研发', '产品', '销售'] as const).map((p) => {
      const list = INTERNS.filter((i) => i.position === p);
      const prog = Math.round(
        list.reduce((s, i) => s + getInternProgress(tasks, i.id), 0) / list.length,
      );
      const skill = Math.round(
        list.reduce((s, i) => s + avgSkill(skills[i.id]), 0) / list.length,
      );
      return { pos: p, count: list.length, prog, skill };
    });
    const byStage = STAGES.map((s) => ({
      stage: s.name,
      count: INTERNS.filter((i) => currentStage(tasks, i.id) === s.id).length,
    }));
    const top = [...INTERNS]
      .map((i) => ({
        name: i.name,
        position: i.position,
        score: avgSkill(skills[i.id]) + getInternProgress(tasks, i.id) / 2,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    return { total, avgProg, overdue, missing, byPos, byStage, top };
  }, [tasks, reports, skills]);

  const buildSystemPrompt = () =>
    [
      '你是一名资深 HRBP，正在撰写实习生培养项目的阶段性总结报告。',
      '请按「整体概况 / 岗位对比 / 风险预警 / 亮点典型 / 下阶段建议」五个小节撰写，',
      '语言专业、克制、可落地，可以使用要点符号，全文 500 字以内。',
    ].join('');

  const buildUserPrompt = () => {
    const fbCnt = feedbacks.length;
    const body = [
      `统计周期：${period === 'week' ? '本周（W22）' : '本月（2026-05）'}`,
      `实习生总数：${stats.total}；平均进度：${stats.avgProg}%；累计导师反馈 ${fbCnt} 条`,
      `本周缺交周报：${stats.missing.length} 人（${stats.missing.map((i) => i.name).join('、') || '无'}）`,
      `存在逾期任务：${stats.overdue.length} 人`,
      `岗位对比：${stats.byPos
        .map((p) => `${p.pos} ${p.count} 人 / 进度 ${p.prog}% / 技能 ${p.skill}`)
        .join('；')}`,
      `阶段分布：${stats.byStage.map((s) => `${s.stage} ${s.count} 人`).join('；')}`,
      `Top3 表现：${stats.top.map((t) => `${t.name}(${t.position})`).join('、')}`,
    ];
    return `请基于以下数据生成${period === 'week' ? '本周' : '本月'}总结报告：\n\n${body.join('\n')}`;
  };

  const generate = async () => {
    setLoading(true);
    setContent('');
    try {
      const reply = await chat([
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt() },
      ]);
      setContent(reply);
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `实习生${period === 'week' ? '周报' : '月报'}_2026.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">AI 批次报告</h1>
        <p className="text-sm text-slate-500 mt-1">
          一键基于全员数据生成结构化总结，发送给业务老板或写入培养复盘。
        </p>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">报告周期：</span>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              {([
                ['week', '本周'],
                ['month', '本月'],
              ] as const).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setPeriod(k)}
                  className={`px-3 py-1 text-sm rounded ${
                    period === k ? 'bg-white shadow text-brand-700 font-medium' : 'text-slate-500'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            {!hasKey() && (
              <span className="badge bg-amber-100 text-amber-700">本地模拟</span>
            )}
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary">
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {loading ? '生成中…' : '一键生成报告'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="section-title">输入快照</div>
            <pre className="text-xs whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-100 leading-relaxed text-slate-600 max-h-[420px] overflow-auto">
{buildUserPrompt()}
            </pre>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="section-title">AI 报告</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onCopy}
                  disabled={!content}
                  className="btn-ghost text-xs disabled:opacity-40"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? '已复制' : '复制'}
                </button>
                <button
                  onClick={onDownload}
                  disabled={!content}
                  className="btn-ghost text-xs disabled:opacity-40"
                >
                  <FileDown size={14} />
                  下载 .md
                </button>
              </div>
            </div>
            <div className="min-h-[420px] max-h-[600px] overflow-auto bg-white rounded-lg border border-slate-100 p-4 text-sm whitespace-pre-wrap leading-relaxed text-slate-700">
              {content ||
                (loading ? '正在生成报告…' : '点击右上角「一键生成报告」试试，AI 将基于左侧快照产出结构化总结。')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="岗位对比">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="text-left py-1">岗位</th>
                <th>人数</th>
                <th>进度</th>
                <th>技能</th>
              </tr>
            </thead>
            <tbody>
              {stats.byPos.map((p) => (
                <tr key={p.pos} className="border-t border-slate-100">
                  <td className="py-1.5">{p.pos}</td>
                  <td className="text-center">{p.count}</td>
                  <td className="text-center">{p.prog}%</td>
                  <td className="text-center">{p.skill}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Top3 表现">
          <ul className="text-sm space-y-2">
            {stats.top.map((t, i) => (
              <li key={t.name} className="flex items-center justify-between">
                <span>
                  <span className="mr-2 text-amber-500 font-semibold">#{i + 1}</span>
                  {t.name} <span className="text-xs text-slate-400">·{t.position}</span>
                </span>
                <span className="badge bg-emerald-50 text-emerald-700">
                  {Math.round(t.score)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="导师覆盖">
          <ul className="text-sm space-y-2">
            {MENTORS.map((m) => {
              const n = INTERNS.filter((i) => i.mentorId === m.id).length;
              return (
                <li key={m.id} className="flex items-center justify-between">
                  <span>
                    {m.avatar} {m.name}{' '}
                    <span className="text-xs text-slate-400">·{m.team}</span>
                  </span>
                  <span className="badge bg-slate-100 text-slate-600">{n} 人</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="section-title mb-3">{title}</div>
      {children}
    </div>
  );
}
