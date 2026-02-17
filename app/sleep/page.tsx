"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Wind, Moon, CheckCircle2, ShieldCheck, ThermometerSnowflake, Sun } from 'lucide-react';

const IMMEDIATE_STEPS = [
  { id: 1, task: "Dim to Darkness", desc: "Turn off all main lights; use only warm amber lamps or candles.", icon: <Moon size={20} /> },
  { id: 2, task: "The Cool Down", desc: "Set your room to 65-68°F. A cooler core temperature triggers deep sleep.", icon: <ThermometerSnowflake size={20} /> },
  { id: 3, task: "Digital Sanctuary", desc: "Put all unnecessary devices in another room or a 'do not disturb' box.", icon: <ShieldCheck size={20} /> },
  { id: 4, task: "Brain Dump", desc: "Write down 3 things on your mind so they don't loop in your head all night.", icon: <Wind size={20} /> },
  { id: 5, task: "Release the Day", desc: "Do 2 minutes of box breathing (4s in, 4s hold, 4s out, 4s hold).", icon: <Sparkles size={20} /> }
];

const createRainSound = (audioCtx: AudioContext) => {
  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  let b0, b1, b2, b3, b4, b5, b6;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3102713;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    output[i] *= 0.11; 
    b6 = white * 0.115926;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1000;

  const gain = audioCtx.createGain();
  gain.gain.value = 0;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  return { noise, gain };
};

