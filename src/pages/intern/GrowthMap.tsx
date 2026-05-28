import { useAuth } from '../../store/authStore';
import { useData } from '../../store/dataStore';
import { STAGES } from '../../constants';
import { currentStage, fmtDate, isOverdue } from '../../utils';
import { CheckCircle2, Circle, Flag } from 'lucide-react';

export default function GrowthMap() {
  const me = useAuth((s) => s.current())!;
  const tasks = useData((s) => s.tasks);
  const toggleTask = useData((s) => s.toggleTask);
  const cur = currentStage(tasks, me.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">成长地图</h1>
        <p className="text-sm text-slate-500 mt-1">围绕「入职准备 → 业务熟悉 → 独立产出 → 答辩转正」4 阶段，逐项打卡你的成长。</p>
      </div>

      <div className="relative">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />
        <div className="space-y-5">
          {STAGES.map((s) => {
            const list = tasks.filter((t) => t.internId === me.id && t.stage === s.id);
            const done = list.filter((t) => t.done).length;
            const total = list.length;
            const status: 'done' | 'doing' | 'todo' =
              (STAGES.findIndex((x) => x.id === s.id) <
              STAGES.findIndex((x) => x.id === cur))
                ? 'done'
                : s.id === cur
                  ? 'doing'
                  : 'todo';
            return (
              <div key={s.id} className="relative pl-10">
                <div
                  className={`absolute left-0 top-1 w-7 h-7 rounded-full flex items-center justify-center text-white ${
                    status === 'done' ? 'bg-emerald-500' : status === 'doing' ? 'bg-brand-600' : 'bg-slate-300'
                  }`}
                >
                  <Flag size={14} />
                </div>
                <div className="card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {s.name} <span className="text-xs text-slate-500 ml-1">{s.weekRange}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {done}/{total} 已完成
                    </div>
                  </div>

                  <ul className="mt-3 divide-y divide-slate-100">
                    {list.map((t) => {
                      const overdue = isOverdue(t.dueDate, t.done);
                      return (
                        <li
                          key={t.id}
                          className="flex items-center gap-3 py-2 px-1 group hover:bg-slate-50 rounded"
                        >
                          <button onClick={() => toggleTask(t.id)} className="shrink-0">
                            {t.done ? (
                              <CheckCircle2 size={18} className="text-emerald-600" />
                            ) : (
                              <Circle size={18} className="text-slate-300 group-hover:text-brand-500" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div
                              className={`text-sm ${
                                t.done ? 'line-through text-slate-400' : 'text-slate-700'
                              }`}
                            >
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
