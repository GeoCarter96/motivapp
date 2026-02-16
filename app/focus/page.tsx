"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FocusMode() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showStarAward, setShowStarAward] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
const [showErrors, setShowErrors] = useState(false);

  const [task, setTask] = useState("");
  const [minutes, setMinutes] = useState("25");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [todayFocusStars, setTodayFocusStars] = useState(0);

  const triggerShake = () => {
  setIsShaking(true);
  // Reset the shake state after animation finishes so it can be triggered again
  setTimeout(() => setIsShaking(false), 500);
  
  // Optional: Add a subtle haptic feedback sound
  new Audio('/sounds/select-chime.mp3').play().catch(() => {});
};

const handleStartClick = () => {
  if (!task.trim() || !minutes || parseInt(minutes) <= 0) {
    triggerShake();
    return;
  }
  setIsActive(true);
  setIsStarted(true);
};

  useEffect(() => {
    setMounted(true);
    const ARCHIVE_KEY = 'user_goals_archive';
    const saved = localStorage.getItem(ARCHIVE_KEY);
    if (saved) {
      const archive = JSON.parse(saved);
      const today = new Date().toDateString();
      const todayStars = archive.filter((item: any) => 
        new Date(item.id).toDateString() === today && item.text.includes("Focus:")
      ).length;
      setTodayFocusStars(todayStars);
    }
  }, []);

  // 2. Timer Sync (Input to Clock)
  useEffect(() => {
    if (!isStarted) {
      const parsed = parseInt(minutes) || 0;
      setTimeLeft(parsed * 60);
      setTotalTime(parsed * 60);
    }
  }, [minutes, isStarted]);

  // 3. Main Countdown Engine
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isStarted]);

  // 4. Completion & Level Up Logic
  const handleComplete = () => {
    setIsActive(false);
    setShowStarAward(true);
    
    const newCount = todayFocusStars + 1;
    setTodayFocusStars(newCount);

    // Celebration
    if ([1, 3, 6, 9, 12, 15].includes(newCount)) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7dd3fc', '#fbbf24', '#ffffff'] 
      });
    }

    new Audio('/sounds/select-chime.mp3').play().catch(() => {});

    // Save to Global Archive
    const ARCHIVE_KEY = 'user_goals_archive';
    const savedArchive = localStorage.getItem(ARCHIVE_KEY);
    const archive = savedArchive ? JSON.parse(savedArchive) : [];
    const focusStarGoal = {
      id: Date.now(),
      text: `Focus: ${task || "Deep Work"} (${minutes}m)`,
      completed: true,
      timeLeft: 0,
      isActive: false,
      subtasks: []
    };
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify([focusStarGoal, ...archive]));

    // Reset View after award animation
    setTimeout(() => {
      setShowStarAward(false);
      setIsStarted(false);
      const parsed = parseInt(minutes) || 25;
      setTimeLeft(parsed * 60);
    }, 3000);
  };

  // 5. Manual Stop/Reset
  const resetSession = () => {
    const audio = new Audio('/sounds/select-chime.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
    
    setIsResetting(true);
    setTimeout(() => {
      setIsActive(false);
      setIsStarted(false);
      const parsed = parseInt(minutes) || 25;
      setTimeLeft(parsed * 60);
      setIsResetting(false);
    }, 1000);
  };

  const getFocusLevel = (count: number) => {
    if (count === 0) return "Beginner";
    if (count <= 2) return "Focus Spark";
    if (count <= 5) return "Deep Diver";
    if (count <= 8) return "Flow Master";
    return "Zen Architect";
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <main className="min-h-screen bg-[#b9e2f5] relative overflow-hidden flex flex-col items-center justify-center pt-10 px-6">
      
      {/* STAR AWARD ANIMATION */}
      <AnimatePresence>
        {showStarAward && (
          <motion.div 
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.5, 1], 
              x: [0, -200, -400], 
              y: [0, -200, -600], 
              opacity: [1, 1, 0] 
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="fixed z-[100] text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]"
          >
            <Star size={120} fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLASH RESET OVERLAY */}
      <AnimatePresence>
        {isResetting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[60] flex items-center justify-center"
          >
             <div className="absolute inset-0 opacity-80" style={{ background: 'conic-gradient(from 0deg at 50% 50%, white, transparent 20deg)', backgroundSize: '10% 100%' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DAILY FOCUS STREAK */}
      <motion.div 
        key={todayFocusStars}
        initial={{ scale: 0.8, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="fixed top-4 right-4 md:top-10 md:right-10 z-50 flex items-center gap-3 px-4 py-2 md:px-6 md:py-3 
                   bg-white/70 backdrop-blur-xl border border-white/80 rounded-full 
                   text-[#526D82] font-black shadow-2xl"
      >
        <div className="relative">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <Star size={20} fill="white" className="text-white" />
          </div>
          {todayFocusStars > 0 && (
            <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-1 -right-1 text-sky-400">
              <Sparkles size={16} fill="currentColor" />
            </motion.div>
          )}
        </div>
        <div className="flex flex-col leading-tight">
          <div className="flex items-baseline gap-1">
            <span className="text-xl md:text-2xl">{todayFocusStars}</span>
            <span className="text-[10px] opacity-40 uppercase tracking-tighter">Stars</span>
          </div>
          <span className="text-[9px] md:text-[10px] text-sky-500 uppercase tracking-widest font-black">{getFocusLevel(todayFocusStars)}</span>
        </div>
      </motion.div>

      {/* BACK BUTTON */}
      <motion.button
        onClick={() => router.push('/intro')}
        className="hidden md:flex absolute top-10 left-10 z-50 items-center gap-2 px-6 py-3 bg-white/30 backdrop-blur-md border border-white/50 rounded-full text-[#526D82] font-black shadow-lg"
      >
        <ArrowLeft size={20} />
      </motion.button>

      {/* MAIN CONTENT */}
      <div className="z-10 text-center w-full max-w-md">
        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div key="setup" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/70 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl border border-white/50">
              <div className="flex justify-center mb-6 text-sky-400"><Brain size={48} /></div>
              <h1 className="text-3xl font-black text-[#526D82] mb-8 tracking-tighter uppercase leading-none">Focus Session</h1>
              <div className="space-y-6">
               {/* Goal Input */}
<div className="text-left">
  <label className="text-[10px] font-black uppercase text-sky-400 ml-4 mb-2 block">The Goal</label>
  <input 
    value={task} 
    onChange={(e) => {
      setTask(e.target.value);
      if(e.target.value.trim()) setShowErrors(false); // Clear error on type
    }}
    placeholder="What are we doing?"
    className={`w-full bg-sky-50/50 rounded-3xl px-6 py-4 text-lg font-bold text-[#526D82] outline-none border-2 transition-all
      ${showErrors && !task.trim() 
        ? 'border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.3)]' 
        : 'border-transparent focus:border-sky-200'
      }`}
  />
</div>

{/* Duration Input */}
<div className="text-left mt-6">
  <label className="text-[10px] font-black uppercase text-sky-400 ml-4 mb-2 block">Duration (Minutes)</label>
  <input 
    type="number" 
    value={minutes} 
    onChange={(e) => {
      setMinutes(e.target.value);
      if(e.target.value) setShowErrors(false);
    }}
    className={`w-full bg-sky-50/50 rounded-3xl px-6 py-4 text-lg font-bold text-[#526D82] outline-none border-2 transition-all
      ${showErrors && (!minutes || parseInt(minutes) <= 0) 
        ? 'border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.3)]' 
        : 'border-transparent focus:border-sky-200'
      }`}
  />
</div>

                
              </div>
            <motion.button 
  onClick={() => {
    if (!task.trim() || !minutes || parseInt(minutes) <= 0) {
      setIsShaking(true);
      setShowErrors(true); // Trigger red glow on inputs
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    setShowErrors(false);
    setIsActive(true);
    setIsStarted(true);
  }}
  animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
  transition={{ duration: 0.4 }}
  className={`mt-10 w-full py-5 rounded-[30px] font-black text-xl shadow-lg transition-all active:scale-95 
    ${(!task.trim() || !minutes || parseInt(minutes) <= 0) 
      ? 'bg-sky-300' 
      : 'bg-sky-400 text-white hover:bg-sky-500'
    }`}
>
  Start Focusing
</motion.button>

            </motion.div>
          ) : (
            <motion.div key="active" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
              <div className="bg-white/80 backdrop-blur-md p-12 rounded-[60px] shadow-2xl border border-white/50 flex flex-col items-center w-full relative">
                <Sparkles className={`text-sky-200 absolute top-8 right-8 ${isActive ? 'animate-pulse' : 'opacity-20'}`} />
                <h2 className="text-3xl font-black text-[#526D82] mb-8 tracking-tight">{task || "Deep Focus"}</h2>
                <div className="relative w-56 h-56 flex items-center justify-center mb-10">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-sky-50" />
                    <motion.circle 
                      cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-sky-400"
                      strokeDasharray={653} strokeDashoffset={653 - (653 * progress) / 100}
                      transition={{ duration: isActive ? 1 : 0, ease: "linear" }}
                    />
                  </svg>
                  <span className="absolute text-5xl font-mono font-black text-[#526D82]">{mounted ? formatTime(timeLeft) : "00:00"}</span>
                </div>
                <div className="flex gap-4 w-full">
                   <button onClick={() => setIsActive(!isActive)} className="flex-1 py-4 bg-sky-100 text-sky-600 rounded-3xl font-black text-lg">{isActive ? "Pause" : "Resume"}</button>
                   <button onClick={resetSession} className="px-6 py-4 bg-red-50 text-red-400 rounded-3xl font-black">Stop</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AMBIENT PARTICLES */}
      <div className="absolute inset-0 pointer-events-none">
        {mounted && [...Array(15)].map((_, i) => (
          <motion.div key={i} animate={{ y: [-20, -1000], opacity: [0, 0.3, 0] }}
            transition={{ duration: Math.random() * 10 + 5, repeat: Infinity }}
            style={{ left: `${Math.random() * 100}%` }}
            className="absolute bottom-0 w-1.5 h-1.5 bg-white rounded-full blur-[1px]"
          />
        ))}
      </div>
    </main>
  );
}
