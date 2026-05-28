import type { ChatMessage } from '../types';

const ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

export function getKey() {
  return localStorage.getItem('deepseek_key') || '';
}

export function hasKey() {
  return !!getKey();
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

/**
 * 调用 DeepSeek Chat API；未配置 Key 或调用失败时回退到本地模拟响应
 */
export async function chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  const key = getKey();
  if (!key) return mockReply(messages);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      signal: opts.signal,
      body: JSON.stringify({
        model: MODEL,
        messages: messages.map(({ role, content }) => ({ role, content })),
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 1200,
        stream: false,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return `[调用失败 ${res.status}] ${text.slice(0, 200)}\n\n以下为本地模拟回答：\n${mockReply(messages)}`;
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '（空响应）';
  } catch (e: any) {
    if (e?.name === 'AbortError') return '（已取消）';
    return `[请求异常] ${e?.message || e}\n\n以下为本地模拟回答：\n${mockReply(messages)}`;
  }
}

// ============ 本地模拟回答 ============
// 根据用户最后一句话的关键词，给出场景化的拟真回答。
export function mockReply(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const sys = messages.find((m) => m.role === 'system')?.content || '';

  // 周报生成
  if (/周报|总结/.test(sys) || /周报|总结/.test(last)) {
    return [
      '【本周成果】',
      '1. 完成了入门任务 X，并提交 PR / 文档；',
      '2. 与导师 1on1 对齐了下阶段目标；',
      '3. 阅读了核心业务文档 3 份，整理了笔记。',
      '',
      '【遇到的问题】',
      '1. 对内部工具链的部分配置仍不熟练；',
      '2. 跨部门沟通时对术语的理解需要加强。',
      '',
      '【下周计划】',
      '1. 独立完成一个小型需求并交付；',
      '2. 主动参加一次需求评审；',
      '3. 输出一份学习笔记分享给团队。',
      '',
      '（以上为本地模拟生成内容；配置 DeepSeek API Key 后将由真实大模型生成。）',
    ].join('\n');
  }

  // 反馈生成（导师）
  if (/反馈|评价|STAR/.test(sys) || /反馈|评价/.test(last)) {
    return [
      '【情境 Situation】',
      '本周分配的任务为「订单中心列表页前端实现」，需要在 3 天内完成基础功能并通过 CR。',
      '',
      '【任务 Task】',
      '希望同学能够独立产出，符合团队代码规范，且具备良好可读性。',
      '',
      '【行动 Action】',
      '同学主动梳理需求边界，按时提交了高质量代码，并在 CR 中积极回应建议。',
      '',
      '【结果 Result】',
      '功能按时上线，CR 仅需一轮即可合入。建议下阶段挑战更复杂的需求，例如承担一个跨模块改动。',
      '',
      '（以上为本地模拟反馈；配置 DeepSeek API Key 后将由真实大模型生成。）',
    ].join('\n');
  }

  // 适岗度评估
  if (/适岗|转正|留用|建议/.test(sys) || /适岗|转正|留用/.test(last)) {
    return [
      '【综合评分】86 / 100',
      '【优势】学习能力突出，代码质量稳定，沟通清晰；',
      '【待改进】跨部门协作经验偏少，宏观业务视角有待加强；',
      '【建议】建议留用，进入相应一级岗，安排 1 个跨团队项目作为试金石。',
      '',
      '（以上为本地模拟分析；配置 DeepSeek API Key 后将由真实大模型生成。）',
    ].join('\n');
  }

  // 批次报告
  if (/批次|整体|全员|批量|看板/.test(last) || /批次|整体|全员/.test(sys)) {
    return [
      '【整体进度】',
      '本批 20 名实习生已全部进入「业务熟悉」及以上阶段，平均完成度 68%。',
      '',
      '【风险关注】',
      '· 3 名同学本周周报缺交，需 HR 协同跟进；',
      '· 销售组节奏偏慢，可考虑拉齐培训进度。',
      '',
      '【亮点】',
      '· 研发组陈睿哲、产品组高博文已进入答辩阶段，表现突出；',
      '· 整体交付质量较上一批提升明显。',
      '',
      '（以上为本地模拟报告；配置 DeepSeek API Key 后将由真实大模型生成。）',
    ].join('\n');
  }

  // 通用 AI 导师答疑
  return [
    '收到你的问题，给出几点建议：',
    '1. 先从最小可行任务入手，主动复述给导师确认理解；',
    '2. 把疑问拆成 What / Why / How 三类，针对性请教；',
    '3. 善用团队 Wiki 与历史会议纪要，比直接提问效率更高；',
    '4. 每天结束花 10 分钟复盘，记录卡点与下一步动作。',
    '',
    '（以上为本地模拟回答；在「设置」页填入 DeepSeek API Key 后将由真实大模型回答。）',
  ].join('\n');
}
