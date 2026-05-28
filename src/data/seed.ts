import type { Task, WeeklyReport, MentorFeedback, Position, StageId } from '../types';
import { INTERNS } from './users';

// 任务模板（按岗位 + 阶段）
const TASK_TEMPLATES: Record<Position, Record<StageId, string[]>> = {
  研发: {
    onboard: ['完成入职手续与系统账号申请', '阅读《新人手册》并完成测验', '搭建本地开发环境', '加入团队周会并自我介绍'],
    business: ['熟悉核心业务流程文档', '阅读核心代码模块 README', '与导师 1on1 梳理业务地图', '完成第一个新手 Bug Fix'],
    output: [
      '独立交付一个小需求 (前端组件 / 接口)',
      '提交 Code Review 并修复 Comment',
      '撰写一份技术文档',
      '参与一次需求评审',
    ],
    graduation: ['整理实习产出物清单', '撰写答辩 PPT', '进行 30 分钟答辩演练', '完成转正申请表'],
  },
  产品: {
    onboard: ['完成入职手续', '阅读产品方法论文档', '研究主要竞品', '加入产品团队周会'],
    business: ['梳理用户旅程地图', '调研 5 位真实用户', '画出业务功能脑图', '与导师 1on1 对齐目标'],
    output: ['撰写一份 PRD', '主持一次需求评审', '设计原型并交付设计师', '完成需求验收'],
    graduation: ['总结实习项目案例', '准备答辩 PPT', '完成自评报告', '提交转正申请'],
  },
  销售: {
    onboard: ['完成入职培训与考试', '熟悉产品手册', '认识团队成员', '了解客户分级体系'],
    business: ['观摩 3 次客户拜访', '熟悉销售工具 (CRM)', '完成话术演练', '与导师对齐目标客户'],
    output: ['独立完成 5 次客户拜访', '产生 1 个意向客户', '完成销售周报', '参与一次合同谈判'],
    graduation: ['整理客户名单与产出', '准备答辩 PPT', '撰写实习总结', '提交转正申请'],
  },
};

const STAGE_ORDER: StageId[] = ['onboard', 'business', 'output', 'graduation'];

const today = new Date('2026-05-28');

