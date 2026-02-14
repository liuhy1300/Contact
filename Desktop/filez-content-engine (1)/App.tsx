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
import { PenTool, Settings, FileText, Clock, Database, Bot, BookOpen, LogOut, User } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-16 md:w-64 bg-[#001C46] text-slate-300 flex flex-col h-screen shrink-0 border-r border-[#001535]">
      <div className="p-4 md:p-6 border-b border-[#002a6aff] flex items-center justify-center md:justify-start">
        <div className="w-8 h-8 bg-[#0071CE] rounded-lg flex items-center justify-center shrink-0 shadow-lg">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <span className="hidden md:block ml-3 font-bold text-white tracking-tight">Filez Engine</span>
      </div>

      <nav className="flex-1 p-2 md:p-4 space-y-2">
        <Link to="/" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/') ? 'bg-[#0071CE] text-white shadow-md' : 'hover:bg-[#002a6a] hover:text-white'}`}>
          <PenTool className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">生成助手</span>
        </Link>
        <Link to="/history" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/history') ? 'bg-[#0071CE] text-white shadow-md' : 'hover:bg-[#002a6a] hover:text-white'}`}>
          <Clock className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">历史记录</span>
        </Link>
        <Link to="/materials" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/materials') ? 'bg-[#0071CE] text-white shadow-md' : 'hover:bg-[#002a6a] hover:text-white'}`}>
          <Database className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">素材库</span>
        </Link>
        <Link to="/knowledge" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/knowledge') ? 'bg-[#0071CE] text-white shadow-md' : 'hover:bg-[#002a6a] hover:text-white'}`}>
          <BookOpen className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">知识库</span>
        </Link>
        <Link to="/admin" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-[#0071CE] text-white shadow-md' : 'hover:bg-[#002a6a] hover:text-white'}`}>
          <Settings className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">后台管理</span>
        </Link>
        <Link to="/tools" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/tools') ? 'bg-[#0071CE] text-white shadow-md' : 'hover:bg-[#002a6a] hover:text-white'}`}>
          <Bot className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">智能工具</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-[#002a6aff]">
        <div className="flex items-center mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#0071CE] flex items-center justify-center text-white shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <div className="ml-3 hidden md:block overflow-hidden">
            <div className="text-xs font-bold text-white truncate">{user?.email?.split('@')[0]}</div>
            <div className="text-[10px] text-slate-400 truncate">Pro Plan</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center md:justify-start p-2 text-slate-400 hover:text-white hover:bg-[#002a6a] rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden md:block ml-3 font-medium text-xs">退出登录</span>
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
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
                path="*"
                element={
                  <div className="flex h-screen overflow-hidden bg-slate-50">
                    <Sidebar />
                    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                      <Routes>
                        <Route path="/" element={<Builder />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/materials" element={<MaterialLibrary />} />
                        <Route path="/knowledge" element={<KnowledgeBase />} />
                        <Route path="/tools" element={<SmartTools />} />
                      </Routes>
                    </div>
                  </div>
                }
              />
            </Route>
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;