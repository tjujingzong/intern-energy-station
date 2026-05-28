import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '../types';
import { ALL_USERS } from '../data/users';

interface AuthState {
  currentId: string | null;
  login: (id: string, password: string) => { ok: boolean; msg: string };
  logout: () => void;
  switchTo: (id: string) => void;
  current: () => User | null;
  getDeepseekKey: () => string;
  setDeepseekKey: (key: string) => void;
}

const PRESET_PWD = '123456';

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      currentId: null,
      login: (id, password) => {
        const u = ALL_USERS.find((x) => x.id === id);
        if (!u) return { ok: false, msg: '账号不存在' };
        if (password !== PRESET_PWD) return { ok: false, msg: '密码错误（默认 123456）' };
        set({ currentId: id });
        return { ok: true, msg: '登录成功' };
      },
      logout: () => set({ currentId: null }),
      switchTo: (id) => {
        if (ALL_USERS.find((x) => x.id === id)) set({ currentId: id });
      },
      current: () => {
        const id = get().currentId;
        return id ? ALL_USERS.find((x) => x.id === id) || null : null;
      },
      getDeepseekKey: () => localStorage.getItem('deepseek_key') || '',
      setDeepseekKey: (key) => {
        if (key) localStorage.setItem('deepseek_key', key);
        else localStorage.removeItem('deepseek_key');
      },
    }),
    { name: 'ies_auth' },
  ),
);

export function getRoleHome(role: Role | undefined): string {
  switch (role) {
    case 'intern':
      return '/intern';
    case 'mentor':
      return '/mentor';
    case 'hr':
      return '/hr';
    case 'recruit':
      return '/recruit';
    default:
      return '/login';
  }
}