function offsetDate(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// 为每位实习生构建任务（已完成阶段任务全 done，当前阶段部分 done，未来阶段全未 done）
export const TASKS: Task[] = (() => {
  const list: Task[] = [];
  INTERNS.forEach((intern) => {
    const tmpl = TASK_TEMPLATES[intern.position!];
    const currentIdx = STAGE_ORDER.indexOf(intern.stage!);
    STAGE_ORDER.forEach((stage, sIdx) => {
      const titles = tmpl[stage];
      titles.forEach((title, tIdx) => {
        const id = `${intern.id}-${stage}-${tIdx}`;
        let done = false;
        let dueOffset = 0;
        if (sIdx < currentIdx) {
          done = true;
          dueOffset = (sIdx - currentIdx) * 7 + tIdx;
        } else if (sIdx === currentIdx) {
          done = tIdx < Math.ceil(titles.length / 2);
          dueOffset = tIdx - 1;
        } else {
          done = false;
          dueOffset = (sIdx - currentIdx) * 7 + tIdx;
        }
        list.push({
          id,
          internId: intern.id,
          stage,
          title,
          dueDate: offsetDate(dueOffset),
          done,
          fromMentor: intern.mentorId,
          createdAt: offsetDate(-30),
        });
      });
    });
  });
  return list;
})();

// 周报：所有实习生在第 1、2 周提交了周报，第 3 周部分实习生未提交
export const WEEKLY_REPORTS: WeeklyReport[] = (() => {
  const list: WeeklyReport[] = [];
  INTERNS.forEach((intern, idx) => {
    const totalWeeks = Math.min(3, STAGE_ORDER.indexOf(intern.stage!) + 1);
    for (let w = 1; w <= totalWeeks; w++) {
      // 模拟少数人本周未交（idx % 7 === 0 的几人在第 3 周缺交）
      if (w === 3 && idx % 7 === 0) continue;
      list.push({
        id: `${intern.id}-w${w}`,
        internId: intern.id,
        weekNo: w,
        weekLabel: `2026-W${20 + w}`,
        achievements: buildAchievement(intern.position!, w),
        problems: buildProblem(intern.position!, w),
        nextWeek: buildNext(intern.position!, w),
        submittedAt: offsetDate(-7 * (totalWeeks - w) - 1),
        feedback: w <= totalWeeks - 1 ? buildFeedback(intern.position!) : undefined,
        feedbackBy: intern.mentorId,
        feedbackAt: offsetDate(-7 * (totalWeeks - w)),
      });
    }
  });
  return list;
})();

function buildAchievement(p: Position, w: number) {
  const sample: Record<Position, string[]> = {
    研发: [
      '完成本地开发环境搭建，跑通了示例工程；阅读了核心模块 README，整理出 3 页学习笔记。',
      '完成第一个 Bug Fix（修复登录页提示错位），代码已合入主干；参与了需求评审会议。',
      '独立交付订单中心列表页前端组件，CR 一次过；编写了组件文档。',
    ],
    产品: [
      '阅读完毕 5 份产品方法论文档；调研了 3 个竞品，输出对比表。',
      '完成用户旅程地图初稿，访谈了 4 位真实用户；与导师对齐了下阶段目标。',
      '产出了一份完整 PRD 并主持需求评审，已进入设计阶段。',
    ],
    销售: [
      '完成产品知识培训并通过考试；熟悉了 CRM 工具；旁听了 2 次客户拜访。',
      '完成话术演练，导师评分 85；参与了 3 次客户拜访，记录了客户画像。',
      '独立拜访 5 个客户，产出 1 个意向客户进入跟进阶段。',
    ],
  };
  return sample[p][w - 1];
}

function buildProblem(p: Position, w: number) {
  const sample: Record<Position, string[]> = {
    研发: ['对内部框架的设计模式还不熟悉。', '调试线上问题时还需要导师协助。', 'CR 中关于性能优化的建议吸收较慢。'],
    产品: ['对业务上下游链路理解不够深入。', '用户访谈技巧需要提升，访谈深度不足。', 'PRD 细节表达不够精准，存在歧义。'],
    销售: ['对部分行业术语还不太熟悉。', '客户异议处理时显得紧张。', '客户推进节奏的把握需要练习。'],
  };
  return sample[p][w - 1];
}

function buildNext(p: Position, w: number) {
  const sample: Record<Position, string[]> = {
    研发: ['阅读核心模块源码并产出导读', '尝试独立交付一个完整需求', '主导一次小型重构并写好 RFC'],
    产品: ['完成用户访谈并产出洞察报告', '产出一版完整 PRD 并评审', '推动需求落地，参与上线复盘'],
    销售: ['进入实战拜访，完成 3 次独立沟通', '产出 1 个意向客户', '推动意向客户进入合同环节'],
  };
  return sample[p][w - 1];
}

function buildFeedback(p: Position) {
  const sample: Record<Position, string> = {
    研发: '本周成长可见，代码质量稳步提升，建议下周更主动地参与代码评审讨论，多关注架构设计层面的思考。',
    产品: '调研扎实，文档清晰；建议在用户访谈中多追问 Why，挖掘真实需求。',
    销售: '态度积极，客户记录详细；建议加强异议处理训练，话术可以更自然有温度。',
  };
  return sample[p];
}

// 导师反馈记录（部分实习生）
export const MENTOR_FEEDBACKS: MentorFeedback[] = INTERNS.slice(0, 12).map((intern, i) => ({
  id: `fb-${intern.id}-1`,
  internId: intern.id,
  mentorId: intern.mentorId!,
  type: i % 3 === 0 ? '1on1' : '周反馈',
  content:
    i % 3 === 0
      ? `${intern.name} 在本周的表现非常积极，主动承担了多项任务。建议下阶段重点提升 ${intern.position} 岗位的核心专业能力，多与团队同事交流。`
      : `${intern.name} 学习能力强，进度快于预期。需要加强细节把控，下周将分配更具挑战的任务来检验综合能力。`,
  createdAt: offsetDate(-3),
}));
