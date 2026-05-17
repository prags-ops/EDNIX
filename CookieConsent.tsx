import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 glass-card rounded-[2rem] p-6 shadow-2xl z-[100] border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Cookie className="text-primary" size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 dark:text-white">Cookie Preferences</h3>
                <button onClick={() => setShow(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4">
                We use cookies to enhance your experience, track progress, and provide personalized AI tutoring. By continuing, you agree to our use of cookies.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleAccept}
                  className="flex-1 premium-gradient text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]"
                >
                  Accept All
                </button>
                <button 
                  onClick={() => setShow(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
