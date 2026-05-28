import type { Task, StageId, SkillScore } from './types';
import { STAGES } from './constants';

export function classNames(...arr: (string | false | null | undefined)[]) {
  return arr.filter(Boolean).join(' ');
}

export function todayStr(): string {
  return new Date('2026-05-28').toISOString().slice(0, 10);
}

export function fmtDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('zh-CN');
}

export function isOverdue(dueDate: string, done: boolean): boolean {
  if (done) return false;
  return new Date(dueDate) < new Date(todayStr());
}

// 实习生总体进度
export function getInternProgress(tasks: Task[], internId: string): number {
  const list = tasks.filter((t) => t.internId === internId);
  if (!list.length) return 0;
  const done = list.filter((t) => t.done).length;
  return Math.round((done / list.length) * 100);
}

// 当前阶段进度
export function getStageProgress(tasks: Task[], internId: string, stage: StageId): number {
  const list = tasks.filter((t) => t.internId === internId && t.stage === stage);
  if (!list.length) return 0;
  const done = list.filter((t) => t.done).length;
  return Math.round((done / list.length) * 100);
}

// 当前阶段
export function currentStage(tasks: Task[], internId: string): StageId {
  for (const s of STAGES) {
    const list = tasks.filter((t) => t.internId === internId && t.stage === s.id);
    if (list.length === 0) continue;
    const undone = list.some((t) => !t.done);
    if (undone) return s.id;
  }
  return 'graduation';
}

// 平均技能分
export function avgSkill(score: SkillScore): number {
  const vals = Object.values(score);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// 雷达图数据格式
export function toRadarData(score: SkillScore, dims: { key: keyof SkillScore; label: string }[]) {
  return dims.map((d) => ({ subject: d.label, value: score[d.key], full: 100 }));
}

// 周编号
export function curWeekLabel(): string {
  // 写死接近 join date，便于 mock
  return '2026-W22';
}
