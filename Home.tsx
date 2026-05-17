import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Target, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Brain,
  Mic2,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Activity,
  Layers,
  Award,
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  ChevronRight,
  ShieldCheck,
  X as XIcon,
  GraduationCap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { type User } from "../user";

interface ScheduleItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  topic: string;
}

const StatusCard = ({ label, value, color, icon: Icon }: { label: string, value: string | number, color: 'emerald' | 'blue', icon: any }) => (
  <div className="glass-card p-6 rounded-[2rem] flex items-center gap-5 border-white/20 dark:border-slate-800/40">
    <div className={`p-3.5 rounded-2xl ${
      color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
    }`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <h3 className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-white">{value}</h3>
    </div>
  </div>
);

export default function Home({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem("ednix_schedule");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: "Monday", start: "09:00", end: "10:00", topic: "" });
  const [activeMissions, setActiveMissions] = useState<ScheduleItem[]>([]);
  const [vivaHistory, setVivaHistory] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem("ednix_schedule", JSON.stringify(schedule));
    updateActiveMissions();
    
    // Load Viva History
    try {
      const saved = localStorage.getItem("ednix_viva_history");
      if (saved) setVivaHistory(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
    
    const interval = setInterval(updateActiveMissions, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  // Derived Insights
  const latestSession = vivaHistory[vivaHistory.length - 1];
  const avgReadiness = vivaHistory.length > 0 
    ? Math.round(vivaHistory.reduce((acc, curr) => acc + (curr.vitals?.readiness || 0), 0) / vivaHistory.length)
    : 0;

  const pulseData = vivaHistory.slice(-3).reverse().map(session => ({
    title: session.topic,
    content: `Accuracy peaked at ${session.vitals?.accuracy}% with high technical depth.`,
    type: session.vitals?.accuracy > 80 ? "success" : "info"
  }));

  const weakSession = [...vivaHistory].sort((a, b) => (a.vitals?.accuracy || 0) - (b.vitals?.accuracy || 0))[0];

  const timeline = vivaHistory.slice(-4).reverse().map(session => ({
    time: new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    event: `Completed ${session.topic} with ${session.vitals?.accuracy}% clarity.`,
    type: session.vitals?.accuracy > 70 ? "achievement" : "growth"
  }));

  const updateActiveMissions = () => {
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

    const active = schedule.filter(item => {
      return item.day === currentDay && 
             currentTime >= item.startTime && 
             currentTime <= item.endTime;
    });

    setActiveMissions(active);
  };

  const addScheduleSlot = () => {
    if (!newSlot.topic) return;
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      day: newSlot.day,
      startTime: newSlot.start,
      endTime: newSlot.end,
      topic: newSlot.topic
    };
    setSchedule([...schedule, newItem]);
    setNewSlot({ ...newSlot, topic: "" });
  };

  const removeScheduleSlot = (id: string) => {
    setSchedule(schedule.filter(s => s.id !== id));
  };

  const observations = pulseData.length > 0 ? pulseData : [
    { title: "Conceptual Confidence", content: "No viva data detected. Initiate your first session to synchronize Intelligence Pulse.", type: "warning" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20"
          >
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Intelligence Grid Synced</span>
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight">
              Welcome, <span className="text-primary italic">{user?.name?.split(' ')[0] || "Learner"}</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm max-w-lg">
              Your academic intelligence profile has been updated. You're showing strong recovery in <span className="text-slate-900 dark:text-white font-bold">Relational Logic</span>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatusCard label="Readiness" value={`${avgReadiness}%`} color="emerald" icon={Activity} />
          <StatusCard label="Focus Path" value={latestSession?.topic?.split(' ')[0] || "DBMS"} color="blue" icon={Target} />
        </div>
      </section>

      {/* Hero Command Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group rounded-[3.5rem] overflow-hidden"
      >
        <div className="absolute inset-0 premium-gradient opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        <div className="relative z-10 p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-8 max-w-2xl text-white">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em]">
                <Sparkles size={14} />
                <span>Next Milestone: Concepts Master</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-display font-bold leading-[1.1]">
                Execute your logic <br /> recovery protocol.
              </h2>
              <p className="text-white/80 text-lg font-medium leading-relaxed">
                {vivaHistory.length > 0 
                  ? `Your board readiness is at ${avgReadiness}%. Focus on addressing the recent reality gaps in ${latestSession?.topic || "your latest topics"} to optimize score.`
                  : "Start your first Mock Viva to initialize your intelligence matrix and bridge conceptual deficits."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
               <Link to="/viva" className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-sm tracking-tight hover:scale-105 transition-all flex items-center gap-3 shadow-2xl">
                  <Mic2 size={18} /> Start Recovery Viva
               </Link>
               <Link to="/role-reversal" className="bg-amber-400 text-slate-900 px-10 py-5 rounded-2xl font-bold text-sm tracking-tight hover:scale-105 transition-all flex items-center gap-3 shadow-2xl">
                  <GraduationCap size={18} /> Role Reversal
               </Link>
               <Link to="/tutor" className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-10 py-5 rounded-2xl font-bold text-sm tracking-tight hover:bg-white/20 transition-all flex items-center gap-3">
                  <Brain size={18} /> Consulting Tutor
               </Link>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="w-80 h-80 rounded-full border-[20px] border-white/10 flex items-center justify-center relative">
              <div className="w-64 h-64 rounded-full border-[2px] border-dashed border-white/30 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-display font-bold">{avgReadiness}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mt-1">Board Readiness</span>
              </div>
            </div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 p-5 glass-card rounded-[2rem] text-slate-900 dark:text-white"
            >
              <TrendingUp className="text-emerald-500 mb-2" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-tight">+5.2% Today</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Intelligence Stream */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-display font-bold">Command Center</h3>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">{activeMissions.length} Active</span>
            </div>
            <button 
              onClick={() => setIsSchedulerOpen(true)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-all"
            >
              <Calendar size={14} />
              Set Timetable
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeMissions.length > 0 ? (
              activeMissions.map((mission) => (
                <motion.div
                  key={mission.id}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/viva?topic=${encodeURIComponent(mission.topic)}`)}
                  className="glass-card p-8 rounded-[2.5rem] border-primary/20 bg-primary/[0.02] relative group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                      <Zap size={20} />
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-widest animate-pulse">Live Mission</span>
                  </div>
                  <div className="space-y-2 mb-8">
                     <h4 className="text-lg font-bold truncate">{mission.topic}</h4>
                     <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                       <Clock size={14} />
                       <span>{mission.startTime} - {mission.endTime}</span>
                     </div>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Launch Mock Viva</span>
                    <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-300 gap-4 glass-card border-dashed border-2 rounded-[3rem] border-slate-200 dark:border-slate-800">
                 <Target size={48} className="opacity-20" />
                 <p className="font-bold uppercase tracking-[0.3em] text-[10px]">No Active Missions Scheduled</p>
                 <button 
                   onClick={() => setIsSchedulerOpen(true)}
                   className="mt-2 text-primary font-bold text-[10px] uppercase tracking-widest hover:underline"
                 >
                   Initialize Timetable
                 </button>
              </div>
            )}
            
            {/* AI Observation Summary */}
            <div className="p-8 rounded-[2.5rem] glass-card border-blue-500/20 bg-blue-500/5 col-span-1 md:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
                   <Search size={22} />
                 </div>
                 <h3 className="text-sm font-bold uppercase tracking-widest">Intelligence Pulse</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {observations.map((obs, i) => (
                   <div key={i} className="space-y-3">
                     <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${obs.type === 'warning' ? 'bg-rose-500' : obs.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                       <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{obs.title}</h4>
                     </div>
                     <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">"{obs.content}"</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Right: Insights & Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Recovery Protocol Panel */}
          <div className="glass-card p-8 rounded-[3rem] bg-[#020617] text-white border-white/5 relative overflow-hidden group shadow-2xl">
             <div className="absolute -bottom-12 -right-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <AlertTriangle size={200} />
             </div>
             <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3 text-rose-500">
                  <History size={20} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Stability Shield</span>
                </div>
                
                <div className="space-y-4">
                   <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fragile Logic</span>
                                                   <span className={`text-xs font-bold ${weakSession?.vitals?.accuracy < 60 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {weakSession?.topic || "Steady State"}
                          </span>

                      </div>
                                             <h4 className="text-xl font-bold tracking-tight">
                         {weakSession 
                           ? `Conceptual instability detected in ${weakSession.topic}.` 
                           : "Intelligence matrix stable. No critical gaps identified."}
                       </h4>

                                             <Link to="/recovery" className="flex items-center justify-center gap-2 w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20">

                         Bridge the Gap <Zap size={14} />
                      </Link>
                   </div>

                   <div className="space-y-3 pt-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stabilization Plan</p>
                      <div className="flex items-center gap-3">
                         <CheckCircle2 size={16} className="text-emerald-500" />
                         <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Compare 3NF vs BCNF logic</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <CheckCircle2 size={16} className="text-emerald-500" />
                         <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Review transitivity dependencies</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-card p-8 rounded-[3rem] border-slate-200/60 dark:border-slate-800/40">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                  <Clock size={20} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest">Growth Timeline</h3>
             </div>
             <div className="space-y-8">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== timeline.length - 1 && <div className="absolute left-[7px] top-6 bottom-[-24px] w-[1px] bg-slate-200 dark:bg-slate-800" />}
                    <div className={`shrink-0 w-3.5 h-3.5 rounded-full mt-1.5 relative z-10 border-4 border-white dark:border-[#020617] ${
                      item.type === 'achievement' ? 'bg-emerald-500' : item.type === 'growth' ? 'bg-blue-500' : 'bg-rose-500'
                    }`} />
                    <div className="space-y-1.5">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.time}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            item.type === 'achievement' ? 'text-emerald-500' : item.type === 'growth' ? 'text-blue-500' : 'text-rose-500'
                          }`}>{item.type}</span>
                       </div>
                       <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{item.event}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Timetable Scheduler Modal */}
      <AnimatePresence>
        {isSchedulerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-white/20 w-full max-w-4xl max-h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-10 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-5">
                  <div className="bg-primary p-3 rounded-2xl text-white shadow-xl shadow-primary/20">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold">Academic Scheduler</h3>
                    <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Protocol Sync Engine</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSchedulerOpen(false)}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                >
                  <XIcon size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Add Slot form */}
                <div className="space-y-8">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Plus size={16} /> Define New Focus Slot
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Topic</label>
                      <input 
                        type="text" 
                        value={newSlot.topic}
                        onChange={(e) => setNewSlot({...newSlot, topic: e.target.value})}
                        placeholder="e.g. Database Transactions"
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-4 ring-primary/10 transition-all outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Day</label>
                        <select 
                           value={newSlot.day}
                           onChange={(e) => setNewSlot({...newSlot, day: e.target.value})}
                           className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-4 ring-primary/10 transition-all outline-none appearance-none"
                        >
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start</label>
                          <input 
                            type="time" 
                            value={newSlot.start}
                            onChange={(e) => setNewSlot({...newSlot, start: e.target.value})}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-3 py-4 font-bold text-xs focus:ring-4 ring-primary/10 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">End</label>
                          <input 
                            type="time" 
                            value={newSlot.end}
                            onChange={(e) => setNewSlot({...newSlot, end: e.target.value})}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-3 py-4 font-bold text-xs focus:ring-4 ring-primary/10 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={addScheduleSlot}
                      className="w-full premium-gradient text-white font-bold py-5 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Commit to Timetable
                    </button>
                  </div>
                </div>

                {/* Timetable view */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                    <span>Synchronized Missions</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{schedule.length} Slots</span>
                  </h4>
                  <div className="space-y-3 custom-scrollbar max-h-[400px] overflow-y-auto pr-2">
                    {schedule.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                        <Calendar size={40} className="opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No Protocol Defined</p>
                      </div>
                    ) : (
                      schedule.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 group border border-transparent hover:border-primary/20 transition-all">
                          <div className="flex gap-4 items-center">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                              <BookOpen size={16} />
                            </div>
                            <div>
                               <p className="text-sm font-bold truncate max-w-[150px]">{item.topic}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.day} • {item.startTime} - {item.endTime}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeScheduleSlot(item.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

