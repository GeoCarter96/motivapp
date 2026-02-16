"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Droplets } from 'lucide-react';

interface Ripple {
  id: string; 
  x: number;
  y: number;
}

export default function ZenPond() {
  const router = useRouter();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isStarted, setIsStarted] = useState(false);
    const addRipple = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isStarted) return;
    
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

  
    const newRipple = { 
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      x, 
      y 
    };
    
    setRipples((prev) => [...prev.slice(-10), newRipple]); 
  };
useEffect(() => {
  const timer = setInterval(() => {
    setRipples((prev) => prev.filter((r) => {
  
      const timestamp = parseInt(r.id.split('-')[0]);
      return Date.now() - timestamp < 2000;
    }));
  }, 100);
  return () => clearInterval(timer);
}, []);

  
  const audioCtxRef = useRef<AudioContext | null>(null);


  const startZenNoise = () => {
    if (audioCtxRef.current) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    const bufferSize = 4096;
    let lastOut = 0.0;
    
    const node = audioCtx.createScriptProcessor(bufferSize, 1, 1);
    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
       
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    };

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.04; 

    node.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  };


  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const handleStart = () => {
    setIsStarted(true);
    startZenNoise();
  };

 

    useEffect(() => {
    const timer = setInterval(() => {
      setRipples((prev) => prev.filter((r) => {

        const rippleTimestamp = parseInt(r.id.split('-')[0]);
        return Date.now() - rippleTimestamp < 2000;
      }));
    }, 100);
    return () => clearInterval(timer);
  }, []);


  return (
    <main 
      onMouseMove={addRipple}
      onClick={addRipple}
      className="min-h-screen bg-[#b9e2f5] relative overflow-hidden flex flex-col items-center justify-center cursor-none"
    >
     <button 
  onClick={() => router.push('/intro')}

  className="hidden md:block absolute top-10 left-10 z-50 p-4 bg-white/20 hover:bg-white/40 rounded-full text-sky-900 backdrop-blur-md transition-all border border-white/50"
>
  <ArrowLeft size={24} />
</button>


      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{ left: ripple.x, top: ripple.y, position: 'absolute', transform: 'translate(-50%, -50%)' }}
              className="w-10 h-10 border-2 border-white/40 rounded-full"
            />
          ))}
        </AnimatePresence>
      </div>

      {!isStarted ? (
        <motion.button
          onClick={handleStart}
          whileHover={{ scale: 1.1 }}
          className="z-50 flex flex-col items-center gap-6"
        >
          <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50">
            <Droplets className="text-white animate-bounce" size={32} />
          </div>
          <span className="text-sky-900/40 font-black tracking-[0.4em] uppercase text-xs">Touch to Begin (Better With Headphones)</span>
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center z-10 pointer-events-none">
         <motion.div
  animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
  transition={{ duration: 8, repeat: Infinity }}
  className="
    /* 1. Base (Mobile): Smaller text, tighter tracking */
    text-4xl tracking-[0.2em] 
    
    /* 2. Tablet (md): Medium text, wider tracking */
    md:text-7xl md:tracking-[0.4em] 
    
    /* 3. Desktop (lg): Original large text, full tracking */
    lg:text-8xl lg:tracking-[0.5em] 
    
    /* 4. Styling */
    text-sky-900/30 font-black uppercase select-none px-4 text-center
  "
>
  STILLNESS
</motion.div>

          <p className="text-sky-900/40 font-bold mt-8 tracking-widest uppercase text-xs">LISTEN FOR 5 MINUTES TO START YOUR DAY CALMLY</p>
        </motion.div>
      )}

      {isStarted && (
        <motion.div 
          className="fixed w-4 h-4 bg-white rounded-full pointer-events-none z-[100] blur-sm shadow-[0_0_15px_white]"
          animate={{ 
            x: ripples.length > 0 ? ripples[ripples.length - 1].x - 8 : -100,
            y: ripples.length > 0 ? ripples[ripples.length - 1].y - 8 : -100,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 250 }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
    </main>
  );
}
