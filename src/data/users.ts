import type { User, SkillScore, Position, StageId } from '../types';

// 5 名导师（每位带 4 名实习生）
export const MENTORS: User[] = [
  { id: 'mentor01', name: '陈思远', role: 'mentor', avatar: '🧑‍💻', team: '研发一组', position: '研发' },
  { id: 'mentor02', name: '林婉清', role: 'mentor', avatar: '👩‍💻', team: '研发二组', position: '研发' },
  { id: 'mentor03', name: '王浩然', role: 'mentor', avatar: '🧑‍🏫', team: '产品中心', position: '产品' },
  { id: 'mentor04', name: '赵雨桐', role: 'mentor', avatar: '👩‍🏫', team: '销售北区', position: '销售' },
  { id: 'mentor05', name: '李文博', role: 'mentor', avatar: '🧑‍🎓', team: '销售南区', position: '销售' },
];

// HR（同时负责招聘协同）
export const STAFF: User[] = [
  { id: 'hr01', name: '苏晓彤', role: 'hr', avatar: '🧑‍💼', team: '人力资源部' },
];

// 20 名实习生分布：研发 8 + 产品 6 + 销售 6
const INTERN_BASE: { name: string; position: Position; school: string; stage: StageId; mentor: string }[] = [
  { name: '张子轩', position: '研发', school: '清华大学', stage: 'output', mentor: 'mentor01' },
  { name: '李梓萱', position: '研发', school: '北京大学', stage: 'output', mentor: 'mentor01' },
  { name: '王俊宇', position: '研发', school: '浙江大学', stage: 'business', mentor: 'mentor01' },
  { name: '刘语桐', position: '研发', school: '上海交大', stage: 'output', mentor: 'mentor01' },
  { name: '陈睿哲', position: '研发', school: '复旦大学', stage: 'graduation', mentor: 'mentor02' },
  { name: '杨梓涵', position: '研发', school: '南京大学', stage: 'output', mentor: 'mentor02' },
  { name: '吴鹏飞', position: '研发', school: '华中科大', stage: 'business', mentor: 'mentor02' },
  { name: '徐婧怡', position: '研发', school: '同济大学', stage: 'onboard', mentor: 'mentor02' },
  { name: '孙浩然', position: '产品', school: '中国人大', stage: 'output', mentor: 'mentor03' },
  { name: '朱欣怡', position: '产品', school: '北京师大', stage: 'output', mentor: 'mentor03' },
  { name: '黄思琪', position: '产品', school: '中山大学', stage: 'business', mentor: 'mentor03' },
  { name: '高博文', position: '产品', school: '武汉大学', stage: 'graduation', mentor: 'mentor03' },
  { name: '马紫宁', position: '产品', school: '厦门大学', stage: 'business', mentor: 'mentor04' },
  { name: '何沐辰', position: '产品', school: '中山大学', stage: 'output', mentor: 'mentor04' },
  { name: '罗嘉怡', position: '销售', school: '对外经贸', stage: 'output', mentor: 'mentor04' },
  { name: '林子骞', position: '销售', school: '上海财大', stage: 'output', mentor: 'mentor04' },
  { name: '韩雨曦', position: '销售', school: '中央财大', stage: 'business', mentor: 'mentor05' },
  { name: '冯思源', position: '销售', school: '南开大学', stage: 'business', mentor: 'mentor05' },
  { name: '邓佳琪', position: '销售', school: '西南财大', stage: 'onboard', mentor: 'mentor05' },
  { name: '蒋宇轩', position: '销售', school: '湖南大学', stage: 'output', mentor: 'mentor05' },
];

const AVATAR_POOL = ['👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍💼', '👩‍💼', '🧑‍💼'];

export const INTERNS: User[] = INTERN_BASE.map((b, i) => ({
  id: `intern${String(i + 1).padStart(2, '0')}`,
  name: b.name,
  role: 'intern',
  avatar: AVATAR_POOL[i % AVATAR_POOL.length],
  position: b.position,
  team: MENTORS.find((m) => m.id === b.mentor)?.team,
  mentorId: b.mentor,
  joinDate: '2026-05-06',
  school: b.school,
  stage: b.stage,
}));

export const ALL_USERS: User[] = [...INTERNS, ...MENTORS, ...STAFF];

// 技能分（用伪随机但稳定的方式）
function pseudo(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function buildSkills(internIdx: number): SkillScore {
  const base = 60 + Math.floor(pseudo(internIdx + 1) * 20);
  const variance = (k: number) => Math.floor(pseudo(internIdx * 7 + k) * 30);
  return {
    business: Math.min(95, base + variance(1)),
    communication: Math.min(95, base + variance(2)),
    execution: Math.min(95, base + variance(3)),
    learning: Math.min(95, base + variance(4)),
    delivery: Math.min(95, base + variance(5)),
  };
}

export const SKILLS: Record<string, SkillScore> = INTERNS.reduce(
  (acc, intern, idx) => ({ ...acc, [intern.id]: buildSkills(idx) }),
  {} as Record<string, SkillScore>,
);
