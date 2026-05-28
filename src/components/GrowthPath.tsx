import { STAGES } from '../constants';
import type { StageId } from '../types';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface GrowthPathProps {
  current: StageId;
  stageProgress: Record<StageId, number>;
}

export default function GrowthPath({ current, stageProgress }: GrowthPathProps) {
  const currentIdx = STAGES.findIndex((s) => s.id === current);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {STAGES.map((s, i) => {
        const status = i < currentIdx ? 'done' : i === currentIdx ? 'doing' : 'todo';
        const progress = stageProgress[s.id] ?? 0;
        return (
          <div
            key={s.id}
            className={`relative rounded-xl border p-4 transition ${
              status === 'doing'
                ? 'border-brand-300 bg-brand-50/60'
                : status === 'done'
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {status === 'done' ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : status === 'doing' ? (
                <Loader2 size={18} className="text-brand-600 animate-spin" />
              ) : (
                <Circle size={18} className="text-slate-400" />
              )}
              <span className="text-xs text-slate-500">{s.weekRange}</span>
            </div>
            <div className="font-medium text-slate-800">{s.name}</div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{s.desc}</div>
            <div className="mt-3 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full ${
                  status === 'done' ? 'bg-emerald-500' : 'bg-brand-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{progress}%</div>
          </div>
        );
      })}
    </div>
  );
}
