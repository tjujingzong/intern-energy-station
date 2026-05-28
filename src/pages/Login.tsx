import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getRoleHome } from '../store/authStore';
import { ALL_USERS, INTERNS, MENTORS, STAFF } from '../data/users';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const [id, setId] = useState('intern01');
  const [pwd, setPwd] = useState('123456');
  const [err, setErr] = useState('');
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();

  const onSubmit = () => {
    const r = login(id, pwd);
    if (!r.ok) {
      setErr(r.msg);
      return;
    }
    const u = ALL_USERS.find((x) => x.id === id);
    navigate(getRoleHome(u?.role));
  };

  const QuickPick = ({ uid, label }: { uid: string; label: string }) => (
    <button
      onClick={() => {
        setId(uid);
        setPwd('123456');
        setErr('');
      }}
      className="px-2.5 py-1 rounded-full bg-white/70 border border-slate-200 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-600"
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm text-xs text-brand-700 mb-4">
            <Sparkles size={14} /> AI 驱动的新人成长导航
          </div>
          <h1 className="text-4xl font-bold text-slate-800 leading-tight">
            实习能量站 <br />
            <span className="text-brand-600">让每一位新人都能精准生长</span>
          </h1>
          <p className="text-slate-600 mt-4 leading-relaxed">
            为实习生、导师、HR（含招聘协同）三个角色，提供标准化带教节奏、个性化成长地图、
            AI 周报反馈与全局适岗度看板，让带教更规范、成长更可见、协同更高效。
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li>· 4 阶段标准化带教 SOP，导师无需凭经验</li>
            <li>· AI 周报助手 + AI 导师答疑，实习生不再迷茫</li>
            <li>· HR 一站式掌握风险预警与适岗度评估</li>
            <li>· 数据全部在浏览器，安全可控（DeepSeek Key 可选）</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <div className="font-semibold text-slate-800">登录实习能量站</div>
              <div className="text-xs text-slate-500">默认密码：123456</div>
            </div>
          </div>

          <label className="label">账号</label>
          <input className="input" value={id} onChange={(e) => setId(e.target.value)} />
          <label className="label mt-3">密码</label>
          <input
            className="input"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
          {err && <div className="text-rose-600 text-xs mt-2">{err}</div>}
          <button className="btn-primary w-full mt-4" onClick={onSubmit}>
            登录
          </button>

          <div className="mt-5 pt-5 border-t border-slate-100 text-xs text-slate-500">
            <div className="mb-2 text-slate-600">快速登录：</div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-12 text-slate-400">实习生</span>
                {INTERNS.slice(0, 4).map((u) => (
                  <QuickPick key={u.id} uid={u.id} label={`${u.id} · ${u.name}`} />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-12 text-slate-400">导师</span>
                {MENTORS.slice(0, 3).map((u) => (
                  <QuickPick key={u.id} uid={u.id} label={`${u.id} · ${u.name}`} />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-12 text-slate-400">HR</span>
                {STAFF.map((u) => (
                  <QuickPick key={u.id} uid={u.id} label={`${u.id} · ${u.name}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
