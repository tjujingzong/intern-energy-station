import { useState } from 'react';
import { useAuth } from '../../store/authStore';
import { useData } from '../../store/dataStore';
import { INTERNS } from '../../data/users';
import { STAGES } from '../../constants';
import { Send, BookOpen } from 'lucide-react';
import type { StageId, Task } from '../../types';
import { todayStr } from '../../utils';

// 标准化带教 SOP（按阶段）
const SOP: Record<StageId, { title: string; tasks: string[] }[]> = {
  onboard: [
    {
      title: '第 1 天：欢迎与认识',
      tasks: ['团队介绍 30min', '账号系统申请', '工位安排与设备调试'],
    },
    {
      title: '第 1 周：制度熟悉',
      tasks: ['阅读员工手册', '完成入职测验', '加入团队周会并自我介绍'],
    },
  ],
  business: [
    {
      title: '业务熟悉模板',
      tasks: ['梳理业务关系图（导师讲解 1h）', '阅读 3 份核心文档并产出读后感', '1on1 对齐下阶段目标'],
    },
  ],
  output: [
    {
      title: '产出辅导模板',
      tasks: ['分配 1 个小型需求', 'CR 反馈 + 修复 + 再 CR', '撰写技术 / 业务文档'],
    },
  ],
  graduation: [
    {
      title: '答辩冲刺模板',
      tasks: ['梳理实习成果时间线', '准备答辩 PPT 大纲', '答辩演练 1 次（同组评分）'],
    },
  ],
};

export default function Templates() {
  const me = useAuth((s) => s.current())!;
  const addTasksBatch = useData((s) => s.addTasksBatch);
  const mine = INTERNS.filter((i) => i.mentorId === me.id);

  const [stage, setStage] = useState<StageId>('business');
  const [internId, setInternId] = useState(mine[0]?.id || '');
  const [picked, setPicked] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  const togglePick = (t: string) => {
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  };

  const dispatch = () => {
    if (!internId || picked.length === 0) return;
    const newTasks: Task[] = picked.map((title, i) => ({
      id: `${internId}-custom-${Date.now()}-${i}`,
      internId,
      stage,
      title,
      dueDate: todayStr(),
      done: false,
      fromMentor: me.id,
      createdAt: todayStr(),
    }));
    addTasksBatch(newTasks);
    setToast(`已下发 ${newTasks.length} 项任务给 ${INTERNS.find((i) => i.id === internId)?.name}`);
    setPicked([]);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">标准化带教 SOP</h1>
        <p className="text-sm text-slate-500 mt-1">
          沉淀团队的最佳实践，避免「凭经验带教」；勾选模板任务可一键下发到实习生的成长地图。
        </p>
      </div>

      <div className="card flex flex-wrap items-end gap-3">
        <div>
          <label className="label">阶段</label>
          <select className="input" value={stage} onChange={(e) => setStage(e.target.value as StageId)}>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.weekRange}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">下发给</label>
          <select className="input" value={internId} onChange={(e) => setInternId(e.target.value)}>
            {mine.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}（{i.position}）
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary" disabled={picked.length === 0} onClick={dispatch}>
          <Send size={14} /> 下发 {picked.length || ''} 项
        </button>
        {toast && <div className="text-emerald-600 text-sm">{toast}</div>}
      </div>

      <div className="space-y-4">
        {SOP[stage].map((sec, sIdx) => (
          <div key={sIdx} className="card">
            <div className="section-title mb-3">
              <BookOpen size={16} className="text-brand-600" /> {sec.title}
            </div>
            <ul className="space-y-2">
              {sec.tasks.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => togglePick(t)}
                >
                  <input
                    type="checkbox"
                    className="accent-brand-600"
                    checked={picked.includes(t)}
                    onChange={() => togglePick(t)}
                  />
                  <div className="text-sm text-slate-700">{t}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
