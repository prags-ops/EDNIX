import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, Lock, User as UserIcon, ShieldCheck, Zap, BookOpen, Code2, Mic2, Star, Sparkles, ArrowRight } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card p-5 rounded-3xl flex items-start gap-4 border-white/10"
  >
    <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-sm font-bold mb-1">{title}</h3>
      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{description}</p>
    </div>
  </motion.div>
);

import { type User } from "../user";

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin({ 
        id: Date.now().toString(), 
        username, 
        email: username.includes("@") ? username : `${username}@example.com`,
        name: username 
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-500 selection:bg-primary/30 font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Left side: Branding & Hero */}
      <div className="hidden lg:flex lg:w-3/5 flex-col p-16 relative overflow-hidden bg-white dark:bg-transparent shadow-2xl dark:shadow-none border-r border-slate-200 dark:border-transparent">
        <div className="z-10 flex flex-col h-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-20"
          >
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Zap className="text-white fill-white" size={24} />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">EDNIX</span>
          </motion.div>

          <div className="flex-1 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-6xl font-display font-bold leading-tight mb-6 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-500 bg-clip-text text-transparent">
                The Future of Academic <br /> 
                <span className="text-primary italic">Intelligence</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-12 font-medium leading-relaxed">
                Unlock your potential with EDNIX. An adaptive AI mentor that evaluates, teaches, and builds conceptual mastery through intelligent interaction.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
              <FeatureCard 
                icon={BookOpen} 
                title="Adaptive AI Tutor" 
                description="Personalized learning paths tailored to your unique knowledge gaps."
                color="blue"
                delay={0.4}
              />
              <FeatureCard 
                icon={Mic2} 
                title="Socratic Mock Viva" 
                description="Master your verbal evaluations with deep, critical questioning."
                color="purple"
                delay={0.5}
              />
              <FeatureCard 
                icon={BrainCircuit} 
                title="Intelligence Mapping" 
                description="Real-time analysis of conceptual strengths and recovery plans."
                color="emerald"
                delay={0.6}
              />
            </div>
          </div>

          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-auto flex items-center gap-6"
          >
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium tracking-wide">Joined by 2,000+ top engineering students</p>
          </motion.footer>
        </div>
        
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-12 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-10 lg:p-12 rounded-[3rem] border-slate-200 dark:border-white/5 relative bg-white/40 dark:bg-slate-900/40">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[10px] font-bold tracking-[0.2em] mb-4 uppercase">
                <Sparkles size={12} />
                <span>Enterprise Protocol</span>
              </div>
              <h2 className="text-3xl font-display font-bold mb-2">Welcome Back</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Log in to your academic command center</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Identity Node</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 dark:text-slate-600 group-focus-within:text-primary transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 pl-14 pr-5 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    placeholder="Username or Email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Access Key</label>
                  <button type="button" className="text-[10px] font-bold text-primary hover:underline">Forgot Key?</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 dark:text-slate-600 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 pl-14 pr-5 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 px-1 py-1">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded-md border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/50 text-primary focus:ring-primary/20 cursor-pointer" />
                <label htmlFor="remember" className="text-xs text-slate-400 dark:text-slate-500 font-medium cursor-pointer select-none">Remember this session</label>
              </div>

              <button
                type="submit"
                className="w-full premium-gradient text-white py-4 mt-4 rounded-2xl font-bold transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 group overflow-hidden relative shadow-lg shadow-primary/20"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                <span>Initialize Command</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest border border-slate-200 dark:border-white/5"
              >
                Create New Intelligence Node
              </button>
            </form>

            <div className="mt-12 flex items-center justify-center gap-6 opacity-40">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-700" />
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-700" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