export default function MidnightWindDown() {
  const router = useRouter();
  
  // 1. ALL STATES AT THE TOP
  const [mounted, setMounted] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [isBlackout, setIsBlackout] = useState(false);
  const [showMorningMessage, setShowMorningMessage] = useState(false);
  const audioRef = useRef<{ audioCtx: AudioContext; noise: AudioBufferSourceNode; gain: GainNode } | null>(null);
const [streak, setStreak] = useState(0);

// Load streak and handle daily reset on mount
useEffect(() => {
  const STREAK_KEY = 'sleep_streak_count';
  const LAST_DATE_KEY = 'sleep_last_completed_date';
  
  const savedStreak = localStorage.getItem(STREAK_KEY);
  const lastDate = localStorage.getItem(LAST_DATE_KEY);
  const today = new Date().toDateString();

  if (lastDate === today) {
    setStreak(parseInt(savedStreak || "0"));
  } else {
    // If we missed a day, streak could reset here, 
    // but for now, we'll just load the last known number.
    setStreak(parseInt(savedStreak || "0"));
  }
}, []);

  // 2. VARIABLES / CALCULATIONS
  const sleepScore = Math.round((checkedSteps.length / IMMEDIATE_STEPS.length) * 100);

  // 3. ALL EFFECTS
  useEffect(() => { 
    setMounted(true); 
  }, []);

  useEffect(() => {
    if (sleepScore === 100) {
      const timer = setTimeout(() => {
        setIsBlackout(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sleepScore]);

  useEffect(() => {
    if (isBlackout) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const { noise, gain } = createRainSound(ctx);
      noise.start();
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 4);
      audioRef.current = { audioCtx: ctx, noise, gain };
    } else if (audioRef.current) {
      const { audioCtx, gain, noise } = audioRef.current;
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
      setTimeout(() => {
        noise.stop();
        audioCtx.close();
      }, 1000);
      audioRef.current = null;
    }
  }, [isBlackout]);

  const handleWakeUp = () => {
  setIsBlackout(false);
  setShowMorningMessage(true);
  
  // RESET THE CHECKLIST HERE
  setCheckedSteps([]); 
  
  // Increment Streak if it's a new day
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('sleep_last_completed_date');
  
  if (lastDate !== today) {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('sleep_streak_count', newStreak.toString());
    localStorage.setItem('sleep_last_completed_date', today);
  }

  setTimeout(() => setShowMorningMessage(false), 5000);
};


  const toggleStep = (id: number) => {
    if (checkedSteps.includes(id)) {
      setCheckedSteps(prev => prev.filter(s => s !== id));
    } else {
      const audio = new Audio('/sounds/select-chime.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
      setCheckedSteps(prev => [...prev, id]);
    }
  };

  const getMoonIcon = () => {
    if (sleepScore === 0) return <Moon size={24} className="opacity-30" />;
    if (sleepScore < 100) return <Moon size={24} fill="currentColor" className="text-sky-300" />;
    return <Sparkles size={24} className="text-yellow-400" />;
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#b9e2f5] relative overflow-hidden flex flex-col items-center pt-24 md:pt-12 px-6 pb-20">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
           style={{ background: 'conic-gradient(from 0deg at 50% 20%, transparent 0deg, white 10deg, transparent 20deg)', backgroundSize: '15% 100%' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-white rounded-full blur-[120px] opacity-50 z-0" />

      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center z-10 mb-12">
        <h1 className="text-4xl font-black text-[#526D82] tracking-tighter uppercase">Evening Wind Down</h1>
        <p className="text-[#526D82]/50 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Tap Steps To Check Off For Deep Rest</p>
      </motion.div>

      {/* Morning Message */}
      <AnimatePresence>
        {showMorningMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 z-[60] bg-white/80 backdrop-blur-md px-8 py-4 rounded-full border border-white shadow-xl flex items-center gap-3"
          >
            <Sun className="text-yellow-500 animate-spin-slow" size={24} />
            <span className="text-[#526D82] font-black uppercase tracking-widest text-sm">
              Good Morning, Sun
            </span>
          </motion.div>
        )}
      </AnimatePresence>

     {/* FLOATING STATS STACK - Middle Right */}
<div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 items-end pointer-events-none">
  
  {/* FLOATING STATS STACK - Middle Right */}
<div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 items-end pointer-events-none">
  
  {/* 1. SLEEP READINESS SCORE - Now Matched Small Size */}
  {/* FLOATING STATS STACK - Repositioned for Mobile */}
<div className="fixed right-4 bottom-24 md:top-1/2 md:bottom-auto md:-translate-y-1/2 z-40 flex flex-col gap-3 items-end pointer-events-none">
  
  {/* 1. SLEEP READINESS SCORE */}
  <motion.div 
    key={`score-${sleepScore}`}
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="pointer-events-auto flex items-center gap-2 p-1.5 md:px-4 md:py-2 
               bg-white/70 backdrop-blur-xl border border-white/80 rounded-full 
               text-[#526D82] font-black shadow-2xl"
  >
    {/* Hidden text on mobile to save space */}
    <div className="hidden md:flex flex-col leading-none text-right">
      <span className="text-lg md:text-xl">{sleepScore}%</span>
      <span className="text-[7px] uppercase tracking-tighter opacity-50">Readiness</span>
    </div>
    <motion.div 
      animate={sleepScore === 100 ? { rotate: 360 } : {}}
      className="w-8 h-8 bg-indigo-900 rounded-full flex items-center justify-center shadow-lg text-white relative"
    >
      {/* Percentage badge for mobile only */}
      <span className="md:hidden absolute -top-1 -left-1 bg-white text-[#526D82] text-[8px] px-1 rounded-full border border-gray-100">
        {sleepScore}%
      </span>
      {sleepScore === 100 ? <Sparkles size={16} className="text-yellow-400" /> : <Moon size={16} fill="currentColor" className="text-sky-300" />}
    </motion.div>
  </motion.div>

  {/* 2. NIGHT STREAK */}
  <motion.div 
    key={`streak-${streak}`}
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: 0.1 }}
    className="pointer-events-auto flex items-center gap-2 p-1.5 md:px-4 md:py-2 
               bg-white/70 backdrop-blur-xl border border-white/80 rounded-full 
               text-[#526D82] font-black shadow-2xl"
  >
    <div className="hidden md:flex flex-col leading-none text-right">
      <span className="text-lg md:text-xl">{streak}</span>
      <span className="text-[7px] uppercase tracking-tighter opacity-50">Night Streak</span>
    </div>
    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg text-white relative">
       {/* Streak badge for mobile only */}
       <span className="md:hidden absolute -top-1 -left-1 bg-white text-[#526D82] text-[8px] px-1 rounded-full border border-gray-100">
        {streak}
      </span>
      <Sparkles size={16} fill="currentColor" />
    </div>
  </motion.div>

</div>


</div>


</div>
      {/* Checklist */}
      <div className="w-full max-w-md space-y-4 z-10">
        {IMMEDIATE_STEPS.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => toggleStep(step.id)}
            className={`cursor-pointer p-6 rounded-[35px] border backdrop-blur-md transition-all duration-500 flex flex-col gap-3
              ${checkedSteps.includes(step.id) 
                ? 'bg-white/80 border-sky-400/50 shadow-xl scale-95' 
                : 'bg-white/50 border-white/60 hover:bg-white/60 shadow-lg'
              }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-colors ${checkedSteps.includes(step.id) ? 'bg-sky-400 text-white' : 'bg-white/60 text-sky-400'}`}>
                {checkedSteps.includes(step.id) ? <CheckCircle2 size={20} /> : step.icon}
              </div>
              <h3 className={`text-xl font-black text-[#526D82] leading-tight transition-all duration-500 ${checkedSteps.includes(step.id) ? 'line-through opacity-30' : ''}`}>
                {step.task}
              </h3>
            </div>
            <AnimatePresence>
              {!checkedSteps.includes(step.id) && (
                <motion.p 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="text-xs text-[#526D82]/60 leading-relaxed font-bold overflow-hidden"
                >
                  {step.desc}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Full Screen Blackout Overlay */}
      <AnimatePresence>
        {isBlackout && (
          <motion.div
            key="blackout-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            onClick={handleWakeUp}
            className="fixed inset-0 z-[100] bg-[#0f172a] flex flex-col items-center justify-center cursor-pointer"
          >
            <motion.div
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: 8 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 rounded-full border border-sky-900 flex items-center justify-center">
                <Moon size={40} className="text-sky-900" />
              </div>
              <div className="text-center">
                <p className="text-sky-900 font-black tracking-[1em] uppercase text-[10px]">
                  Resting
                </p>
                <p className="text-sky-900 text-[8px] uppercase mt-4 tracking-widest font-bold">
                  Tap to wake up gently
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <motion.button
        onClick={() => router.push('/intro')}
        className="hidden md:flex absolute top-10 left-10 z-50 items-center gap-2 px-6 py-3 bg-white/30 backdrop-blur-md border border-white/50 rounded-full text-[#526D82] font-black shadow-lg"
      >
        <ArrowLeft size={20} />
        
      </motion.button>
    </main>
  );
}
