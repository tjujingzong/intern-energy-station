// 全局类型定义
export type Role = 'intern' | 'mentor' | 'hr' | 'recruit';

export type Position = '研发' | '产品' | '销售';

export type StageId = 'onboard' | 'business' | 'output' | 'graduation';

export interface Stage {
  id: StageId;
  name: string;
  desc: string;
  weekRange: string; // 例如 "第 1 周"
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string; // emoji
  position?: Position;
  team?: string;
  mentorId?: string;
  joinDate?: string;
  school?: string;
  stage?: StageId;
}

export interface Task {
  id: string;
  internId: string;
  stage: StageId;
  title: string;
  desc?: string;
  dueDate: string; // YYYY-MM-DD
  done: boolean;
  fromMentor?: string;
  createdAt: string;
}

export interface SkillScore {
  business: number; // 业务理解
  communication: number; // 沟通
  execution: number; // 执行力
  learning: number; // 学习力
  delivery: number; // 产出质量
}

export interface WeeklyReport {
  id: string;
  internId: string;
  weekNo: number; // 第几周
  weekLabel: string; // 例如 "2026-W21"
  achievements: string;
  problems: string;
  nextWeek: string;
  submittedAt: string;
  feedback?: string; // 导师反馈
  feedbackBy?: string;
  feedbackAt?: string;
}

export interface MentorFeedback {
  id: string;
  internId: string;
  mentorId: string;
  type: '1on1' | '周反馈' | '月度评估';
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  ts?: number;
}
