import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, getRoleHome } from '../store/authStore';
import { ROLE_LABELS } from '../constants';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { ALL_USERS } from '../data/users';
import type { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface LayoutProps {
  title: string;
  nav: { to: string; label: string; icon: ReactNode }[];
  children: ReactNode;
}

export default function Layout({ title, nav, children }: LayoutProps) {
  const me = useAuth((s) => s.current());
  const switchTo = useAuth((s) => s.switchTo);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <div className="font-semibold text-slate-800 leading-tight">实习能量站</div>
              <div className="text-[11px] text-slate-500">新人成长导航</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-auto">
          <div className="px-2 text-[11px] uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </div>
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-slate-100 space-y-1">
          <NavLink
            to={`${getRoleHome(me?.role)}/settings`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <Settings size={16} />
            设置
          </NavLink>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={16} />
            退出登录
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="text-sm text-slate-500">
            {me ? `${ROLE_LABELS[me.role]} · ${me.team || ''}` : ''}
          </div>
          <div className="flex items-center gap-3">
            <RoleQuickSwitch
              onPick={(id) => {
                switchTo(id);
                const u = ALL_USERS.find((x) => x.id === id);
                navigate(getRoleHome(u?.role));
              }}
            />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
              <span className="text-lg leading-none">{me?.avatar || '👤'}</span>
              <span className="text-sm font-medium text-slate-700">{me?.name || '未登录'}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function RoleQuickSwitch({ onPick }: { onPick: (id: string) => void }) {
  const presets = [
    { id: 'intern01', label: '实习生·张子轩' },
    { id: 'mentor01', label: '导师·陈思远' },
    { id: 'hr01', label: 'HR·苏晓彤' },
  ];
  return (
    <div className="hidden md:flex items-center gap-1 text-xs text-slate-500">
      <UserIcon size={14} />
      <span>演示切换：</span>
      {presets.map((p) => (
        <button
          key={p.id}
          onClick={() => onPick(p.id)}
          className="px-2 py-1 rounded hover:bg-slate-100 hover:text-slate-700"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
