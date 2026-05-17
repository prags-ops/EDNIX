import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic2, 
  Send, 
  Loader2, 
  ShieldAlert, 
  RefreshCw, 
  Smartphone,
  Zap,
  User as UserIcon,
  Bot,
  Square,
  X,
  Volume2,
  Sparkles,
  Trophy,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate } from "react-router-dom";
import { type User } from "../user";

interface VivaMessage {
  role: string;
  content: string;
  feedback?: {
    score?: string;
    missingKeywords?: string[];
    idealAnswer?: string;
    realityGap?: string;
    confidence?: string;
  };
}

export default function MockViva({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<VivaMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryPlan, setRecoveryPlan] = useState("");
  const [explainingMistakeId, setExplainingMistakeId] = useState<number | null>(null);
  const [mistakeExplanation, setMistakeExplanation] = useState<string>("");
  
  const [config, setConfig] = useState({
    difficulty: "Intermediate",
    qCount: 5,
    subjects: "Computer Science",
    voiceEnabled: true
  });
  const [vitals, setVitals] = useState({
    accuracy: 0,
    confidence: 0,
    depth: 0,
    readiness: 0
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const synthesis = useRef<SpeechSynthesis | null>(window.speechSynthesis);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const speak = (text: string) => {
    if (!config.voiceEnabled || !synthesis.current) return;
    synthesis.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, ''));
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesis.current.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      synthesis.current?.cancel();
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(transcript);
    };
    recognition.start();
  };

  const startViva = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setIsStarted(true);
    try {
      const res = await axios.post("/api/ai/ask", {
        prompt: `Initialize a ${config.difficulty} level viva on "${topic}". Total questions: ${config.qCount}.`,
        type: "viva-start",
        config
      });
      if (res.data.success) {
        setHistory([{ role: "examiner", content: res.data.data }]);
        speak(res.data.data);
      }
    } catch (err: any) {
      setError(err.message);
      setIsStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const parseFeedback = (text: string) => {
    const scoreMatch = text.match(/- Score:\s*(.*)/i);
    const keywordsMatch = text.match(/- Missing Keywords:\s*(.*)/i);
    const idealMatch = text.match(/- Ideal Answer:\s*(.*)/i);
    const gapMatch = text.match(/- Reality Gap:\s*(.*)/i);
    const confidenceMatch = text.match(/- Confidence:\s*(.*)/i);

    if (!scoreMatch && !keywordsMatch && !idealMatch && !gapMatch && !confidenceMatch) return null;

    return {
      score: scoreMatch ? scoreMatch[1].trim() : undefined,
      missingKeywords: keywordsMatch ? keywordsMatch[1].split(',').map(s => s.trim()).filter(s => s) : undefined,
      idealAnswer: idealMatch ? idealMatch[1].trim() : undefined,
      realityGap: gapMatch ? gapMatch[1].trim() : undefined,
      confidence: confidenceMatch ? confidenceMatch[1].trim() : undefined,
    };
  };

  const explainMistake = async (index: number) => {
    const msg = history[index];
    if (!msg.feedback) return;
    
    const studentAnswer = history[index - 1]?.content || "";
    
    setExplainingMistakeId(index);
    setMistakeExplanation("");
    try {
       const res = await axios.post("/api/ai/ask", {
          prompt: `Analyze mistake:\nStudent Answer: ${studentAnswer}\nReality Gap: ${msg.feedback.realityGap}\nIdeal Answer: ${msg.feedback.idealAnswer}`,
          type: "explain-mistake",
          topic
       });
       if (res.data.success) {
          setMistakeExplanation(res.data.data);
       }
    } catch (err: any) {
       console.error(err);
    }
  };

  const generateRecoveryPlan = async () => {
    setLoading(true);
    try {
      const transcript = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      const res = await axios.post("/api/ai/ask", {
        prompt: `Generate recovery plan for session on ${topic}.\n\nTranscript:\n${transcript}\n\nPlease include specific sections for: Weak Concepts, Recovery Strategy, and Priority Focus Areas.`,
        type: "viva-recovery",
        topic
      });
      if (res.data.success) {
        setRecoveryPlan(res.data.data);
        
        // Deep Analysis for Bridge the Gap Workspace
        const report = {
          topic,
          vitals,
          timestamp: new Date().toISOString(),
          history: history.filter(h => h.feedback),
          recoveryPlan: res.data.data,
          analysis: {
            weakConcepts: history.filter(h => h.feedback?.realityGap).map(h => h.feedback?.realityGap),
            unansweredQuestions: history.filter(h => h.feedback?.score && parseInt(h.feedback.score) < 3).length,
            repeatedMistakes: 0, // Placeholder
            confidenceVsPerformance: vitals.confidence > 80 && vitals.accuracy < 60 ? "Overconfident" : "Proportional"
          }
        };
        
        localStorage.setItem("ednix_bridge_gap_report", JSON.stringify(report));
        
        // Sync to history as well
        const historyRaw = localStorage.getItem("ednix_viva_history");
        const vHistory = historyRaw ? JSON.parse(historyRaw) : [];
        vHistory.push({ ...report, sessionsCompleted: 1 });
        localStorage.setItem("ednix_viva_history", JSON.stringify(vHistory.slice(-10)));

        // Transition to Workspace
        navigate("/recovery");
      }
    } catch (err: any) {
      setError("Plan synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    const currentAnswer = answer;
    setAnswer("");
    setLoading(true);
    const newHistory: VivaMessage[] = [...history, { role: "student", content: currentAnswer }];
    setHistory(newHistory);

    try {
      const res = await axios.post("/api/ai/ask", {
        prompt: topic,
        history: history,
        currentAnswer: currentAnswer,
        type: "viva-continue",
        config
      });
      if (res.data.success) {
        const aiResponse = res.data.data;
        const feedback = parseFeedback(aiResponse);
        
        let cleanContent = aiResponse;
        if (feedback) {
          cleanContent = aiResponse.split(/- Score:|- Missing Keywords:|- Ideal Answer:|- Reality Gap:|- Confidence:/i)[0].trim();
        }

        setHistory([...newHistory, { role: "examiner", content: cleanContent, feedback: feedback || undefined }]);
        speak(cleanContent);
        
        if (feedback?.score) {
          const scoreNum = parseInt(feedback.score);
          if (!isNaN(scoreNum)) {
            const confMap: any = { "High": 95, "Medium": 65, "Low": 35 };
            setVitals({
              accuracy: Math.min(100, Math.max(0, scoreNum * 10)),
              confidence: feedback.confidence ? confMap[feedback.confidence] || vitals.confidence : vitals.confidence,
              depth: Math.min(100, vitals.depth + (scoreNum > 7 ? 10 : 2)),
              readiness: Math.min(100, vitals.readiness + 3)
            });
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetViva = () => {
    synthesis.current?.cancel();
    setHistory([]);
    setAnswer("");
    setTopic("");
    setIsStarted(false);
    setError("");
    setVitals({ accuracy: 0, confidence: 0, depth: 0, readiness: 0 });
  };

  return (
    <div className="h-full flex gap-8">
      {/* Recovery Plan Modal */}
      <AnimatePresence>
        {showRecovery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
               <div className="p-10 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-primary/5">
                  <div className="flex items-center gap-5">
                    <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
                      <Zap size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold">Neural Recovery Protocol</h3>
                      <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Optimized Learning Strategy</p>
                    </div>
                  </div>
                  <button onClick={() => setShowRecovery(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                    <X size={24} />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-10 prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                  <ReactMarkdown>{recoveryPlan}</ReactMarkdown>
               </div>
               <div className="p-10 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
                  <button 
                    onClick={() => setShowRecovery(false)}
                    className="px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Dismiss
                  </button>
                  <Link 
                    to={`/tutor?mode=recovery&topic=${topic || "Recent Viva Gaps"}`}
                    className="px-10 py-4 premium-gradient text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Initiate Recovery Sprint
                  </Link>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Control Surface */}
      <aside className={`${isSidebarCollapsed ? "w-20" : "w-80"} flex flex-col gap-6 shrink-0 h-full transition-all duration-500 ease-in-out relative group/sidebar`}>
        <div className="glass-card rounded-[2.5rem] p-6 h-full space-y-8 shadow-xl border-white/20 dark:border-slate-800/40 relative overflow-hidden">
           {!isSidebarCollapsed && (
             <>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Mission Parameters</h3>
               </div>
               
               {!isStarted ? (
                 <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cognitive Depth</label>
                      <select 
                        value={config.difficulty} 
                        onChange={(e) => setConfig({...config, difficulty: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 ring-primary/20 outline-none transition-all"
                      >
                        <option>Basic</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Load</label>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{config.qCount} Qs</span>
                      </div>
                      <input 
                        type="range" min="3" max="15" 
                        value={config.qCount}
                        onChange={(e) => setConfig({...config, qCount: parseInt(e.target.value)})}
                        className="w-full accent-primary h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Neural Voice</span>
                      <button 
                        onClick={() => setConfig({...config, voiceEnabled: !config.voiceEnabled})}
                        className={`w-12 h-6 rounded-full transition-all relative ${config.voiceEnabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${config.voiceEnabled ? "left-7" : "left-1"}`} />
                      </button>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-8 flex-1">
                    <VitalMeter label="Accuracy" value={vitals.accuracy} color="emerald" />
                    <VitalMeter label="Confidence" value={vitals.confidence} color="blue" />
                    <VitalMeter label="Logic Depth" value={vitals.depth} color="amber" />
                    <VitalMeter label="Board Readiness" value={vitals.readiness} color="rose" />
                    
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 italic">
                        <Sparkles size={16} className="text-primary shrink-0" />
                        <p className="text-[10px] leading-relaxed font-medium text-slate-600 dark:text-slate-400">
                          AI observation: "Technical terminology is precise. Maintain this depth in conceptual links."
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={generateRecoveryPlan}
                        disabled={loading || history.length < 2}
                        className="w-full premium-gradient text-white p-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin inline mr-2" /> : "Finalize & Export Plan"}
                      </button>
                    </div>
                 </div>
               )}
             </>
           )}

           {isSidebarCollapsed && (
             <div className="flex flex-col items-center gap-8 pt-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.voiceEnabled ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`} title="Voice Status">
                   <Volume2 size={20} />
                </div>
                {isStarted && <div className="space-y-4">
                  <div className="w-1.5 h-12 bg-emerald-500/20 rounded-full overflow-hidden relative" title="Accuracy">
                     <div className="absolute bottom-0 w-full bg-emerald-500" style={{ height: `${vitals.accuracy}%` }} />
                  </div>
                  <div className="w-1.5 h-12 bg-blue-500/20 rounded-full overflow-hidden relative" title="Confidence">
                     <div className="absolute bottom-0 w-full bg-blue-500" style={{ height: `${vitals.confidence}%` }} />
                  </div>
                </div>}
             </div>
           )}

           {/* Collapse Toggle */}
           <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-md z-30 hover:bg-primary hover:text-white transition-all text-slate-400"
           >
             {isSidebarCollapsed ? <motion.div animate={{ rotate: 0 }}><ChevronRight size={14} /></motion.div> : <motion.div animate={{ rotate: 0 }}><ChevronLeft size={14} /></motion.div>}
           </button>
        </div>
      </aside>

      {/* Intelligence Stream */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-slate-950/20 glass-card rounded-[3rem] border-white/20 dark:border-slate-800/40 shadow-2xl relative overflow-hidden h-full">
        <header className="flex items-center justify-between px-12 py-6 border-b border-white/20 dark:border-slate-800/40 shrink-0">
          <div className="flex items-center gap-6">
            <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
              <Mic2 size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold tracking-tight">Viva Intelligence Arena</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Neural Link Active • CS Core</span>
              </div>
            </div>
          </div>
          
          {isStarted && (
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {isSpeaking && (
                  <motion.button 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => synthesis.current?.cancel()} 
                    className="flex items-center gap-3 px-5 py-2.5 bg-rose-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                  >
                    <Square size={14} fill="currentColor" />
                    Silence AI
                  </motion.button>
                )}
              </AnimatePresence>
              <button 
                onClick={resetViva} 
                className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:border-rose-500/20 transition-all shadow-sm"
              >
                <X size={16} />
                Terminate
              </button>
            </div>
          )}
        </header>

        {error && (
          <div className="mx-10 mt-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-5 rounded-[2rem] flex items-center gap-4 text-sm font-bold shadow-sm">
            <ShieldAlert size={20} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} className="font-black text-[10px] uppercase tracking-widest bg-rose-500 text-white px-3 py-1 rounded-lg">Dismiss</button>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto px-12 py-10 space-y-12 custom-scrollbar scroll-smooth" ref={scrollRef}>
          {!isStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-10 max-w-xl mx-auto py-20 grayscale opacity-40 group hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-32 h-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20"
                >
                  <Mic2 size={56} className="text-primary" />
                </motion.div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-2xl">
                  <Zap size={20} />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-4xl font-display font-bold tracking-tight text-slate-800 dark:text-white">Initialize Field.</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-loose">
                  Connect to the neural examiner for a high-intensity clinical viva. Logic traps and layered cross-questioning enabled.
                </p>
                <div className="space-y-4 pt-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-1 flex items-center justify-center text-[11px] font-bold uppercase text-slate-400">
                      Comp Sci
                    </div>
                    <input 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter Target Concept (e.g. DBMS Internal Protocols)"
                      className="col-span-2 glass-card border-white/20 dark:border-slate-800 shadow-sm rounded-2xl p-4.5 focus:ring-4 ring-primary/10 outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  <button 
                    onClick={startViva}
                    disabled={loading || !topic.trim()}
                    className="w-full premium-gradient text-white p-5 rounded-3xl font-bold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? <Loader2 className="animate-spin inline mr-2" /> : "Initiate Intelligence Link"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12 max-w-full mx-auto px-6 md:px-16 xl:px-32">
              {history.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-6 max-w-[90%] ${msg.role === 'student' ? 'flex-row-reverse text-right ml-auto' : 'flex-row text-left mr-auto'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      msg.role === 'student' 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                        : "bg-emerald-500 text-white"
                    }`}>
                      {msg.role === 'student' ? <UserIcon size={26} /> : <Bot size={28} />}
                    </div>
                    <div className="space-y-4">
                      <div className={`p-5 rounded-[2.5rem] shadow-sm relative ${
                        msg.role === 'student' 
                          ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-900/60 border border-emerald-500/10 text-slate-800 dark:text-slate-100 rounded-tl-none'
                      }`}>
                        <div className="prose dark:prose-invert max-w-none text-base leading-relaxed font-sans font-medium">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>

                        {msg.feedback && (
                          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-8">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Neural Assessment</span>
                              <div className="flex gap-2">
                                {msg.feedback.confidence && (
                                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold ${
                                    msg.feedback.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-500' : 
                                    msg.feedback.confidence === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                                  }`}>
                                    CONFIDENCE: {msg.feedback.confidence}
                                  </div>
                                )}
                                <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-bold shadow-md shadow-emerald-500/20">
                                  SCORE: {msg.feedback.score}/10
                                </div>
                              </div>
                            </div>
                            
                            {msg.feedback.missingKeywords && msg.feedback.missingKeywords.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1">Missing Conceptual Keys</p>
                                <div className="flex flex-wrap gap-2">
                                  {msg.feedback.missingKeywords.map(k => (
                                    <span key={k} className="bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-rose-500/20 uppercase tracking-tight">
                                      {k}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {msg.feedback.realityGap && (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1">Knowledge Link Vulnerability</p>
                                  <button 
                                    onClick={() => explainMistake(i)}
                                    className="text-[10px] font-bold uppercase text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-all tracking-tight"
                                  >
                                    Diagnose Mistake
                                  </button>
                                </div>
                                <p className="text-sm font-medium text-rose-600/90 dark:text-rose-400/90 italic pl-4 border-l-2 border-rose-500/30">
                                  "{msg.feedback.realityGap}"
                                </p>
                                
                                <AnimatePresence>
                                  {explainingMistakeId === i && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-4 p-6 bg-amber-500/[0.03] border border-amber-500/20 rounded-[2rem] overflow-hidden"
                                    >
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                          <ShieldAlert size={18} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Deep Logic Rectification</span>
                                      </div>
                                      {!mistakeExplanation ? (
                                        <div className="flex items-center gap-4 p-2">
                                          <Loader2 size={16} className="animate-spin text-amber-500" />
                                          <span className="text-[11px] font-bold text-amber-500/60 uppercase tracking-widest">Processing neural trace...</span>
                                        </div>
                                      ) : (
                                        <div className="prose dark:prose-invert text-amber-900/80 dark:text-amber-200/80 text-sm leading-loose">
                                          <ReactMarkdown>{mistakeExplanation}</ReactMarkdown>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                            {msg.feedback.idealAnswer && (
                              <div className="space-y-3 p-6 bg-emerald-500/[0.03] rounded-[2rem] border border-emerald-500/10">
                                <p className="text-[9px] font-bold uppercase text-emerald-600 tracking-widest">Synthesized Benchmark</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-loose">
                                  {msg.feedback.idealAnswer}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {msg.role === 'examiner' && i === history.length - 1 && isSpeaking && (
                          <div className="absolute -bottom-4 right-8 flex gap-1.5">
                            {[0.2, 0.4, 0.6, 0.8].map(d => (
                              <motion.div 
                                key={d}
                                animate={{ height: [8, 20, 8] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: d }}
                                className="w-1.5 bg-primary rounded-full shadow-lg shadow-primary/20" 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-4 opacity-50">
                        Signal Stamped • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                      <Loader2 size={24} className="text-white animate-spin" />
                   </div>
                   <div className="space-y-4">
                     <div className="h-5 w-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                     <div className="h-5 w-72 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse opacity-40" />
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Neural Intake Dock */}
        <div className="px-12 py-4 shrink-0 bg-gradient-to-t from-white dark:from-[#020617] to-transparent z-20">
          <div className={`glass-card rounded-[2rem] p-2 shadow-2xl transition-all border-white/40 dark:border-slate-800/60 focus-within:ring-4 ring-primary/5 group ${!isStarted && "opacity-30 pointer-events-none"}`}>
            <form onSubmit={handleSend} className="flex gap-4 items-center">
              <button 
                type="button"
                onClick={startListening}
                className={`p-2.5 rounded-xl transition-all shadow-lg ${isListening ? "bg-rose-500 text-white animate-pulse" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                title={isListening ? "Intelligence Capture Active" : "Voice Capture Link"}
              >
                <div className="relative">
                   <Volume2 size={20} />
                   {isListening && <motion.div animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-white rounded-full" />}
                </div>
              </button>
              <input 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={isListening ? "Decoding neural signal..." : "Input cognitive response..."}
                className="flex-1 bg-transparent py-2.5 text-base font-medium placeholder:text-slate-400 focus:outline-none dark:text-white"
                disabled={loading || !isStarted}
              />
              <button 
                type="submit"
                disabled={loading || !answer.trim() || !isStarted}
                className="premium-gradient text-white px-8 h-12 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 disabled:grayscale disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                <span className="hidden md:block">Transmit</span>
              </button>
            </form>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-4 uppercase tracking-[0.6em] font-bold opacity-30">
            EDNIX Neural Arena v4.2.0 • Biometric Encryption
          </p>
        </div>
      </div>
    </div>
  );
}

const VitalMeter = ({ label, value, color }: { label: string, value: number, color: 'emerald' | 'blue' | 'amber' | 'rose' }) => {
  const colors: any = {
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    blue: "bg-blue-500 shadow-blue-500/20",
    amber: "bg-amber-500 shadow-amber-500/20",
    rose: "bg-rose-500 shadow-rose-500/20"
  };
  
  const textColors: any = {
    emerald: "text-emerald-500",
    blue: "text-blue-500",
    amber: "text-amber-500",
    rose: "text-rose-500"
  };
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-gray-400">{label}</span>
        <span className={textColors[color]}>{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden text-[0px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  );
}

