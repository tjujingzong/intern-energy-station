import { useAuth } from '../../store/authStore';
import { MENTORS } from '../../data/users';
import AIChat from '../../components/AIChat';

export default function AIMentor() {
  const me = useAuth((s) => s.current())!;
  const mentor = MENTORS.find((m) => m.id === me.mentorId);

  const sys = `你是「${me.position}」岗位的资深导师，名字叫做「AI 导师」。
现在你正在为新入职的实习生 ${me.name}（来自 ${me.school}，岗位：${me.position}，团队：${me.team}，
真实导师：${mentor?.name}）提供随时答疑。
你的回答需要：
1. 紧密结合「${me.position}」岗位实际工作场景，举例具体；
2. 体现对新人的鼓励与温度，避免说教；
3. 当问题超出岗位范围时，引导其去问真实导师 ${mentor?.name}；
4. 回答控制在 300 字以内，必要时使用要点列表。`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">AI 导师答疑</h1>
        <p className="text-sm text-slate-500 mt-1">
          有问题随时问，AI 导师会结合你的岗位与团队给出建议；私密对话仅保存在你的浏览器。
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIChat
            storageKey={`intern-ai-${me.id}`}
            systemPrompt={sys}
            placeholder="例如：第一次参加需求评审，我该如何准备？"
            hint="提示：你可以直接点击下方的常用问题，或自行输入问题。AI 不会取代真实导师，重要决策仍请向你的导师确认。"
            quickPrompts={[
              '入职第一周我应该做什么准备？',
              `${me.position}岗位常见的产出物有哪些？`,
              '如何更高效地向导师汇报工作？',
              '怎样写一份让人愿意看完的周报？',
              '我感觉学习进度有点慢，怎么办？',
            ]}
            height="640px"
          />
        </div>
        <div className="space-y-4">
          <div className="card">
            <div className="section-title mb-2">我的导师</div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{mentor?.avatar}</span>
              <div>
                <div className="font-medium text-slate-800">{mentor?.name}</div>
                <div className="text-xs text-slate-500">{mentor?.team}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-3 leading-relaxed">
              真实导师将通过「1on1 / 周反馈 / 月度评估」等节点为你提供面对面指导，AI 导师作为日常答疑补充。
            </div>
          </div>
          <div className="card">
            <div className="section-title mb-2">常用话术</div>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li>· 「我对 XX 的理解是…，请问我理解对了吗？」</li>
              <li>· 「我尝试了 A 和 B 两种方案，目前倾向 B，原因是…」</li>
              <li>· 「我卡在 XX，已经查过 XX，下一步是否可以 XX？」</li>
              <li>· 「我希望在下周完成 XX，需要您支持 XX 资源」</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
