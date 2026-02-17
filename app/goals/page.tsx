"use client";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Timer, Trash2, CheckCircle2, ArrowLeft, Image as ImageIcon, X, History, Quote } from 'lucide-react';


interface Subtask {
  id: number;
  text: string;
  completed: boolean;
}

interface Goal {
  id: number;
  text: string;
  completed: boolean;
  timeLeft: number | null;
  isActive: boolean;
  subtasks: Subtask[];
}

const STORAGE_KEY = 'user_goals_v2';
const ARCHIVE_KEY = 'user_goals_archive';
const VISION_KEY = 'user_vision_board';

const MOTIVATIONS = [
  "Small steps lead to big horizons.",
  "Your potential is as vast as the sky.",
  "Every reality was once just a wish.",
  "Focus on the step, not the mountain.",
  "Consistency is the bridge to success."
];

export default function GoalsPage() {
     const router = useRouter();
  const [newGoal, setNewGoal] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [motivation, setMotivation] = useState("");
 const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
   const archiveGoal = (goal: Goal) => {
    
    const audio = new Audio('/sounds/shimmer.mp3'); 
    audio.volume = 0.4;
    audio.play().catch(() => {});

    setArchive(prev => [goal, ...prev]);
    setGoals(prev => prev.filter(g => g.id !== goal.id));
  };


  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).value : [];
  });

  const [archive, setArchive] = useState<Goal[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(ARCHIVE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  
  useEffect(() => {
    setVisionImage(localStorage.getItem(VISION_KEY));
    setMotivation(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
  }, []);

 
  useEffect(() => {
    const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value: goals, expiry }));
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  }, [goals, archive]);

  
  useEffect(() => {
    const timer = setInterval(() => {
      setGoals(prev => prev.map(g => {
        if (g.isActive && g.timeLeft && g.timeLeft > 0 && !g.completed) {
          const newTime = g.timeLeft - 1;
          return { ...g, timeLeft: newTime, isActive: newTime > 0 };
        }
        return g;
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
    const goalToAdd: Goal = {
      id: Date.now(),
      text: newGoal,
      completed: false,
      timeLeft: parseInt(minutes) * 60,
      isActive: true,
      subtasks: []
    };
    setGoals([goalToAdd, ...goals]);
    setNewGoal("");
    setMinutes("");
  };

  const addSubtask = (goalId: number, text: string) => {
    if (!text.trim()) return;
    setGoals(goals.map(g => g.id === goalId ? {
      ...g, subtasks: [...g.subtasks, { id: Date.now(), text, completed: false }]
    } : g));
  };

  const toggleSubtask = (goalId: number, subId: number) => {
    setGoals(goals.map(g => g.id === goalId ? {
      ...g, subtasks: g.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
    } : g));
  };


  const handleVisionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setVisionImage(base64);
        localStorage.setItem(VISION_KEY, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="min-h-screen bg-[#b9e2f5] relative overflow-hidden flex flex-col items-center pt-6 px-6 pb-20">
      
    <motion.button
  onClick={() => router.push('/intro')}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.5)" }}
  whileTap={{ scale: 0.95 }}
  /* Hidden on mobile, fixed bottom-left on tablet, absolute top-left on desktop */
  className="hidden md:flex fixed lg:absolute 
             bottom-10 lg:bottom-auto lg:top-10 
             left-10 
             z-40 items-center gap-2 px-5 py-3 
             bg-white/30 backdrop-blur-md border border-white/50 rounded-full 
             text-[#526D82] font-black transition-all shadow-lg"
>
  <ArrowLeft size={20} />
  
</motion.button>



     <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 mb-12 z-20 items-stretch">

  <motion.div 
    initial={{ x: -20, opacity: 0 }} 
    animate={{ x: 0, opacity: 1 }} 
    className="flex-[2] bg-white/40 backdrop-blur-md rounded-[40px] p-2 border border-white/60 relative overflow-hidden min-h-[400px] group shadow-2xl"
  >
<motion.div 
  key={archive.length} 
  initial={{ scale: 1 }}
  animate={{ 
    scale: [1, 1.3, 1],
    rotate: [0, -10, 10, 0],
  }}
  transition={{ duration: 0.5, ease: "backOut" }}
  className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-full shadow-lg border border-sky-100 flex items-center gap-3"
>
  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.6)]">
    <motion.span 
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="text-white text-lg"
    >
      ⭐
    </motion.span>
  </div>
 <div className="flex flex-col">
  <span className="text-[#526D82] font-black text-xl leading-none">
    {mounted ? archive.length : 0} 
  </span>
  <span className="text-[#526D82]/50 font-bold text-[10px] uppercase tracking-tighter">
    Stars Collected
  </span>
</div>

</motion.div>


   <div className="relative w-full h-48 bg-white/20 dark:bg-slate-800/20 backdrop-blur-md rounded-[40px] border border-white/30 dark:border-slate-700/50 overflow-hidden group">
  {visionImage ? (
    <>
      <img 
        src={visionImage} 
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
        alt="Vision" 
      />
      {/* Remove Button - Top Right */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          setVisionImage(null);
        }}
        className="absolute top-4 right-4 z-30 p-2 bg-black/20 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white transition-colors duration-300"
      >
        <X size={16} />
      </button>

      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <p className="text-white font-bold text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">Change Vision</p>
      </div>
    </>
  ) : (
    <div className="absolute inset-0 flex items-end justify-end p-6 border-4 border-dashed border-sky-200/50 rounded-[40px]">
      <div className="flex flex-col items-end text-right text-sky-800/50 dark:text-sky-200/40">
        <ImageIcon size={32} strokeWidth={1.5} />
        <p className="text-[10px] font-black mt-2 uppercase tracking-widest">Vision Board</p>
        <p className="text-[8px] opacity-60 italic">Click to upload focus</p>
      </div>
    </div>
  )}
  
  {/* The input covers the card except when clicking the X button */}
  <input 
    type="file" 
    accept="image/*" 
    onChange={handleVisionUpload} 
    className="absolute inset-0 opacity-0 cursor-pointer z-20" 
  />
</div>

  </motion.div>

  
  <motion.div 
    initial={{ x: 20, opacity: 0 }} 
    animate={{ x: 0, opacity: 1 }} 
    className="flex-1 bg-white/20 backdrop-blur-xl rounded-[40px] p-8 border border-white/40 flex items-center justify-center text-center shadow-xl"
  >
    <div className="space-y-4">
      <div className="w-12 h-12 bg-sky-400/20 rounded-full flex items-center justify-center mx-auto">
        <Quote size={24} className="text-sky-500" />
      </div>
      <p className="text-[#526D82] font-black italic text-xl leading-relaxed">
        "{motivation}"
      </p>
      <div className="h-1 w-12 bg-sky-300/40 mx-auto rounded-full" />
    </div>
  </motion.div>
</div>


     
      <motion.form onSubmit={addGoal} className="relative z-20 w-full max-w-md mb-12">
       
         <div className="relative bg-white/90 backdrop-blur-xl px-8 py-6 rounded-[50px] shadow-2xl flex items-center gap-4">
          <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Main goal..." className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-[#526D82] placeholder:text-sky-200" />
          <input type="number" required value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="Min" className="w-16 bg-sky-50 rounded-full px-2 py-2 text-sky-600 font-black" />
          <motion.button type="submit" whileHover={{ scale: 1.1 }} className="w-12 h-12 bg-sky-400 rounded-full flex items-center justify-center text-white">+</motion.button>
        </div>
      </motion.form>

    
      <Reorder.Group axis="y" values={goals} onReorder={setGoals} className="w-full max-w-md space-y-6 z-10 pb-20">
        <AnimatePresence>
          {goals.map((goal) => (
            <Reorder.Item key={goal.id} value={goal} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ x: 100, opacity: 0 }}>
              <motion.div className="bg-white/80 backdrop-blur-lg p-6 rounded-[35px] shadow-xl border border-white/60">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-xl font-black ${goal.completed ? 'line-through text-gray-400' : 'text-[#526D82]'}`}>{goal.text}</h3>
                    <div className="flex items-center gap-2 text-sky-500 font-mono font-bold text-sm">
                      <Timer size={14} /> {formatTime(goal.timeLeft)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => archiveGoal(goal)} className="p-2 text-sky-300 hover:text-sky-600 transition-colors"><CheckCircle2 size={20}/></button>
                    <button onClick={() => setGoals(goals.filter(g => g.id !== goal.id))} className="p-2 text-red-200 hover:text-red-500"><Trash2 size={20}/></button>
                  </div>
                </div>

               
                <div className="space-y-2 border-t border-sky-50 pt-4">
                  {goal.subtasks.map(s => (
                    <div key={s.id} onClick={() => toggleSubtask(goal.id, s.id)} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all ${s.completed ? 'bg-sky-400 border-sky-400' : 'border-sky-200'}`} />
                      <span className={`text-sm font-bold ${s.completed ? 'line-through text-gray-300' : 'text-slate-600'}`}>{s.text}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      onKeyDown={(e) => { if(e.key === 'Enter') { addSubtask(goal.id, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; }}}
                      placeholder="Add step..." 
                      className="text-xs bg-transparent border-b border-sky-100 outline-none w-full py-1 text-slate-500 font-bold placeholder:text-sky-200" 
                    />
                  </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

   
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setShowArchive(!showArchive)} className="w-14 h-14 bg-white shadow-2xl rounded-full flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white transition-all">
          <History size={24} />
        </button>
      </div>

      <AnimatePresence>
        {showArchive && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed inset-0 bg-sky-900/40 backdrop-blur-xl z-[60] flex items-end">
            <div className="w-full bg-white rounded-t-[50px] p-10 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-sky-900">Archive Log</h2>
                <button onClick={() => setShowArchive(false)} className="font-bold text-sky-400">Close</button>
              </div>
              <div className="space-y-4">
                {archive.map(g => (
                  <div key={g.id} className="p-4 bg-sky-50 rounded-2xl flex justify-between items-center">
                    <span className="font-bold text-sky-800 opacity-60">{g.text}</span>
                    <span className="text-xs text-sky-300 font-black">{new Date(g.id).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
