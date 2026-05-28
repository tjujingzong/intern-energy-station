import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, WeeklyReport, MentorFeedback, SkillScore, ChatMessage } from '../types';
import { TASKS, WEEKLY_REPORTS, MENTOR_FEEDBACKS } from '../data/seed';
import { SKILLS } from '../data/users';

interface DataState {
  tasks: Task[];
  reports: WeeklyReport[];
  feedbacks: MentorFeedback[];
  skills: Record<string, SkillScore>;
  chatHistory: Record<string, ChatMessage[]>; // key: internId
  ready: boolean;

  // ops
  toggleTask: (taskId: string) => void;
  addTask: (task: Task) => void;
  addTasksBatch: (tasks: Task[]) => void;
  submitReport: (r: WeeklyReport) => void;
  addFeedback: (fb: MentorFeedback) => void;
  setReportFeedback: (reportId: string, feedback: string, by: string) => void;
  updateSkill: (internId: string, score: SkillScore) => void;
  appendChat: (key: string, msgs: ChatMessage[]) => void;
  clearChat: (key: string) => void;
  resetAll: () => void;
}

const initial = {
  tasks: TASKS,
  reports: WEEKLY_REPORTS,
  feedbacks: MENTOR_FEEDBACKS,
  skills: SKILLS,
  chatHistory: {} as Record<string, ChatMessage[]>,
  ready: true,
};

export const useData = create<DataState>()(
  persist(
    (set) => ({
      ...initial,
      toggleTask: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
        })),
      addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
      addTasksBatch: (tasks) => set((s) => ({ tasks: [...tasks, ...s.tasks] })),
      submitReport: (r) =>
        set((s) => {
          const exists = s.reports.find((x) => x.id === r.id);
          if (exists) {
            return { reports: s.reports.map((x) => (x.id === r.id ? r : x)) };
          }
          return { reports: [r, ...s.reports] };
        }),
      addFeedback: (fb) => set((s) => ({ feedbacks: [fb, ...s.feedbacks] })),
      setReportFeedback: (reportId, feedback, by) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === reportId
              ? { ...r, feedback, feedbackBy: by, feedbackAt: new Date().toISOString().slice(0, 10) }
              : r,
          ),
        })),
      updateSkill: (internId, score) =>
        set((s) => ({ skills: { ...s.skills, [internId]: score } })),
      appendChat: (key, msgs) =>
        set((s) => ({
          chatHistory: { ...s.chatHistory, [key]: [...(s.chatHistory[key] || []), ...msgs] },
        })),
      clearChat: (key) =>
        set((s) => {
          const next = { ...s.chatHistory };
          delete next[key];
          return { chatHistory: next };
        }),
      resetAll: () => set({ ...initial }),
    }),
    { name: 'ies_data' },
  ),
);
