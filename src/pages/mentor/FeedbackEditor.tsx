import { useMemo, useState } from 'react';
import { useAuth } from '../../store/authStore';
import { useData } from '../../store/dataStore';
import { INTERNS } from '../../data/users';
import { chat, hasKey } from '../../api/deepseek';
import { Save, Sparkles, Loader2, Copy } from 'lucide-react';
import type { MentorFeedback } from '../../types';
import { todayStr } from '../../utils';

const TEMPLATES = {
  '1on1': '1. 实习生本周高光时刻\n2. 卡点与遇到的问题\n3. 下阶段目标对齐\n4. 我能为你提供什么资源',
  '周反馈': '【优势】\n【待改进】\n【下周关注】',
  '月度评估': '【整体表现】\n【技能维度】\n【价值观契合】\n【转正意向】',
};

export default function FeedbackEditor() {
  const me = useAuth((s) => s.current())!;
  const addFeedback = useData((s) => s.addFeedback);
  const feedbacks = useData((s) => s.feedbacks);
  const mine = useMemo(() => INTERNS.filter((i) => i.mentorId === me.id), [me.id]);

  const [internId, setInternId] = useState(mine[0]?.id || '');
  const [type, setType] = useState<MentorFeedback['type']>('周反馈');
  const [observe, setObserve] = useState('独立交付了订单页前端，CR 一次过；周报内容空洞，需要更多自我反思。');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const intern = INTERNS.find((i) => i.id === internId);
  const myFeedbacks = feedbacks.filter((f) => f.mentorId === me.id).slice(0, 8);

  const generate = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const reply = await chat([
        {
          role: 'system',
          content: `你是负责实习生带教的资深导师，请根据观察点为实习生撰写「${type}」反馈，使用 STAR 结构（Situation / Task / Action / Result），语气专业且包含温度。控制在 250 字以内。`,
        },
        {
          role: 'user',
          content: `实习生：${intern?.name}（${intern?.position}岗）\n观察点：\n${observe}\n参考模板：${TEMPLATES[type]}`,
        },
      ]);
      setDraft(reply);
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!intern || !draft.trim()) return;
    addFeedback({
      id: `fb-${intern.id}-${Date.now()}`,
      internId: intern.id,
      mentorId: me.id,
      type,
      content: draft,
      createdAt: todayStr(),
    });
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">AI 反馈助手</h1>
        <p className="text-sm text-slate-500 mt-1">
          只需写下观察点，AI 会按 STAR 结构帮你产出有温度、有建设性的反馈。
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">实习生</label>
              <select className="input" value={internId} onChange={(e) => setInternId(e.target.value)}>
                {mine.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}（{i.position}）
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">反馈类型</label>
              <select
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value as MentorFeedback['type'])}
              >
                <option value="1on1">1on1 沟通</option>
                <option value="周反馈">周反馈</option>
                <option value="月度评估">月度评估</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">本周观察点（事实记录）</label>
            <textarea
              className="input min-h-[100px]"
              value={observe}
              onChange={(e) => setObserve(e.target.value)}
              placeholder="举例：xx 时间，xx 任务，结果如何，过程中你观察到什么…"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={generate} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
              {loading ? '生成中…' : 'AI 起草反馈'}
            </button>
            {!hasKey() && (
              <span className="text-xs text-amber-600">未配置 Key，将使用本地模拟</span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="label">反馈正文（可编辑）</label>
              {draft && (
                <button
                  className="text-xs text-slate-500 hover:text-brand-600 inline-flex items-center gap-1"
                  onClick={() => navigator.clipboard.writeText(draft)}
                >
                  <Copy size={12} /> 复制
                </button>
              )}
            </div>
            <textarea
              className="input min-h-[180px] whitespace-pre-wrap"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="点击「AI 起草反馈」后将在此显示，并支持编辑。"
            />
          </div>

          <button className="btn-primary" onClick={save} disabled={!draft.trim()}>
            <Save size={14} /> 保存到该实习生档案
          </button>
          {saved && <div className="text-emerald-600 text-xs">已保存到反馈记录。</div>}
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="section-title mb-2">参考模板</div>
            <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded p-3">
{TEMPLATES[type]}
            </pre>
          </div>

          <div className="card">
            <div className="section-title mb-2">我近期的反馈</div>
            <div className="space-y-2 max-h-72 overflow-auto pr-1">
              {myFeedbacks.map((f) => {
                const i = INTERNS.find((x) => x.id === f.internId);
                return (
                  <div key={f.id} className="text-xs border border-slate-100 rounded p-2">
                    <div className="text-slate-500 mb-1">
                      {i?.name} · {f.type} · {f.createdAt}
                    </div>
                    <div className="text-slate-700 whitespace-pre-wrap line-clamp-3">{f.content}</div>
                  </div>
                );
              })}
              {myFeedbacks.length === 0 && <div className="text-xs text-slate-400">暂无</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
