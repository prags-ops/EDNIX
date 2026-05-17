import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Code2, 
  Mic2, 
  LogOut,
  Sun,
  Moon,
  Zap,
  ChevronLeft,
  Search,
  LucideIcon,
  GraduationCap
} from "lucide-react";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";

import { type User } from "./user";

// Pages
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import AiTutor from "./pages/AiTutor";
import CodeLab from "./pages/CodeLab";
import MockViva from "./pages/MockViva";
import RoleReversal from "./pages/RoleReversal";
import Recovery from "./pages/Recovery";
import Login from "./pages/Login";
import CookieConsent from "./components/CookieConsent";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
  collapsed: boolean;
}

const SidebarItem = ({ icon: Icon, label, to, collapsed }: SidebarItemProps) => {
  const location = useLocation();
  const active = location.pathname === to;
  
  return (
    <Link to={to}>
      <motion.div 
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3.5 rounded-2xl transition-all duration-300 group relative ${
          active 
            ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
            : "text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800/50"
        }`}
      >
        <Icon size={20} className={`${active ? "text-primary" : "group-hover:text-primary"} transition-colors`} />
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-4 text-xs font-bold tracking-tight"
          >
            {label}
          </motion.span>
        )}
        {active && (
          <motion.div 
            layoutId="active-indicator"
            className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        )}
      </motion.div>
    </Link>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

function Layout({ children, user, isSidebarCollapsed, setIsSidebarCollapsed, onLogout }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 dark:bg-primary/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 dark:bg-accent/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 100 : 300 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="glass-card m-4 mr-0 rounded-[32px] flex flex-col shrink-0 relative z-10 border-slate-200/50 dark:border-slate-800/40 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/60"
      >
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} p-8 mb-4`}>
          <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/25 relative group">
            <Zap className="text-white fill-white" size={22} />
            <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-xl font-bold font-display tracking-tight leading-none bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                EDNIX
              </h1>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500 mt-1">Intelligence</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Command Center" to="/" collapsed={isSidebarCollapsed} />
          <SidebarItem icon={BookOpen} label="AI Tutor" to="/tutor" collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Code2} label="Code Lab" to="/codelab" collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Mic2} label="Mock Viva" to="/viva" collapsed={isSidebarCollapsed} />
          <SidebarItem icon={GraduationCap} label="Role Reversal" to="/role-reversal" collapsed={isSidebarCollapsed} />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-200/60 dark:border-slate-800/40 space-y-2">
          <div className="bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl p-2 space-y-1">
            <button 
              onClick={toggleTheme} 
              className="flex items-center space-x-3 w-full py-3 px-4 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all font-medium text-xs uppercase tracking-wider"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              {!isSidebarCollapsed && <span>Theme Mode</span>}
            </button>
            <button 
              onClick={onLogout} 
              className="flex items-center space-x-3 w-full py-3 px-4 rounded-xl text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 transition-all font-medium text-xs uppercase tracking-wider"
            >
              <LogOut size={18} />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
          
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/50 dark:ring-slate-800">
                {user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-tighter">Pro Account</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-24 bg-white dark:bg-slate-900 text-slate-400 hover:text-primary w-6 h-12 rounded-lg flex items-center justify-center transition-all z-50 border border-slate-200 dark:border-slate-800 group shadow-md"
        >
          <motion.div animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}>
            <ChevronLeft size={14} className="group-hover:scale-125 transition-transform" />
          </motion.div>
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full p-4 pl-0">
        <CookieConsent />
        <header className="flex items-center justify-between px-8 py-2 z-20">
          <div className="flex items-center gap-4">
          </div>
          <div className="flex items-center gap-3">
          </div>
        </header>

        <main className="flex-1 relative z-10 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={useLocation().pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved && saved !== "undefined") {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse user", e);
    }
    return null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/*" element={
              user ? (
                <Layout 
                  user={user} 
                  isSidebarCollapsed={isSidebarCollapsed} 
                  setIsSidebarCollapsed={setIsSidebarCollapsed}
                  onLogout={handleLogout}
                >
                  <Routes>
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/tutor" element={<AiTutor user={user} />} />
                    <Route path="/codelab" element={<CodeLab user={user} />} />
                    <Route path="/viva" element={<MockViva user={user} />} />
                    <Route path="/role-reversal" element={<RoleReversal user={user} />} />
                    <Route path="/recovery" element={<Recovery user={user} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Layout>
              ) : <Navigate to="/login" />
            } />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
