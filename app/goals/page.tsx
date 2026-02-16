"use client";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Timer, Trash2 } from 'lucide-react';



interface Goal {
  id: number;
  text: string;
  completed: boolean;
  timeLeft: number | null;
  isActive: boolean;
}

const STORAGE_KEY = 'user_goals';

export default function GoalsPage() {
  const [newGoal, setNewGoal] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // 1. Initialize State from LocalStorage
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window === 'undefined') return []; // Safety for SSR
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    try {
      const { value, expiry } = JSON.parse(saved);
      // Check if the entire session has expired
      if (new Date().getTime() > expiry) {
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      return value;
    } catch (e) {
      return [];
    }
  });

  // 2. Save to LocalStorage whenever goals change
  useEffect(() => {
    // Set expiry for 24 hours from now
    const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value: goals, expiry }));
  }, [goals]);

  // 3. Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setGoals(prevGoals => prevGoals.map(goal => {
        if (goal.isActive && goal.timeLeft && goal.timeLeft > 0 && !goal.completed) {
          const newTime = goal.timeLeft - 1;
          return { 
            ...goal, 
            timeLeft: newTime,
            isActive: newTime > 0 
          };
        }
        return goal;
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim() || !minutes) return;

    const createSound = new Audio('/sounds/select-chime.mp3');
    createSound.volume = 0.4;
    createSound.play().catch(e => console.error(e));

    const goalToAdd: Goal = {
      id: Date.now(),
      text: newGoal,
      completed: false,
      timeLeft: parseInt(minutes) * 60,
      isActive: true
    };

    setGoals([goalToAdd, ...goals]);
    setNewGoal("");
    setMinutes("");
  };

  const clearSky = () => {
    const audio = new Audio('/sounds/bell.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
    
    setIsResetting(true);
    setTimeout(() => {
      setGoals([]);
      localStorage.removeItem(STORAGE_KEY);
      setIsResetting(false);
    }, 1000);
  };

  const deleteGoal = (id: number) => {
    const audio = new Audio('/sounds/select-chime.mp3'); 
    audio.volume = 0.5;
    audio.play().catch((err) => console.log(err));
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const toggleGoal = (id: number) => {
    const audio = new Audio('/sounds/glass-chime.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {});
    setGoals(goals.map(g => 
      g.id === id ? { ...g, completed: !g.completed, isActive: !g.completed } : g
    ));
  };

 


  return (
    <main className="min-h-screen bg-[#b9e2f5] relative overflow-hidden flex flex-col items-center pt-10 px-6">
     
      <AnimatePresence>
        {isResetting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] flex items-center justify-center"
          >
             <div className="absolute inset-0 opacity-80" 
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, white, transparent 20deg)', backgroundSize: '10% 100%' }} />
          </motion.div>
        )}
      </AnimatePresence>
      
     
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
           style={{ background: 'conic-gradient(from 0deg at 50% 20%, transparent 0deg, white 10deg, transparent 20deg)', backgroundSize: '15% 100%' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-white rounded-full blur-[120px] opacity-50 z-0" />

     
      <motion.form 
        onSubmit={addGoal}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 w-full max-w-md mb-16"
      >
        <div className="relative bg-white/90 backdrop-blur-xl px-8 py-6 rounded-[50px] shadow-2xl flex items-center gap-4
                        before:absolute before:bg-white before:w-16 before:h-16 before:rounded-full before:-top-6 before:left-8
                        after:absolute after:bg-white after:w-20 after:h-20 after:rounded-full after:-top-8 after:right-10">
          <input 
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Type a new goal..."
            className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-[#526D82] placeholder:text-[#526D82]/40 z-10"
          />
          
          <input 
            type="number"
            required
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Mins"
            className="w-20 bg-sky-50/50 backdrop-blur-sm rounded-full px-3 py-2 
                       text-sky-600 font-black outline-none border-2 border-sky-100 
                       placeholder:text-sky-300 placeholder:font-bold
                       transition-all duration-300 shadow-inner z-10" 
          />

          <motion.button 
            type="submit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-sky-400 rounded-full flex items-center justify-center text-white text-2xl shadow-lg z-10"
          >
            +
          </motion.button>
        </div>
      </motion.form>

   
     <Reorder.Group axis="y" values={goals} onReorder={setGoals} className="w-full max-w-md space-y-6 z-10 pb-20">
  <AnimatePresence>
    {goals.map((goal) => (
      <Reorder.Item 
        key={goal.id} 
        value={goal}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        // --- SLIDE OUT ANIMATION ---
        exit={{ 
          opacity: 0, 
          x: 150, // Slides out to the right
          transition: { duration: 0.2, ease: "easeIn" } 
        }}
      >
        <motion.div 
          className="bg-white/70 backdrop-blur-md p-6 rounded-[40px] shadow-xl flex items-center justify-between border border-white/50"
        >
          {/* LEFT SIDE: Text and Timer */}
          <div className="flex flex-col gap-1">
            <span className={`text-2xl font-black drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] transition-all duration-500
              ${goal.isActive && !goal.completed 
                ? 'text-[#526D82] opacity-100' 
                : 'text-[#9DB2BF] opacity-50 line-through'
              }`}
            >
              {goal.text}
            </span>

            <div className={`flex items-center gap-2 font-mono font-bold ${goal.isActive && !goal.completed ? 'text-sky-500' : 'text-gray-400'}`}>
              <Timer size={16} className={goal.isActive && !goal.completed ? "animate-pulse" : ""} />
              <span className="text-sm">
                {goal.timeLeft && goal.timeLeft > 0 ? formatTime(goal.timeLeft) : "TIME'S UP"}
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: Buttons (Always Visible) */}
          <div className="flex items-center gap-3">
            <motion.button 
              onClick={() => deleteGoal(goal.id)}
              whileHover={{ scale: 1.2, color: "#f87171" }} // Pops red on hover
              whileTap={{ scale: 0.8 }}
              className="text-[#526D82]/40 hover:text-red-400 transition-colors p-2"
            >
              <Trash2 size={22} />
            </motion.button>
            
            <motion.button 
              onClick={() => toggleGoal(goal.id)}
              whileTap={{ scale: 0.7 }}
              className={`w-14 h-14 rounded-full border-4 transition-all duration-700 flex items-center justify-center flex-shrink-0
                         ${goal.completed 
                           ? 'bg-yellow-300 border-yellow-200 shadow-[0_0_30px_#fde047]' 
                           : 'bg-white border-sky-100 shadow-inner'}`}
            >
              {goal.completed && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white text-2xl">
                  ✨
                </motion.div>
              )}
            </motion.button>
          </div>
        </motion.div>
      </Reorder.Item>
    ))}
  </AnimatePresence>
</Reorder.Group>

     
      <motion.div 
        animate={{ 
          height: `${25 + (goals.filter(g => g.completed).length * 8)}%`,
          backgroundColor: goals.length > 0 && goals.every(g => g.completed) ? "#fef3c7" : "#ffffff" 
        }}
        className="fixed bottom-0 w-full blur-[60px] rounded-t-[100%] z-20 opacity-90 transition-all duration-1000 pointer-events-none"
      />

     
     <AnimatePresence>
  {goals.length > 0 && (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      

      onClick={clearSky}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="mt-12 mb-10 cursor-pointer px-10 py-4 bg-white/30 backdrop-blur-md rounded-full border border-white/50 text-black font-black text-xl shadow-lg z-30"
    >
      Clear All Stars
    </motion.button>
  )}
</AnimatePresence>

    </main>
  );
}
