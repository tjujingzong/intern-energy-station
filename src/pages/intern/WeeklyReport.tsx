import { useMemo, useState } from 'react';
import { useAuth } from '../../store/authStore';
import { useData } from '../../store/dataStore';
import { chat, hasKey } from '../../api/deepseek';
import { Sparkles, Send, FileText, Loader2, Save } from 'lucide-react';
import { curWeekLabel, fmtDate, todayStr } from '../../utils';
import type { WeeklyReport } from '../../types';

export default function WeeklyReportPage() {
  const me = useAuth((s) => s.current())!;
  const reports = useData((s) => s.reports);
  const submitReport = useData((s) => s.submitReport);

  const myReports = useMemo(
    () => reports.filter((r) => r.internId === me.id).sort((a, b) => b.weekNo - a.weekNo),
    [reports, me.id],
  );

  const [points, setPoints] = useState('本周完成需求 X、读了核心模块文档、参加了一次评审');
  const [achievements, setAchievements] = useState('');
  const [problems, setProblems] = useState('');
  const [nextWeek, setNextWeek] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const reply = await chat([
        {
          role: 'system',
          content: `你是一个负责帮助新人撰写实习周报的助手。请基于用户提供的本周关键事件要点，输出结构化的周报，必须包含三个段落：【本周成果】【遇到的问题】【下周计划】。每段都以列表形式列出 2-3 条。语气专业、积极、具体。岗位：${me.position}。`,
        },
        { role: 'user', content: `请帮我生成实习周报。关键事件：\n${points}` },
      ]);
      // 解析三段
      const ach = pick(reply, /(本周成果|本周做了|主要成果)[\s\S]*?(?=遇到的问题|下周计划|$)/);
      const pro = pick(reply, /(遇到的问题|存在的问题|问题与挑战)[\s\S]*?(?=下周计划|$)/);
      const nxt = pick(reply, /(下周计划|下阶段计划|下周安排)[\s\S]*?$/);
      setAchievements(strip(ach) || reply);
      setProblems(strip(pro));
      setNextWeek(strip(nxt));
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!achievements.trim()) {
      alert('请先生成或填写「本周成果」');
      return;
    }
    const weekLabel = curWeekLabel();
    const r: WeeklyReport = {
      id: `${me.id}-${weekLabel}`,
      internId: me.id,
      weekNo: myReports.length + 1,
      weekLabel,
      achievements,
      problems,
      nextWeek,
      submittedAt: todayStr(),
    };
    submitReport(r);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">AI 周报助手</h1>
        <p className="text-sm text-slate-500 mt-1">
          只需写下本周做了什么，AI 会帮你输出结构化的周报；你可以编辑后一键提交给导师。
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <div className="section-title">
            <Sparkles size={16} className="text-brand-600" /> 第一步：输入本周关键要点
            {!hasKey() && (
              <span className="badge bg-amber-100 text-amber-700 ml-2">本地模拟</span>
            )}
          </div>
          <textarea
            className="input min-h-[120px]"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="例如：完成订单中心列表页前端实现、参加了一次需求评审、阅读了 3 份业务文档…"
          />
          <button className="btn-primary" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {loading ? '生成中…' : 'AI 生成周报'}
          </button>

          <div className="section-title pt-2">
            <FileText size={16} className="text-brand-600" /> 第二步：检查与编辑
          </div>
          <Field label="本周成果" value={achievements} onChange={setAchievements} />
          <Field label="遇到的问题" value={problems} onChange={setProblems} />
          <Field label="下周计划" value={nextWeek} onChange={setNextWeek} />

          <button className="btn-primary" onClick={save}>
            <Send size={14} /> 提交给导师
          </button>
          {saved && (
            <div className="text-emerald-600 text-xs">
              <Save size={12} className="inline mr-1" /> 已保存，导师将在「反馈助手」中看到。
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title mb-3">历史周报</div>
          {myReports.length === 0 && <div className="text-sm text-slate-500">暂无历史周报</div>}
          <div className="space-y-3 max-h-[640px] overflow-auto pr-1">
            {myReports.map((r) => (
              <div key={r.id} className="border border-slate-100 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-800 text-sm">
                    {r.weekLabel} · 第 {r.weekNo} 周
                  </div>
                  <div className="text-[11px] text-slate-400">提交于 {fmtDate(r.submittedAt)}</div>
                </div>
                <Block label="本周成果" content={r.achievements} />
                <Block label="问题" content={r.problems} />
                <Block label="下周" content={r.nextWeek} />
                {r.feedback && (
                  <div className="mt-2 px-3 py-2 bg-brand-50/60 border border-brand-100 rounded-lg text-xs text-slate-700">
                    <div className="font-medium text-brand-700 mb-1">导师反馈</div>
                    <div className="whitespace-pre-wrap">{r.feedback}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea
        className="input min-h-[80px] whitespace-pre-wrap"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Block({ label, content }: { label: string; content?: string }) {
  if (!content) return null;
  return (
    <div className="mt-2 text-xs">
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{content}</div>
    </div>
  );
}

function pick(s: string, re: RegExp): string {
  const m = s.match(re);
  return m ? m[0] : '';
}
function strip(s: string) {
  return s.replace(/^(本周成果|遇到的问题|下周计划)[：:\s]*/g, '').trim();
}
