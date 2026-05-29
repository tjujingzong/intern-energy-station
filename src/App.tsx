import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  FileText,
  MessageCircle,
  Users,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  PieChart,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import Layout from './components/Layout';
import { useAuth, getRoleHome } from './store/authStore';

import Login from './pages/Login';
import Settings from './pages/Settings';

import InternDashboard from './pages/intern/Dashboard';
import GrowthMap from './pages/intern/GrowthMap';
import WeeklyReport from './pages/intern/WeeklyReport';
import AIMentor from './pages/intern/AIMentor';

import MentorDashboard from './pages/mentor/Dashboard';
import MenteeDetail from './pages/mentor/MenteeDetail';
import FeedbackEditor from './pages/mentor/FeedbackEditor';
import Templates from './pages/mentor/Templates';

import HROverview from './pages/hr/Overview';
import RiskAlerts from './pages/hr/RiskAlerts';
import HRReport from './pages/hr/Report';

import FitAnalysis from './pages/recruit/FitAnalysis';
import BatchSummary from './pages/recruit/BatchSummary';

const INTERN_NAV = [
  { to: '/intern', label: '我的看板', icon: <LayoutDashboard size={16} /> },
  { to: '/intern/growth', label: '成长地图', icon: <Map size={16} /> },
  { to: '/intern/report', label: 'AI 周报助手', icon: <FileText size={16} /> },
  { to: '/intern/ai', label: 'AI 导师答疑', icon: <MessageCircle size={16} /> },
];

const MENTOR_NAV = [
  { to: '/mentor', label: '我的实习生', icon: <Users size={16} /> },
  { to: '/mentor/feedback', label: 'AI 反馈助手', icon: <Sparkles size={16} /> },
  { to: '/mentor/templates', label: '带教 SOP 模板', icon: <ClipboardList size={16} /> },
];

const HR_NAV = [
  { to: '/hr', label: '全景看板', icon: <PieChart size={16} /> },
  { to: '/hr/alerts', label: '风险预警', icon: <AlertTriangle size={16} /> },
  { to: '/hr/report', label: 'AI 批次报告', icon: <FileText size={16} /> },
  { to: '/hr/fit', label: '适岗度评估', icon: <GraduationCap size={16} /> },
  { to: '/hr/batch', label: '批次趋势', icon: <TrendingUp size={16} /> },
];

function RequireAuth({ children }: { children: React.ReactNode }) {
  const me = useAuth((s) => s.current());
  const loc = useLocation();
  if (!me) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

function RoleHomeRedirect() {
  const me = useAuth((s) => s.current());
  return <Navigate to={getRoleHome(me?.role)} replace />;
}

function SettingsRedirect() {
  const me = useAuth((s) => s.current());
  return <Navigate to={`${getRoleHome(me?.role)}/settings`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleHomeRedirect />} />

      {/* 实习生 */}
      <Route
        path="/intern/*"
        element={
          <RequireAuth>
            <Layout title="实习生工作台" nav={INTERN_NAV}>
              <Routes>
                <Route index element={<InternDashboard />} />
                <Route path="growth" element={<GrowthMap />} />
                <Route path="report" element={<WeeklyReport />} />
                <Route path="ai" element={<AIMentor />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/intern" replace />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />

      {/* 导师 */}
      <Route
        path="/mentor/*"
        element={
          <RequireAuth>
            <Layout title="导师工作台" nav={MENTOR_NAV}>
              <Routes>
                <Route index element={<MentorDashboard />} />
                <Route path="mentee/:id" element={<MenteeDetail />} />
                <Route path="feedback" element={<FeedbackEditor />} />
                <Route path="templates" element={<Templates />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/mentor" replace />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />

      {/* HR（合并招聘协同能力） */}
      <Route
        path="/hr/*"
        element={
          <RequireAuth>
            <Layout title="HR 工作台" nav={HR_NAV}>
              <Routes>
                <Route index element={<HROverview />} />
                <Route path="alerts" element={<RiskAlerts />} />
                <Route path="report" element={<HRReport />} />
                <Route path="fit" element={<FitAnalysis />} />
                <Route path="batch" element={<BatchSummary />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/hr" replace />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />

      {/* 兼容：旧 /recruit/* 路径重定向到 HR */}
      <Route path="/recruit" element={<Navigate to="/hr/fit" replace />} />
      <Route path="/recruit/batch" element={<Navigate to="/hr/batch" replace />} />
      <Route path="/recruit/*" element={<Navigate to="/hr" replace />} />

      {/* 兼容：旧 /settings 路径重定向到当前角色的 settings */}
      <Route path="/settings" element={<SettingsRedirect />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
