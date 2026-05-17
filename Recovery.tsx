import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Activity, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Brain,
  Layers,
  Award,
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  ChevronRight,
  ShieldCheck,
  X as XIcon,
  Bot,
  User as UserIcon,
  Sparkles,
  GitGraph,
  Loader2,
  LucideIcon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { type User } from "../user";

interface RecoveryNode {
  id: string;
  label: string;
  status: 'weak' | 'recovering' | 'stable';
  mistakes: string[];
  observations: string;
  score: number;
  dependencies: string[];
}

const NodeCard = ({ node, onClick, isSelected }: { node: RecoveryNode, onClick: () => void, isSelected: boolean }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    onClick={onClick}
    className={`p-6 rounded-[2rem] border cursor-pointer transition-all ${
      isSelected 
        ? "ring-4 ring-primary/20 bg-white dark:bg-slate-800 border-primary" 
        : "glass-card border-white/20 dark:border-slate-800/40 hover:border-primary/20"
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full ${
        node.status === 'weak' ? 'bg-rose-500' : 
        node.status === 'recovering' ? 'bg-amber-500' : 'bg-emerald-500'
      } shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
      <span className="text-sm font-bold tracking-tight">{node.label}</span>
    </div>
  </motion.div>
);

export default function Recovery({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<RecoveryNode | null>(null);
  const [nextViva, setNextViva] = useState({ date: "", time: "", difficulty: "Intermediate" });

  useEffect(() => {
    const saved = localStorage.getItem("ednix_bridge_gap_report");
    if (saved) {
      setReport(JSON.parse(saved));
    } else {
      // Fallback redirect if no report
      // navigate("/viva");
    }
  }, []);

  // Mock nodes based on report or defaults
  const nodes: RecoveryNode[] = useMemo(() => {
    if (!report) return [];
    
    // Attempt to extract concepts from analysis or history
    const baseConcept = report.topic || "DBMS";
    const concepts = report.analysis.weakConcepts.length > 0 
      ? report.analysis.weakConcepts.slice(0, 4) 
      : ["Theoretical Foundations", "Practical Implementation", "Logic Depth", "Follow-up Reasoning"];

    return concepts.map((c: string, i: number) => ({
      id: `node-${i}`,
      label: c.length > 25 ? c.substring(0, 25) + "..." : c,
      status: i === 0 ? 'weak' : i === 1 ? 'recovering' : 'stable',
      mistakes: ["Struggled with follow-up reasoning", "Incorrect example provided"],
      observations: "Performance dropped during technical depth checks.",
      score: i === 0 ? 4 : i === 1 ? 6 : 8,
      dependencies: []
    }));
  }, [report]);

  if (!report) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <div className="text-center space-y-6">
          <Loader2 className="animate-spin text-primary mx-auto" size={48} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Initializing Intelligence Matrix...</p>
        </div>
      </div>
    );
  }

  const handleSchedule = () => {
    // Save schedule to missions
    const mission = {
      id: Date.now().toString(),
      topic: `${report.topic} (Recovery)`,
      day: new Date(nextViva.date).toLocaleDateString('en-US', { weekday: 'long' }),
      startTime: nextViva.time,
      endTime: "10:00", // placeholder
    };
    
    const saved = localStorage.getItem("ednix_schedule");
    const schedule = saved ? JSON.parse(saved) : [];
    localStorage.setItem("ednix_schedule", JSON.stringify([...schedule, mission]));
    
    navigate("/");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Analysis */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-10 rounded-[3rem] border-primary/20 bg-primary/[0.02]">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30">
            <TrendingUp size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Recovery Workspace</h1>
            <p className="text-primary font-bold text-xs uppercase tracking-[0.3em] mt-2">Active intelligence Reconstruction</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Viva Topic</p>
             <p className="text-lg font-bold">{report.topic}</p>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 mx-2" />
          <div className="text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery Score</p>
             <p className="text-lg font-bold text-primary">{report.vitals.accuracy}%</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Mind Map & Analysis */}
        <div className="lg:col-span-8 space-y-12">
          {/* Node Visualization */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-display font-bold flex items-center gap-3">
                <GitGraph className="text-primary" size={24} />
                Neural Knowledge Map
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Weak</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Recovering</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Stable</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {nodes.map(node => (
                <NodeCard 
                  key={node.id} 
                  node={node} 
                  onClick={() => setSelectedNode(node)}
                  isSelected={selectedNode?.id === node.id}
                />
              ))}
            </div>

            <AnimatePresence>
              {selectedNode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-primary/20 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8">
                    <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-primary">
                      <XIcon size={20} />
                    </button>
                  </div>
                  <div className="flex items-center gap-5 mb-8">
                    <div className={`p-4 rounded-2xl ${
                      selectedNode.status === 'weak' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      <Brain size={24} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold">{selectedNode.label}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Concept Diagnostics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Deficits</label>
                        <div className="space-y-2">
                          {selectedNode.mistakes.map((m, i) => (
                            <div key={i} className="flex gap-3 text-sm font-medium text-rose-500 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                              <ShieldAlert size={16} className="shrink-0" />
                              {m}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6 text-sm">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Observation</label>
                          <p className="italic text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                            "{selectedNode.observations}"
                          </p>
                       </div>
                       <Link to={`/tutor?mode=recovery&topic=${selectedNode.label}`} className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                         Begin Remediation <ArrowRight size={14} />
                       </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Detailed Plan */}
          <section className="space-y-6">
            <h3 className="text-xl font-display font-bold px-2">Recovery Synthesis</h3>
            <div className="glass-card p-10 rounded-[3rem] prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
               <ReactMarkdown>{report.recoveryPlan}</ReactMarkdown>
            </div>
          </section>
        </div>

        {/* Right: Recommendations & Priority */}
        <div className="lg:col-span-4 space-y-12">
          {/* Priority Matrix */}
          <section className="glass-card p-8 rounded-[3rem] space-y-8">
            <div className="flex items-center gap-3">
              <Layers className="text-primary" size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Intelligence Priority</h3>
            </div>
            <div className="space-y-6">
               <PriorityItem label="High Priority" items={nodes.filter(n => n.status === 'weak').map(n => n.label)} color="rose" />
               <PriorityItem label="Medium Priority" items={nodes.filter(n => n.status === 'recovering').map(n => n.label)} color="amber" />
               <PriorityItem label="Stable Base" items={nodes.filter(n => n.status === 'stable').map(n => n.label)} color="emerald" />
            </div>
          </section>

          {/* Roadmap */}
          <section className="glass-card p-8 rounded-[3rem] space-y-8">
             <div className="flex items-center gap-3">
              <TrendingUp className="text-primary" size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Recovery Roadmap</h3>
            </div>
            <div className="space-y-8">
               <RoadmapStep step={1} title="Conceptual Revision" desc="Focus on SQL JOIN visualization and reasoning." />
               <RoadmapStep step={2} title="Guided Tutor Training" desc="Complete 1 guided session on ACID properties." />
               <RoadmapStep step={3} title="Mock Simulation" desc="Bridge conceptually complex follow-up questions." />
            </div>
          </section>

          {/* Recovery Status System */}
          <section className="glass-card p-8 rounded-[3rem] space-y-8">
             <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary" size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Recovery Status Intelligence</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 px-4 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <span>Concept</span>
                <span className="text-right">Status</span>
              </div>
              <div className="space-y-2">
                {nodes.map((node, i) => (
                  <div key={i} className="grid grid-cols-2 items-center px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold truncate">{node.label}</span>
                    <div className="flex justify-end">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                        node.status === 'weak' ? 'bg-rose-500/10 text-rose-500' : 
                        node.status === 'recovering' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {node.status === 'weak' ? 'Weak' : node.status === 'recovering' ? 'Recovering' : 'Stable'}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 items-center px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold truncate">General Reasoning</span>
                    <div className="flex justify-end">
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-500">
                        Improving
                      </span>
                    </div>
                  </div>
              </div>
            </div>
          </section>

          {/* Next Cycle Scheduler */}
          <section className="glass-card p-8 rounded-[3rem] space-y-8 border-primary/20 bg-primary/5">
             <div className="flex items-center gap-3">
              <Calendar className="text-primary" size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Commit Next Cycle</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
                <input 
                  type="date"
                  value={nextViva.date}
                  onChange={(e) => setNextViva({...nextViva, date: e.target.value})}
                  className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-4 text-xs font-bold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Slot</label>
                <input 
                  type="time"
                  value={nextViva.time}
                  onChange={(e) => setNextViva({...nextViva, time: e.target.value})}
                  className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-4 text-xs font-bold outline-none"
                />
              </div>
              <button 
                onClick={handleSchedule}
                disabled={!nextViva.date || !nextViva.time}
                className="w-full py-5 premium-gradient text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                Schedule Recovery Viva
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const PriorityItem = ({ label, items, color }: { label: string, items: string[], color: 'rose' | 'amber' | 'emerald' }) => {
  const colorMap: any = {
    rose: "bg-rose-500 text-rose-500",
    amber: "bg-amber-500 text-amber-500",
    emerald: "bg-emerald-500 text-emerald-500"
  };
  
  const [bg, text] = colorMap[color].split(' ');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${bg} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
        <span className={`text-[10px] font-bold uppercase tracking-widest ${text}`}>{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? items.map((item, i) => (
          <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-bold border border-slate-100 dark:border-slate-800/40">
            {item}
          </span>
        )) : <span className="text-[10px] text-slate-400 italic">No concepts identified.</span>}
      </div>
    </div>
  );
};

const RoadmapStep = ({ step, title, desc }: { step: number, title: string, desc: string }) => (
  <div className="flex gap-5">
    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0 border border-primary/20">
      {step}
    </div>
    <div className="space-y-1">
      <h4 className="text-xs font-bold uppercase tracking-tight">{title}</h4>
      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

