
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Builder from './pages/Builder';
import Admin from './pages/Admin';
import MaterialLibrary from './pages/MaterialLibrary';
import History from './pages/History';
import SmartTools from './pages/SmartTools';
import KnowledgeBase from './pages/KnowledgeBase';
import Login from './pages/Login';
import CompetitiveIntelligence from './pages/CompetitiveIntelligence';
import GeoOptimization from './pages/BrandPulse/GeoOptimization';
import GraphicDesign from './pages/BrandPulse/GraphicDesign';
import MailArchitect from './pages/BrandPulse/MailArchitect';
import SEMIntelligence from './pages/SEMIntelligence';
import Dashboard from './pages/Dashboard';
import { PenTool, Settings, FileText, Clock, Database, Bot, BookOpen, LogOut, User, Target, Globe, LayoutDashboard, Palette, Mail, LayoutGrid, TrendingUp } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  // 导航项渲染器 — 悬浮胶囊设计
  const NavItem = ({ to, icon: Icon, label, color }: { to: string, icon: any, label: string, color?: string }) => {
    const active = isActive(to);
    const iconColor = active ? 'text-white' : (color || 'text-slate-500');
    return (
      <Link to={to} className={`group flex items-center mx-2 px-3 py-2.5 rounded-[10px] transition-all duration-250 relative ${active
        ? 'bg-gradient-to-r from-violet-600/90 to-indigo-600/70 text-white shadow-lg shadow-violet-500/20 font-semibold'
        : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'}`}
      >
        {/* 选中态外发光 */}
        {active && <div className="absolute inset-0 rounded-[10px] bg-violet-500/10 blur-sm -z-10" />}
        <Icon className={`w-4 h-4 shrink-0 transition-colors duration-200 ${active ? 'text-white' : iconColor} ${!active ? `group-hover:${color || 'text-indigo-400'}` : ''}`} />
        <span className="hidden md:block ml-3 text-[13px]">{label}</span>
      </Link>
    );
  };

  // 分组标题渲染器
  const SectionHeader = ({ label }: { label: string }) => (
    <div className="mx-2 px-3 pt-6 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600/70 hidden md:block select-none">
      {label}
    </div>
  );

  return (
    <div className="w-16 md:w-64 bg-zinc-950 flex flex-col h-screen shrink-0 border-r border-white/[0.06] z-20">
      {/* Logo 区 */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25 text-white font-black text-base">
          F
        </div>
        <div className="hidden md:flex flex-col ml-3">
          <span className="font-bold text-slate-100 text-[15px] tracking-tight leading-tight">Filez Engine</span>
          <span className="text-[9px] text-slate-500 font-medium tracking-wider">MARKETING PLATFORM</span>
        </div>
      </div>

      {/* 导航区 */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
        <SectionHeader label="指挥中心" />
        <NavItem to="/" icon={LayoutGrid} label="指挥舱首页" color="text-indigo-400" />

        <SectionHeader label="工作台" />
        <NavItem to="/materials" icon={Database} label="素材库" color="text-slate-500" />
        <NavItem to="/history" icon={Clock} label="历史记录" color="text-slate-500" />
        <NavItem to="/knowledge" icon={BookOpen} label="知识库" color="text-amber-500" />

        <SectionHeader label="智能体" />
        <NavItem to="/builder" icon={PenTool} label="内容营销" color="text-blue-400" />
        <NavItem to="/strategy" icon={LayoutDashboard} label="品牌营销" color="text-purple-400" />
        <NavItem to="/brand/design" icon={Palette} label="平面设计" color="text-orange-400" />
        <NavItem to="/brand/mail" icon={Mail} label="EDM 营销" color="text-pink-400" />
        <NavItem to="/brand/geo" icon={Globe} label="GEO 优化" color="text-emerald-400" />
        <NavItem to="/brand/sem" icon={TrendingUp} label="SEM 智数" color="text-orange-400" />
        <NavItem to="/tools" icon={Bot} label="智能工具" color="text-cyan-400" />

        <SectionHeader label="系统" />
        <NavItem to="/admin" icon={Settings} label="后台管理" color="text-slate-500" />
      </nav>

      {/* 飞行员卡片 */}
      <div className="mx-3 mb-3 p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            {/* 头像 + 在线状态 */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 border border-white/10 flex items-center justify-center text-slate-300">
                <User className="w-4 h-4" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
            </div>
            <div className="ml-3 hidden md:block overflow-hidden">
              <div className="text-xs font-bold text-slate-200 truncate leading-tight">{user?.email?.split('@')[0] || 'Marketer'}</div>
              <div className="text-[10px] font-semibold text-amber-500/80 truncate leading-tight mt-0.5">✦ Pro Team</div>
            </div>
          </div>
          {/* 设置/退出 */}
          <button
            onClick={signOut}
            title="退出登录"
            className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={signOut}
            className="md:hidden flex w-8 h-8 rounded-lg items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-zinc-950 text-slate-500">Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes Wrapper */}
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <div className="flex h-screen overflow-hidden bg-zinc-950">
                    <Sidebar />
                    <div className="flex-1 bg-zinc-950 overflow-hidden relative flex flex-col">
                      <Outlet />
                    </div>
                  </div>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/builder" element={<Builder />} />
                <Route path="/strategy" element={<CompetitiveIntelligence />} />
                <Route path="/brand/design" element={<GraphicDesign />} />
                <Route path="/brand/mail" element={<MailArchitect />} />
                <Route path="/brand/geo" element={<GeoOptimization />} />
                <Route path="/brand/sem" element={<SEMIntelligence />} />

                {/* Other Modules */}
                <Route path="/history" element={<History />} />
                <Route path="/materials" element={<MaterialLibrary />} />
                <Route path="/knowledge" element={<KnowledgeBase />} />
                <Route path="/tools" element={<SmartTools />} />
                <Route path="/builder" element={<Builder />} />
                <Route path="/admin" element={<Admin />} />

                {/* Placeholder Routes */}
                <Route path="/content/creation" element={<div className="p-8 text-slate-500">内容创作模块 (开发中)</div>} />
                <Route path="/content/review" element={<div className="p-8 text-slate-500">内容审核模块 (开发中)</div>} />
                <Route path="/analytics/performance" element={<div className="p-8 text-slate-500">数据洞察模块 (开发中)</div>} />
                <Route path="/analytics/reports" element={<div className="p-8 text-slate-500">报表中心 (开发中)</div>} />
                <Route path="/assets/library" element={<div className="p-8 text-slate-500">资产库 (开发中)</div>} />
                <Route path="/settings" element={<div className="p-8 text-slate-500">系统设置 (开发中)</div>} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;