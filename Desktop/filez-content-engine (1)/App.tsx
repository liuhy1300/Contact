import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Builder from './pages/Builder';
import Admin from './pages/Admin';
import MaterialLibrary from './pages/MaterialLibrary';
import History from './pages/History';
import SmartTools from './pages/SmartTools';
import { PenTool, Settings, FileText, Clock, Database, Bot } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-16 md:w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800">
      <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-center md:justify-start">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <span className="hidden md:block ml-3 font-bold text-white tracking-tight">Filez Engine</span>
      </div>

      <nav className="flex-1 p-2 md:p-4 space-y-2">
        <Link to="/" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/') ? 'bg-red-600/10 text-red-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <PenTool className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">生成助手 (Builder)</span>
        </Link>
        <Link to="/history" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/history') ? 'bg-purple-600/10 text-purple-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <Clock className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">历史记录 (History)</span>
        </Link>
        <Link to="/materials" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/materials') ? 'bg-emerald-600/10 text-emerald-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <Database className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">素材库 (Assets)</span>
        </Link>
        <Link to="/admin" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-blue-600/10 text-blue-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <Settings className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">后台管理 (Admin)</span>
        </Link>
        <Link to="/tools" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/tools') ? 'bg-indigo-600/10 text-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <Bot className="w-5 h-5 shrink-0" />
          <span className="hidden md:block ml-3 font-medium">智能工具 (Smart Tools)</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center md:text-left">
        <span className="hidden md:inline">v2.3.0 Enterprise</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <Routes>
              <Route path="/" element={<Builder />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/history" element={<History />} />
              <Route path="/materials" element={<MaterialLibrary />} />
              <Route path="/tools" element={<SmartTools />} />
            </Routes>
          </div>
        </div>
      </Router>
    </DataProvider>
  );
};

export default App;