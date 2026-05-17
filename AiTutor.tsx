import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Send, 
  Loader2, 
  Sparkles, 
  Upload, 
  FileText, 
  X, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  User as UserIcon, 
  Bot,
  Plus,
  MessageSquare,
  ArrowRight,
  Zap,
  Download,
  AlertTriangle,
  Star,
  History as HistoryIcon,
  GitBranch,
  Search as SearchIcon,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react";
import * as d3 from "d3";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { type User } from "../user";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isBookmarked?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

export default function AiTutor({ user }: { user: User | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem("ai_tutor_sessions");
      if (saved) {
        return JSON.parse(saved, (key, value) => 
          (key === 'timestamp' || key === 'updatedAt') ? new Date(value) : value
        );
      }
    } catch (e) {
      console.error("Failed to parse sessions", e);
    }
    const initialSession = {
      id: "session-1",
      title: "New Concept Discovery",
      messages: [{
        id: "welcome-1",
        role: "assistant" as const,
        content: "What's up! 👋 I'm your AI Computer Science Tutor. Ready to crush some concepts today? Whether you want a direct explanation or want to test your thinking, I've got you. What's on your mind?",
        timestamp: new Date()
      }],
      updatedAt: new Date()
    };
    return [initialSession];
  });

  const [learningMode, setLearningMode] = useState<"learn" | "mastery">("mastery");

  const [currentSessionId, setCurrentSessionId] = useState<string>(sessions[0]?.id || "session-1");
  const [humanLanguage, setHumanLanguage] = useState("English");
  
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  const [bookmarks, setBookmarks] = useState<Message[]>(() => {
    const saved = localStorage.getItem("ai_tutor_bookmarks");
    return saved ? JSON.parse(saved, (key, value) => key === 'timestamp' ? new Date(value) : value) : [];
  });

  useEffect(() => {
    localStorage.setItem("ai_tutor_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("ai_tutor_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const [showBookmarks, setShowBookmarks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [topic, setTopic] = useState("");
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);
  const [generatingMindMap, setGeneratingMindMap] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [recoveryContext, setRecoveryContext] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem("ednix_bridge_gap_report");
    if (saved) setRecoveryContext(JSON.parse(saved));
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  const PROACTIVE_GREETINGS = [
    "Ready to master a new Computer Science logic today? I've been analyzing your recent paths—how about we dive into the ACID properties of DBMS?",
    "Science is about discovery! 🚀 What if we broke down the complexity of Dijkstra's algorithm today?",
    "Computer Science excellence is built on consistent revision. Shall we tackle SQL Join logic or explore Operating System scheduling?",
    "Greeting, computer scientist! I'm ready to help you simplify a complex topic. Want to start with Normalization or maybe Multi-threading internals?",
    "Every session is a step toward mastery. Today, I suggest we focus on Data Structure optimization. Ready to start?",
    "Logic check time! 🧠 Want to test your understanding of BCNF or maybe explore the OSI model layers?",
    "Success usually comes to those who are too busy looking for it. Let's make today productive—what concept shall we visualize?"
  ];

  const startNewChat = (customGreeting?: string, customTitle?: string) => {
    const randomGreeting = customGreeting || PROACTIVE_GREETINGS[Math.floor(Math.random() * PROACTIVE_GREETINGS.length)];
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: customTitle || "New Concept Discovery",
      messages: [{
        id: Date.now().toString() + "-welcome",
        role: "assistant",
        content: customGreeting ? customGreeting : `${randomGreeting}\n\n*What topic shall we explore today?*`,
        timestamp: new Date()
      }],
      updatedAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setTopic("");
    setShowBookmarks(false);
    return newId;
  };

  const exportChatToPdf = async () => {
    if (!chatContentRef.current) return;
    setExporting(true);
    try {
      const element = chatContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`EDNIX_Notes_${currentSession.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
      setError("Failed to generate PDF export.");
    } finally {
      setExporting(false);
    }
  };

  // Auto-start new session on fresh navigation or handle recovery redirection
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get("mode");
    const topicParam = queryParams.get("topic");

    if (mode === "recovery") {
      const recoveryGreeting = `**RECOVERY PROTOCOL ACTIVATED** 🔓\n\nI've synchronized with your last viva results. It looks like you struggled with **${topicParam || "certain concepts"}**. \n\nLet's clear this up right now. Explain your understanding of this topic so I can pinpoint the exact logic gap.`;
      startNewChat(recoveryGreeting, `Recovery: ${topicParam || "Concept Recovery"}`);
      navigate(location.pathname, { replace: true });
    }
  }, []);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      setCurrentSessionId(filtered[0].id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleBookmark = (msg: Message) => {
    const updatedSessions = sessions.map(session => ({
      ...session,
      messages: session.messages.map(m => m.id === msg.id ? { ...m, isBookmarked: !m.isBookmarked } : m)
    }));
    setSessions(updatedSessions);
    
    if (bookmarks.find(b => b.id === msg.id)) {
      setBookmarks(prev => prev.filter(b => b.id !== msg.id));
    } else {
      setBookmarks(prev => [msg, ...prev]);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && files.length === 0) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: topic || (files.length > 0 ? `Analyze docs: ${files.map(f => f.name).join(", ")}` : ""),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { 
      ...s, 
      messages: updatedMessages,
      updatedAt: new Date() 
    } : s));

    const generateBetterTitle = async (content: string, sessionId: string) => {
      try {
        const res = await axios.post("/api/ai/ask", {
          prompt: content,
          type: "summarize-title"
        });
        if (res.data.success) {
          const freshTitle = res.data.data.replace(/[".]/g, "");
          setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: freshTitle } : s));
        }
      } catch (e) {
        console.error("Title generation failed", e);
        // Fallback to substring if it fails
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: content.substring(0, 30) + "..." } : s));
      }
    };

    if (currentSession.title === "New Concept Discovery") {
      generateBetterTitle(userMsg.content, currentSessionId);
    }

    setTopic("");
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      
      let systemPrompt = `You are a world-class AI Computer Science Tutor. Mode: ${learningMode}. Language: ${humanLanguage}.`;
      if (recoveryContext) {
        systemPrompt += `\n\nRECOVERY CONTEXT DETECTED:
        The student recently completed a viva on "${recoveryContext.topic}" with ${recoveryContext.vitals.accuracy}% accuracy.
        Weak Concepts: ${recoveryContext.analysis.weakConcepts.join(", ")}.
        
        INSTRUCTION: Adapt your teaching to bridge these specific gaps. 
        - Ask more follow-up questions to test deep reasoning.
        - Avoid direct spoon-feeding; use Socratic method.
        - Prioritize guided logic over quick answers.
        - Use practical database/code examples if applicable.`;
      }

      formData.append("prompt", `${systemPrompt}\n\nStudent Message: ${userMsg.content}`);
      formData.append("type", "tutor");
      formData.append("learningMode", learningMode);
      formData.append("humanLanguage", humanLanguage);
      
      const context = updatedMessages.slice(-4).map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join("\n");
      formData.append("chatHistory", context);

      files.forEach((file) => formData.append("files", file));

      const res = await axios.post("/api/ai/ask", formData);

      if (res.data.success) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: res.data.data,
          timestamp: new Date(),
        };
        
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { 
          ...s, 
          messages: [...s.messages, assistantMsg],
          updatedAt: new Date()
        } : s));
      } else {
        setError(res.data.message || "Failed to generate response.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Intelligence engine offline.");
    } finally {
      setLoading(false);
      setFiles([]);
    }
  };

  const generateMindMap = async () => {
    if (messages.length < 2) return;
    setGeneratingMindMap(true);
    setError("");
    try {
      const lastContext = messages.slice(-5).map(m => m.content).join("\n");
      const res = await axios.post("/api/ai/ask", {
        prompt: `Generate a detailed mind map for the topic discussed. 
        Format: Return ONLY a JSON object with this structure: {"name": "Root Topic", "children": [{"name": "Subtopic 1", "children": [...]}]}
        Context: ${lastContext}`,
        type: "mind-map"
      });

      // Simple cleaner for JSON if AI adds markdown blocks
      let jsonStr = res.data.data;
      if (jsonStr.includes("```json")) {
        jsonStr = jsonStr.split("```json")[1].split("```")[0];
      } else if (jsonStr.includes("```")) {
        jsonStr = jsonStr.split("```")[1].split("```")[0];
      }
      
      const data = JSON.parse(jsonStr);
      setMindMapData(data);
      setIsMindMapOpen(true);
    } catch (err: any) {
      console.error("Mind Map generation error:", err);
      setError("Failed to generate mind map. AI returned invalid structure.");
    } finally {
      setGeneratingMindMap(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAsk(e as any);
    }
    if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1 || items[i].type.indexOf("pdf") !== -1) {
        const file = items[i].getAsFile();
        if (file) setFiles(prev => [...prev, file]);
      }
    }
  };

  return (
    <div className="h-full flex gap-4 pb-2" onPaste={handlePaste}>
      {/* Mind Map Overlay */}
      <AnimatePresence>
        {isMindMapOpen && mindMapData && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-slate-950/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full h-full max-w-7xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative border border-white/20 dark:border-slate-800"
            >
              <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <GitBranch size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold">Neural Knowledge Map</h3>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{currentSession?.title || "Topic Map"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMindMapOpen(false)}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 relative overflow-hidden bg-slate-50/30 dark:bg-slate-950/30">
                <MindMapViewer data={mindMapData} />
              </div>

              <div className="p-8 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
                 <button 
                   onClick={() => setIsMindMapOpen(false)}
                   className="px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-sans"
                 >
                   Close Map
                 </button>
                 <button 
                   onClick={() => window.print()}
                   className="px-10 py-4 premium-gradient text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-sans"
                 >
                   Export View
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar - Sessions */}
      <aside className={`${isSidebarCollapsed ? "w-20" : "w-80"} glass-card rounded-[2.5rem] flex flex-col shrink-0 overflow-hidden shadow-2xl border-white/20 dark:border-slate-800/40 transition-all duration-500 ease-in-out relative group/sidebar`}>
        <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/40 flex items-center gap-3">
          {!isSidebarCollapsed && (
            <button 
              onClick={() => startNewChat()}
              className="flex-1 premium-gradient text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
            >
              <Plus size={18} /> New Session
            </button>
          )}
          {isSidebarCollapsed && (
             <button 
                onClick={() => startNewChat()}
                className="w-12 h-12 premium-gradient text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-all mx-auto"
                title="New Session"
             >
                <Plus size={20} />
             </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {!isSidebarCollapsed && (
            <div className="px-4 py-4 mb-4 bg-slate-100/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/40">
               <div className="flex items-center gap-2 mb-3">
                  <Activity size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Intelligence</span>
               </div>
               {recoveryContext ? (
                 <div className="space-y-2">
                    <p className="text-xs font-bold truncate">Weakness: {recoveryContext.analysis.weakConcepts[0] || "None"}</p>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${recoveryContext.vitals.accuracy}%` }} />
                       </div>
                       <span className="text-[10px] font-bold text-primary">{recoveryContext.vitals.accuracy}%</span>
                    </div>
                    <p className="text-[9px] text-slate-400 uppercase font-medium">Synced from latest Viva</p>
                 </div>
               ) : (
                 <p className="text-[10px] text-slate-400 italic">No recent viva data. Start one to sync memory.</p>
               )}
            </div>
          )}

          {!isSidebarCollapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3">Intelligence History</p>}
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              whileHover={{ x: isSidebarCollapsed ? 0 : 4 }}
              onClick={() => {
                setCurrentSessionId(session.id);
                setShowBookmarks(false);
              }}
              className={`group flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"} p-4 rounded-2xl cursor-pointer transition-all ${
                currentSessionId === session.id && !showBookmarks 
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"
              }`}
              title={isSidebarCollapsed ? session.title : ""}
            >
              <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? "justify-center" : ""}`}>
                <MessageSquare size={18} className={currentSessionId === session.id && !showBookmarks ? "text-primary" : "text-slate-400"} />
                {!isSidebarCollapsed && <span className="text-xs font-bold truncate">{session.title}</span>}
              </div>
              {!isSidebarCollapsed && sessions.length > 1 && (
                <button 
                  onClick={(e) => deleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-500/10"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="p-6 mt-auto bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/50 dark:border-slate-800/40">
          <button 
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-4"} p-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${
              showBookmarks 
                ? "bg-primary text-white shadow-lg shadow-primary/10" 
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Knowledge Vault"
          >
            <Bookmark size={20} />
            {!isSidebarCollapsed && <span>Knowledge Vault</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-md z-30 hover:bg-primary hover:text-white transition-all text-slate-400"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-slate-950/20 glass-card rounded-[3rem] border-white/20 dark:border-slate-800/40 shadow-2xl relative overflow-hidden h-full">
        <header className="flex items-center justify-between px-12 py-6 border-b border-slate-200/60 dark:border-slate-800/40 shrink-0">
          <div className="flex items-center gap-6">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-lg shadow-primary/5">
              <BookOpen size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-display font-bold tracking-tight">Tutor</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={generateMindMap}
              disabled={generatingMindMap || messages.length < 2 || showBookmarks}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary transition-all disabled:opacity-30 shadow-sm"
              title="Generate Neural Mind Map"
            >
              {generatingMindMap ? <Loader2 size={18} className="animate-spin" /> : <GitBranch size={18} />}
              <span className="text-[10px] font-bold uppercase tracking-widest hidden xl:block">Mind Map</span>
            </button>

            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1 border border-slate-200 dark:border-slate-800 ring-1 ring-white/20">
              {[
                { id: "learn", label: "Learn", color: "blue", icon: <BookOpen size={14} /> },
                { id: "mastery", label: "Mastery", color: "emerald", icon: <Zap size={14} /> }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setLearningMode(mode.id as any)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    learningMode === mode.id 
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md ring-1 ring-slate-200 dark:ring-slate-600" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportChatToPdf}
                disabled={exporting || showBookmarks || messages.length <= 1}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary transition-all disabled:opacity-30 shadow-sm"
                title="Export Protocol"
              >
                {exporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
              </button>
              
              <select
                value={humanLanguage}
                onChange={(e) => setHumanLanguage(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-[10px] uppercase font-bold focus:ring-2 focus:ring-primary/20 appearance-none min-w-[100px] text-center shadow-sm"
              >
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
          </div>
        </header>

        {/* Workspace Stream */}
        <div 
          ref={chatContentRef}
          className="flex-1 overflow-y-auto px-12 py-10 space-y-12 custom-scrollbar scroll-smooth"
        >
          {showBookmarks ? (
            <div className="space-y-10 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold flex items-center gap-4">
                  <Star className="text-primary fill-primary" size={28} />
                  Knowledge Vault
                </h2>
                <button onClick={() => setShowBookmarks(false)} className="text-[11px] font-bold text-primary px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all uppercase tracking-widest">
                  Back to Session
                </button>
              </div>
              
              {bookmarks.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-slate-300 gap-6 grayscale opacity-40">
                  <Bookmark size={80} strokeWidth={1} />
                  <p className="font-bold uppercase tracking-[0.3em] text-xs">Intelligence Repository Empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {bookmarks.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      whileHover={{ y: -4 }}
                      className="glass-card rounded-[2.5rem] p-10 relative group border-primary/20 bg-primary/[0.02]"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <Bot size={24} />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-0.5">Synthesized Insight</span>
                            <span className="text-[11px] text-slate-400 font-bold uppercase">{new Date(msg.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button onClick={() => toggleBookmark(msg)} className="text-primary hover:scale-110 transition-transform">
                          <BookmarkCheck size={32} />
                        </button>
                      </div>
                      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-14 w-full max-w-full mx-auto px-6 md:px-16 xl:px-32">
              <AnimatePresence mode="popLayout" initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-6 ${msg.role === "user" ? "max-w-2xl flex-row-reverse text-right ml-auto" : "max-w-4xl flex-row mr-auto"}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                        msg.role === "user" 
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                          : "bg-primary text-white"
                      }`}>
                        {msg.role === "user" ? <UserIcon size={22} /> : <Bot size={22} />}
                      </div>
                      <div className={`relative group space-y-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`p-5 rounded-[2.5rem] shadow-sm relative ${
                          msg.role === "user" 
                            ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-tr-none" 
                            : "bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-tl-none"
                        }`}>
                          <div className="prose max-w-none dark:prose-invert text-base leading-loose font-sans">
                            <ReactMarkdown
                              components={{
                                code({ node, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || "");
                                  return match ? (
                                    <div className="rounded-[2rem] overflow-hidden my-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                                      <div className="bg-slate-950 px-6 py-3 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{match[1]} Script</span>
                                        <div className="flex gap-1.5">
                                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                                        </div>
                                      </div>
                                      <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{ margin: 0, padding: '2rem', fontSize: '0.9rem' }}
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, "")}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg font-mono text-sm font-bold text-primary" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          
                          {msg.role === "assistant" && (
                            <button 
                              onClick={() => toggleBookmark(msg)}
                              className={`absolute -right-12 top-4 p-3 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 ${
                                msg.isBookmarked ? "text-primary opacity-100" : "text-slate-300 hover:text-primary"
                              }`}
                            >
                              {msg.isBookmarked ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
                            </button>
                          )}
                        </div>
                        
                        {/* Interactive Chips for first response */}
                        {msg.role === 'assistant' && currentSession.messages.length === 1 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {[
                                "Explain OOP logic in Java", 
                                "How does Quick Sort cycle?", 
                                "Dijkstra's Algorithm walkthrough",
                                "Master SQL Joins logic",
                                "DBMS Recovery Protocols"
                            ].map((q) => (
                              <button 
                                key={q} 
                                onClick={() => setTopic(q)}
                                className="px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all uppercase tracking-tight"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-6 max-w-md">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
                      <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] rounded-tl-none space-y-4">
                      <div className="flex gap-2">
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-primary rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                        {learningMode === "mastery" ? "Analyzing Knowledge Gap..." : "Synthesizing masterclass..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Dynamic Input Dock */}
        <div className="px-12 py-4 shrink-0 bg-gradient-to-t from-white dark:from-[#020617] to-transparent z-20">
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-500/10 border border-rose-500/20 text-rose-600 px-6 py-3 rounded-2xl mb-4 text-xs font-bold flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
               </div>
               <button onClick={() => setError("")}><X size={16} /></button>
            </motion.div>
          )}

          <div className="glass-card rounded-[2rem] p-1.5 shadow-2xl focus-within:ring-4 ring-primary/5 transition-all border-white/40 dark:border-slate-800/60 group">
            <form onSubmit={handleAsk} className="flex flex-col gap-1.5">
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 px-3 pt-3">
                  <AnimatePresence>
                    {files.map((f, index) => (
                      <motion.div 
                        key={`${f.name}-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-3 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                      >
                        <FileText size={14} />
                        <span className="truncate max-w-[150px]">{f.name}</span>
                        <button type="button" onClick={() => removeFile(index)} className="hover:text-rose-500 transition-colors">
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center">
                  <div className="pl-4 text-slate-400">
                    <Zap size={20} className="group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={learningMode === 'mastery' ? "Probe deep into a concept... (Ctrl+Enter to send)" : "Explain complex logic simply... (Ctrl+Enter to send)"}
                    className="flex-1 bg-transparent py-2.5 px-4 focus:outline-none text-slate-900 dark:text-white text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    disabled={loading}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-3 rounded-xl transition-all ${files.length > 0 ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"}`}
                    title="Knowledge Intake"
                  >
                    <Upload size={18} />
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (!topic.trim() && files.length === 0)}
                    className="premium-gradient text-white p-2.5 px-5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:grayscale disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Process</span>
                  </button>
                </div>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.txt,.doc,.docx"
                multiple
              />
            </form>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-6 uppercase tracking-[0.4em] font-bold opacity-30 mt-8">
            EDNIX Neural Engine v4.2.1 • Secure Synthesis
          </p>
        </div>
      </div>
    </div>
  );
}

const MindMapViewer = ({ data }: { data: any }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    // Defs for gradients and filters
    const defs = svg.append("defs");
    
    // Glowing line filter
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3.5")
      .attr("result", "blur");
    filter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    // Color Gradients
    const gradients = [
      { id: "grad-cyan", color1: "#06b6d4", color2: "#0891b2" },
      { id: "grad-rose", color1: "#f43f5e", color2: "#e11d48" },
      { id: "grad-amber", color1: "#eab308", color2: "#d97706" },
      { id: "grad-purple", color1: "#a855f7", color2: "#9333ea" },
      { id: "grad-primary", color1: "#3b82f6", color2: "#2563eb" }
    ];

    gradients.forEach(g => {
      const grad = defs.append("linearGradient")
        .attr("id", g.id)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", g.color1);
      grad.append("stop").attr("offset", "100%").attr("stop-color", g.color2);
    });

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().nodeSize([60, 260]);
    treeLayout(root);

    const nodes = root.descendants();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Apply initial transform to center the whole tree
    svg.call(zoom.transform as any, d3.zoomIdentity
      .translate(centerX - 100, centerY)
      .scale(0.8)
    );

    // Links with organic curves
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any
      )
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2.5)
      .attr("opacity", 0.4)
      .attr("stroke-dasharray", "4,4")
      .attr("class", "animate-pulse-slow");

    // Nodes
    const node = g.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer")
      .on("mouseenter", function() {
         d3.select(this).select("rect").transition().duration(200).attr("transform", "scale(1.05)");
      })
      .on("mouseleave", function() {
         d3.select(this).select("rect").transition().duration(200).attr("transform", "scale(1)");
      });

    node.each(function(d: any) {
      const el = d3.select(this);
      const isRoot = d.depth === 0;
      
      let gradientId = "grad-cyan";
      let color = "#06b6d4";
      if (d.data.status === "weak" || d.data.name.toLowerCase().includes("weak")) {
        gradientId = "grad-rose";
        color = "#f43f5e";
      }
      if (d.data.status === "improving") {
        gradientId = "grad-amber";
        color = "#eab308";
      }
      if (d.data.status === "priority") {
        gradientId = "grad-purple";
        color = "#a855f7";
      }
      if (isRoot) {
        gradientId = "grad-primary";
        color = "#3b82f6";
      }

      // Card-like background for node
      const label = d.data.name;
      const textWidth = label.length * 8 + 40;
      const rectHeight = isRoot ? 48 : 38;
      const rectWidth = Math.max(textWidth, isRoot ? 140 : 100);

      el.append("rect")
        .attr("x", -rectWidth / 2)
        .attr("y", -rectHeight / 2)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("rx", 16)
        .attr("fill", `url(#${gradientId})`)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("opacity", 1)
        .style("filter", "drop-shadow(0px 4px 12px rgba(0,0,0,0.15))")
        .attr("class", "transition-transform");

      // Root indicator glow
      if (isRoot) {
        el.append("circle")
          .attr("r", 30)
          .attr("fill", color)
          .attr("opacity", 0.15)
          .style("filter", "url(#glow)");
      }

      el.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text(label)
        .attr("font-family", "'Outfit', sans-serif")
        .attr("font-size", isRoot ? "14px" : "11px")
        .attr("font-weight", "700")
        .attr("fill", "white")
        .attr("class", "pointer-events-none uppercase tracking-tight shadow-sm");
    });

  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full relative group overflow-hidden">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
         <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800">
               <Activity size={14} className="text-primary" />
               <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Neural Key</span>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] shadow-lg shadow-rose-500/20" />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Weak</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-lg shadow-amber-500/20" />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Growth</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-lg shadow-cyan-500/20" />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mastery</span>
               </div>
            </div>
         </div>
      </div>
      <svg ref={svgRef} width="100%" height="100%" className="overflow-visible" />
    </div>
  );
}

