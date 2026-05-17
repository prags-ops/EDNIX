import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Send, 
  Loader2, 
  ShieldAlert, 
  History, 
  Zap,
  User as UserIcon,
  Bot,
  X,
  Volume2,
  Sparkles,
  Search,
  GraduationCap
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { type User } from "../user";

interface RoleMessage {
  role: "examiner" | "student" | "system";
  content: string;
  evaluation?: string;
}

export default function RoleReversal({ user }: { user: User | null }) {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<"examiner" | "candidate">("examiner");
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<RoleMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [vitals, setVitals] = useState({
    observation: 0,
    logicDetection: 0,
    criticalThinking: 0
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const startSession = async () => {
    if (mode === "examiner" && (!topic.trim() || !question.trim())) return;
    if (mode === "candidate" && !jobRole.trim()) return;
    
    setLoading(true);
    try {
      if (mode === "examiner") {
        const res = await axios.post("/api/ai/ask", {
          prompt: `Topic: ${topic}\nExaminer's Question: ${question}`,
          type: "role-reversal-start"
        });
        if (res.data.success) {
          setIsStarted(true);
          setHistory([
            { role: "examiner", content: question },
            { role: "student", content: res.data.data }
          ]);
          setVitals({ observation: 0, logicDetection: 0, criticalThinking: 0 });
        }
      } else {
        const res = await axios.post("/api/ai/ask", {
          prompt: `Job Role: ${jobRole}`,
          type: "role-reversal-interviewer-start"
        });
        if (res.data.success) {
          setIsStarted(true);
          setHistory([
            { role: "student", content: res.data.data } 
          ]);
          setVitals({ observation: 0, logicDetection: 0, criticalThinking: 0 });
        }
      }
    } catch (err: any) {
      setError(err.message);
      setIsStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const submitCritique = async (critique: string) => {
    if (!critique.trim()) return;
    setLoading(true);
    
    const lastAiMessage = history[history.length - 1].content;
    
    try {
      if (mode === "examiner") {
        const res = await axios.post("/api/ai/ask", {
          prompt: `Topic: ${topic}\nStudent Answer: ${lastAiMessage}\nExaminer's Critique: ${critique}`,
          type: "role-reversal-evaluate"
        });
        if (res.data.success) {
          const evaluation = res.data.data;
          const scoreMatch = evaluation.match(/Final Evaluator Score: \[(\d+)\/10\]/);
          const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

          setVitals(prev => ({
            observation: Math.min(100, prev.observation + (score * 8)),
            logicDetection: Math.min(100, prev.logicDetection + (score * 7)),
            criticalThinking: Math.min(100, prev.criticalThinking + (score * 6))
          }));

          setHistory(prev => [
            ...prev, 
            { role: "examiner", content: critique },
            { role: "system", content: evaluation }
          ]);
        }
      } else {
        // Candidate mode: AI evaluates user's answer (critique)
        const res = await axios.post("/api/ai/ask", {
          prompt: `Review my answer: ${critique}\nBased on interviewer's question: ${lastAiMessage}`,
          type: "role-reversal-interviewer-evaluate"
        });
        if (res.data.success) {
          const evaluation = res.data.data;
          const scoreMatch = evaluation.match(/\[(\d+)\/10\]/);
          const score = scoreMatch ? parseInt(scoreMatch[1]) : 7;
          
          setHistory(prev => [
            ...prev,
            { role: "examiner", content: critique }, // examiner here works for layout (right side)
            { role: "student", content: evaluation } // AI response
          ]);
          
          setVitals(prev => ({
            observation: Math.min(100, prev.observation + (score * 8)),
            logicDetection: Math.min(100, prev.logicDetection + (score * 7)),
            criticalThinking: Math.min(100, prev.criticalThinking + (score * 6))
          }));
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setHistory([]);
    setIsStarted(false);
    setTopic("");
    setQuestion("");
    setError("");
  };

  return (
    <div className="h-full flex gap-8">
      {/* Control Surface */}
      <aside className={`${isSidebarCollapsed ? "w-20" : "w-80"} transition-all duration-500 shrink-0 h-full relative`}>
        <div className="glass-card rounded-[2.5rem] p-6 h-full space-y-8 shadow-xl border-white/20 dark:border-slate-800/40 overflow-hidden">
          {!isSidebarCollapsed && (
            <>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-primary" size={18} />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Mission: Reverse Link</h3>
              </div>
              
              {!isStarted && (
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => setMode("examiner")}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${mode === "examiner" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400"}`}
                  >
                    Examiner Mode
                  </button>
                  <button 
                    onClick={() => setMode("candidate")}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${mode === "candidate" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400"}`}
                  >
                    Interviewer Mode
                  </button>
                </div>
              )}

              {!isStarted ? (
                <div className="space-y-6">
                   <p className="text-xs text-slate-500 leading-relaxed font-medium">
                     {mode === "examiner" 
                       ? "In Examiner Mode, you are the boss. Ask a question and point out the failures in AI's reasoning." 
                       : "In Interviewer Mode, the AI will grill you for a specific job role. Prepare to be evaluated."}
                   </p>
                   
                   <div className="space-y-4">
                     {mode === "examiner" ? (
                       <>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Focus Domain</label>
                           <input 
                             type="text" 
                             value={topic}
                             onChange={(e) => setTopic(e.target.value)}
                             placeholder="e.g. Operating Systems"
                             className="w-full glass-card rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 ring-primary/20 outline-none border-white/40 shadow-sm"
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Question</label>
                           <textarea 
                              rows={3}
                              value={question}
                              onChange={(e) => setQuestion(e.target.value)}
                              placeholder="Ask a conceptual question to test the student..."
                              className="w-full glass-card rounded-2xl px-4 py-3 text-xs font-medium focus:ring-2 ring-primary/20 outline-none border-white/40 shadow-sm resize-none"
                           />
                         </div>
                       </>
                     ) : (
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Job Role</label>
                         <select 
                           value={jobRole}
                           onChange={(e) => setJobRole(e.target.value)}
                           className="w-full glass-card rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 ring-primary/20 outline-none border-white/40 shadow-sm"
                         >
                            <option>Software Engineer</option>
                            <option>Frontend Developer</option>
                            <option>Backend Developer</option>
                            <option>Data Scientist</option>
                            <option>DevOps Engineer</option>
                            <option>Product Manager</option>
                            <option>UI/UX Designer</option>
                         </select>
                       </div>
                     )}
                     
                     <button 
                       onClick={startSession}
                       disabled={loading || (mode === "examiner" ? (!topic.trim() || !question.trim()) : !jobRole.trim())}
                       className="w-full premium-gradient text-white p-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group"
                     >
                       <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                       <span className="relative z-10">
                         {loading ? <Loader2 size={16} className="animate-spin inline mr-2" /> : mode === "examiner" ? "Deploy Student AI" : "Enter Interview Arena"}
                       </span>
                     </button>
                   </div>
                </div>
              ) : (
                <div className="space-y-8">
                   <div className="space-y-6">
                     <VitalMeter label="Observation" value={vitals.observation} color="cyan" />
                     <VitalMeter label="Logic Detection" value={vitals.logicDetection} color="purple" />
                     <VitalMeter label="Critical Thinking" value={vitals.criticalThinking} color="rose" />
                   </div>
                   
                   <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                     <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                       <div className="flex items-center gap-2">
                         <Sparkles size={14} className="text-primary" />
                         <span className="text-[10px] font-bold uppercase text-primary">Auditor Note</span>
                       </div>
                       <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                         "AI Students may use technically correct terms but flawed reasoning. Look for 'How' and 'Why' gaps."
                       </p>
                     </div>
                   </div>

                   <button 
                     onClick={resetSession}
                     className="w-full p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-rose-500 border border-rose-500/20 hover:bg-rose-500/5 transition-all"
                   >
                     Abandon Session
                   </button>
                </div>
              )}
            </>
          )}

          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-md z-30"
          >
            {isSidebarCollapsed ? <GraduationCap size={14} className="text-primary" /> : <X size={14} className="text-slate-400" />}
          </button>
        </div>
      </aside>

      {/* Arena */}
      <div className="flex-1 flex flex-col glass-card rounded-[3rem] border-white/20 dark:border-slate-800/40 shadow-2xl relative overflow-hidden h-full">
         <header className="px-12 py-8 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="p-4 rounded-[1.5rem] bg-primary text-white shadow-xl shadow-primary/20">
                  <GraduationCap size={28} />
               </div>
                <div>
                   <h2 className="text-3xl font-display font-bold">Role Reversal Arena</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     {mode === "examiner" ? "You are the Examiner • Validate Neural Logic" : `Interviewer Mode • Role: ${jobRole}`}
                   </p>
                </div>
            </div>
            
            {isStarted && (
              <div className="flex items-center gap-3">
                 <div className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <History size={14} className="text-primary" />
                    <span>Active Session</span>
                 </div>
              </div>
            )}
         </header>

         {error && (
            <div className="mx-12 mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm flex gap-3">
               <ShieldAlert size={18} />
               {error}
            </div>
         )}

         <div className="flex-1 overflow-y-auto px-12 py-8 space-y-10 custom-scrollbar" ref={scrollRef}>
            {!isStarted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-lg mx-auto py-20 opacity-40">
                 <div className="w-24 h-24 rounded-[30%] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Zap size={48} className="text-amber-500" />
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-3xl font-display font-bold">{mode === "examiner" ? "Examiner Access Required" : "Candidate Access Required"}</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                      {mode === "examiner" 
                        ? "Initialize a session to become the examiner. You will be grading an AI \"student\" who might make deliberate mistakes."
                        : `Prepare for a rigorous technical interview for the ${jobRole} position. The AI will evaluate your answers and provide benchmark responses.`}
                    </p>
                 </div>
              </div>
            ) : (
              <div className="space-y-8">
                 {history.map((msg, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'student' ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'student' ? 'justify-start' : 'justify-end'}`}
                    >
                       <div className={`flex gap-5 max-w-[85%] ${msg.role === 'student' ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                            msg.role === 'student' ? 'bg-primary text-white' : 
                            msg.role === 'system' ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          }`}>
                            {msg.role === 'student' ? <Bot size={24} /> : 
                             msg.role === 'system' ? <ShieldCheck size={24} /> : <UserIcon size={24} />}
                          </div>
                          <div className={`p-6 rounded-[2.5rem] ${
                            msg.role === 'student' ? 'bg-amber-50 dark:bg-amber-500/10 text-slate-900 dark:text-amber-100 rounded-tl-none border border-amber-500/20' :
                            msg.role === 'system' ? 'bg-primary/5 border border-primary/20 text-slate-800 dark:text-primary-100 rounded-tr-none' :
                            'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-white rounded-tr-none'
                          }`}>
                             <div className="prose dark:prose-invert max-w-none text-sm font-medium leading-relaxed">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                             </div>
                             {msg.role === 'student' && i === history.length - 1 && (
                               <div className="mt-4 pt-4 border-t border-amber-500/20 flex justify-between items-center">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                                    {mode === "examiner" ? "Student Response" : "Interviewer Feedback"}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                                    {mode === "examiner" ? "Awaiting Critique" : "Awaiting Answer"}
                                  </span>
                               </div>
                             )}
                          </div>
                       </div>
                    </motion.div>
                 ))}
                 {loading && (
                    <div className="flex justify-center py-4">
                       <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                 )}
              </div>
            )}
         </div>

         {isStarted && history.length > 0 && history[history.length - 1].role === 'student' && (
           <div className="p-8 pt-0">
              <div className="glass-card rounded-[2.5rem] p-3 shadow-2xl border-white/20 dark:border-slate-800 flex gap-4">
                 <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                       ref={inputRef}
                       placeholder={mode === "examiner" ? "Enter your critique... point out errors or missing points." : "Give your technical answer..."}
                       className="w-full bg-transparent pl-12 pr-4 py-4 text-sm font-bold focus:outline-none dark:text-white"
                       onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                             e.preventDefault();
                             submitCritique(e.currentTarget.value);
                             e.currentTarget.value = "";
                          }
                       }}
                    />
                 </div>
                  <button 
                     onClick={() => {
                         if (inputRef.current) {
                             submitCritique(inputRef.current.value);
                             inputRef.current.value = "";
                         }
                     }}
                     className="premium-gradient text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                     {mode === "examiner" ? "Verdict" : "Submit"}
                  </button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}

const VitalMeter = ({ label, value, color }: { label: string, value: number, color: 'cyan' | 'purple' | 'rose' }) => {
  const colors: any = {
    cyan: "bg-cyan-500 shadow-cyan-500/20",
    purple: "bg-purple-500 shadow-purple-500/20",
    rose: "bg-rose-500 shadow-rose-500/20"
  };
  
  const textColors: any = {
    cyan: "text-cyan-500",
    purple: "text-purple-500",
    rose: "text-rose-500"
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-gray-400">{label}</span>
        <span className={textColors[color]}>{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  );
}
