import type { Stage, StageId, SkillScore } from './types';

// 4 阶段成长路径（4 周左右）
export const STAGES: Stage[] = [
  {
    id: 'onboard',
    name: '入职准备',
    desc: '熟悉公司文化、团队成员、基础工具与制度',
    weekRange: '第 1 周',
  },
  {
    id: 'business',
    name: '业务熟悉',
    desc: '了解业务模型、产品线、岗位职责与协作流程',
    weekRange: '第 2 周',
  },
  {
    id: 'output',
    name: '独立产出',
    desc: '在导师指导下承担任务，独立交付小型项目',
    weekRange: '第 3-4 周',
  },
  {
    id: 'graduation',
    name: '答辩转正',
    desc: '总结实习成果、答辩展示、转正评估',
    weekRange: '第 5 周',
  },
];

export const STAGE_MAP: Record<StageId, Stage> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<StageId, Stage>,
);

// 5 维技能维度
export const SKILL_DIMS: { key: keyof SkillScore; label: string }[] = [
  { key: 'business', label: '业务理解' },
  { key: 'communication', label: '沟通协作' },
  { key: 'execution', label: '执行力' },
  { key: 'learning', label: '学习力' },
  { key: 'delivery', label: '产出质量' },
];

// 角色名称
export const ROLE_LABELS: Record<string, string> = {
  intern: '实习生',
  mentor: '导师',
  hr: 'HR',
  recruit: '招聘',
};

// 岗位主题色
export const POSITION_COLORS: Record<string, string> = {
  研发: 'bg-blue-100 text-blue-700',
  产品: 'bg-purple-100 text-purple-700',
  销售: 'bg-amber-100 text-amber-700',
};
